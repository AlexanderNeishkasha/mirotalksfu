'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { JSDOM } = require('jsdom');

/** Read authoritative settings markup without running meeting admission. */
const page = readFileSync(join(__dirname, '../views/Room.html'), 'utf8');

for (const [group, expected] of [
    ['Devices', ['tabAudioDevicesBtn', 'tabVideoDevicesBtn', 'tabVirtualBackgroundBtn']],
    ['Meeting', ['tabProfileBtn', 'tabRoomBtn', 'tabRecordingBtn', 'tabModeratorBtn']],
    ['Personal', ['tabShortcutsBtn', 'tabAspectBtn', 'tabLanguagesBtn']],
]) {
    test(`settings navigation preserves controls in the requested order: ${group}`, () => {
        const dom = new JSDOM(page);
        try {
            const nav = dom.window.document.querySelector('#mySettings .tab');
            const groups = {};
            let current;
            for (const node of nav.children) {
                if (node.classList.contains('settings-nav-label')) {
                    current = node.textContent;
                    groups[current] = [];
                } else groups[current].push(node.id);
            }
            assert.deepEqual(Object.keys(groups), ['Devices', 'Meeting', 'Personal']);
            assert.deepEqual(groups[group], expected);
            for (const id of expected) {
                assert.equal(dom.window.document.querySelectorAll(`#${id}`).length, 1);
                assert.ok(dom.window.document.getElementById(id.replace(/Btn$/, '')));
            }
        } finally {
            dom.window.close();
        }
    });
}

test('initial settings content and active navigation both point to audio devices', () => {
    const dom = new JSDOM(page);
    try {
        const active = dom.window.document.querySelectorAll('#mySettings .tablinks.active');
        assert.equal(active.length, 1);
        assert.equal(active[0].id, 'tabAudioDevicesBtn');
        const css = readFileSync(join(__dirname, '../css/Room.css'), 'utf8');
        assert.match(css, /#tabAudioDevices\s*\{\s*display: block;/);
        assert.doesNotMatch(css, /#tabRoom\s*\{\s*display: block;/);
    } finally {
        dom.window.close();
    }
});
