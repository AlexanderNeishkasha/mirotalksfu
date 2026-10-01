'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const read = (file) => readFileSync(join(__dirname, file), 'utf8');

for (const [name, videos, expected] of [
    ['audio only', [], 'audio/webm;codecs=opus'],
    ['camera', [{}], 'video/webm;codecs=vp8,opus'],
]) {
    test(`recording MIME matches the actual tracks: ${name}`, () => {
        const context = { MediaRecorder: { isTypeSupported: (type) => type === 'audio/webm;codecs=opus' } };
        vm.runInNewContext(read('BodrikRecordingLifecycle.js'), context);
        assert.equal(
            context.getRecordingOptions({ getVideoTracks: () => videos }, { mimeType: 'video/webm;codecs=vp8,opus' })
                .mimeType,
            expected
        );
    });
}

test('stop keeps the graph alive through final data, then releases it in the stop callback', async () => {
    const events = [];
    const recorder = {
        state: 'recording',
        stop() {
            events.push('request stop');
            this.state = 'inactive';
        },
    };
    const client = {
        mediaRecorder: recorder,
        _recordingStarted: true,
        recScreenAudioTracks: [],
        audioRecorder: { stopMixedAudioStream: () => events.push('release graph') },
        recording: { recSyncServerRecording: false },
        toggleVideoAudioTabs() {},
        disableRecordingOptions() {},
        handleLocalRecordingStop: () => events.push('save final data'),
        event: () => events.push('UI stopped'),
        recordingAction() {},
        sound() {},
    };
    const context = {
        rc: client,
        document: { getElementById: () => ({ innerText: '7s' }) },
        console: { log() {}, error() {} },
    };
    vm.runInNewContext(
        `${read('BodrikRecordingLifecycle.js')}; ${read('RoomClient.js')}; globalThis.Client = RoomClient`,
        context
    );
    context.Client.prototype.stopRecording.call(client);
    context.Client.prototype.stopRecording.call(client);
    assert.deepEqual(events, ['request stop']);
    assert.equal(client.mediaRecorder, recorder);
    events.push('final data available');
    await context.Client.prototype.handleMediaRecorderStop.call(recorder, { target: recorder });
    assert.deepEqual(events, [
        'request stop',
        'final data available',
        'save final data',
        'release graph',
        'UI stopped',
    ]);
    assert.equal(client.mediaRecorder, null);
});

test('startup waits for the audio graph before starting the recorder', async () => {
    const events = [];
    let ready;
    const recorder = {};
    const client = {
        mediaRecorder: recorder,
        audioRecorder: {
            resume: () =>
                new Promise((resolve) => {
                    ready = resolve;
                }),
        },
        handleMediaRecorder: () => events.push('start encoder'),
        event: () => events.push('UI started'),
        recordingAction() {},
        sound() {},
    };
    const context = {};
    vm.runInNewContext(`${read('RoomClient.js')}; globalThis.Client = RoomClient`, context);
    const pending = context.Client.prototype.initRecording.call(client);
    assert.deepEqual(events, []);
    ready();
    await pending;
    assert.deepEqual(events, ['start encoder', 'UI started']);
});
