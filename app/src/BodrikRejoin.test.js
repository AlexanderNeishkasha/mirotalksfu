'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { bindRejoinSecret, findDisconnectedRejoinPeers } = require('./BodrikRejoin');

const secret = '12345678-1234-4123-8123-123456789abc';
const otherSecret = '87654321-1234-4123-8123-123456789abc';

/** Cover fresh admission, same-name impersonation and disconnected-only replacement. */
test('tab proof identifies only its own disconnected peer and is not serialized', () => {
    const old = { id: 'old', peer_name: 'Guest' };
    const stranger = { id: 'stranger', peer_name: 'Guest' };
    const room = {
        getPeers: () =>
            new Map([
                ['old', old],
                ['stranger', stranger],
            ]),
    };
    const sockets = new Map([
        ['old', {}],
        ['stranger', {}],
    ]);

    assert.equal(bindRejoinSecret(old, secret), true);
    assert.equal(bindRejoinSecret(stranger, otherSecret), true);
    assert.equal(JSON.stringify([...room.getPeers()]).includes(secret), false);
    assert.deepEqual(findDisconnectedRejoinPeers(room, sockets, secret, 'new'), []);
    sockets.delete('old');
    assert.deepEqual(findDisconnectedRejoinPeers(room, sockets, secret, 'new'), [old]);
    const older = { id: 'older', peer_name: 'Guest' };
    bindRejoinSecret(older, secret);
    room.getPeers = () =>
        new Map([
            ['old', old],
            ['older', older],
            ['stranger', stranger],
        ]);
    assert.deepEqual(findDisconnectedRejoinPeers(room, sockets, secret, 'new'), [old, older]);
    assert.deepEqual(findDisconnectedRejoinPeers(room, sockets, otherSecret, 'new'), []);
    assert.deepEqual(findDisconnectedRejoinPeers(room, sockets, 'not-a-proof', 'new'), []);
    assert.deepEqual(findDisconnectedRejoinPeers(room, sockets, secret, 'old'), [older]);
    assert.equal(bindRejoinSecret({}, 'not-a-proof'), false);
});
