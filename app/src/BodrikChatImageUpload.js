'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const TYPES = new Map([
    ['image/png', { extension: 'png', valid: (body) => body.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) }],
    ['image/jpeg', { extension: 'jpg', valid: (body) => body[0] === 0xff && body[1] === 0xd8 && body[2] === 0xff }],
    ['image/webp', { extension: 'webp', valid: (body) => body.subarray(0, 4).toString() === 'RIFF' && body.subarray(8, 12).toString() === 'WEBP' }],
]);

/** Accept a small verified image only from a participant currently joined with this room-bound token. */
function createChatImageUploadHandler({ directory, verifyToken, decodeToken, getRoom }) {
    return async (req, res) => {
        try {
            const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
            if (!token || !(await verifyToken(token))) return res.status(401).json({ error: 'Unauthorized' });
            const roomId = decodeToken(token)?.room;
            const room = roomId && getRoom(roomId);
            if (!room || ![...room.getPeers().values()].some((peer) => peer.peer_info?.peer_token === token)) {
                return res.status(403).json({ error: 'Not in meeting' });
            }

            const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
            const type = TYPES.get(String(req.headers['content-type'] || '').split(';')[0].toLowerCase());
            if (!type || body.length < 12 || body.length > 5 * 1024 * 1024 || !type.valid(body)) {
                return res.status(400).json({ error: 'Invalid image' });
            }
            await fs.mkdir(directory, { recursive: true });
            const filename = `${crypto.randomUUID()}.${type.extension}`;
            await fs.writeFile(path.join(directory, filename), body, { flag: 'wx' });
            return res.status(201).json({ url: `/uploads/chat/${filename}` });
        } catch (error) {
            console.error('Chat image upload failed', error.message);
            return res.status(500).json({ error: 'Image upload failed' });
        }
    };
}

const IMAGE_LIFETIME_MS = 48 * 60 * 60 * 1000;

/** Remove expired chat images without following symlinks or deleting other uploads. */
async function removeExpiredChatImages(directory, now = Date.now()) {
    let entries;
    try {
        entries = await fs.readdir(directory, { withFileTypes: true });
    } catch (error) {
        if (error.code === 'ENOENT') return;
        throw error;
    }
    for (const entry of entries) {
        if (!entry.isFile() || !/^[0-9a-f-]+\.(png|jpg|webp)$/.test(entry.name)) continue;
        const file = path.join(directory, entry.name);
        const stat = await fs.stat(file).catch((error) => error.code === 'ENOENT' ? null : Promise.reject(error));
        if (stat && now - stat.mtimeMs >= IMAGE_LIFETIME_MS) {
            await fs.unlink(file).catch((error) => { if (error.code !== 'ENOENT') throw error; });
        }
    }
}

/** Schedule expiration for temporary images; return a shutdown cleanup callback. */
function startChatImageCleanup(directory) {
    const cleanup = () => removeExpiredChatImages(directory).catch((error) => console.error('Chat image cleanup failed', error));
    cleanup();
    const timer = setInterval(cleanup, 60 * 60 * 1000);
    timer.unref();
    return () => clearInterval(timer);
}

module.exports = { createChatImageUploadHandler, removeExpiredChatImages, startChatImageCleanup };
