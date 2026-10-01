'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

/** Inspect the shipped fork rather than a generated image. */
function source(file) {
    return readFileSync(join(__dirname, '../..', file), 'utf8');
}

for (const { name, controls, events } of [
    {
        name: 'whiteboard',
        controls: /whiteboardButton|id="whiteboard"|wbCanvas/,
        events: ['wbCanvasToJson', 'whiteboardObject', 'whiteboardPointer', 'whiteboardAction'],
    },
    {
        name: 'editor',
        controls: /editorButton|id="editorRoom"|quill@/,
        events: ['editorChange', 'editorActions', 'editorUpdate'],
    },
    {
        name: 'polls',
        controls: /pollButton|id="pollRoom"|switchEveryoneCantPolls/,
        events: ['createPoll', 'vote', 'updatePoll', 'editPoll', 'deletePoll'],
    },
    { name: 'room reactions', controls: /emojiRoomButton|id="userEmoji"|id="emojiPickerContainer"/, events: [] },
]) {
    test(`${name} no longer has controls or signaling subscriptions`, () => {
        assert.doesNotMatch(source('public/views/Room.html'), controls);
        for (const event of events) {
            assert.ok(!source('app/src/Server.js').includes(`socket.on('${event}'`), event);
            assert.ok(!source('public/js/RoomClient.js').includes(`socket.on('${event}'`), event);
        }
    });
}

test('retired features cannot initialize or leave dangling client globals', () => {
    for (const file of ['public/js/Room.js', 'public/js/RoomClient.js', 'public/js/Rules.js']) {
        assert.doesNotMatch(
            source(file),
            /\b(?:quill|wbCanvas|setupWhiteboard|handleEditor|togglePoll|handleRoomEmoji|polls_cant_create)\b/i,
            file
        );
    }
    const page = source('public/views/Room.html');
    assert.doesNotMatch(page, /quill@|pdfjs-dist|Editor\.css|Polls\.css/);
    for (const id of ['chatMessage', 'chatSendButton', 'chatEmoji', 'mySettings', 'videoMediaContainer']) {
        assert.ok(page.includes(`id="${id}"`), id);
    }
    assert.match(page, /emoji-mart/);
    assert.doesNotMatch(page, /fabric@|VideoDrawing\.js/);
    assert.match(source('public/js/RoomClient.js'), /sendChatReaction\(/);
});

test('video drawing no longer exposes controls, globals, or signaling', () => {
    assert.doesNotMatch(source('public/js/VideoGrid.js'), /VideoDrawingOverlay/);
    for (const file of [
        'public/js/RoomClient.js',
        'public/js/Rules.js',
        'app/src/Server.js',
        'app/src/config.template.js',
    ]) {
        assert.doesNotMatch(source(file), /VideoDrawing|videoDrawing|drawingButton|handleDW|SHOW_DRAWING_BUTTON/, file);
    }
    assert.doesNotMatch(source('public/css/VideoGrid.css'), /video-drawing/);
    assert.match(source('public/js/RoomClient.js'), /handleFS\(/);
    assert.match(source('public/js/RoomClient.js'), /handleVP\(/);
});

test('stale room reactions are not relayed, while privacy commands still work', async () => {
    const server = source('app/src/Server.js');
    const registration = server.slice(server.indexOf("socket.on('cmd',"), server.indexOf("socket.on('roomAction',"));
    let handler;
    let relays = 0;
    let updates = 0;
    const room = { broadCast: () => relays++, sendTo: () => relays++ };
    vm.runInNewContext(registration, {
        socket: {
            id: 'peer',
            on: (_, callback) => {
                handler = callback;
            },
        },
        roomExists: () => true,
        checkXSS: (data) => data,
        log: { debug() {} },
        Validator: { isValidData: () => true },
        getRoom: () => room,
        getPeer: () => ({ updatePeerInfo: () => updates++ }),
    });
    await handler({ type: 'roomEmoji', broadcast: true });
    assert.equal(relays, 0);
    await handler({ type: 'privacy', active: true, broadcast: true });
    assert.equal(updates, 1);
    assert.equal(relays, 1);
});

test('remaining pinned panels retain their original widths', () => {
    const context = {};
    vm.runInNewContext(`${source('public/js/RoomClient.js')}; globalThis.Client = RoomClient`, context);
    const width = context.Client.prototype.getPinnedSidePanelWidth;
    for (const [state, expected] of [
        [{}, 0],
        [{ isChatPinned: true }, 25],
        [{ isBreakoutPinned: true }, 0],
    ]) {
        assert.equal(width.call(state), expected);
    }
});
