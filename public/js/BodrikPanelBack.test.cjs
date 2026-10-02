'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

/** Model asynchronous history traversal and class observation independently from media/network I/O. */
function fixture() {
    const dom = new JSDOM(`<div id="mySettings"></div><div id="chatRoom"></div><div id="plist" class="hidden"></div>
        <button id="mySettingsCloseBtn"></button><button id="chatHideParticipantsList"></button><button id="chatCloseButton"></button>`);
    const document = dom.window.document;
    const entries = [{}];
    let cursor = 0;
    let pending = 0;
    let callback;
    let disconnected = false;
    const history = {
        get state() {
            return entries[cursor];
        },
        pushState(state) {
            entries.splice(++cursor);
            entries.push(state);
        },
        back() {
            pending++;
        },
    };
    const context = {
        window: { addEventListener() {} },
        document,
        history,
        location: { href: 'https://meet.test/room/x' },
        MutationObserver: class {
            constructor(fn) {
                callback = fn;
            }
            observe() {}
            disconnect() {
                disconnected = true;
            }
        },
    };
    vm.runInNewContext(readFileSync(join(__dirname, 'BodrikPanelBack.js'), 'utf8'), context);
    const api = context.window.BodrikPanelBack;
    const element = (id) => document.getElementById(id);
    element('mySettingsCloseBtn').onclick = () => element('mySettings').classList.remove('show');
    element('chatHideParticipantsList').onclick = () => element('plist').classList.add('hidden');
    element('chatCloseButton').onclick = () => element('chatRoom').classList.remove('show');
    return {
        api,
        element,
        entries,
        history,
        sync: () => {
            if (!disconnected) callback?.();
        },
        /** Deliver one requested or user-initiated Back event. */
        back() {
            pending = Math.max(0, pending - 1);
            cursor--;
            return api.handleBack();
        },
        get pending() {
            return pending;
        },
        cleanup: () => dom.window.close(),
    };
}

for (const [name, openId, closeId] of [
    ['settings', 'mySettings', 'mySettingsCloseBtn'],
    ['chat', 'chatRoom', 'chatCloseButton'],
]) {
    test(`mobile Back closes ${name} without invoking the leave guard`, () => {
        const h = fixture();
        try {
            h.api.start(true);
            h.element(openId).classList.add('show');
            h.sync();
            assert.equal(h.entries.length, 3);
            assert.equal(h.back(), true);
            assert.equal(h.element(openId).classList.contains('show'), false);
            h.sync();
            assert.equal(h.history.state.sessionActive, true);
            assert.equal(h.back(), false, 'next Back should use the existing leave confirmation');
        } finally {
            h.cleanup();
        }
    });
    test(`closing ${name} via its button consumes only the panel entry`, () => {
        const h = fixture();
        try {
            h.api.start(true);
            h.element(openId).classList.add('show');
            h.sync();
            h.element(closeId).click();
            h.sync();
            assert.equal(h.pending, 1);
            assert.equal(h.back(), true);
            assert.equal(h.history.state.bodrikPanelBack, undefined);
        } finally {
            h.cleanup();
        }
    });
}

test('participants and settings share one entry, and Back closes the most recently opened panel', () => {
    const h = fixture();
    try {
        h.api.start(true);
        h.element('chatRoom').classList.add('show');
        h.sync();
        h.element('plist').classList.remove('hidden');
        h.sync();
        h.element('mySettings').classList.add('show');
        h.sync();
        assert.equal(h.entries.length, 3);
        assert.equal(h.back(), true);
        assert.equal(h.element('mySettings').classList.contains('show'), false);
        assert.equal(h.element('plist').classList.contains('hidden'), false);
        assert.equal(h.back(), true);
        assert.equal(h.element('plist').classList.contains('hidden'), true);
        assert.equal(h.element('chatRoom').classList.contains('show'), true);
        assert.equal(h.back(), true);
        assert.equal(h.element('chatRoom').classList.contains('show'), false);
    } finally {
        h.cleanup();
    }
});

test('reopening during a pending close re-arms one entry without closing the new panel', () => {
    const h = fixture();
    try {
        h.api.start(true);
        h.element('mySettings').classList.add('show');
        h.sync();
        h.element('mySettingsCloseBtn').click();
        h.sync();
        h.element('chatRoom').classList.add('show');
        h.sync();
        assert.equal(h.pending, 1);
        assert.equal(h.back(), true);
        assert.equal(h.element('chatRoom').classList.contains('show'), true);
        assert.equal(h.history.state.bodrikPanelBack, true);
    } finally {
        h.cleanup();
    }
});

test('reconnect does not add session entries, desktop does not intercept panels, and leave cleans up', () => {
    const h = fixture();
    try {
        h.api.start(false);
        h.api.start(false);
        assert.equal(h.entries.length, 2);
        h.element('mySettings').classList.add('show');
        h.sync();
        assert.equal(h.api.handleBack(), false);
        h.api.start(true);
        h.sync();
        h.api.stop();
        assert.equal(h.pending, 1);
        assert.equal(h.back(), true);
        assert.equal(h.api.handleBack(), false);
    } finally {
        h.cleanup();
    }
});
