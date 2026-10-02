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

test('new microphone settings enable basic noise suppression, echo cancellation and gain control', () => {
    const context = vm.createContext({ localStorage: { getItem: () => null } });
    const source = fs.readFileSync(require('node:path').join(__dirname, 'LocalStorage.js'), 'utf8');
    vm.runInContext(source + '\nglobalThis.LocalStorage = LocalStorage;', context);
    const settings = new context.LocalStorage().SFU_SETTINGS;
    assert.equal(settings.mic_noise_suppression_mode, 'browser');
    assert.equal(settings.mic_echo_cancellation, true);
    assert.equal(settings.mic_auto_gain_control, true);
});

for (const [mode, customEnabled, expected] of [
    ['off', true, false],
    ['browser', true, true],
    ['rnnoise', true, false],
    ['rnnoise', false, true],
    ['invalid', true, false],
]) {
    test(`capture constraint for ${mode}; custom=${customEnabled}`, () => {
        const source = fs.readFileSync(require('node:path').join(__dirname, 'RoomClient.js'), 'utf8');
        const method = source.slice(
            source.indexOf('    getAudioConstraints(deviceId) {'),
            source.indexOf('    getCameraConstraints() {')
        );
        const settings = { mic_noise_suppression_mode: mode };
        const Client = vm.runInNewContext(`(class { ${method} })`, {
            localStorageSettings: settings,
            BUTTONS: { settings: { customNoiseSuppression: customEnabled } },
            window: {
                BodrikNoiseSuppression: {
                    normalize: (value) => (['off', 'browser', 'rnnoise'].includes(value) ? value : 'off'),
                    browserConstraint: (value) => value === 'browser',
                },
            },
        });
        assert.equal(new Client().getAudioConstraints().audio.noiseSuppression, expected);
    });
}

for (const legacy of [true, false, undefined]) {
    test(`legacy noise setting ${String(legacy)} migrates to basic`, () => {
        const values = new Map();
        const saved = { keyboard_shortcuts: false };
        if (legacy !== undefined) saved.mic_noise_suppression = legacy;
        values.set('SFU_SETTINGS', JSON.stringify(saved));
        const context = vm.createContext({
            localStorage: {
                getItem: (key) => values.get(key) ?? null,
                setItem: (key, value) => values.set(key, value),
            },
        });
        const source = fs.readFileSync(require('node:path').join(__dirname, 'LocalStorage.js'), 'utf8');
        vm.runInContext(source + '\nglobalThis.LocalStorage = LocalStorage;', context);
        const settings = new context.LocalStorage().getLocalStorageSettings();
        assert.equal(settings.mic_noise_suppression_mode, 'browser');
        assert.equal(Object.hasOwn(settings, 'mic_noise_suppression'), false);
    });
}

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
