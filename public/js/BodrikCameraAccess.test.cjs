'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const code = readFileSync(join(__dirname, 'BodrikCameraAccess.js'), 'utf8');

/** Capture camera UI, permission probes, publication and cleanup without touching real hardware. */
function harness({ capture, enumerate, options = [] } = {}) {
    const select = { options };
    const notice = {};
    const button = {
        addEventListener: (_, fn) => {
            button.click = fn;
        },
        removeEventListener: () => {
            button.removed = true;
        },
    };
    const status = { textContent: '' };
    const nodes = {
        videoSelect: select,
        cameraAccessNotice: notice,
        cameraAccessRetry: button,
        cameraAccessStatus: status,
    };
    let cleanup;
    let refresh;
    let stopped = 0;
    let captures = 0;
    let authorized = options.length > 0;
    const dialogs = [];
    const disabled = [];
    const stream = { getTracks: () => [{ stop: () => stopped++ }] };
    const context = {
        console: { warn() {} },
        document: { getElementById: (id) => nodes[id] },
        navigator: {
            mediaDevices: {
                getUserMedia: async () => {
                    captures++;
                    const result = capture ? await capture() : stream;
                    authorized = true;
                    return result;
                },
            },
        },
        enumerateVideoDevices:
            enumerate ||
            (async () => {
                if (authorized) select.options = [{ value: 'camera', disabled: false }];
                return select.options.length > 0;
            }),
        MutationObserver: class {
            constructor(fn) {
                refresh = fn;
            }
            observe() {}
            disconnect() {
                button.disconnected = true;
            }
        },
        window: {
            addEventListener: (_, fn) => {
                cleanup = fn;
            },
        },
        Swal: {
            fire: (data) => {
                dialogs.push(data);
                return Promise.resolve({ isConfirmed: false });
            },
        },
        swalBackground: '#222',
        RoomClient: { mediaType: { video: 'videoType' } },
        setVideoButtonsDisabled: (value) => disabled.push(value),
    };
    vm.runInNewContext(code, context);
    return {
        select,
        notice,
        button,
        status,
        stream,
        cleanup,
        refresh,
        context,
        dialogs,
        disabled,
        stopped: () => stopped,
        captures: () => captures,
    };
}

test('initial permission grants restore device choices and release the probe', async () => {
    const h = harness();
    assert.equal(h.select.hidden, true);
    await h.button.click();
    assert.equal(h.select.hidden, false);
    assert.equal(h.notice.hidden, true);
    assert.equal(h.stopped(), 1);
    assert.equal(h.captures(), 1);
});

test('permissions granted in site settings reveal devices without opening a busy camera', async () => {
    const h = harness({
        options: [{ value: 'camera', disabled: false }],
        capture: async () => {
            throw new Error('must not open camera');
        },
    });
    await h.button.click();
    assert.equal(h.select.hidden, false);
    assert.equal(h.captures(), 0);
    assert.equal(h.status.textContent, '');
});

for (const [name, expected] of [
    ['NotAllowedError', 'Camera access is blocked.'],
    ['SecurityError', 'Camera access is blocked.'],
    ['NotFoundError', 'No cameras found'],
    ['NotReadableError', 'The camera is busy or unavailable.'],
]) {
    test(`camera retry explains ${name} and permits another attempt`, async () => {
        const h = harness({
            capture: async () => {
                const error = new Error('capture failed');
                error.name = name;
                throw error;
            },
        });
        await h.button.click();
        assert.ok(h.status.textContent.startsWith(expected));
        assert.equal(h.button.disabled, false);
        assert.equal(h.notice.hidden, false);
    });
}

test('unsupported capture APIs explain the secure-context requirement', async () => {
    const h = harness();
    h.context.navigator = {};
    await h.button.click();
    assert.equal(h.status.textContent, 'Camera access requires a supported browser and a secure connection.');
});

test('enumeration failure after permission grant still releases the probe', async () => {
    let calls = 0;
    const h = harness({
        enumerate: async () => {
            if (++calls === 1) return false;
            throw new Error('enumeration failed');
        },
    });
    await h.button.click();
    assert.equal(h.stopped(), 1);
    assert.equal(h.notice.hidden, false);
});

test('duplicate retries are suppressed and page exit cancels obsolete UI work', async () => {
    let resolve;
    const h = harness({
        capture: () =>
            new Promise((r) => {
                resolve = r;
            }),
    });
    const first = h.button.click();
    await h.button.click();
    assert.equal(h.captures(), 1);
    h.cleanup();
    resolve(h.stream);
    await first;
    assert.equal(h.stopped(), 1);
    assert.equal(h.select.options.length, 0);
    assert.equal(h.button.disconnected, true);
    assert.equal(h.button.removed, true);
});

test('camera activation publishes once without an extra permission probe', async () => {
    const h = harness({ options: [{ value: 'chosen-camera', disabled: false }] });
    h.select.value = 'chosen-camera';
    const publications = [];
    await h.context.window.BodrikCameraAccess.startCamera({
        produce: async (...args) => {
            publications.push(args);
            return { id: 'producer' };
        },
    });
    assert.deepEqual(publications, [['videoType', 'chosen-camera']]);
    assert.equal(h.captures(), 0);
    assert.deepEqual(h.disabled, [true, false]);
});

test('capture failure restores controls and shows actionable copy, not technical internals', async () => {
    const h = harness();
    await h.context.window.BodrikCameraAccess.startCamera({
        produce: async () => {
            const error = new Error('Already in use');
            error.name = 'NotReadableError';
            throw error;
        },
    });
    assert.equal(h.dialogs.length, 1);
    assert.equal(h.dialogs[0].title, 'Camera unavailable');
    assert.ok(h.dialogs[0].text.startsWith('The camera is busy or unavailable.'));
    assert.deepEqual(h.disabled, [true, false]);
});
