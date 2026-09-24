const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname, 'RoomClient.js'), 'utf8');
const methods = source.slice(source.indexOf('    applyOutputVolume(audioPlayer) {'), source.indexOf('    handlePeerAudio(cmd) {'));
const Volume = vm.runInNewContext(`(class { ${methods} })`, { window: {} });

/** Create a remote audio player with an inspectable gain node. */
function player() {
    return { dataset: { peerVolume: '0.5', bodrikMusic: 'true' }, muted: true, volume: 1, playbackRate: 1 };
}

test('mobile music applies Studio master times listener volume without changing playback speed', () => {
    const gain = { gain: { value: 1 } };
    const client = new Volume();
    client.isMobileDevice = true;
    client.masterOutputVolume = 0.8;
    client.bodrikMusicVolume = 0.5;
    client.getOutputGainNode = () => gain;
    const audio = player();
    client.applyOutputVolume(audio);
    assert.equal(gain.gain.value, 0.2);
    assert.equal(audio.muted, false);
    assert.equal(audio.playbackRate, 1);
    client.bodrikMusicVolume = 0;
    client.applyOutputVolume(audio);
    assert.equal(gain.gain.value, 0);
    client.bodrikMusicVolume = 1;
    client.applyOutputVolume(audio);
    assert.equal(gain.gain.value, 0.4);
});

test('mobile tries Web Audio despite HTML volume appearing writable', () => {
    const client = new Volume();
    client.isMobileDevice = true;
    client.canSetElementVolume = () => true;
    client.getOutputAudioContext = () => ({
        createMediaElementSource: () => ({ connect() {} }),
        createGain: () => ({ gain: { value: 1 }, connect() {} }),
        destination: {},
    });
    const audio = player();
    assert.ok(client.getOutputGainNode(audio, 0.4));
    assert.ok(audio._outputGainNode);
    assert.equal(client.getOutputGainNode(audio, 1), audio._outputGainNode);
});

test('desktop continues using HTML volume when no gain is needed', () => {
    const client = new Volume();
    client.isMobileDevice = false;
    client.masterOutputVolume = 0.8;
    client.bodrikMusicVolume = 0.5;
    client.getOutputGainNode = () => null;
    const audio = player();
    client.applyOutputVolume(audio);
    assert.equal(audio.volume, 0.2);
    assert.equal(audio.muted, false);
});
