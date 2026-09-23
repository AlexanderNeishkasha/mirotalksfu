'use strict';

const jwt = require('jsonwebtoken');
const Logger = require('./Logger');

const log = new Logger('BodrikPlayback');

/** Synchronize one native music RTP source with authoritative bodrik.fm playback. */
class BodrikPlayback {
    constructor(roomId, destination, spawnProcess, options = {}) {
        this.roomId = roomId;
        this.destination = destination;
        this.spawnProcess = spawnProcess;
        this.backendUrl = options.backendUrl || process.env.BODRIK_MUSIC_BACKEND_URL;
        this.secret = options.secret || process.env.MUSIC_BRIDGE_SECRET;
        this.fetch = options.fetch || global.fetch;
        this.pollMs = options.pollMs || 1000;
        this.setConferenceActive = options.setConferenceActive || (async () => {});
        this.setVolume = options.setVolume || (() => {});
        this.timer = null;
        this.abort = null;
        this.process = null;
        this.sourceKey = null;
        this.sourcePosition = 0;
        this.sourceStartedAt = 0;
        this.stopped = false;
    }

    /** Begin polling after validating private bridge configuration. */
    start() {
        if (!this.backendUrl || !this.secret || this.secret.length < 32) {
            throw new Error('native music bridge configuration is incomplete');
        }
        this.poll();
        return this;
    }

    async poll() {
        if (this.stopped) return;
        this.abort = new AbortController();
        try {
            const token = jwt.sign({}, this.secret, { subject: this.roomId, expiresIn: 30 });
            const endpoint = new URL(`/api/internal/conferences/${encodeURIComponent(this.roomId)}/music`, this.backendUrl);
            const response = await this.fetch(endpoint, {
                headers: { authorization: `Bearer ${token}` },
                signal: this.abort.signal,
            });
            if (!response.ok) throw new Error(`snapshot returned ${response.status}`);
            await this.apply(await response.json());
        } catch (error) {
            if (!this.stopped && error.name !== 'AbortError') {
                log.warn('Music snapshot unavailable', { room_id: this.roomId, error: error.message });
                await this.silence();
            }
        } finally {
            this.abort = null;
            if (!this.stopped) this.timer = setTimeout(() => this.poll(), this.pollMs);
        }
    }

    async apply(snapshot) {
        const conferenceActive = snapshot?.output === 'conference';
        const requestedVolume = Number(snapshot.volume);
        const volume = Number.isFinite(requestedVolume)
            ? Math.min(1, Math.max(0, requestedVolume))
            : 1;
        this.setVolume(volume);
        if (!conferenceActive) await this.silence();
        await this.setConferenceActive(conferenceActive);
        if (!conferenceActive || !snapshot?.is_playing || !snapshot.track) {
            await this.silence();
            return;
        }
        const media = new URL(snapshot.track.media_url, this.backendUrl);
        const backend = new URL(this.backendUrl);
        if (media.origin !== backend.origin || !media.pathname.startsWith('/media/')) {
            throw new Error('snapshot returned an unsafe media URL');
        }
        const key = `${snapshot.revision}:${snapshot.track.id}`;
        const position = Math.max(0, Number(snapshot.position) || 0);
        const localPosition = this.sourcePosition + (Date.now() - this.sourceStartedAt) / 1000;
        const drift = Math.abs(position - localPosition);
        if (key === this.sourceKey && this.process?.exitCode == null && drift < 2) return;
        if (key === this.sourceKey && drift >= 2) {
            log.warn('Correcting music drift', { room_id: this.roomId, drift_seconds: drift.toFixed(3) });
        }
        await this.silence();
        this.sourceKey = key;
        this.sourcePosition = position;
        this.sourceStartedAt = Date.now();
        this.process = this.spawnProcess(media.toString(), position);
        const active = this.process;
        let stderr = '';
        active.stderr?.on('data', (chunk) => { stderr = (stderr + chunk.toString()).slice(-4096); });
        active.once('error', (error) => this.processFailed(active, error));
        active.once('exit', (code, signal) => {
            if (!this.stopped && this.process === active && code !== 0) {
                this.processFailed(active, new Error(`FFmpeg exited: ${code ?? signal}; ${stderr}`));
            }
        });
    }

    processFailed(process, error) {
        if (this.process !== process) return;
        log.warn('Music source stopped', { room_id: this.roomId, error: error.message });
        this.process = null;
        this.sourceKey = null;
    }

    async silence() {
        const process = this.process;
        this.process = null;
        this.sourceKey = null;
        this.sourcePosition = 0;
        this.sourceStartedAt = 0;
        if (!process || process.exitCode != null) return;
        process.kill('SIGTERM');
        if (process.exitCode != null) return;
        await Promise.race([
            new Promise((resolve) => process.once('exit', resolve)),
            new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);
        if (process.exitCode == null) process.kill('SIGKILL');
    }

    /** Stop polling and terminate the current source. */
    stop() {
        this.stopped = true;
        clearTimeout(this.timer);
        this.abort?.abort();
        void this.silence();
    }
}

module.exports = BodrikPlayback;
