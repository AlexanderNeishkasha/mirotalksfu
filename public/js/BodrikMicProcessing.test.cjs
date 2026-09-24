const test = require('node:test');
const assert = require('node:assert/strict');
const { setBodrikMicPreference, bindBodrikMicSettings } = require('./BodrikMicProcessing');
const fs = require('node:fs');
const vm = require('node:vm');

/** Model the raw capture track, including the RNNoise wrapper's input. */
function fixture(track) {
    const settings = { mic_echo_cancellation: false, mic_auto_gain_control: false };
    const input = { checked: true, disabled: false };
    const storage = {
        setSettings(value) {
            this.saved = { ...value };
        },
    };
    const roomClient = { RNNoiseProcessor: { mediaStream: { getAudioTracks: () => [track] } } };
    return { settings, input, storage, roomClient };
}

test('existing browser settings default both microphone enhancements to off', () => {
    const context = vm.createContext({
        localStorage: { getItem: () => JSON.stringify({ mic_noise_suppression: false }) },
    });
    const source = fs.readFileSync(require('node:path').join(__dirname, 'LocalStorage.js'), 'utf8');
    vm.runInContext(source + '\nglobalThis.LocalStorage = LocalStorage;', context);
    const settings = new context.LocalStorage().getLocalStorageSettings();
    assert.notEqual(settings.mic_echo_cancellation, true);
    assert.notEqual(settings.mic_auto_gain_control, true);
});

test('capture constraints default off and follow each saved enhancement', () => {
    const source = fs.readFileSync(require('node:path').join(__dirname, 'RoomClient.js'), 'utf8');
    const method = source.slice(
        source.indexOf('    getAudioConstraints(deviceId) {'),
        source.indexOf('    getCameraConstraints() {')
    );
    const settings = { mic_noise_suppression: false };
    const Client = vm.runInNewContext(`(class { ${method} })`, {
        localStorageSettings: settings,
        BUTTONS: { settings: { customNoiseSuppression: true } },
    });
    const client = new Client();
    client.isRNNoiseSupported = true;
    assert.deepEqual(JSON.parse(JSON.stringify(client.getAudioConstraints().audio)), {
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
    });
    settings.mic_echo_cancellation = true;
    settings.mic_auto_gain_control = true;
    assert.equal(client.getAudioConstraints().audio.echoCancellation, true);
    assert.equal(client.getAudioConstraints().audio.autoGainControl, true);
});

test('updates the raw capture track and persists a successful setting', async () => {
    const track = {
        readyState: 'live',
        getConstraints: () => ({ deviceId: 'mic' }),
        async applyConstraints(value) {
            this.applied = value;
        },
    };
    const context = fixture(track);
    await setBodrikMicPreference({
        key: 'mic_echo_cancellation',
        constraint: 'echoCancellation',
        enabled: true,
        ...context,
    });
    assert.deepEqual(track.applied, { deviceId: 'mic', echoCancellation: true });
    assert.equal(context.storage.saved.mic_echo_cancellation, true);
    assert.equal(context.input.disabled, false);
});

test('failed capture update restores the switch without saving', async () => {
    const track = {
        readyState: 'live',
        getConstraints: () => ({}),
        async applyConstraints() {
            throw new Error('device failure');
        },
    };
    const context = fixture(track);
    await assert.rejects(
        setBodrikMicPreference({
            key: 'mic_auto_gain_control',
            constraint: 'autoGainControl',
            enabled: true,
            ...context,
        }),
        /device failure/
    );
    assert.equal(context.input.checked, false);
    assert.equal(context.input.disabled, false);
    assert.equal(context.storage.saved, undefined);
});

test('both settings switches update their own browser constraint', async () => {
    const echoInput = { checked: true, disabled: false };
    const gainInput = { checked: true, disabled: false };
    const settings = {};
    const applied = [];
    const storage = { setSettings() {} };
    const track = {
        readyState: 'live',
        getConstraints: () => ({}),
        async applyConstraints(value) {
            applied.push(value);
        },
    };
    bindBodrikMicSettings({
        echoInput,
        gainInput,
        settings,
        storage,
        getRoomClient: () => ({ localAudioStream: { getAudioTracks: () => [track] } }),
        onError: () => assert.fail('unexpected capture failure'),
    });
    await echoInput.onchange();
    await gainInput.onchange();
    assert.deepEqual(applied, [{ echoCancellation: true }, { autoGainControl: true }]);
});

test('preference is saved for the next capture if the microphone is off', async () => {
    const context = fixture(undefined);
    await setBodrikMicPreference({
        key: 'mic_echo_cancellation',
        constraint: 'echoCancellation',
        enabled: true,
        ...context,
    });
    assert.equal(context.storage.saved.mic_echo_cancellation, true);
});
