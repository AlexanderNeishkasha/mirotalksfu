const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname, 'RoomClient.js'), 'utf8');
const method = source.slice(source.indexOf('    handleVolumeControl(volumeInputId)'), source.indexOf('    setAudioVolume(audioPlayer,'));

/** Exercise the listener slider with isolated browser storage and signaling. */
function slider() {
    const values = new Map();
    const sent = [];
    const localStorage = {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
    };
    const Client = vm.runInNewContext(`(class { ${method} })`, { localStorage });
    const input = { value: '100', dataset: { volumeKey: 'music' }, listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; } };
    const audio = { muted: false, volume: 1 };
    const client = new Client();
    client.room_id = 'room';
    client.audioConsumers = new Map([['slider', 'audio']]);
    client.getId = (id) => ({ slider: input, audio })[id];
    client.setAudioVolume = (_audio, gain) => { audio.gain = gain; };
    client.emitCmd = (cmd) => sent.push(cmd);
    client.addVolumeEventListeners = (element, callback) => element.addEventListener('input', callback);
    client.handleVolumeControl('slider');
    return { input, audio, sent, values };
}

test('listener slider changes only local gain and local preference', () => {
    const { input, audio, sent, values } = slider();
    input.value = '25';
    input.listeners.input();
    assert.equal(audio.gain, 0.25);
    assert.equal(values.get('bodrik-peer-volume:room:music'), '25');
    assert.equal(sent.length, 0);
});

test('self cards do not render a volume slider or publish producer gain', () => {
    const start = source.indexOf('    async handleProducer(id, type, stream)');
    const end = source.indexOf('    async handleConsumer(', start);
    assert.ok(start >= 0 && end > start);
    const localVideo = source.slice(start, end);
    assert.doesNotMatch(localVideo, /handlePV\(|producerVideo\.audioVolumeInput|vb\.appendChild\(pv\)/);
    assert.match(source, /remotePeer && BUTTONS\.videoOff\.audioVolumeInput && vb\.appendChild\(pv\)/);
    assert.doesNotMatch(source, /audioProducerId: this\.audioProducerId/);
});
