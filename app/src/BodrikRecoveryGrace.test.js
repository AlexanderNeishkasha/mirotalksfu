'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { createRecoveryGrace } = require('./BodrikRecoveryGrace');

/** Build a deterministic clock and room for reconnect lifecycle tests. */
function fixture() {
    const timers = new Map();
    let nextId = 0;
    let now = 0;
    const clock = {
        now: () => now,
        setTimeout: (callback) => {
            timers.set(++nextId, callback);
            return nextId;
        },
        clearTimeout: (id) => timers.delete(id),
    };
    const peer = { id: 'peer' };
    const room = { getPeer: () => peer };
    const roomList = new Map([['room', room]]);
    const active = new Map();
    const logs = [];
    const grace = createRecoveryGrace(
        { sockets: { sockets: active } },
        roomList,
        { info: (...args) => logs.push(args) },
        120000,
        clock
    );
    const socket = { id: 'session', room_id: 'room' };
    return {
        active,
        grace,
        logs,
        peer,
        room,
        socket,
        timers,
        expire: () => {
            now += 120000;
            for (const [id, callback] of [...timers]) {
                timers.delete(id);
                callback();
            }
        },
    };
}

test('recovered connection cancels its old cleanup deadline', () => {
    const value = fixture();
    let cleanups = 0;
    value.grace.defer(value.socket, () => cleanups++);
    value.active.set(value.socket.id, { connected: true, recovered: true });
    value.grace.cancel(value.socket.id);
    value.expire();
    assert.equal(cleanups, 0);
    assert.equal(value.timers.size, 0);
    assert.equal(value.logs.length, 0);
});

test('repeated losses keep only the most recent deadline', () => {
    const value = fixture();
    let cleanups = 0;
    value.grace.defer(value.socket, () => cleanups++);
    const obsolete = [...value.timers.values()][0];
    value.active.set(value.socket.id, { connected: true, recovered: true });
    value.grace.cancel(value.socket.id);
    value.active.delete(value.socket.id);
    value.grace.defer(value.socket, () => cleanups++);
    obsolete(); // Even an already queued old callback must not remove the peer.
    assert.equal(cleanups, 0);
    value.expire();
    assert.equal(cleanups, 1);
});

test('expired disconnect never deletes a peer replaced under the same socket ID', () => {
    const value = fixture();
    let cleanups = 0;
    value.grace.defer(value.socket, () => cleanups++);
    value.room.getPeer = () => ({ id: 'replacement' });
    value.expire();
    assert.equal(cleanups, 0);
});

test('a recovered active socket is retained even if its timer fires', () => {
    const value = fixture();
    let cleanups = 0;
    value.grace.defer(value.socket, () => cleanups++);
    value.active.set(value.socket.id, { connected: true, recovered: true });
    value.expire();
    assert.equal(cleanups, 0);
    assert.equal(value.logs.at(-1)[0], '[Reconnect] - kept recovered peer');
});

test('unrecovered disconnect expires and explicit leave can cancel immediately', () => {
    const value = fixture();
    let cleanups = 0;
    value.grace.defer(value.socket, () => cleanups++);
    value.expire();
    assert.equal(cleanups, 1);
    value.grace.defer(value.socket, () => cleanups++);
    value.grace.cancel(value.socket.id);
    cleanups++; // Explicit exit performs cleanup synchronously in Server.js.
    value.expire();
    assert.equal(cleanups, 2);
});
