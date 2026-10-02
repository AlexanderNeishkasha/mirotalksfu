'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM } = require('jsdom');

const read = (file) => readFileSync(path.join(__dirname, file), 'utf8');
const page = read('../views/Room.html');
const room = read('Room.js');
const css = read('../css/ThemeControls.css');
const en = JSON.parse(read('../lang/en.json'));
const ru = JSON.parse(read('../lang/ru.json'));

test('three microphone settings expose accessible circular help controls', () => {
    const dom = new JSDOM(page);
    try {
        for (const id of ['noiseSuppressionHelp', 'echoCancellationHelp', 'autoGainControlHelp']) {
            const button = dom.window.document.getElementById(id);
            assert.equal(button?.tagName, 'BUTTON');
            assert.equal(button.type, 'button');
            assert.equal(button.textContent.trim(), '?');
            assert.ok(button.getAttribute('aria-label'));
        }
    } finally {
        dom.window.close();
    }
    assert.match(css, /#mySettings \.setting-help-button\s*\{[\s\S]*margin: 0[\s\S]*border-radius: 50%/);
    assert.match(css, /#mySettings \.setting-help-button:hover,[\s\S]*color: #fff/);
});

test('noise mode select is wide and keeps neutral mutually exclusive labels', () => {
    const dom = new JSDOM(page);
    try {
        const select = dom.window.document.getElementById('noiseSuppressionMode');
        assert.deepEqual(
            [...select.options].map((option) => [option.value, option.textContent]),
            [
                ['off', 'Off'],
                ['browser', 'Browser'],
                ['rnnoise', 'RNNoise'],
            ]
        );
        assert.match(select.className, /mic-noise-mode-select/);
    } finally {
        dom.window.close();
    }
    assert.match(
        css,
        /#micOptionsButton select\.mic-noise-mode-select\s*\{[\s\S]*width: 190px !important[\s\S]*margin: 0 !important[\s\S]*align-self: center/
    );
    assert.match(css, /#micOptionsButton #noiseSuppressionButton\s*\{[\s\S]*grid-template-columns: minmax\(0, 1fr\)/);
    assert.match(css, /#micOptionsButton select\.mic-noise-mode-select\s*\{[\s\S]*width: 100% !important/);
    assert.match(css, /#micOptionsButton \.settingsTable td\s*\{[\s\S]*vertical-align: middle/);
    assert.match(css, /#micOptionsButton \.settingsTable td:first-child \.title\s*\{[\s\S]*width: auto/);
    assert.match(css, /\.mic-setting-label\s*\{[\s\S]*justify-content: flex-start[\s\S]*white-space: nowrap/);
    assert.doesNotMatch(css, /#micOptionsButton \.settingsTable \.title\s*\{[\s\S]*width: 100%/);
    assert.equal(ru.labels.Off, 'Выключено');
});

for (const key of [
    'Browser noise suppression — recommended',
    'Uses the browser or device audio processing with the lowest load. Start with this mode.',
    'RNNoise — enhanced',
    'Removes steady background noise more aggressively, but uses more CPU, memory, and battery. Choose browser mode if audio stutters or sounds distorted.',
    'Echo cancellation',
    'Enable it when sound plays through speakers or a laptop: it helps prevent other participants from hearing their voices returned through your microphone. Headphones usually do not need it.',
    'Automatic gain control',
    'Keeps quiet and loud speech at a more even level. Enable it for a distant microphone or changing speaking volume; disable it if volume pumps or you transmit music.',
]) {
    test(`microphone help has maintained English and Russian copy: ${key}`, () => {
        assert.equal(en.tooltips[key], key);
        assert.ok(ru.tooltips[key] && ru.tooltips[key] !== key);
        assert.ok(room.includes(key));
    });
}

test('help supports hover, keyboard focus, and mobile tap', () => {
    assert.match(room, /trigger: 'mouseenter focus click'/);
    assert.match(room, /setTippy\(id, micHelpHtml\(sections\), isMobileDevice \? 'bottom' : 'right', true\)/);
    assert.match(room, /maxWidth: Math\.min\(340, window\.innerWidth - 32\)/);
});
