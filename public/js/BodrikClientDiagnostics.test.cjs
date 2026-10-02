'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const code = readFileSync(join(__dirname, 'BodrikClientDiagnostics.js'), 'utf8');

/** Run client diagnostics with controllable signaling, timers and browser events. */
function harness() {
    const windowHandlers = new Map();
    const socketHandlers = new Map();
    const emitted = [];
    let timer;
    const socket = {
        connected: true,
        recovered: false,
        on: (name, callback) => socketHandlers.set(name, callback),
        emit: (name, payload, acknowledge) => {
            emitted.push({ name, payload });
            acknowledge?.();
        },
    };
    const context = {
        window: { addEventListener: (name, callback) => windowHandlers.set(name, callback) },
        navigator: { onLine: true },
        document: { visibilityState: 'visible' },
        Error,
        DOMException,
        console: { warn() {} },
        setTimeout: (callback) => {
            timer = callback;
            return 1;
        },
        clearTimeout: () => {
            timer = null;
        },
    };
    vm.runInNewContext(code, context);
    context.window.BodrikClientDiagnostics.attach(socket);
    context.window.BodrikClientDiagnostics.setEnabled(true);
    return {
        api: context.window.BodrikClientDiagnostics,
        socket,
        socketHandlers,
        windowHandlers,
        emitted,
        runTimer: () => timer?.(),
    };
}

for (const mode of ['off', 'browser', 'rnnoise']) {
    test(`microphone diagnostic records ${mode} without device identifiers`, () => {
        const h = harness();
        h.socketHandlers.get('bodrikDiagnosticsReady')();
        h.api.reportMic(
            { mic_noise_suppression_mode: mode, mic_echo_cancellation: true, mic_auto_gain_control: false },
            {
                getSettings: () => ({
                    noiseSuppression: false,
                    echoCancellation: true,
                    autoGainControl: false,
                    sampleRate: 48000,
                    channelCount: 1,
                    deviceId: 'private',
                    groupId: 'private',
                }),
            },
            'capture',
            mode === 'rnnoise'
        );
        h.runTimer();
        const event = h.emitted[0].payload[0];
        assert.equal(event.type, 'mic_processing');
        assert.equal(event.details.noise_mode, mode);
        assert.equal(event.details.echo_actual, true);
        assert.equal(event.details.gain_actual, false);
        assert.equal(event.details.deviceId, undefined);
        assert.equal(event.details.groupId, undefined);
        assert.equal(event.details.rnnoise_active, mode === 'rnnoise');
    });
}

test('missing track settings remain unknown and disabled collection never reads the track', () => {
    const h = harness();
    h.socketHandlers.get('bodrikDiagnosticsReady')();
    h.api.reportMic({}, null, 'rnnoise_fallback');
    h.runTimer();
    assert.equal(h.emitted[0].payload[0].details.echo_actual, undefined);
    h.api.setEnabled(false);
    h.api.reportMic(
        {},
        {
            getSettings() {
                throw new Error('must not read');
            },
        },
        'capture'
    );
});

test('RNNoise diagnostics use raw input settings rather than processed output', () => {
    const h = harness();
    h.socketHandlers.get('bodrikDiagnosticsReady')();
    h.api.reportCapture(
        { mic_noise_suppression_mode: 'rnnoise' },
        {
            isProcessing: true,
            mediaStream: { getAudioTracks: () => [{ getSettings: () => ({ echoCancellation: true }) }] },
        },
        { getSettings: () => ({ echoCancellation: false }) }
    );
    h.runTimer();
    assert.equal(h.emitted[0].payload[0].details.echo_actual, true);
    assert.equal(h.emitted[0].payload[0].details.rnnoise_active, true);
});

for (const [name, error, code, message] of [
    ['TURN error', { errorCode: 401, errorText: 'Unauthorized' }, '401', 'Unauthorized'],
    ['unreachable server', { errorCode: 701, errorText: 'Server unreachable' }, '701', 'Server unreachable'],
    ['missing code', { errorText: 'Failure' }, undefined, 'Failure'],
    ['missing text', { errorCode: 701 }, '701', undefined],
]) {
    test(`ICE event details preserve meaningful code and text: ${name}`, () => {
        const h = harness();
        const details = h.api.errorDetails({ ...error, url: 'turn:private', address: 'private', port: 5349 });
        assert.equal(details.code, code);
        assert.equal(details.message, message);
        assert.equal(details.name, 'RTCPeerConnectionIceErrorEvent');
        assert.equal(details.url, undefined);
        assert.equal(details.address, undefined);
        assert.equal(details.port, undefined);
    });
}

