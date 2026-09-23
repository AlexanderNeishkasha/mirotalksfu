'use strict';

const { spawn } = require('node:child_process');
const { randomInt } = require('node:crypto');
const Peer = require('./Peer');
const Logger = require('./Logger');
const BodrikPlayback = require('./BodrikPlayback');

const log = new Logger('BodrikMusic');
const PEER_ID = 'bodrik-music';
const PAYLOAD_TYPE = 111;
const CLOCK_RATE = 48000;

/** Server-native stereo fixture producer used before real playback is connected. */
class BodrikMusic {
    constructor(room, options = {}) {
        this.room = room;
        this.ffmpegPath = options.ffmpegPath || process.env.FFMPEG_PATH || 'ffmpeg';
        this.spawn = options.spawn || spawn;
        this.process = null;
        this.playback = null;
        this.sourcePort = randomInt(41000, 61000);
        this.peer = null;
        this.transport = null;
        this.producer = null;
        this.stopping = false;
        this.masterVolume = 1;
    }

    static enabled() {
        return process.env.BODRIK_MUSIC_ENABLED === 'true' || process.env.BODRIK_MUSIC_SPIKE_ENABLED === 'true';
    }

    /** Start either the generated fixture or the authoritative playback controller. */
    async start() {
        if (this.playback || this.transport || this.stopping) throw new Error('Bodrik Music already started');
        this.ssrc = randomInt(1, 0x7fffffff);
        try {
            if (process.env.BODRIK_MUSIC_ENABLED === 'true') {
                this.playback = new BodrikPlayback(this.room.id, null,
                    (mediaUrl, position) => this.spawn(this.ffmpegPath,
                        playbackArgs(this.transport.tuple.localPort, this.sourcePort, this.ssrc, mediaUrl, position),
                        { stdio: ['ignore', 'ignore', 'pipe'] }),
                    {
                        setConferenceActive: (active) => this.setConferenceActive(active),
                        setVolume: (volume) => this.setVolume(volume),
                    }).start();
            } else {
                await this.createPeer();
                this.process = this.spawn(this.ffmpegPath, ffmpegArgs(this.transport.tuple.localPort, this.ssrc), {
                    stdio: ['ignore', 'ignore', 'pipe'],
                });
                let stderr = '';
                this.process.stderr?.on('data', (chunk) => { stderr = (stderr + chunk.toString()).slice(-4096); });
                this.process.once('error', (error) => this.failed(error));
                this.process.once('exit', (code, signal) => {
                    if (!this.stopping) this.failed(new Error(`FFmpeg exited: ${code ?? signal}; ${stderr}`));
                });
            }
            return this;
        } catch (error) {
            this.stop();
            throw error;
        }
    }

    async createPeer() {
        if (this.peer || this.stopping) return;
        this.transport = await this.room.router.createPlainTransport({
            listenInfo: { protocol: 'udp', ip: '127.0.0.1' }, rtcpMux: true, comedia: true,
        });
        this.peer = new Peer(PEER_ID, { peer_info: peerInfo(this.masterVolume) });
        this.peer.addTransport(this.transport);
        this.room.addPeer(this.peer);
        const producerId = await this.room.produce(
            PEER_ID, this.transport.id, rtpParameters(this.ssrc), 'audio', 'audioType'
        );
        this.producer = this.peer.getProducer(producerId);
        this.room.broadCast(PEER_ID, 'setVideoOff', this.peer.peer_info);
        log.info('Bodrik Music peer started', { room_id: this.room.id, producer_id: producerId });
    }

    /** Broadcast meeting-wide gain without restarting the RTP source. */
    setVolume(volume) {
        if (volume === this.masterVolume) return;
        this.masterVolume = volume;
        if (!this.peer) return;
        this.peer.peer_info.peer_music_volume = volume;
        this.room.broadCast(PEER_ID, 'bodrikMusicVolume', { volume });
    }

    async setConferenceActive(active) {
        if (active) return this.createPeer();
        if (!this.peer) return;
        this.peer.close();
        this.room.delPeer(this.peer);
        this.room.broadCast(PEER_ID, 'removeMe', {
            room_id: this.room.id, peer_id: PEER_ID, peer_name: peerInfo().peer_name,
            peer_counts: this.room.getPeersCount(), isPresenter: false,
        });
        this.peer = null;
        this.producer = null;
        this.transport = null;
    }

