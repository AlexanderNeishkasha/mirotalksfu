'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const source = readFileSync(path.join(__dirname, 'BodrikKeyboardShortcuts.js'), 'utf8');

/** Load the actual resolver with DOM element/editability semantics. */
function fixture() {
    const dom = new JSDOM(
        '<body><button id="button"></button><input id="input"><textarea id="textarea"></textarea><select id="select"></select><div id="editable" contenteditable="true"></div><div id="textbox" role="textbox"></div><div id="editor" class="CodeMirror"><span id="editor-child"></span></div></body>'
    );
    const context = vm.createContext({ window: dom.window });
    vm.runInContext(source, context);
    return { dom, document: dom.window.document, shortcuts: dom.window.BodrikKeyboardShortcuts };
}

for (const [code, key, expected] of [
    ['KeyA', 'a', 'audio'],
    ['KeyA', 'ф', 'audio'],
    ['KeyV', 'м', 'video'],
    ['KeyS', 'ы', 'screen'],
    ['KeyH', 'р', 'hand'],
    ['KeyC', 'с', 'chat'],
    ['KeyO', 'щ', 'settings'],
    ['KeyR', 'к', 'recording'],
    ['KeyF', 'а', 'file'],
    ['KeyZ', 'я', null],
]) {
    test(`physical shortcut ${code} resolves independently from printed key ${key}`, () => {
        const { dom, document, shortcuts } = fixture();
        try {
            assert.equal(shortcuts.action({ code, key, target: document.querySelector('#button') }, true), expected);
        } finally {
            dom.window.close();
        }
    });
}

for (const [name, event] of [
    ['disabled setting', { enabled: false }],
    ['repeated key', { repeat: true }],
    ['Ctrl chord', { ctrlKey: true }],
    ['Alt chord', { altKey: true }],
    ['Meta chord', { metaKey: true }],
    ['IME composition', { isComposing: true }],
    ['already handled event', { defaultPrevented: true }],
]) {
    test(`shortcut is ignored for ${name}`, () => {
        const { dom, document, shortcuts } = fixture();
        try {
            const { enabled = true, ...overrides } = event;
            assert.equal(
                shortcuts.action({ code: 'KeyA', target: document.querySelector('#button'), ...overrides }, enabled),
                null
            );
        } finally {
            dom.window.close();
        }
    });
}

for (const selector of ['#input', '#textarea', '#select', '#editable', '#textbox', '#editor', '#editor-child']) {
    test(`shortcut is ignored while editing ${selector}`, () => {
        const { dom, document, shortcuts } = fixture();
        try {
            const target = document.querySelector(selector);
            const path =
                selector === '#editor-child' ? [target, document.querySelector('#editor'), document.body] : [target];
            assert.equal(shortcuts.action({ code: 'KeyC', target, composedPath: () => path }, true), null);
        } finally {
            dom.window.close();
        }
    });
}

test('room loads resolver before handlers and checks the live toggle value', () => {
    const room = readFileSync(path.join(__dirname, 'Room.js'), 'utf8');
    const page = readFileSync(path.join(__dirname, '../views/Room.html'), 'utf8');
    assert.ok(page.indexOf('BodrikKeyboardShortcuts.js') < page.indexOf('Room.js'));
    assert.match(room, /BodrikKeyboardShortcuts\.action\(event, isShortcutsEnabled\)/);
    assert.doesNotMatch(room, /event\.key\.toLowerCase\(\)/);
});
