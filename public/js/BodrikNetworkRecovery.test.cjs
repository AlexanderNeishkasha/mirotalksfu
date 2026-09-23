const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

const source = fs.readFileSync(require.resolve('./BodrikNetworkRecovery.js'), 'utf8');

/** Exercise readmission using the same socket without navigating or exposing the prejoin form. */
test('readmits the existing tab and restores a muted microphone', async () => {
    const context = { window: {}, isParticipantsListOpen: false };
    vm.runInNewContext(source, context);
    const events = [];
    const room = { peers: '[]' };
    const client = {
        socket: {
            connected: true,
            id: 'new-id',
            async request(type, data) {
                events.push([type, data]);
                if (type === 'createRoom') throw 'already exists';
                return room;
            },
        },
        peer_id: 'old-id',
        peer_info: { peer_id: 'old-id', peer_audio: false, peer_video: true },
        room_id: 'private-id',
        producerLabel: new Map([['audioType', 'mic'], ['videoType', 'camera']]),
        producers: new Map([['mic', { paused: true }]]),
        consumers: new Map(), consumersProducer: new Map(), consumingProducers: new Set(),
        resumedConsumers: new Set(), chatDataConsumers: new Map(),
        audioConsumers: new Map(),
        videoMediaContainer: { replaceChildren() {} }, videoPinMediaContainer: { replaceChildren() {} },
        localAudioEl: { replaceChildren() {} }, remoteAudioEl: { replaceChildren() {} },
        consumerTransport: { close() { events.push(['close receive']); } },
        producerTransport: { close() { events.push(['close send']); } },
        stopConsumerReconcile() { events.push(['stop reconcile']); },
        getRejoinSecret() { return 'tab-secret'; },
        async joinAllowed(value) {
            assert.equal(value, room);
            assert.equal(this.rejoining, true);
            assert.equal(this.rejoiningMuted, true);
            assert.equal(this.peer_info.peer_id, 'new-id');
            events.push(['joinAllowed']);
        },
    };
    await context.window.BodrikNetworkRecovery.rejoin(client);
    assert.equal(client.peer_id, 'new-id');
    assert.equal(client.peer_info.peer_audio, false);
    assert.equal(client.rejoiningMuted, false);
    assert.deepEqual(events.map(([type]) => type), ['stop reconcile', 'close receive', 'close send', 'createRoom', 'join', 'joinAllowed']);
    assert.equal(events[4][1].rejoin_secret, 'tab-secret');
});

/** Reject a lost socket before admitting a peer to the wrong session. */
test('aborts when signaling changes during readmission', async () => {
    const context = { window: {}, isParticipantsListOpen: false };
    vm.runInNewContext(source, context);
    const client = {
        socket: { connected: true, id: 'old', async request() { this.id = 'changed'; } },
        peer_info: { peer_audio: true }, producerLabel: new Map(), producers: new Map(),
        consumers: new Map(), consumersProducer: new Map(), consumingProducers: new Set(),
        resumedConsumers: new Set(), chatDataConsumers: new Map(), audioConsumers: new Map(),
        videoMediaContainer: { replaceChildren() {} }, videoPinMediaContainer: { replaceChildren() {} },
        localAudioEl: { replaceChildren() {} }, remoteAudioEl: { replaceChildren() {} },
        stopConsumerReconcile() {}, room_id: 'room',
    };
    await assert.rejects(context.window.BodrikNetworkRecovery.rejoin(client), /Signaling changed/);
});

/** A rejected or expired admission token must not create local media or navigate away. */
test('rejects an unauthorized admission without reopening prejoin', async () => {
    const context = { window: {}, isParticipantsListOpen: false };
    vm.runInNewContext(source, context);
    let mediaStarted = false;
    const client = {
        socket: { connected: true, id: 'new', async request(type) {
            if (type === 'createRoom') throw 'already exists';
            return 'unauthorized';
        } },
        peer_info: { peer_audio: false }, producerLabel: new Map(), producers: new Map(),
        consumers: new Map(), consumersProducer: new Map(), consumingProducers: new Set(),
        resumedConsumers: new Set(), chatDataConsumers: new Map(), audioConsumers: new Map(),
        videoMediaContainer: { replaceChildren() {} }, videoPinMediaContainer: { replaceChildren() {} },
        localAudioEl: { replaceChildren() {} }, remoteAudioEl: { replaceChildren() {} },
        stopConsumerReconcile() {}, room_id: 'room', getRejoinSecret() { return 'tab-secret'; },
        async joinAllowed() { mediaStarted = true; },
    };
    await assert.rejects(context.window.BodrikNetworkRecovery.rejoin(client), /rejected/);
    assert.equal(mediaStarted, false);
});
