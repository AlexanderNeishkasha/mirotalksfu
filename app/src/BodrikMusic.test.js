'use strict';

const assert = require('node:assert/strict');
const { EventEmitter, once } = require('node:events');
const test = require('node:test');
const mediasoup = require('mediasoup');

const { BodrikMusic, ffmpegArgs, playbackArgs, peerInfo, rtpParameters } = require('./BodrikMusic');
const BodrikPlayback = require('./BodrikPlayback');

process.env.SERVER_HOST_URL = 'https://meet.example:3443';

function fixture() {
    const transport = new EventEmitter();
    transport.id = 'plain';
    transport.tuple = { localPort: 45000 };
    transport.closed = false;
    transport.close = () => {
        transport.closed = true;
    };
    const producer = new EventEmitter();
    producer.id = 'producer';
    producer.closed = false;
    producer.close = () => {
        producer.closed = true;
    };
    const peers = new Map();
    const room = {
        id: 'room',
        router: {
            createPlainTransport: async (options) => {
                room.transportOptions = options;
                return transport;
            },
        },
        addPeer: (peer) => peers.set(peer.id, peer),
        delPeer: (peer) => peers.delete(peer.id),
        broadCast: (...args) => {
            room.broadcastArgs = args;
        },
        produce: async (peerId, transportId, parameters, kind, type) => {
            room.produceArgs = { peerId, transportId, parameters, kind, type };
            peers.get(peerId).addProducer(producer.id, producer);
            return producer.id;
        },
    };
    const process = new EventEmitter();
    process.stderr = new EventEmitter();
    process.exitCode = null;
    process.kill = () => {
        process.exitCode = 0;
        process.killed = true;
    };
    const spawn = (...args) => {
        room.spawnArgs = args;
        return process;
    };
    return { peers, process, producer, room, spawn, transport };
}

test('fixture uses localhost stereo Opus RTP with a bot-marked peer', async () => {
    const value = fixture();
    const music = await new BodrikMusic(value.room, { spawn: value.spawn, ffmpegPath: 'ffmpeg' }).start();
    assert.deepEqual(value.room.transportOptions.listenInfo, { protocol: 'udp', ip: '127.0.0.1' });
    assert.equal(value.room.transportOptions.comedia, true);
    assert.equal(value.room.produceArgs.parameters.codecs[0].mimeType, 'audio/opus');
    assert.equal(value.room.produceArgs.parameters.codecs[0].channels, 2);
    assert.equal(value.room.produceArgs.kind, 'audio');
    assert.equal(value.room.produceArgs.type, 'audioType');
    assert.equal(value.peers.get('bodrik-music').peer_info.peer_bot, true);
    assert.deepEqual(value.room.broadcastArgs.slice(0, 2), ['bodrik-music', 'setVideoOff']);
    assert.match(value.room.spawnArgs[1].join(' '), /aevalsrc=exprs=/);
    assert.match(value.room.spawnArgs[1].join(' '), /:c=stereo/);
    assert.match(value.room.spawnArgs[1].join(' '), /rtp:\/\/127\.0\.0\.1:45000/);
    music.stop();
    assert.equal(value.process.killed, true);
    assert.equal(value.transport.closed, true);
    assert.equal(value.peers.size, 0);
});

test('real mediasoup PlainTransport receives the generated FFmpeg RTP fixture', async () => {
    const worker = await mediasoup.createWorker();
    const router = await worker.createRouter({
        mediaCodecs: [
            {
                kind: 'audio',
                mimeType: 'audio/opus',
                preferredPayloadType: 111,
                clockRate: 48000,
                channels: 2,
            },
        ],
    });
    const peers = new Map();
    const room = {
        id: 'integration-room',
        router,
        addPeer: (peer) => peers.set(peer.id, peer),
        delPeer: (peer) => peers.delete(peer.id),
        broadCast: () => {},
        produce: async (peerId, transportId, parameters, kind, type) => {
            const producer = await peers.get(peerId).createProducer(transportId, parameters, kind, type);
            return producer.id;
        },
    };
    const music = await new BodrikMusic(room).start();
    await music.producer.enableTraceEvent(['rtp']);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('RTP timeout')), 5000));
    const [trace] = await Promise.race([once(music.producer, 'trace'), timeout]);
    assert.equal(trace.type, 'rtp');
    music.stop();
    router.close();
    worker.close();
});

