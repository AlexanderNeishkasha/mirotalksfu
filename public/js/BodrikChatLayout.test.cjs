'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const page = readFileSync(join(__dirname, '../views/Room.html'), 'utf8');
const css = readFileSync(join(__dirname, '../css/ChatListActions.css'), 'utf8');
const client = readFileSync(join(__dirname, 'RoomClient.js'), 'utf8');

test('narrow conversation header gives Invite, actions, and Close separate grid cells', () => {
    const header = page.split('<!-- CHAT LIST OPTIONS -->')[1].split('<!-- CHAT SEARCH -->')[0];
    assert.match(header, /<div class="chat-action-icon-btns">[\s\S]*?<\/div>\s*<button id="chatHideParticipantsList"/);
    assert.match(css, /\.chat-list-actions\s*\{\s*display: grid;/);
    assert.match(css, /\.chat-action-icon-btns\s*\{[^}]*grid-row: 2;/);
    assert.match(css, /\.chat-list-actions > #chatHideParticipantsList\s*\{[^}]*grid-row: 1;/);
    assert.match(css, /@media screen and \(max-width: 600px\) \{\s*@container chat-panel \(min-width: 420px\)/);
    assert.match(page, /ChatListActions\.css\?v=bodrik-2/);
    assert.match(page, /RoomClient\.js\?v=bodrik-21/);
});

test('conversation list covers the chat header on narrow screens, but not on desktop', () => {
    const method = client
        .split('    toggleShowParticipants(fromUser = false) {')[1]
        .split('    async toggleParticipants() {')[0];
    const displayed = new Map();
    const toggle = new Function(
        'BUTTONS',
        'elemDisplay',
        'window',
        `return ({ toggleShowParticipants(fromUser = false) {${method} }).toggleShowParticipants;`
    )({ main: { chatButton: true } }, (id, visible) => displayed.set(id, visible), { innerWidth: 390 });
    const hidden = new Set(['hidden']);
    const plist = {
        classList: {
            toggle: (name) => (hidden.has(name) ? hidden.delete(name) : hidden.add(name)),
            contains: (name) => hidden.has(name),
        },
        style: {},
    };
    const chat = { id: 'chat', style: {} };
    const room = {
        isMobileDevice: true,
        isChatPinned: false,
        getId: (id) => (id === 'plist' ? plist : chat),
        isPlistOpen: () => !hidden.has('hidden'),
        toggleChatHistorySize: () => {},
        updateChatFooterVisibility: () => {},
    };

    toggle.call(room);
    assert.equal(displayed.get('chat'), false);
    assert.equal(plist.style.width, '100%');
    assert.equal(chat.style.marginLeft, 0);

    toggle.call(room);
    assert.equal(displayed.get('chat'), true);

    room.isMobileDevice = false;
    toggle.call(room);
    assert.equal(displayed.get('chat'), false); // narrow browser viewport
    toggle.call(room);
    room.isChatPinned = false;
    // Desktop retains the side-by-side chat and participant list.
    const desktopToggle = new Function(
        'BUTTONS',
        'elemDisplay',
        'window',
        `return ({ toggleShowParticipants(fromUser = false) {${method} }).toggleShowParticipants;`
    )({ main: { chatButton: true } }, (id, visible) => displayed.set(id, visible), { innerWidth: 1280 });
    desktopToggle.call(room);
    assert.equal(displayed.get('chat'), true);
    assert.equal(chat.style.marginLeft, '300px');
});
