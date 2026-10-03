const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname, 'LocalStorage.js'), 'utf8');

/** Create browser storage backed by an inspectable map. */
function storage(savedSettings) {
    const values = new Map();
    if (savedSettings) values.set('SFU_SETTINGS', JSON.stringify(savedSettings));
    const localStorage = {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
    };
    const context = vm.createContext({ localStorage });
    vm.runInContext(source + '\nglobalThis.LocalStorage = LocalStorage;', context);
    return { values, Store: context.LocalStorage };
}

for (const [name, avatar, expected] of [
    ['legacy gallery', 'https://meet.test/images/avatars/avatar_01.png', ''],
    ['relative legacy gallery', '/images/avatars/avatar_25.png', ''],
    ['uploaded avatar', 'https://meet.test/avatars/user.png', 'https://meet.test/avatars/user.png'],
    ['external avatar', 'https://example.test/photo.png', 'https://example.test/photo.png'],
]) {
    test(`retired avatar gallery preference: ${name}`, () => {
        const { Store } = storage({ peer_avatar: avatar });
        assert.equal(new Store().getLocalStorageSettings().peer_avatar, expected);
    });
}

test('new visitors keep chat closed on join and on incoming messages', () => {
    const { Store } = storage();
    const store = new Store();
    assert.equal(store.SFU_SETTINGS.show_chat_on_msg, false);
    assert.equal(store.SFU_SETTINGS.mic_noise_suppression_mode, 'browser');
    assert.equal(store.SFU_SETTINGS.mic_echo_cancellation, true);
    assert.equal(store.SFU_SETTINGS.mic_auto_gain_control, true);
    assert.equal(store.getLocalStorageSettings(), null);
});

for (const mode of ['off', 'browser', 'rnnoise', 'invalid', undefined]) {
    test(`speech defaults migrate ${mode} once and preserve later choices`, () => {
        const { Store, values } = storage({
            mic_noise_suppression_mode: mode,
            mic_echo_cancellation: false,
            mic_auto_gain_control: false,
            speaker_volume: 37,
        });
        values.set('BODRIK_NOISE_MODE_V3_DEFAULT_OFF', '1');
        const store = new Store();
        const settings = store.getLocalStorageSettings();
        assert.equal(settings.mic_noise_suppression_mode, 'browser');
        assert.equal(settings.mic_echo_cancellation, true);
        assert.equal(settings.mic_auto_gain_control, true);
        assert.equal(settings.speaker_volume, 37);
        settings.mic_noise_suppression_mode = 'off';
        settings.mic_echo_cancellation = false;
        settings.mic_auto_gain_control = false;
        store.setSettings(settings);
        const saved = new Store().getLocalStorageSettings();
        assert.equal(saved.mic_noise_suppression_mode, 'off');
        assert.equal(saved.mic_echo_cancellation, false);
        assert.equal(saved.mic_auto_gain_control, false);
        saved.mic_noise_suppression_mode = 'invalid';
        store.setSettings(saved);
        assert.equal(new Store().getLocalStorageSettings().mic_noise_suppression_mode, 'browser');
    });
}

test('existing visitors reset auto-open once without losing other settings', () => {
    const { Store, values } = storage({
        show_chat_on_msg: true,
        mic_noise_suppression: true,
        theme: 7,
    });
    const store = new Store();
    const migrated = store.getLocalStorageSettings();
    assert.equal(migrated.show_chat_on_msg, false);
    assert.equal(migrated.mic_noise_suppression_mode, 'browser');
    assert.equal(Object.hasOwn(migrated, 'mic_noise_suppression'), false);
    assert.equal(migrated.theme, 7);
    assert.equal(values.get('BODRIK_CHAT_AUTO_OPEN_OFF_V1'), '1');
    migrated.show_chat_on_msg = true;
    store.setSettings(migrated);
    assert.equal(new Store().getLocalStorageSettings().show_chat_on_msg, true);
});
