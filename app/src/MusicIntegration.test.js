'use strict';

// Run separately on Linux with a compiled mediasoup worker and FFmpeg installed.
const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const mediasoup = require('mediasoup');
const { BodrikMusic } = require('./BodrikMusic');

process.env.SERVER_HOST_URL = 'https://meet.example:3443';

test('real mediasoup PlainTransport receives generated FFmpeg RTP', async () => {
    const worker = await mediasoup.createWorker();
    let music;
    let router;
    let timer;
    try {
        router = await worker.createRouter({
            mediaCodecs: [
                { kind: 'audio', mimeType: 'audio/opus', preferredPayloadType: 111, clockRate: 48000, channels: 2 },
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
        music = await new BodrikMusic(room).start();
        await music.producer.enableTraceEvent(['rtp']);
        const timeout = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error('RTP timeout')), 5000);
        });
        const [trace] = await Promise.race([once(music.producer, 'trace'), timeout]);
        assert.equal(trace.type, 'rtp');
    } finally {
        clearTimeout(timer);
        music?.stop();
        router?.close();
        worker.close();
    }
});
