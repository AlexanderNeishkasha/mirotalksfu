'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const TYPES = new Map([
    ['image/jpeg', { extension: 'jpg', signature: (data) => data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff }],
    ['image/png', { extension: 'png', signature: (data) => data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) }],
    ['image/webp', { extension: 'webp', signature: (data) => data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP' }],
]);

/** Creates an authenticated handler for small, browser-normalized avatar images. */
function createAvatarUploadHandler({ directory, verifyToken, publicPrefix = '/uploads/avatars' }) {
    return async (req, res) => {
        try {
            const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
            if (!token || !(await verifyToken(token))) return res.status(401).json({ error: 'Unauthorized' });

            const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
            const type = TYPES.get(String(req.headers['content-type'] || '').split(';')[0].toLowerCase());
            if (!type || body.length < 12 || body.length > 256 * 1024 || !type.signature(body)) {
                return res.status(400).json({ error: 'Invalid avatar image' });
            }

            await fs.mkdir(directory, { recursive: true });
            const filename = `${crypto.randomUUID()}.${type.extension}`;
            await fs.writeFile(path.join(directory, filename), body, { flag: 'wx' });
            res.status(201).json({ url: `${publicPrefix}/${filename}` });
        } catch (error) {
            console.error('Avatar upload failed', error);
            res.status(500).json({ error: 'Avatar upload failed' });
        }
    };
}

module.exports = { createAvatarUploadHandler };