test('playback controller follows revisions and rejects non-backend media', async () => {
    const processes = [];
    let appliedVolume = null;
    const controller = new BodrikPlayback(
        'private-room',
        45000,
        (url, position) => {
            const process = new EventEmitter();
            process.exitCode = null;
            process.kill = () => {
                process.exitCode = 0;
            };
            processes.push({ url, position, process });
            return process;
        },
        {
            backendUrl: 'http://127.0.0.1:3001',
            secret: 'x'.repeat(32),
            setVolume: (volume) => {
                appliedVolume = volume;
            },
        }
    );
    await controller.apply({
        output: 'conference',
        volume: 0.45,
        revision: 2,
        is_playing: true,
        position: 12.5,
        track: { id: '7', media_url: '/media/song.mp3' },
    });
    assert.equal(processes[0].url, 'http://127.0.0.1:3001/media/song.mp3');
    assert.equal(processes[0].position, 12.5);
    assert.equal(appliedVolume, 0.45);
    controller.sourceStartedAt = Date.now();
    await controller.apply({
        output: 'conference',
        volume: 0.2,
        revision: 2,
        is_playing: true,
        position: 12.5,
        track: { id: '7', media_url: '/media/song.mp3' },
    });
    assert.equal(appliedVolume, 0.2);
    assert.equal(processes.length, 1);
    controller.sourceStartedAt = Date.now();
    await controller.apply({
        output: 'conference',
        revision: 2,
        is_playing: true,
        position: 12.5,
        track: { id: '7', media_url: '/media/song.mp3' },
    });
    assert.equal(appliedVolume, 1);
    assert.equal(processes.length, 1);
    controller.sourceStartedAt = Date.now() - 10_000;
    await controller.apply({
        output: 'conference',
        volume: 0.45,
        revision: 2,
        is_playing: true,
        position: 13,
        track: { id: '7', media_url: '/media/song.mp3' },
    });
    assert.equal(processes.length, 2);
    assert.equal(processes[0].process.exitCode, 0);
    await controller.apply({ output: 'conference', revision: 3, is_playing: false, position: 13, track: null });
    assert.equal(processes[1].process.exitCode, 0);
    await assert.rejects(
        () =>
            controller.apply({
                output: 'conference',
                revision: 4,
                is_playing: true,
                position: 0,
                track: { id: '8', media_url: 'https://evil.example/audio' },
            }),
        /unsafe/
    );
    controller.stop();
});

test('RTP and FFmpeg parameters agree on payload, SSRC, sample rate, and channels', () => {
    const params = rtpParameters(1234);
    const args = ffmpegArgs(45000, 1234);
    assert.equal(params.codecs[0].payloadType, 111);
    assert.equal(params.codecs[0].clockRate, 48000);
    assert.deepEqual(params.encodings, [{ ssrc: 1234 }]);
    assert.ok(args.includes('111'));
    assert.ok(args.includes('1234'));
    assert.ok(args.includes('48000'));
    const liveArgs = playbackArgs(45000, 46000, 1234, 'http://127.0.0.1/media/song', 42, 1_700_000_000_000);
    assert.match(liveArgs.join(' '), /-ss 42 -i http:\/\/127\.0\.0\.1\/media\/song/);
    assert.match(liveArgs.join(' '), /aresample=48000:async=1000:first_pts=0/);
    assert.doesNotMatch(liveArgs.join(' '), /volume=/);
    assert.match(liveArgs.join(' '), /-application:a audio -frame_duration:a 20 -vbr:a on/);
    assert.match(liveArgs.join(' '), /-fec:a 1 -packet_loss:a 5 -b:a 160k/);
    assert.match(liveArgs.join(' '), /localport=46000/);
    assert.match(liveArgs.join(' '), /-output_ts_offset 1700000000/);
    assert.match(liveArgs.join(' '), /-seq 4608/);
    assert.doesNotMatch(liveArgs.join(' '), /Bearer|token/i);
    assert.equal(peerInfo().peer_name, 'Бодрик FM');
    assert.equal(peerInfo().peer_avatar, 'https://meet.example:3443/images/bodrik-ava.png');
    process.env.SERVER_HOST_URL = 'https://pc.local:3443';
    assert.equal(peerInfo().peer_avatar, 'https://pc.local:3443/images/bodrik-ava.png');
    process.env.SERVER_HOST_URL = 'https://meet.example:3443';
});
