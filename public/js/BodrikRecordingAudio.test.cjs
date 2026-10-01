'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

/** Build an inspectable recording graph with real client volume hooks and fake Web Audio nodes. */
function setup() {
    let inputStops = 0;
    let outputStops = 0;
    let closes = 0;
    const track = (id) => ({ id, kind: 'audio', stop: () => inputStops++ });
    const music = track('music');
    const mic = track('mic');
    class Stream {
        constructor(tracks) {
            this.tracks = tracks;
        }
        getAudioTracks() {
            return this.tracks;
        }
        getTracks() {
            return this.tracks;
        }
    }
    const node = () => ({
        connections: [],
        connect(target) {
            this.connections.push(target);
        },
        disconnect() {},
    });
    class Context {
        constructor() {
            this.destination = { speaker: true };
        }
        createMediaStreamDestination() {
            return { ...node(), stream: new Stream([{ stop: () => outputStops++ }]) };
        }
        createMediaStreamSource() {
            return node();
        }
        createGain() {
            return { ...node(), gain: { value: 1 } };
        }
        close() {
            closes++;
            return Promise.resolve();
        }
    }
    const context = { window: { AudioContext: Context }, MediaStream: Stream, console: { log() {}, warn() {} } };
    for (const file of ['BodrikAudioGain.js', 'BodrikRecordingAudio.js', 'RoomClient.js']) {
        vm.runInNewContext(readFileSync(join(__dirname, file), 'utf8'), context);
    }
    vm.runInNewContext('globalThis.Mixer = BodrikRecordingAudio; globalThis.Client = RoomClient;', context);
    const player = { dataset: { bodrikMusic: 'true', peerVolume: '0.05' }, srcObject: new Stream([music]) };
    const client = {
        masterOutputVolume: 0.5,
        bodrikMusicVolume: 0.1,
        peer_info: { peer_audio: true },
        getOutputAudioElements: () => [player],
        getOutputGainNode: () => null,
        getPeerAudioBtn: () => null,
        getPeerAudioVolumeBar: () => null,
    };
    const mixer = new context.Mixer(client);
    client.audioRecorder = mixer;
    mixer.getMixedAudioStream([new Stream([music]), new Stream([mic]), new Stream([mic])]);
    return {
        context,
        client,
        mixer,
        player,
        inputStops: () => inputStops,
        outputStops: () => outputStops,
        closes: () => closes,
    };
}

test('recording follows Studio, participant and speaker levels, including live changes and mute', () => {
    const { context, client, mixer, player } = setup();
    assert.ok(Math.abs(mixer.entries.get('music').gain.gain.value - 0.0025) < 1e-10);
    assert.equal(mixer.entries.size, 2, 'local microphone must not be doubled');
    player.dataset.peerVolume = '0.01';
    context.Client.prototype.applyOutputVolume.call(client, player);
    assert.equal(mixer.entries.get('music').gain.gain.value, player.volume);
    client.bodrikMusicVolume = 0;
    context.Client.prototype.applyOutputVolume.call(client, player);
    assert.equal(mixer.entries.get('music').gain.gain.value, 0);
    context.Client.prototype.setIsAudio.call(client, 'self', false);
    assert.equal(mixer.entries.get('mic').gain.gain.value, 0);
});

test('recording graph never plays through speakers or stops live call tracks', () => {
    const h = setup();
    for (const { source, gain } of h.mixer.entries.values()) {
        assert.equal(source.connections[0], gain);
        assert.equal(gain.connections[0], h.mixer.destination);
    }
    h.mixer.stopMixedAudioStream();
    h.mixer.stopMixedAudioStream();
    assert.equal(h.inputStops(), 0);
    assert.equal(h.outputStops(), 1);
    assert.equal(h.closes(), 1);
});
