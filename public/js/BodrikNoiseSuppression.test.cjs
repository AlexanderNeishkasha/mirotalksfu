'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const read = (name) => readFileSync(path.join(__dirname, name), 'utf8');

/** Load the lightweight selector/loader with inspectable script insertion. */
function fixture() {
    const scripts = [];
    const window = { location: { href: 'https://meet.test/room/x', origin: 'https://meet.test' } };
    const context = {
        window,
        URL,
        setTimeout,
        clearTimeout,
        document: {
            currentScript: { src: 'https://meet.test/js/BodrikNoiseSuppression.js?v=source-sha' },
            head: { appendChild: (script) => scripts.push(script) },
            createElement: () => ({
                remove() {
                    this.removed = true;
                },
            }),
        },
    };
    vm.runInNewContext(read('BodrikNoiseSuppression.js'), context);
    return { scripts, window, api: window.BodrikNoiseSuppression };
}

for (const [input, expected] of [
    ['off', 'off'],
    ['browser', 'browser'],
    ['rnnoise', 'rnnoise'],
    [undefined, 'off'],
    ['invalid', 'off'],
]) {
    test(`noise mode normalization: ${String(input)} → ${expected}`, () => {
        assert.equal(fixture().api.normalize(input), expected);
    });
}

for (const [mode, expected] of [
    ['off', false],
    ['browser', true],
    ['rnnoise', false],
    ['invalid', false],
]) {
    test(`browser constraint is exclusive for ${mode}`, () => {
        assert.equal(fixture().api.browserConstraint(mode), expected);
    });
}

test('ordinary room startup loads only the lightweight selector, not RNNoise/WASM controllers', () => {
    const page = readFileSync(path.join(__dirname, '../views/Room.html'), 'utf8');
    assert.match(page, /BodrikNoiseSuppression\.js/);
    assert.doesNotMatch(page, /NodeProcessor\.js|NoiseSuppressionProcessor\.js|RnnoiseSync\.js/);
});

test('explicit RNNoise load is shared and carries the room asset revision', async () => {
    const { api, scripts, window } = fixture();
    const first = api.load();
    assert.equal(api.load(), first);
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].src, '/js/NodeProcessor.js?v=source-sha');
    window.RNNoiseProcessor = class RNNoiseProcessor {};
    scripts[0].onload();
    assert.equal(await first, window.RNNoiseProcessor);
});

test('failed RNNoise load removes the script and remains retryable', async () => {
    const { api, scripts } = fixture();
    const first = api.load();
    scripts[0].onerror();
    await assert.rejects(first, /Could not load RNNoise/);
    assert.equal(scripts[0].removed, true);
    const second = api.load();
    assert.notEqual(second, first);
    scripts[1].onerror();
    await assert.rejects(second, /Could not load RNNoise/);
});

test('RoomClient initializes RNNoise only for the exclusive rnnoise mode and falls back to browser capture', () => {
    const client = read('RoomClient.js');
    assert.match(client, /mic_noise_suppression_mode\) === 'rnnoise'/);
    assert.match(client, /RNNoise unavailable; falling back to browser noise suppression/);
    assert.match(client, /mic_noise_suppression_mode = 'browser'/);
    assert.match(
        client,
        /stream = await navigator\.mediaDevices\.getUserMedia\(this\.getAudioConstraints\(deviceId\)\)/
    );
});
