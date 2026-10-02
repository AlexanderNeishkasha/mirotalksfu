'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { registerRoomChat } = require('./BodrikRoomChat');

/** Build admitted/lobby peers and inspect only Socket.IO deliveries. */
function fixture(moderator = {}) {
    const handlers = new Map();
    const deliveries = [];
    const sender = { peer_name: 'Sender' };
    const target = { peer_name: 'Target' };
    const lobby = { peer_name: 'Lobby', peer_lobby: true };
    const other = { peer_name: 'Other' };
    const room = {
        id: 'room',
        _moderator: moderator,
        peers: new Map([
            ['sender', sender],
            ['target', target],
            ['lobby', lobby],
        ]),
        getPeer(id) {
            return this.peers.get(id);
        },
        send: (id, event, data) => deliveries.push({ id, event, data }),
    };
    const otherRoom = {
        id: 'other',
        peers: new Map([['other', other]]),
        getPeer(id) {
            return this.peers.get(id);
        },
    };
    const socket = { id: 'sender', room_id: 'room', on: (name, handler) => handlers.set(name, handler) };
    registerRoomChat(
        socket,
        new Map([
            ['room', room],
            ['other', otherRoom],
        ]),
        { warn() {} }
    );
    return { handlers, deliveries, room, socket, sender, target, lobby };
}

for (const [name, moderator, message, recipients] of [
    ['public chat', {}, { to_peer_id: 'all' }, ['target']],
    ['private chat', {}, { to_peer_id: 'target' }, ['target']],
    ['unknown private target', {}, { to_peer_id: 'missing' }, []],
    ['blocked public chat', { chat_cant_publicly: true }, { to_peer_id: 'all' }, []],
    ['blocked private chat', { chat_cant_privately: true }, { to_peer_id: 'target' }, []],
]) {
    test(`Socket.IO-only delivery: ${name}`, () => {
        const { handlers, deliveries } = fixture(moderator);
        handlers.get('message')({
            peer_name: 'Sender',
            peer_id: 'forged',
            room_id: 'forged',
            peer_msg: 'hello',
            ...message,
        });
        assert.deepEqual(
            deliveries.map((item) => item.id),
            recipients
        );
        for (const item of deliveries) {
            assert.equal(item.event, 'message');
            assert.equal(item.data.peer_id, 'sender');
            assert.equal(item.data.room_id, 'room');
        }
    });
}

for (const [name, mutate] of [
    [
        'sender identity spoof',
        (data) => {
            data.peer_name = 'Target';
        },
    ],
    [
        'empty text',
        (data) => {
            data.peer_msg = ' ';
        },
    ],
    [
        'missing recipient',
        (data) => {
            delete data.to_peer_id;
        },
    ],
    [
        'oversized text',
        (data) => {
            data.peer_msg = 'x'.repeat(4001);
        },
    ],
    [
        'oversized recipient',
        (data) => {
            data.to_peer_id = 'x'.repeat(161);
        },
    ],
    [
        'oversized name',
        (data) => {
            data.peer_name = 'x'.repeat(65);
        },
    ],
    [
        'oversized message id',
        (data) => {
            data.msg_id = 'x'.repeat(161);
        },
    ],
    [
        'sender in lobby',
        (_data, f) => {
            f.sender.peer_lobby = true;
        },
    ],
    [
        'sender removed',
        (_data, f) => {
            f.room.peers.delete('sender');
        },
    ],
    [
        'sender switched room',
        (_data, f) => {
            f.socket.room_id = 'other';
        },
    ],
]) {
    test(`Socket.IO chat rejects ${name}`, () => {
        const f = fixture();
        const data = { peer_name: 'Sender', peer_msg: 'hello', to_peer_id: 'all' };
        mutate(data, f);
        f.handlers.get('message')(data);
        assert.deepEqual(f.deliveries, []);
    });
}

test('public chat never reaches lobby or a peer in another room', () => {
    const f = fixture();
    f.handlers.get('message')({ peer_name: 'Sender', peer_msg: 'hello', to_peer_id: 'all' });
    assert.deepEqual(
        f.deliveries.map((item) => item.id),
        ['target']
    );
});

for (const [name, reaction, count] of [
    ['add', { msg_id: 'm1', emoji: '👍', action: 'add', peer_name: 'Forged' }, 1],
    ['remove', { msg_id: 'm1', emoji: '👍', action: 'remove' }, 1],
    ['unknown action', { msg_id: 'm1', emoji: '👍', action: 'replace' }, 0],
    ['missing id', { emoji: '👍', action: 'add' }, 0],
    ['missing emoji', { msg_id: 'm1', action: 'add' }, 0],
    ['oversized id', { msg_id: 'x'.repeat(161), emoji: '👍', action: 'add' }, 0],
    ['oversized emoji', { msg_id: 'm1', emoji: '👍'.repeat(9), action: 'add' }, 0],
]) {
    test(`Socket.IO reaction validation: ${name}`, () => {
        const f = fixture();
        f.handlers.get('chatReaction')(reaction);
        assert.equal(f.deliveries.length, count);
        if (count) {
            assert.equal(f.deliveries[0].data.peer_name, 'Sender');
            assert.equal(f.deliveries[0].data.peer_id, 'sender');
            assert.deepEqual(
                f.deliveries.map((item) => item.id),
                ['target']
            );
        }
    });
}

test('chat and reactions share a bounded per-socket signaling budget', () => {
    const f = fixture();
    for (let index = 0; index < 70; index++) {
        f.handlers.get(index % 2 ? 'message' : 'chatReaction')(
            index % 2
                ? { peer_name: 'Sender', peer_msg: `message-${index}`, to_peer_id: 'target' }
                : { msg_id: `m${index}`, emoji: '👍', action: 'add' }
        );
    }
    assert.equal(f.deliveries.length, 60);
});

test('room transport disables SCTP and active client/server code contains no DataChannel path', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const root = path.join(__dirname, '../..');
    const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(read('app/src/Room.js'), /enableSctp: false/);
    for (const file of ['app/src/Server.js', 'app/src/Room.js', 'app/src/Peer.js', 'public/js/RoomClient.js']) {
        assert.doesNotMatch(
            read(file),
            /produceData|consumeData|newDataProducer|dataConsumerClosed|chatDataProducer|DataChannel/,
            file
        );
    }
});
