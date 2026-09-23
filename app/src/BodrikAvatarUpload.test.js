'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createAvatarUploadHandler } = require('./BodrikAvatarUpload');

function response() {
    return {
        code: 200,
        body: null,
        status(code) { this.code = code; return this; },
        json(body) { this.body = body; return this; },
    };
}

/** Invokes the upload handler with a minimal request/response pair. */
async function invoke(handler, request) {
    const res = response();
    await handler(request, res);
    return res;
}

test('avatar upload requires a valid meeting token and image signature', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'bodrik-avatar-'));
    const handler = createAvatarUploadHandler({ directory, verifyToken: async (token) => token === 'valid' });
    const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(8)]);

    assert.equal((await invoke(handler, { headers: { 'content-type': 'image/webp' }, body: webp })).code, 401);
    assert.equal((await invoke(handler, { headers: { authorization: 'Bearer valid', 'content-type': 'image/webp' }, body: Buffer.from('bad image') })).code, 400);

    const uploaded = await invoke(handler, {
        headers: { authorization: 'Bearer valid', 'content-type': 'image/webp' },
        body: webp,
    });
    assert.equal(uploaded.code, 201);
    assert.match(uploaded.body.url, /^\/uploads\/avatars\/[0-9a-f-]+\.webp$/);
    assert.deepEqual(await fs.readFile(path.join(directory, path.basename(uploaded.body.url))), webp);
});
