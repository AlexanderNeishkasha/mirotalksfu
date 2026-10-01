'use strict';
const assert = require('node:assert/strict');
const { mkdtemp, readFile, readdir, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const test = require('node:test');
// Logger loads generated runtime config; diagnostics tests isolate logging from secrets/config.js.
const loggerPath = require.resolve('./Logger');
const previousLogger = require.cache[loggerPath];
require.cache[loggerPath] = {
    exports: class {
        error() {}
    },
};
const { DiagnosticStore, registerClientDiagnostics, sanitizeEvent } = require('./ClientDiagnostics');
if (previousLogger) require.cache[loggerPath] = previousLogger;
else delete require.cache[loggerPath];

for (const { name, event, accepted } of [
    {
        name: 'allowlisted transport state',
        event: { type: 'transport_state', at: Date.now(), seq: 2, details: { transport: 'consumer', state: 'failed' } },
        accepted: true,
    },
    { name: 'unknown event', event: { type: 'chat_message', details: { message: 'secret' } }, accepted: false },
    { name: 'missing event', event: null, accepted: false },
]) {
    test(`diagnostic event validation: ${name}`, () => assert.equal(Boolean(sanitizeEvent(event)), accepted));
}

test('diagnostic sanitization drops unknown fields and redacts URLs, tokens, candidates and controls', () => {
    const event = sanitizeEvent({
        type: 'browser_error',
        details: {
            message: 'failed https://example.test/path?token=secret token=abc\nnext',
            candidate: 'candidate:private-address',
            sdp: 'v=0',
            chat: 'must disappear',
            online: true,
        },
    });
    assert.equal(event.details.chat, undefined);
    assert.equal(event.details.candidate, undefined);
    assert.equal(event.details.sdp, undefined);
    assert.equal(event.details.online, true);
    assert.equal(event.details.message.includes('secret'), false);
    assert.equal(event.details.message.includes('example.test'), false);
    assert.equal(event.details.message.includes('\n'), false);
});

/** Create a joined fake socket and capture one registered event handler. */
function joinedSocket() {
    const handlers = new Map();
    const socket = { id: 'socket-id', room_id: 'private-room', on: (name, callback) => handlers.set(name, callback) };
    const peer = { peer_name: 'Diagnostic User', peer_info: { browser_name: 'Chrome', browser_version: '120' } };
    const rooms = new Map([['private-room', { getPeer: (id) => (id === socket.id ? peer : null) }]]);
    return { socket, rooms, handler: (name) => handlers.get(name) };
}

test('server accepts diagnostics only after admission and adds its observed connection IP', () => {
    const records = [];
    const { socket, rooms, handler } = joinedSocket();
    registerClientDiagnostics(socket, rooms, { write: (record) => records.push(record) }, '203.0.113.24');
    let acknowledged = 0;
    handler('bodrikDiagnostics')(
        [{ type: 'signaling_disconnect', details: { reason: 'ping timeout' } }],
        () => acknowledged++
    );
    assert.equal(records.length, 1);
    assert.equal(acknowledged, 1);
    assert.equal(records[0].nickname, 'Diagnostic User');
    assert.equal(records[0].room_id, 'private-room');
    assert.equal(records[0].details.reason, 'ping timeout');
    assert.equal(records[0].remote_ip, '203.0.113.24');
    socket.room_id = 'not-joined';
    handler('bodrikDiagnostics')([{ type: 'browser_error', details: { message: 'must be dropped' } }]);
    assert.equal(records.length, 1);
});

test('server rejects oversized batches and limits accepted events per minute', () => {
    const records = [];
    const { socket, rooms, handler } = joinedSocket();
    registerClientDiagnostics(socket, rooms, { write: (record) => records.push(record) }, 'not-an-ip');
    const event = { type: 'transport_state', details: { state: 'connected' } };
    handler('bodrikDiagnostics')(Array(21).fill(event));
    assert.equal(records.length, 0);
    for (let index = 0; index < 4; index++) handler('bodrikDiagnostics')(Array(20).fill(event));
    assert.equal(records.length, 60);
    assert.equal(records[0].remote_ip, undefined);
});

test('persistent JSONL store writes enriched events and rotates bounded files', async (t) => {
    const directory = await mkdtemp(path.join(tmpdir(), 'bodrik-diagnostics-'));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const store = new DiagnosticStore({ directory, maxBytes: 160, retentionDays: 14 });
    for (let index = 0; index < 6; index++)
        store.write({ server_at: new Date().toISOString(), type: 'transport_state', seq: index });
    await store.close();
    const files = await readdir(directory);
    assert.ok(files.length > 1, files);
    const lines = (await Promise.all(files.map((name) => readFile(path.join(directory, name), 'utf8'))))
        .join('')
        .trim()
        .split('\n');
    assert.equal(lines.length, 6);
    assert.equal(JSON.parse(lines[0]).type, 'transport_state');
});
