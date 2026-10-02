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

test('quick noise select delegates to settings and follows settings changes after rebuild', () => {
    const dom = new JSDOM(page, { runScripts: 'outside-only' });
    try {
        dom.window.eval(read('BodrikNoiseSuppression.js'));
        const source = dom.window.document.getElementById('noiseSuppressionMode');
        const menu = dom.window.document.createElement('div');
        const api = dom.window.BodrikNoiseSuppression;
        let menuClicks = 0;
        menu.addEventListener('click', () => {
            menuClicks++;
        });
        let changes = 0;
        source.addEventListener('change', () => {
            changes++;
        });
        for (const mode of ['off', 'browser', 'rnnoise']) {
            menu.replaceChildren();
            api.appendMenuSelect(menu, source);
            const select = menu.querySelector('select');
            const click = new dom.window.MouseEvent('click', { bubbles: true, cancelable: true });
            select.dispatchEvent(click);
            assert.equal(menuClicks, 0, 'select clicks must not rebuild the enclosing menu');
            assert.equal(click.defaultPrevented, false, 'native select opening must remain enabled');
            select.value = mode;
            select.dispatchEvent(new dom.window.Event('change'));
            assert.equal(source.value, mode);
            source.value = 'off';
            source.dispatchEvent(new dom.window.Event('change'));
            assert.equal(select.value, 'off');
        }
        assert.equal(changes, 6);
    } finally {
        dom.window.close();
    }
});

test('quick-menu help reuses content, toggles on click, and destroys obsolete instances', () => {
    const dom = new JSDOM(page, { runScripts: 'outside-only' });
    try {
        dom.window.eval(read('BodrikNoiseSuppression.js'));
        const menu = dom.window.document.createElement('div');
        const source = dom.window.document.getElementById('noiseSuppressionMode');
        const instances = [];
        dom.window.tippy = (button, props) => {
            const instance = {
                state: { isVisible: false },
                show() {
                    this.state.isVisible = true;
                },
                hide() {
                    this.state.isVisible = false;
                },
                destroy() {
                    this.destroyed = true;
                },
                props,
            };
            instances.push(instance);
            return instance;
        };
        let bubbled = 0;
        menu.addEventListener('click', () => {
            bubbled++;
        });
        for (const [control, help] of [
            ['deviceMenuNoiseSuppression', 'noiseSuppressionHelp'],
            ['deviceMenuEchoCancellation', 'echoCancellationHelp'],
            ['deviceMenuAutoGainControl', 'autoGainControlHelp'],
        ]) {
            const label = dom.window.document.createElement('label');
            label.htmlFor = control;
            menu.append(label);
            dom.window.document.getElementById(help)._tippy = { props: { content: help, trigger: 'manual' } };
        }
        const api = dom.window.BodrikNoiseSuppression;
        api.appendMenuHelp(menu);
        assert.equal(instances.length, 3);
        for (const [index, button] of [...menu.querySelectorAll('button')].entries()) {
            button.click();
            assert.equal(instances[index].state.isVisible, true);
            button.click();
            assert.equal(instances[index].state.isVisible, false);
            assert.ok(button.getAttribute('aria-label'));
        }
        assert.equal(bubbled, 0);
        assert.equal(instances[0].props.content, 'noiseSuppressionHelp');
        api.appendMenuSelect(menu, source);
        assert.ok(instances.every((instance) => instance.destroyed));
        dom.window.document.getElementById('echoCancellationHelp')._tippy.props.trigger = 'mouseenter focus';
        api.appendMenuHelp(menu);
        const desktop = instances.findLast((instance) => instance.props.content === 'echoCancellationHelp');
        assert.equal(desktop.props.trigger, 'mouseenter focus');
        menu.querySelector('#deviceMenuEchoCancellationHelp').click();
        assert.equal(desktop.state.isVisible, false, 'desktop click must not manually toggle hover help');
    } finally {
        dom.window.close();
    }
});

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
    assert.match(css, /#mySettings \.setting-help-button,[\s\S]*?\{[\s\S]*margin: 0[\s\S]*border-radius: 50%/);
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
                ['browser', 'Basic'],
                ['rnnoise', 'Enhanced'],
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
    'Basic',
    'Reduces background noise with minimal processing load.',
    'Enhanced',
    'Suppresses background noise more strongly, using more CPU and battery.',
    'Echo cancellation',
    'Helps reduce echo when using speakers.',
    'Automatic gain control',
    'Automatically evens out quiet and loud speech.',
]) {
    test(`microphone help has maintained English and Russian copy: ${key}`, () => {
        assert.equal(en.tooltips[key], key);
        assert.ok(ru.tooltips[key] && ru.tooltips[key] !== key);
        assert.ok(room.includes(key));
    });
}

test('help initialization is outside the desktop-only tooltip block', () => {
    assert.match(
        room,
        /setTippy\('participantsHiddenBtn',[\s\S]*?\n    \}\n\n    setMicProcessingHelpTippy\(\);\n    initEnumerateDevices\(\);/
    );
});

test('help supports desktop hover/focus and an explicit mobile/tablet tap toggle', () => {
    assert.match(room, /const touchHelp = isMobileDevice \|\| isTabletDevice \|\| isIPadDevice/);
    assert.match(room, /trigger: touchHelp \? 'manual' : 'mouseenter focus'/);
    assert.match(room, /setTippy\(id, micHelpHtml\(sections\), touchHelp \? 'bottom' : 'right', true\)/);
    assert.match(room, /instance\.state\.isVisible \? instance\.hide\(\) : instance\.show\(\)/);
    assert.match(room, /appendTo: \(\) => document\.body/);
    assert.match(room, /maxWidth: Math\.min\(340, window\.innerWidth - 32\)/);
});
