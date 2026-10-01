'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const source = readFileSync(join(__dirname, 'BodrikSettingsEscape.js'), 'utf8');

for (const {
    name,
    key = 'Escape',
    open = true,
    dialog = false,
    defaultPrevented = false,
    isComposing = false,
    expected = 0,
} of [
    { name: 'settings with both hidden and show classes close', expected: 1 },
    { name: 'closed settings remain closed', open: false },
    { name: 'nested dialog handles Escape', dialog: true },
    { name: 'other keys do nothing', key: 'Enter' },
    { name: 'handled Escape does nothing', defaultPrevented: true },
    { name: 'composition does nothing', isComposing: true },
]) {
    test(name, () => {
        let handler;
        let cleanup;
        let clicks = 0;
        const document = {
            getElementById: (id) =>
                id === 'mySettings'
                    ? { classList: { contains: (name) => name === 'hidden' || (name === 'show' && open) } }
                    : { click: () => clicks++ },
            addEventListener: (_, callback) => {
                handler = callback;
            },
            removeEventListener: (_, callback) => assert.equal(callback, handler),
        };
        const window = {
            Swal: { isVisible: () => dialog },
            addEventListener: (_, callback) => {
                cleanup = callback;
            },
        };
        vm.runInNewContext(source, { document, window });
        handler({ key, defaultPrevented, isComposing });
        assert.equal(clicks, expected);
        cleanup();
    });
}

test('room loads settings Escape handler', () => {
    const page = readFileSync(join(__dirname, '../views/Room.html'), 'utf8');
    assert.match(page, /BodrikSettingsEscape\.js\?v=2/);
});
