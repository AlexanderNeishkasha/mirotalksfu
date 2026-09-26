'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const page = readFileSync(join(__dirname, '../views/Room.html'), 'utf8');
const css = readFileSync(join(__dirname, '../css/ChatListActions.css'), 'utf8');

test('narrow conversation header gives Invite, actions, and Close separate grid cells', () => {
    const header = page.split('<!-- CHAT LIST OPTIONS -->')[1].split('<!-- CHAT SEARCH -->')[0];
    assert.match(header, /<div class="chat-action-icon-btns">[\s\S]*?<\/div>\s*<button id="chatHideParticipantsList"/);
    assert.match(css, /\.chat-list-actions\s*\{\s*display: grid;/);
    assert.match(css, /\.chat-action-icon-btns\s*\{[^}]*grid-row: 2;/);
    assert.match(css, /\.chat-list-actions > #chatHideParticipantsList\s*\{[^}]*grid-row: 1;/);
    assert.match(page, /ChatListActions\.css/);
});
