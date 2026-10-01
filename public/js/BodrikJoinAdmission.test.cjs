'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const source = readFileSync(join(__dirname, 'RoomClient.js'), 'utf8');

/** Exercise the actual admission method with signaling and rendering boundaries captured. */
function admission(result, failure = false) {
    let finish;
    const completed = new Promise((resolve) => {
        finish = resolve;
    });
    const events = [];
    const context = {
        console: { log() {}, warn() {}, error() {} },
        endRoomSession: () => events.push('end session'),
        popupHtmlMessage: (...args) => finish({ popup: args }),
    };
    vm.runInNewContext(`${source}; globalThis.Client = RoomClient`, context);
    const client = {
        socket: {
            request: (event, data) => {
                events.push({ event, data });
                return failure ? Promise.reject(result) : Promise.resolve(result);
            },
        },
        joinAllowed: async (room) => finish({ room }),
        event: (event) => events.push(event),
    };
    for (const name of [
        'roomInvalid',
        'userRoomNotAllowed',
        'userUnauthorized',
        'roomJoinLocked',
        'unlockTheRoom',
        'waitJoinConfirm',
        'isBanned',
    ]) {
        client[name] = () => finish({ rejected: name });
    }
    return { client, events, completed, method: context.Client.prototype.join };
}

test(
    'successful admission requests the room and initializes participants and session state',
    { timeout: 1000 },
    async () => {
        const room = {
            peers: JSON.stringify([['peer-id', { peer_info: { peer_name: 'Participant' } }]]),
            recUploadToken: 'test-recording-token',
            sessionId: 'test-session',
        };
        const { client, events, completed, method } = admission(room);
        const data = { room_id: 'test-room' };
        await method.call(client, data);
        const outcome = await completed;
        assert.deepEqual(events[0], { event: 'join', data });
        assert.equal(outcome.room, room);
        assert.equal(client.peers.size, 1);
        assert.equal(client.peers.get('peer-id').peer_info.peer_name, 'Participant');
        assert.equal(client.recUploadToken, 'test-recording-token');
        assert.equal(client.sessionId, 'test-session');
    }
);

for (const [response, handler] of [
    ['invalid', 'roomInvalid'],
    ['notAllowed', 'userRoomNotAllowed'],
    ['unauthorized', 'userUnauthorized'],
    ['isJoinLocked', 'roomJoinLocked'],
    ['isLocked', 'unlockTheRoom'],
    ['isLobby', 'waitJoinConfirm'],
    ['isBanned', 'isBanned'],
]) {
    test(`rejected admission keeps the existing response path: ${response}`, { timeout: 1000 }, async () => {
        const { client, completed, method } = admission(response);
        await method.call(client, {});
        assert.equal((await completed).rejected, handler);
        assert.equal(client.peers, undefined);
    });
}

test(
    'full rooms and signaling failures report errors rather than initializing participants',
    { timeout: 1000 },
    async () => {
        for (const [response, failure] of [
            [{ maxParticipantsReached: true, maxParticipants: 2 }, false],
            [new Error('offline'), true],
        ]) {
            const { client, completed, method } = admission(response, failure);
            await method.call(client, {});
            assert.ok((await completed).popup);
            assert.equal(client.peers, undefined);
        }
    }
);
