'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const css = readFileSync(join(__dirname, '../css/ThemeControls.css'), 'utf8');
const page = readFileSync(join(__dirname, '../views/Room.html'), 'utf8');

for (const action of ['confirm', 'deny', 'cancel']) {
    test(`modal ${action} button follows the live theme instead of inline colors`, () => {
        assert.match(css, new RegExp(`button\\.swal2-${action}`));
        assert.match(css, /background-color: var\(--(?:room-switch-accent|btns-bg-color)\) !important/);
        assert.match(css, /outline: 2px solid var\(--room-switch-accent\)/);
    });
}

test('volume ranges use the live accent, including the dropdown override', () => {
    assert.match(css, /body input\[type='range'\]/);
    assert.match(css, /body \.navbar-dropdown-control input\[type='range'\]/);
    assert.match(css, /accent-color: var\(--room-switch-accent\)/);
    assert.match(page, /ThemeControls\.css/);
});
