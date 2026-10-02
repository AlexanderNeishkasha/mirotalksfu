'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const espree = require('espree');
const { read, deferred, tick, until, fixture } = require('../../tests/helpers/background.cjs');

/** Exercise the actual lazy script loader with controllable DOM load/error events. */
function loader() {
    const scripts = [];
    const context = {
        window: {},
        DOMException,
        setTimeout,
        clearTimeout,
        document: {
            head: { appendChild: (script) => scripts.push(script) },
            createElement: () => ({
                remove() {
                    this.removed = true;
                },
            }),
        },
    };
    vm.runInNewContext(read('BodrikBackgroundAssets.js'), context);
    return { scripts, context, assets: context.window.BodrikBackgroundAssets };
}

test('ordinary meeting loads no segmentation/GIF assets or model', () => {
    const { state, effect } = fixture();
    assert.equal(state.segmentationLoads, 0);
    assert.equal(state.models.length, 0);
    assert.equal(effect.isProcessing, false);
    const page = readFileSync(path.join(__dirname, '../views/Room.html'), 'utf8');
    assert.doesNotMatch(page, /<script[^>]+src="[^\"]*(?:selfie_segmentation|gifler)/);
    assert.ok(page.indexOf('BodrikBackgroundAssets.js') < page.indexOf('VirtualBackground.js'));
    assert.ok(page.indexOf('BodrikBackgroundCapture.js') < page.indexOf('RoomClient.js'));
});

for (const [name, key, globalName] of [
    ['segmentation', 'segmentation', 'SelfieSegmentation'],
    ['GIF decoder', 'gifler', 'gifler'],
]) {
    test(`shared lazy dependency and successful reuse: ${name}`, async () => {
        const { scripts, context, assets } = loader();
        const first = assets[key]();
        assert.equal(assets[key](), first);
        assert.equal(scripts.length, 1);
        context.window[globalName] = function Dependency() {};
        scripts[0].onload();
        assert.equal(await first, context.window[globalName]);
        assert.equal(await assets[key](), context.window[globalName]);
        assert.equal(scripts.length, 1);
    });
}

test('dependency failure removes the failed script and allows an actual retry', async () => {
    const { scripts, context, assets } = loader();
    const first = assets.segmentation();
    scripts[0].onerror();
    await assert.rejects(first, /Could not load/);
    assert.equal(scripts[0].removed, true);
    const second = assets.segmentation();
    assert.notEqual(first, second);
    context.window.SelfieSegmentation = function Model() {};
    scripts[1].onload();
    await second;
});

test('a caller cancellation does not cancel another caller sharing the dependency', async () => {
    const { scripts, context, assets } = loader();
    const shared = assets.segmentation();
    const abort = new AbortController();
    const cancelled = assets.wait(shared, abort.signal);
    abort.abort();
    await assert.rejects(cancelled, { name: 'AbortError' });
    context.window.SelfieSegmentation = function Model() {};
    scripts[0].onload();
    assert.equal(await shared, context.window.SelfieSegmentation);
});

test('bounded waits reject timeout without losing the underlying operation cleanup', async () => {
    const { assets } = loader();
    const pending = deferred();
    await assert.rejects(assets.wait(pending.promise, undefined, 1), /timed out/);
    pending.resolve();
});

for (const [name, invoke, gifs] of [
    ['blur', (effect, source) => effect.applyBlurToWebRTCStream(source, 10), 0],
    ['static image', (effect, source) => effect.applyVirtualBackgroundToWebRTCStream(source, 'photo.png'), 0],
    ['transparent', (effect, source) => effect.applyTransparentVirtualBackgroundToWebRTCStream(source), 0],
    [
        'GIF with query parameters',
        (effect, source) => effect.applyVirtualBackgroundToWebRTCStream(source, 'animation.gif?v=1'),
        1,
    ],
]) {
    test(`effect activation and complete owned teardown: ${name}`, async () => {
        const { effect, source, state } = fixture();
        const result = await invoke(effect, source);
        assert.equal(state.segmentationLoads, 1);
        assert.equal(state.gifLoads, gifs);
        assert.equal(result.getVideoTracks()[0], state.outputs[0]);
        await effect.stopCurrentProcessor();
        await effect.cleanup;
        assert.equal(source.readyState, 'live');
        assert.equal(source.listeners.size, 0);
        assert.equal(state.clones[0].readyState, 'ended');
        assert.equal(state.outputs[0].readyState, 'ended');
        assert.equal(state.models[0].closes, 1);
        if (gifs) {
            assert.equal(state.animation.stops, 1);
            assert.deepEqual(state.revokedUrls, ['blob:background-test']);
        }
    });
}

test('unsupported APIs reject activation before requesting heavy assets', async () => {
    const { effect, source, state } = fixture();
    effect.isSupported = false;
    await assert.rejects(effect.applyBlurToWebRTCStream(source), /not supported/);
    assert.equal(state.segmentationLoads, 0);
    assert.equal(source.readyState, 'live');
});

test('disable in the first scheduler turn cannot resurrect a new processing session', async () => {
    const { effect, source, state } = fixture();
    const activation = effect.applyBlurToWebRTCStream(source);
    await effect.stopCurrentProcessor();
    await assert.rejects(activation, { name: 'AbortError' });
    assert.equal(effect.active, null);
    assert.equal(state.models.length, 0);
});

test('cancellation while dependencies load does not allocate a late model or output', async () => {
    const dependency = deferred();
    const { effect, source, state } = fixture({ segmentation: () => dependency.promise });
    const activation = effect.applyBlurToWebRTCStream(source);
    await until(() => state.segmentationLoads === 1);
    await effect.stopCurrentProcessor();
    await assert.rejects(activation, { name: 'AbortError' });
    dependency.resolve(function UnexpectedModel() {
        throw new Error('must not construct a late model');
    });
    await tick();
    assert.equal(state.models.length, 0);
    assert.equal(state.outputs.length, 0);
    assert.equal(source.readyState, 'live');
});

test('cancelled model initialization closes once after it settles, never before', async () => {
    const ready = deferred();
    const { effect, source, state } = fixture({ initialize: () => ready.promise });
    const activation = effect.applyBlurToWebRTCStream(source);
    await until(() => state.models.length === 1);
    await effect.stopCurrentProcessor();
    await assert.rejects(activation, { name: 'AbortError' });
    assert.equal(state.models[0].closes, 0);
    ready.resolve();
    await effect.cleanup;
    assert.equal(state.models[0].closes, 1);
    assert.equal(state.outputs.length, 0);
});

test('rapid selection switches serialize model cleanup and publish only the latest output', async () => {
    const firstReady = deferred();
    const { effect, source, state } = fixture({
        initialize: (index) => (index === 0 ? firstReady.promise : Promise.resolve()),
    });
    const first = effect.applyBlurToWebRTCStream(source);
    await until(() => state.models.length === 1);
    const second = effect.applyTransparentVirtualBackgroundToWebRTCStream(source);
    await assert.rejects(first, { name: 'AbortError' });
    assert.equal(state.models.length, 1);
    firstReady.resolve();
    const output = await second;
    assert.equal(state.models.length, 2);
    assert.equal(state.models[0].closes, 1);
    assert.equal(state.outputs.length, 1);
    assert.equal(output.getVideoTracks()[0], state.outputs[0]);
    await effect.stopCurrentProcessor();
    await effect.cleanup;
});

test('model initialization failure releases resources and the next activation can retry', async () => {
    const { effect, source, state } = fixture({
        initialize: (index) => (index === 0 ? Promise.reject(new Error('model offline')) : Promise.resolve()),
    });
    await assert.rejects(effect.applyBlurToWebRTCStream(source), /model offline/);
    await effect.cleanup;
    assert.equal(source.readyState, 'live');
    assert.equal(state.models[0].closes, 1);
    await effect.applyBlurToWebRTCStream(source);
    await effect.stopCurrentProcessor();
    await effect.cleanup;
    assert.equal(state.models[1].closes, 1);
});

test('image load failure retains raw capture and allows another selection', async () => {
    const { effect, source, state } = fixture();
    await assert.rejects(effect.applyVirtualBackgroundToWebRTCStream(source, 'fail.png'), /Could not load/);
    await effect.cleanup;
    assert.equal(state.outputs.length, 0);
    assert.equal(source.readyState, 'live');
    await effect.applyVirtualBackgroundToWebRTCStream(source, 'okay.png');
    await effect.stopCurrentProcessor();
    await effect.cleanup;
});

test('late GIF callback after disabling stops animation instead of starting it', async () => {
    let decoded;
    const { effect, source, state } = fixture({
        gif: (callback, animation) => {
            decoded = () => callback(animation);
        },
    });
    const activation = effect.applyVirtualBackgroundToWebRTCStream(source, 'animation.gif');
    await until(() => decoded);
    await effect.stopCurrentProcessor();
    await assert.rejects(activation, { name: 'AbortError' });
    decoded();
    await effect.cleanup;
    assert.equal(state.animation.starts, 0);
    assert.equal(state.animation.stops, 1);
    assert.equal(state.outputs.length, 0);
});

for (const [name, delay, expected] of [
    ['zero', 0, 10],
    ['negative', -1, 10],
    ['nonfinite', NaN, 10],
    ['one centisecond', 1, 2],
    ['two centiseconds', 2, 2],
    ['normal', 10, 10],
]) {
    test(`GIF catch-up loop always progresses: ${name}`, () => {
        const { effect } = fixture();
        const animation = { _frames: [{ delay }] };
        effect.normalizeGifFrameDelays(animation);
        assert.equal(animation._frames[0].delay, expected);
    });
}

test('unknown GIF decoder layout is rejected rather than starting an unsafe animation', () => {
    const { effect } = fixture();
    assert.throws(() => effect.normalizeGifFrameDelays({}), /Unsupported GIF decoder/);
});

test('cancelled GIF download aborts the request and never starts decoding', async () => {
    const download = deferred();
    const { effect, source, state } = fixture({ fetch: () => download.promise });
    const activation = effect.applyVirtualBackgroundToWebRTCStream(source, 'animation.gif');
    await until(() => state.gifRequests.length === 1);
    await effect.stopCurrentProcessor();
    await assert.rejects(activation, { name: 'AbortError' });
    assert.equal(state.gifRequests[0].signal.aborted, true);
    download.resolve({ ok: true, blob: async () => ({}) });
    await effect.cleanup;
    assert.equal(state.animation, undefined);
    assert.equal(state.revokedUrls.length, 0);
});

test('GIF download failure closes its model and preserves the original camera', async () => {
    const { effect, source, state } = fixture({ fetch: async () => ({ ok: false }) });
    await assert.rejects(effect.applyVirtualBackgroundToWebRTCStream(source, 'animation.gif'), /Could not load/);
    await effect.cleanup;
    assert.equal(source.readyState, 'live');
    assert.equal(state.models[0].closes, 1);
    assert.equal(state.animation, undefined);
});

test('real stream pipeline bounds segmentation sends and releases every consumed frame/bitmap', async () => {
    const { effect, source, state, Frame } = fixture();
    await effect.applyBlurToWebRTCStream(source);
    const frames = Array.from({ length: 6 }, () => new Frame());
    for (const frame of frames) state.processors[0].controller.enqueue(frame);
    await until(() => state.frames.length === 6);
    assert.equal(state.models[0].sends, 2);
    assert.ok(frames.every((frame) => frame.closes > 0));
    assert.ok(state.bitmaps.every((bitmap) => bitmap.closes > 0));
    await effect.stopCurrentProcessor();
    await effect.cleanup;
    assert.equal(source.readyState, 'live');
});

test('camera hardware end stops background and its generated track', async () => {
    const { effect, source, state } = fixture();
    await effect.applyBlurToWebRTCStream(source);
    source.end();
    await effect.cleanup;
    assert.equal(effect.active, null);
    assert.equal(state.outputs[0].readyState, 'ended');
});

test('camera owner release closes raw and generated capture, but not unrelated call tracks', async () => {
    const { effect, stream, state, context } = fixture();
    const owner = { cameraCaptureGeneration: 1 };
    const unrelated = {
        stops: 0,
        stop() {
            this.stops++;
        },
    };
    await context.BodrikBackgroundCapture.prepare(owner, stream, 1, effect, { blurLevel: 10 });
    context.BodrikBackgroundCapture.release(owner, effect);
    await effect.cleanup;
    assert.equal(stream.getVideoTracks()[0].readyState, 'ended');
    assert.equal(state.outputs[0].readyState, 'ended');
    assert.equal(unrelated.stops, 0);
    assert.equal(owner.cameraSourceStream, null);
});

test('activation failure reports an actionable warning and publishes only the original camera stream', async () => {
    const { effect, stream, state, context } = fixture({ initialize: () => Promise.reject(new Error('offline')) });
    const owner = { cameraCaptureGeneration: 1 };
    const result = await context.BodrikBackgroundCapture.prepare(owner, stream, 1, effect, { blurLevel: 10 });
    assert.equal(result, stream);
    assert.equal(stream.getVideoTracks()[0].readyState, 'live');
    assert.equal(state.outputs.length, 0);
    assert.ok(state.warnings.some((args) => String(args).includes('Your camera will work without effects')));
    context.BodrikBackgroundCapture.release(owner, effect);
    await effect.cleanup;
});

test('closing camera during model preparation cannot publish its obsolete result', async () => {
    const ready = deferred();
    const { effect, stream, state, context } = fixture({ initialize: () => ready.promise });
    const owner = { cameraCaptureGeneration: 1 };
    const pending = context.BodrikBackgroundCapture.prepare(owner, stream, 1, effect, { blurLevel: 10 });
    await until(() => state.models.length === 1);
    context.BodrikBackgroundCapture.release(owner, effect);
    await assert.rejects(pending, { name: 'AbortError' });
    ready.resolve();
    await effect.cleanup;
    assert.equal(state.outputs.length, 0);
    assert.equal(stream.getVideoTracks()[0].listeners.size, 0);
});

test('hardware camera end reaches its owner without retaining obsolete subscriptions', async () => {
    const { effect, stream, source, context } = fixture();
    const owner = { cameraCaptureGeneration: 1 };
    let ended = 0;
    await context.BodrikBackgroundCapture.prepare(owner, stream, 1, effect, {}, () => {
        ended++;
        context.BodrikBackgroundCapture.release(owner, effect);
    });
    source.end();
    assert.equal(ended, 1);
    assert.equal(source.listeners.size, 0);
    assert.equal(owner.cameraSourceStream, null);
});

test('stale raw camera acquisition is released before any background preparation', async () => {
    const { effect, stream, state, context } = fixture();
    await assert.rejects(
        context.BodrikBackgroundCapture.prepare({ cameraCaptureGeneration: 2 }, stream, 1, effect, {}),
        { name: 'AbortError' }
    );
    assert.equal(stream.getVideoTracks()[0].readyState, 'ended');
    assert.equal(state.segmentationLoads, 0);
});

/** Extract actual producer lifecycle hooks without invoking capture, DOM setup, or signaling. */
function producerHooks() {
    const source = read('RoomClient.js');
    const ast = espree.parse(source, { ecmaVersion: 'latest', range: true });
    const method = ast.body
        .find((node) => node.type === 'ClassDeclaration')
        .body.body.find((node) => node.key.name === 'produce');
    const hooks = new Map();
    /** Locate hook registrations in the current production method. */
    function visit(node) {
        if (!node || typeof node !== 'object') return;
        if (
            node.type === 'CallExpression' &&
            node.callee.object?.name === 'producer' &&
            node.callee.property?.name === 'on'
        ) {
            hooks.set(node.arguments[0].value, source.slice(...node.arguments[1].range));
        }
        for (const [key, value] of Object.entries(node)) {
            if (key === 'range') continue;
            if (Array.isArray(value)) value.forEach(visit);
            else if (value && typeof value === 'object') visit(value);
        }
    }
    visit(method);
    return hooks;
}

for (const [event, callback] of producerHooks()) {
    for (const [name, current, expected] of [
        ['active', 'old-id', 1],
        ['replaced', 'new-id', 0],
        ['new capture pending', undefined, 0],
    ]) {
        test(`producer ${event} hook cannot stop another camera: ${name}`, () => {
            const calls = [];
            const owner = {
                producerLabel: new Map([['videoType', current]]),
                closeProducer: (...args) => calls.push(args),
            };
            const hook = vm
                .runInNewContext(`(function() { return ${callback}; })`, {
                    producer: { id: 'old-id' },
                    type: 'videoType',
                })
                .call(owner);
            hook();
            assert.equal(calls.length, expected);
        });
    }
}

test('a stale preview cannot overwrite the newer no-effect preview', async () => {
    const { context, stream, Stream } = fixture();
    const pending = deferred();
    const effect = {
        generation: 0,
        applyBlurToWebRTCStream() {
            this.generation++;
            return pending.promise;
        },
        async stopCurrentProcessor() {
            this.generation++;
        },
    };
    const video = {};
    const first = context.BodrikBackgroundCapture.preview(effect, video, stream, { blurLevel: 10 });
    assert.equal(await context.BodrikBackgroundCapture.preview(effect, video, stream, {}), true);
    pending.resolve(new Stream([{}]));
    assert.equal(await first, false);
    assert.equal(video.srcObject, stream);
});