    /** Stop FFmpeg and release the synthetic peer, producer, and transport idempotently. */
    stop() {
        if (this.stopping) return;
        this.stopping = true;
        this.playback?.stop();
        this.playback = null;
        if (this.process && this.process.exitCode == null) this.process.kill('SIGTERM');
        this.process = null;
        if (this.peer) {
            this.peer.close();
            this.room.delPeer(this.peer);
        } else if (this.transport && !this.transport.closed) {
            this.transport.close();
        }
        this.peer = null;
        this.producer = null;
        this.transport = null;
    }

    failed(error) {
        log.error('Bodrik Music fixture failed', { room_id: this.room.id, error: error.message });
        this.stop();
    }
}

/** Describe the native peer with a public avatar on this SFU's configured origin. */
function peerInfo(masterVolume = 1) {
    const avatarUrl = new URL('/images/bodrik-ava.png', process.env.SERVER_HOST_URL).toString();
    return {
        peer_id: PEER_ID,
        peer_uuid: PEER_ID,
        peer_name: 'Бодрик FM',
        peer_avatar: avatarUrl,
        peer_presenter: false,
        peer_audio: true,
        peer_audio_volume: 100,
        peer_video: false,
        peer_video_privacy: false,
        peer_recording: false,
        peer_hand: false,
        peer_lobby: false,
        peer_screen: false,
        peer_bot: true,
        peer_music_volume: masterVolume,
    };
}

function rtpParameters(ssrc) {
    return {
        codecs: [{
            mimeType: 'audio/opus',
            payloadType: PAYLOAD_TYPE,
            clockRate: CLOCK_RATE,
            channels: 2,
            parameters: { useinbandfec: 1, stereo: 1, 'sprop-stereo': 1 },
            rtcpFeedback: [],
        }],
        encodings: [{ ssrc }],
        rtcp: { cname: `bodrik-music-${ssrc}`, reducedSize: true },
    };
}

function ffmpegArgs(port, ssrc) {
    const envelope = 'sin(PI*mod(t\\,0.5)/0.5)';
    const bass = steppedFrequency([130.81, 174.61, 196.0, 146.83], 1);
    const melody = steppedFrequency([261.63, 329.63, 392.0, 523.25, 493.88, 392.0, 329.63, 293.66], 0.5);
    const source = `aevalsrc=exprs=0.11*${envelope}*sin(2*PI*${bass}*t)|0.09*${envelope}*sin(2*PI*${melody}*t):s=${CLOCK_RATE}:c=stereo`;
    return [
        '-hide_banner', '-loglevel', 'warning', '-re', '-f', 'lavfi', '-i', source,
        '-ac', '2', '-ar', String(CLOCK_RATE), '-c:a', 'libopus', '-b:a', '128k',
        '-payload_type', String(PAYLOAD_TYPE), '-ssrc', String(ssrc),
        '-f', 'rtp', `rtp://127.0.0.1:${port}?pkt_size=1200`,
    ];
}

function playbackArgs(port, sourcePort, ssrc, mediaUrl, position, nowMs = Date.now()) {
    const sequence = Math.floor(nowMs / 20) % 65536;
    const timestampOffset = nowMs / 1000;
    return [
        '-hide_banner', '-loglevel', 'warning', '-re', '-ss', String(position), '-i', mediaUrl,
        '-vn', '-af', `aresample=${CLOCK_RATE}:async=1000:first_pts=0`, '-ac', '2',
        '-c:a', 'libopus', '-application:a', 'audio', '-frame_duration:a', '20', '-vbr:a', 'on',
        '-fec:a', '1', '-packet_loss:a', '5', '-b:a', '160k',
        '-payload_type', String(PAYLOAD_TYPE), '-ssrc', String(ssrc),
        '-output_ts_offset', String(timestampOffset), '-seq', String(sequence),
        '-f', 'rtp', `rtp://127.0.0.1:${port}?localport=${sourcePort}&pkt_size=1200`,
    ];
}

/** Build an FFmpeg expression that advances through notes over one repeating cycle. */
function steppedFrequency(notes, secondsPerNote) {
    const cycle = notes.length * secondsPerNote;
    return notes.slice(0, -1).reduceRight(
        (fallback, note, index) =>
            `if(lt(mod(t\\,${cycle})\\,${(index + 1) * secondsPerNote})\\,${note}\\,${fallback})`,
        String(notes.at(-1))
    );
}

module.exports = { BodrikMusic, ffmpegArgs, playbackArgs, peerInfo, rtpParameters };
