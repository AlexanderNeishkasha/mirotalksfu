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

test('new visitors keep chat closed on join and on incoming messages', () => {
    const { Store } = storage();
    const store = new Store();
    assert.equal(store.SFU_SETTINGS.show_chat_on_msg, false);
    assert.equal(store.getLocalStorageSettings(), null);
});

test('existing visitors reset auto-open once without losing other settings', () => {
    const { Store, values } = storage({ show_chat_on_msg: true, mic_noise_suppression: true, theme: 7 });
    const store = new Store();
    const migrated = store.getLocalStorageSettings();
    assert.equal(migrated.show_chat_on_msg, false);
    assert.equal(migrated.mic_noise_suppression, false);
    assert.equal(migrated.theme, 7);
    assert.equal(values.get('BODRIK_CHAT_AUTO_OPEN_OFF_V1'), '1');
    migrated.show_chat_on_msg = true;
    store.setSettings(migrated);
    assert.equal(new Store().getLocalStorageSettings().show_chat_on_msg, true);
});
