const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('./RoomClient.js'), 'utf8');

/** Load the production client class without opening a browser or a media device. */
function recoveryMethods(rejoin) {
    const events = [];
    const context = {
        console: { info() {}, error() {} },
        window: { BodrikNetworkRecovery: { rejoin } },
        startRoomSession() { events.push('session resumed'); },
    };
    vm.runInNewContext(`${source}; globalThis.RecoveryClient = RoomClient`, context);
    return { methods: context.RecoveryClient.prototype, events };
}

/** An unrecovered signaling socket must re-enter in the same tab, not navigate. */
test('unrecovered socket readmits in place and resumes the session', async () => {
    const { methods, events } = recoveryMethods(async () => events.push('readmit'));
    const client = {
        socket: { id: 'new', connected: true, recovered: false },
        recoveryDisconnectedAt: Date.now(),
        closeReconnectAlert() { events.push('close alert'); },
        refreshBrowser() { throw new Error('must not reload'); },
    };
    await methods.handleReconnect.call(client);
    assert.equal(client._isConnected, true);
    assert.equal(client.needsReadmission, false);
    assert.deepEqual(events, ['readmit', 'session resumed', 'close alert']);
});

/** Admission failures remain visible and retryable without falling back to a stale URL. */
test('failed readmission shows a retry state without reloading', async () => {
    const { methods } = recoveryMethods(async () => { throw new Error('unauthorized'); });
    let retries = 0;
    const client = {
        socket: { id: 'new', connected: true, recovered: false },
        recoveryDisconnectedAt: Date.now(),
        showMaxAttemptsAlert() { retries += 1; },
        refreshBrowser() { throw new Error('must not reload'); },
    };
    await methods.handleReconnect.call(client);
    assert.equal(client._isConnected, false);
    assert.equal(client.needsReadmission, true);
    assert.equal(retries, 1);
});

/** A dead current media transport triggers one readmission; old transport events do not. */
test('transport failure readmits only the current connected room', () => {
    const { methods } = recoveryMethods(async () => {});
    const current = { id: 'current' };
    let reconnects = 0;
    let alerts = 0;
    const client = {
        socket: { connected: true }, _isConnected: true,
        producerTransport: current, consumerTransport: { id: 'consumer' },
        handleReconnect() { reconnects += 1; },
        showReconnectAlert() { alerts += 1; },
    };
    methods.readmitAfterTransportFailure.call(client, { id: 'obsolete' });
    assert.equal(reconnects, 0);
    methods.readmitAfterTransportFailure.call(client, current);
    assert.equal(client.needsReadmission, true);
    assert.equal(client._isConnected, false);
    assert.equal(reconnects, 1);
    assert.equal(alerts, 1);
    methods.readmitAfterTransportFailure.call(client, current);
    assert.equal(reconnects, 1);
});
