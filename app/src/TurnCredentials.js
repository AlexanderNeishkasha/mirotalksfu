'use strict';

const { createHash, createHmac } = require('node:crypto');

const MIN_SECRET_LENGTH = 32;
const MIN_TTL_SECONDS = 60;
const MAX_TTL_SECONDS = 86400;

/** Parse and validate private TURN settings without exposing the shared secret. */
function readTurnConfig(env = process.env) {
    if (env.TURN_ENABLED !== 'true') return null;

    const urls = String(env.TURN_URLS || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    if (urls.length === 0 || urls.some((url) => !/^turns?:[^\s,]+$/i.test(url))) {
        throw new Error('TURN_URLS must contain valid turn: or turns: URLs');
    }

    const secret = String(env.TURN_SHARED_SECRET || '');
    if (secret.length < MIN_SECRET_LENGTH) {
        throw new Error(`TURN_SHARED_SECRET must contain at least ${MIN_SECRET_LENGTH} characters`);
    }

    const ttlSeconds = Number.parseInt(env.TURN_CREDENTIAL_TTL_SECONDS || '3600', 10);
    if (!Number.isInteger(ttlSeconds) || ttlSeconds < MIN_TTL_SECONDS || ttlSeconds > MAX_TTL_SECONDS) {
        throw new Error(`TURN_CREDENTIAL_TTL_SECONDS must be ${MIN_TTL_SECONDS}-${MAX_TTL_SECONDS}`);
    }
    return { urls, secret, ttlSeconds };
}

/** Create coturn REST credentials scoped to one peer and a short expiration time. */
function createTurnIceServers(peerId, options = {}) {
    const config = readTurnConfig(options.env);
    if (!config) return [];
    if (typeof peerId !== 'string' || peerId.length === 0) throw new Error('TURN peer ID is required');

    const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
    const peerTag = createHash('sha256').update(peerId).digest('hex').slice(0, 16);
    const username = `${nowSeconds + config.ttlSeconds}:${peerTag}`;
    const credential = createHmac('sha1', config.secret).update(username).digest('base64');
    return [{ urls: config.urls, username, credential }];
}

/** Add ephemeral ICE servers and optionally force relay for controlled acceptance tests. */
function createTurnTransportOptions(peerId, options = {}) {
    const env = options.env ?? process.env;
    const iceServers = createTurnIceServers(peerId, { ...options, env });
    return {
        iceServers,
        ...(iceServers.length > 0 && env.TURN_FORCE_RELAY === 'true' ? { iceTransportPolicy: 'relay' } : {}),
    };
}

module.exports = { createTurnIceServers, createTurnTransportOptions, readTurnConfig };
