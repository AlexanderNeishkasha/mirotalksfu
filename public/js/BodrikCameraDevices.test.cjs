'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const code = readFileSync(join(__dirname, 'BodrikCameraDevices.js'), 'utf8');

/** Exercise enumeration with real control flow, including missing prejoin selectors and capture failures. */
function harness(devices, { enumerationError = false } = {}) {
    const select = {
        options: [],
        set innerHTML(_) {
            this.options = [];
        },
    };
    let stopped = 0;
    let captures = 0;
    const context = {
        console: { warn() {} },
        videoSelect: select,
        initVideoSelect: null,
        isEnumerateVideoDevices: false,
        isVideoAllowed: false,
        lS: { DEVICES_COUNT: { video: 99 } },
        navigator: {
            mediaDevices: {
                getUserMedia: async () => {
                    captures++;
                    return { getTracks: () => [{ stop: () => stopped++ }] };
                },
                enumerateDevices: async () => {
                    if (enumerationError) throw new Error('enumeration failed');
                    return devices;
                },
            },
        },
        addChild: async (device, selects) => {
            for (const target of selects) target.options.push({ value: device.deviceId });
        },
    };
    vm.runInNewContext(code, context);
    return { context, select, stopped: () => stopped, captures: () => captures };
}

test('enumeration exposes authorized devices without opening them, ignores anonymous entries and absent selectors', async () => {
    const h = harness([
        { kind: 'videoinput', deviceId: 'camera', label: 'Camera' },
        { kind: 'videoinput', deviceId: 'blocked', label: '' },
        { kind: 'audioinput', deviceId: 'mic', label: 'Mic' },
    ]);
    assert.equal(await h.context.enumerateVideoDevices(), true);
    assert.equal(h.select.options.length, 1);
    assert.equal(h.context.lS.DEVICES_COUNT.video, 1);
    assert.equal(h.captures(), 0);
    await h.context.enumerateVideoDevices();
    assert.equal(h.select.options.length, 1);
    assert.equal(h.context.lS.DEVICES_COUNT.video, 1);
});

test('initial permission probes are released when enumeration fails', async () => {
    const h = harness([], { enumerationError: true });
    assert.equal(await h.context.initEnumerateVideoDevices(), false);
    assert.equal(h.context.isVideoAllowed, false);
    assert.equal(h.stopped(), 1);
});

test('Hide Me is retired without removing moderation or ordinary grid filters', () => {
    for (const file of ['Room.js', 'RoomClient.js', 'Rules.js']) {
        const source = readFileSync(join(__dirname, file), 'utf8');
        assert.doesNotMatch(source, /isHideMeActive|getHideMeActive|handleHideMe|hideMeButton/);
    }
    const page = readFileSync(join(__dirname, '../views/Room.html'), 'utf8');
    assert.doesNotMatch(page, /hideMeButton|Toggle hide myself/);
    assert.match(readFileSync(join(__dirname, 'RoomClient.js'), 'utf8'), /confirmPeerAction\(/);
});
