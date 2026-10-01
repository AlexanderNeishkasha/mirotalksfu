'use strict';

const { createWriteStream, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } = require('node:fs');
const path = require('node:path');
const { isIP } = require('node:net');
const Logger = require('./Logger');
const log = new Logger('ClientDiagnostics');

const EVENT_TYPES = new Set([
    'browser_error',
    'unhandled_rejection',
    'signaling_connect',
    'signaling_disconnect',
    'signaling_error',
    'signaling_reconnect_attempt',
    'signaling_reconnect_failed',
    'transport_state',
    'ice_gathering_state',
    'ice_candidate_error',
    'transport_restart',
    'transport_failure',
    'recovery_start',
    'recovery_success',
    'recovery_failure',
]);
/** Parse bounded positive integer configuration, falling back for missing or unsafe values. */
function positiveInteger(value, fallback, max) {
    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0 && number <= max ? number : fallback;
}

const DETAIL_KEYS = new Set([
    'transport',
    'state',
    'reason',
    'message',
    'name',
    'code',
    'attempt',
    'elapsed_ms',
    'recovered',
    'online',
    'visibility',
    'phase',
    'retry',
]);

/** Convert untrusted diagnostics to bounded, single-line data without URLs, tokens, candidates or SDP. */
function cleanString(value, max = 240) {
    if (typeof value !== 'string') return undefined;
    return value
        .replace(/[\x00-\x1f\x7f]/g, ' ')
        .replace(/https?:\/\/[^\s"']+/gi, '[url]')
        .replace(/(token|authorization|credential|password|candidate|sdp)\s*[:=]\s*[^\s,;}]+/gi, '$1=[redacted]')
        .slice(0, max);
}

/** Validate one client event and retain only explicitly approved primitive details. */
function sanitizeEvent(event) {
    if (!event || !EVENT_TYPES.has(event.type)) return null;
    const details = {};
    if (event.details && typeof event.details === 'object' && !Array.isArray(event.details)) {
        for (const [key, value] of Object.entries(event.details)) {
            if (!DETAIL_KEYS.has(key)) continue;
            if (typeof value === 'string') details[key] = cleanString(value);
            else if (typeof value === 'boolean') details[key] = value;
            else if (typeof value === 'number' && Number.isFinite(value))
                details[key] = Math.max(-1e9, Math.min(1e9, value));
        }
    }
    return {
        type: event.type,
        client_at: Number.isFinite(event.at) ? new Date(event.at).toISOString() : undefined,
        seq: Number.isSafeInteger(event.seq) && event.seq >= 0 ? event.seq : undefined,
        details,
    };
}

/** Append bounded diagnostics to daily JSONL files stored on a persistent volume, with size and age rotation. */
class DiagnosticStore {
    constructor({
        directory = process.env.CLIENT_DIAGNOSTICS_DIR || '/src/logs/client-diagnostics',
        retentionDays = positiveInteger(process.env.CLIENT_DIAGNOSTICS_RETENTION_DAYS, 14, 365),
        maxBytes = positiveInteger(process.env.CLIENT_DIAGNOSTICS_MAX_BYTES, 10 * 1024 * 1024, 1024 * 1024 * 1024),
    } = {}) {
        this.directory = directory;
        this.retentionDays = retentionDays;
        this.maxBytes = maxBytes;
        this.stream = null;
        this.file = null;
        this.bytes = 0;
        this.part = 0;
        mkdirSync(directory, { recursive: true, mode: 0o750 });
        this.prune();
    }

    /** Select today's file and rotate numbered parts before an append exceeds the configured bound. */
    open(extraBytes) {
        const day = new Date().toISOString().slice(0, 10);
        if (!this.file || !path.basename(this.file).startsWith(day)) {
            this.stream?.end();
            this.part = 0;
            this.file = path.join(this.directory, `${day}.jsonl`);
            this.bytes = existsSync(this.file) ? statSync(this.file).size : 0;
            if (this.bytes + extraBytes > this.maxBytes) {
                while (existsSync(path.join(this.directory, `${day}.${++this.part}.jsonl`))) {}
                this.file = path.join(this.directory, `${day}.${this.part}.jsonl`);
                this.bytes = 0;
            }
            this.stream = createWriteStream(this.file, { flags: 'a', mode: 0o640 });
            this.stream.on('error', (error) => log.error('Diagnostic stream failed', error));
        }
        if (this.bytes + extraBytes <= this.maxBytes) return;
        this.stream.end();
        do this.file = path.join(this.directory, `${day}.${++this.part}.jsonl`);
        while (existsSync(this.file));
        this.bytes = 0;
        this.stream = createWriteStream(this.file, { flags: 'a', mode: 0o640 });
        this.stream.on('error', (error) => log.error('Diagnostic stream failed', error));
    }

    /** Persist one line after server enrichment; stream backpressure is acceptable for this low-volume channel. */
    write(record) {
        const line = JSON.stringify(record) + '\n';
        this.open(Buffer.byteLength(line));
        this.bytes += Buffer.byteLength(line);
        this.stream.write(line);
    }

    /** Remove only recognized diagnostic files older than the retention period. */
    prune() {
        const cutoff = Date.now() - this.retentionDays * 24 * 60 * 60 * 1000;
        for (const name of readdirSync(this.directory)) {
            if (!/^\d{4}-\d{2}-\d{2}(?:\.\d+)?\.jsonl$/.test(name)) continue;
            const file = path.join(this.directory, name);
            if (statSync(file).mtimeMs < cutoff) unlinkSync(file);
        }
    }

    /** Finish pending writes during server shutdown. */
    close() {
        return new Promise((resolve) => {
            if (!this.stream) return resolve();
            this.stream.end(resolve);
            this.stream = null;
        });
    }
}

/** Register a joined-socket-only, rate-limited diagnostics channel and enrich accepted events with peer identity. */
function registerClientDiagnostics(socket, roomList, store, remoteAddress) {
    const received = [];
    socket.on('bodrikDiagnostics', (events, acknowledge) => {
        const now = Date.now();
        while (received.length && now - received[0] > 60_000) received.shift();
        const room = socket.room_id && roomList.get(socket.room_id);
        const peer = room?.getPeer(socket.id);
        const done = () => (typeof acknowledge === 'function' ? acknowledge() : undefined);
        if (!peer || !Array.isArray(events) || events.length > 20 || received.length >= 60) return done();
        try {
            if (Buffer.byteLength(JSON.stringify(events)) > 32 * 1024) return done();
        } catch {
            return done();
        }
        for (const raw of events) {
            if (received.length >= 60) break;
            const event = sanitizeEvent(raw);
            if (!event) continue;
            received.push(now);
            try {
                store.write({
                    server_at: new Date(now).toISOString(),
                    room_id: cleanString(socket.room_id, 128),
                    socket_id: cleanString(socket.id, 64),
                    nickname: cleanString(peer.peer_name, 100),
                    remote_ip: isIP(remoteAddress) ? remoteAddress : undefined,
                    browser: cleanString(peer.peer_info?.browser_name, 40),
                    browser_version: cleanString(peer.peer_info?.browser_version, 40),
                    ...event,
                });
            } catch (error) {
                log.error('Failed to persist client diagnostic', error);
                break;
            }
        }
        done();
    });
}

module.exports = { DiagnosticStore, registerClientDiagnostics, sanitizeEvent };
