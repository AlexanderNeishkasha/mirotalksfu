'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createChatImageUploadHandler, removeExpiredChatImages } = require('./BodrikChatImageUpload');

/** Cover admission, image signature, size and successful storage. */
test('chat images require an active room-bound token and a supported image', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'bodrik-chat-image-'));
    const peer = { peer_info: { peer_token: 'valid' } };
    const room = { getPeers: () => new Map([['peer', peer]]) };
    const upload = createChatImageUploadHandler({
        directory,
        verifyToken: async (token) => token === 'valid',
        decodeToken: () => ({ room: 'private-room' }),
        getRoom: (id) => (id === 'private-room' ? room : null),
    });
    const png = Buffer.from('89504e470d0a1a0a0000000049454e44', 'hex');
    async function send(token, type, body) {
        const res = {
            status(code) {
                this.code = code;
                return this;
            },
            json(payload) {
                this.body = payload;
                return this;
            },
        };
        await upload({ headers: { authorization: token ? `Bearer ${token}` : '', 'content-type': type }, body }, res);
        return res;
    }
    try {
        assert.equal((await send('', 'image/png', png)).code, 401);
        peer.peer_info.peer_token = 'different';
        assert.equal((await send('valid', 'image/png', png)).code, 403);
        peer.peer_info.peer_token = 'valid';
        assert.equal((await send('valid', 'image/png', Buffer.alloc(16))).code, 400);
        assert.equal((await send('valid', 'image/png', Buffer.alloc(5 * 1024 * 1024 + 1))).code, 400);
        assert.equal((await send('valid', 'image/svg+xml', png)).code, 400);
        const result = await send('valid', 'image/png', png);
        assert.equal(result.code, 201);
        assert.match(result.body.url, /^\/uploads\/chat\/[0-9a-f-]+\.png$/);
        const stored = path.join(directory, path.basename(result.body.url));
        assert.deepEqual(await fs.readFile(stored), png);
        const old = new Date(Date.now() - 49 * 60 * 60 * 1000);
        await fs.utimes(stored, old, old);
        const recent = path.join(directory, '12345678-1234-4123-8123-123456789abc.webp');
        await fs.writeFile(recent, png);
        await fs.writeFile(path.join(directory, 'unrelated.txt'), 'keep');
        await removeExpiredChatImages(directory);
        await assert.rejects(fs.stat(stored), { code: 'ENOENT' });
        assert.deepEqual(await fs.readFile(recent), png);
        assert.equal(await fs.readFile(path.join(directory, 'unrelated.txt'), 'utf8'), 'keep');
    } finally {
        await fs.rm(directory, { recursive: true, force: true });
    }
});
