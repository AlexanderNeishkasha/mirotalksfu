'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

/** Read active menu sources and translations from the public fork. */
function source(file) {
    return readFileSync(join(__dirname, '..', file), 'utf8');
}

for (const label of [
    'Test Speaker',
    'Open Audio Settings',
    'Open Video Settings',
    'Grid',
    'Speaker top',
    'Speaker bottom',
    'Speaker left',
    'Speaker right',
    'Speaker 1:1',
    'Push to talk',
    'Open Virtual Background',
    'No cameras found',
    'No microphones found',
    'No speakers found',
    'Speaker selection not supported',
]) {
    test(`device/view menu has a Russian translation: ${label}`, () => {
        const ru = JSON.parse(source('lang/ru.json'));
        for (const ns of ['buttons', 'labels']) assert.ok(ru[ns][label] && ru[ns][label] !== label);
    });
}

for (const [label, translated] of [
    ['Pin Video', 'Закрепить видео'],
    ['Focus Mode', 'Режим фокусировки'],
    ['Full Screen', 'Полный экран'],
]) {
    test(`camera and screen dropdown label is localized: ${label}`, () => {
        const ru = JSON.parse(source('lang/ru.json'));
        const en = JSON.parse(source('lang/en.json'));
        assert.equal(ru.labels[label], translated);
        assert.equal(en.labels[label], label);
        assert.ok(source('js/RoomClient.js').includes(`'${label}'`));
    });
}

test('participant-view tooltip uses the requested wording', () => {
    assert.equal(
        JSON.parse(source('lang/ru.json')).tooltips['Change participant view'],
        'Изменить отображение участников'
    );
});

for (const allowed of [true, false]) {
    test(`video-off admission does not hide camera controls before enumeration; allowed=${allowed}`, async () => {
        const hidden = [];
        const events = [];
        const context = {
            console: { log() {} },
            isEnumerateAudioDevices: false,
            isEnumerateVideoDevices: false,
            BUTTONS: { main: { startVideoButton: allowed } },
            startAudioButton: 'audio-start',
            stopAudioButton: 'audio-stop',
            startAudioDeviceDropdown: 'audio-menu',
            startVideoButton: 'video-start',
            stopVideoButton: 'video-stop',
            startVideoDeviceDropdown: 'video-menu',
            hide: (element) => hidden.push(element),
            setColor() {},
        };
        vm.runInNewContext(`${source('js/RoomClient.js')}; globalThis.Client = RoomClient`, context);
        const client = {
            isAudioAllowed: false,
            isVideoAllowed: false,
            _moderator: {},
            peer_info: {},
            producerExist: () => false,
            setVideoOff() {},
            sendVideoOff() {},
            updatePeerInfo() {},
            event: (event) => events.push(event),
        };
        await context.Client.prototype.startLocalMedia.call(client);
        assert.ok(hidden.every((element) => !element.startsWith('video-')));
        assert.equal(events.includes(context.Client.EVENTS.stopVideo), allowed);
    });
}

test('Video AI controls, SDK, config, and service handlers are retired without removing the camera', () => {
    const page = source('views/Room.html');
    assert.doesNotMatch(page, /tabVideoAI|avatarVideoAI|livekit-client/);
    assert.match(page, /id="startVideoButton"/);
    for (const file of ['js/Room.js', 'js/RoomClient.js', 'js/Rules.js'])
        assert.doesNotMatch(source(file), /VideoAI|videoAI|liveKit|LiveAvatar|avatarQuality/);
    const server = readFileSync(join(__dirname, '../../app/src/Server.js'), 'utf8');
    for (const event of [
        'getAvatarList',
        'getVoiceList',
        'previewVoice',
        'createSessionToken',
        'startSession',
        'stopSession',
        'talkToOpenAI',
    ])
        assert.ok(!server.includes(`socket.on('${event}'`), event);
});
