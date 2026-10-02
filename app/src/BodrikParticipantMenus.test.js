'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

/** Read active client/server source and maintained dictionaries. */
function source(file) {
    return readFileSync(join(__dirname, '../..', file), 'utf8');
}

for (const label of [
    'Set as presenter',
    'Remove presenter role',
    'Pin video',
    'Unpin video',
    'Hide from grid',
    'Show in grid',
    'Toggle audio',
    'Toggle video',
    'Toggle screen',
    'Share file',
    'Share file to all',
    'Ban participant',
    'Eject participant',
    'Eject all participants',
    'Mute all participants',
    'Hide all participants',
    'Stop all screens sharing',
]) {
    test(`participant action has a Russian button translation: ${label}`, () => {
        const ru = JSON.parse(source('public/lang/ru.json'));
        const en = JSON.parse(source('public/lang/en.json'));
        assert.equal(en.buttons[label], label);
        assert.ok(ru.buttons[label] && ru.buttons[label] !== label);
    });
}

test('participant menu section headings and eject wording are localized', () => {
    const ru = JSON.parse(source('public/lang/ru.json'));
    for (const label of ['Role', 'View', 'Moderation', 'Share', 'Danger zone']) {
        assert.ok(ru.labels[label] && ru.labels[label] !== label);
    }
    assert.equal(ru.tooltips.Eject, 'Выгнать');
    assert.equal(ru.labels['Kick Out'], 'Выгнать');
    assert.equal(ru.dialogs.Eject, 'Выгнать');
});

test('URL media sharing is retired end to end, without retiring screen sharing or file transfer', () => {
    for (const file of [
        'public/js/Room.js',
        'public/js/RoomClient.js',
        'public/js/Rules.js',
        'app/src/Server.js',
        'app/src/Room.js',
        'app/src/config.template.js',
        'public/views/Room.html',
    ]) {
        assert.doesNotMatch(
            source(file),
            /shareVideo|shareMediaData|tabVideoShare|sendVideoButton|handleSV|media_cant_sharing/,
            file
        );
    }
    const client = source('public/js/RoomClient.js');
    assert.match(client, /selectFileToShare\(/);
    assert.match(client, /sendVideoOff\(/);
    assert.match(client, /this\._moderator = \{/);
    assert.match(source('app/src/Room.js'), /module\.exports = class Room/);
    assert.match(source('app/src/config.template.js'), /module\.exports/);
    assert.match(source('public/views/Room.html'), /id="startScreenButton"/);
    const context = {};
    vm.runInNewContext(`${client}; globalThis.Client = RoomClient`, context);
    // Chat embeds still depend on these shared URL helpers.
    assert.equal(context.Client.prototype.getVideoType('https://example.com/video.mp4'), 'video/mp4');
    assert.equal(typeof context.Client.prototype.getYoutubeEmbed, 'function');
});