test('ICE error text remains bounded and redacted', () => {
    const details = harness().api.errorDetails({
        errorCode: 701,
        errorText: 'https://secret.test token=secret\n' + 'x'.repeat(500),
    });
    assert.ok(details.message.length <= 240);
    assert.equal(details.message.includes('secret'), false);
    assert.equal(details.message.includes('\n'), false);
});

test('diagnostics stay disabled until the joined server opts in', () => {
    const h = harness();
    h.api.setEnabled(false);
    h.api.report('browser_error', { message: 'disabled' });
    h.socketHandlers.get('bodrikDiagnosticsReady')();
    h.runTimer();
    assert.equal(h.emitted.length, 0);
});

test('events queue before admission and flush in bounded batches after server readiness', () => {
    const h = harness();
    for (let index = 0; index < 25; index++) h.api.report('transport_state', { state: 'connected', ignored: 'drop' });
    h.runTimer();
    assert.equal(h.emitted.length, 0);
    h.socketHandlers.get('bodrikDiagnosticsReady')();
    h.runTimer();
    assert.equal(h.emitted.length, 2);
    assert.equal(h.emitted[0].payload.length, 20);
    assert.equal(h.emitted[1].payload.length, 5);
    assert.equal(h.emitted[0].payload[0].details.ignored, undefined);
});

test('disconnect keeps queued diagnostics for the next admitted signaling connection', () => {
    const h = harness();
    h.socketHandlers.get('bodrikDiagnosticsReady')();
    h.socketHandlers.get('disconnect')();
    h.api.report('signaling_disconnect', { reason: 'ping timeout' });
    h.runTimer();
    assert.equal(h.emitted.length, 0);
    h.socket.connected = true;
    h.socketHandlers.get('connect')();
    h.socketHandlers.get('bodrikDiagnosticsReady')();
    h.runTimer();
    assert.equal(h.emitted[0].payload[0].details.reason, 'ping timeout');
});

test('browser errors are bounded and redact URLs and token-like values', () => {
    const h = harness();
    h.socketHandlers.get('bodrikDiagnosticsReady')();
    h.windowHandlers.get('error')({ error: new Error('failed https://private.test/path?token=secret token=abc') });
    h.runTimer();
    const event = h.emitted[0].payload[0];
    assert.equal(event.type, 'browser_error');
    assert.equal(event.details.message.includes('secret'), false);
    assert.equal(event.details.message.includes('private.test'), false);
});

test('queue remains bounded while offline and pagehide drops obsolete data', () => {
    const h = harness();
    h.socket.connected = false;
    for (let index = 0; index < 140; index++) h.api.report('transport_state', { state: String(index) });
    h.runTimer();
    h.socket.connected = true;
    h.socketHandlers.get('bodrikDiagnosticsReady')();
    for (let index = 0; index < 5; index++) h.runTimer();
    assert.equal(h.emitted.flatMap((batch) => batch.payload).length, 100);
    h.windowHandlers.get('pagehide')();
    h.api.report('browser_error', { message: 'must not queue' });
    assert.equal(h.emitted.flatMap((batch) => batch.payload).length, 100);
});

test('room loads diagnostics before RoomClient and instruments connection recovery boundaries', () => {
    const page = readFileSync(join(__dirname, '../views/Room.html'), 'utf8');
    const client = readFileSync(join(__dirname, 'RoomClient.js'), 'utf8');
    assert.ok(page.indexOf('BodrikClientDiagnostics.js') < page.indexOf('RoomClient.js'));
    assert.match(client, /BodrikClientDiagnostics\.attach\(socket\)/);
    assert.match(client, /BodrikClientDiagnostics\.setEnabled\(room\.clientDiagnosticsEnabled === true\)/);
    for (const event of [
        'signaling_disconnect',
        'signaling_error',
        'transport_state',
        'ice_candidate_error',
        'recovery_start',
        'recovery_success',
        'recovery_failure',
    ]) {
        const implementation = event.startsWith('recovery_')
            ? readFileSync(join(__dirname, 'BodrikNetworkRecovery.js'), 'utf8')
            : client;
        assert.ok(implementation.includes(`report('${event}'`), event);
    }
});
