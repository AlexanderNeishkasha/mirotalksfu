const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('./RoomClient.js'), 'utf8');
const view = fs.readFileSync(require.resolve('../views/Room.html'), 'utf8');

/** Load the production client class without opening a browser or a media device. */
function recoveryMethods(rejoin) {
    const events = [];
    const context = {
        console: { info() {}, error() {}, warn() {} },
        VideoAI: { active: false },
        window: { BodrikNetworkRecovery: { rejoin } },
        startRoomSession() {
            events.push('session resumed');
        },
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
        closeReconnectAlert() {
            events.push('close alert');
        },
        refreshBrowser() {
            throw new Error('must not reload');
        },
    };
    await methods.handleReconnect.call(client);
    assert.equal(client._isConnected, true);
    assert.equal(client.needsReadmission, false);
    assert.deepEqual(events, ['readmit', 'session resumed', 'close alert']);
});

/** Admission failures remain visible and retryable without falling back to a stale URL. */
test('failed readmission shows a retry state without reloading', async () => {
    const { methods } = recoveryMethods(async () => {
        throw new Error('unauthorized');
    });
    let retries = 0;
    const client = {
        socket: { id: 'new', connected: true, recovered: false },
        recoveryDisconnectedAt: Date.now(),
        showMaxAttemptsAlert() {
            retries += 1;
        },
        refreshBrowser() {
            throw new Error('must not reload');
        },
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
        socket: { connected: true },
        _isConnected: true,
        producerTransport: current,
        consumerTransport: { id: 'consumer' },
        handleReconnect() {
            reconnects += 1;
        },
        showReconnectAlert() {
            alerts += 1;
        },
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

/** An intentional exit must not show recovery or readmit while the server acknowledges it. */
test('leaving suppresses signaling and media recovery until exit cleanup', async () => {
    const { methods, events } = recoveryMethods(async () => {
        throw new Error('must not rejoin');
    });
    let acknowledge;
    const client = {
        socket: {
            id: 'peer',
            connected: true,
            request(type, _data, timeout) {
                assert.equal(type, 'exitRoom');
                assert.equal(timeout, 1500);
                return new Promise((resolve) => {
                    acknowledge = resolve;
                });
            },
            off() {},
            io: { off() {} },
        },
        consumerTransport: {
            id: 'consumer',
            close() {
                events.push('consumer closed');
            },
        },
        producerTransport: {
            id: 'producer',
            close() {
                events.push('producer closed');
            },
        },
        closeReconnectAlert() {
            events.push('alert closed');
        },
        stopConsumerReconcile() {},
        handleDisconnect() {
            throw new Error('must not display disconnection');
        },
        showReconnectAlert() {
            throw new Error('must not display recovery');
        },
        handleReconnectAttempt() {
            throw new Error('must not retry');
        },
        event() {
            events.push('exit event');
        },
    };
    methods.exit.call(client);
    assert.equal(client.isLeaving, true);
    assert.equal(client._isConnected, false);
    assert.match(source, /handleSocketDisconnect = \(reason\) => \{\s*if \(this\.isLeaving\) return/);
    assert.match(source, /handleTransportClosed = \(\{ transport_id \}\) => \{\s*if \(this\.isLeaving\) return/);
    await methods.handleReconnect.call(client);
    methods.readmitAfterTransportFailure.call(client, client.producerTransport);
    assert.deepEqual(events, ['alert closed']);
    acknowledge('Successfully exited room');
    await new Promise(setImmediate);
    assert.deepEqual(events, ['alert closed', 'consumer closed', 'producer closed', 'exit event']);
});

/** Invalidate older cached client code that still displays recovery on leave. */
test('the meeting loads the updated exit behavior', () => {
    assert.match(view, /RoomClient\.js\?v=bodrik-21/);
});

/** A lost socket still releases local media immediately instead of waiting for a dead acknowledgment. */
test('leaving after signaling loss cleans up without an exit request', () => {
    const { methods, events } = recoveryMethods(async () => {});
    const client = {
        socket: {
            connected: false,
            request() {
                throw new Error('must not request');
            },
            off() {},
            io: { off() {} },
        },
        producerTransport: {
            close() {
                events.push('producer closed');
            },
        },
        closeReconnectAlert() {},
        stopConsumerReconcile() {},
        event() {
            events.push('exit event');
        },
    };
    methods.exit.call(client);
    assert.deepEqual(events, ['producer closed', 'exit event']);
});

/** A failed exit acknowledgment still releases local resources rather than reopening recovery. */
test('exit request failure cleans up without a reconnect banner', async () => {
    const { methods, events } = recoveryMethods(async () => {});
    const client = {
        socket: {
            connected: true,
            request() {
                return Promise.reject(new Error('offline'));
            },
            off() {},
            io: { off() {} },
        },
        producerTransport: {
            close() {
                events.push('producer closed');
            },
        },
        closeReconnectAlert() {
            events.push('alert closed');
        },
        stopConsumerReconcile() {},
        event() {
            events.push('exit event');
        },
    };
    methods.exit.call(client);
    await new Promise(setImmediate);
    assert.deepEqual(events, ['alert closed', 'producer closed', 'exit event']);
});
