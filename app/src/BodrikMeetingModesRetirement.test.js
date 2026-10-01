'use strict';
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

/** Read active source from the public fork. */
function source(file) {
    return readFileSync(join(__dirname, '../..', file), 'utf8');
}

for (const { name, pattern, events } of [
    {
        name: 'breakout rooms',
        pattern: /breakoutRoom|breakoutPanel|breakoutToolbar|isBreakout/i,
        events: [
            'getBreakoutRoomsInfo',
            'breakoutRoom',
            'breakoutRoomEnd',
            'breakoutRoomHelp',
            'breakoutRoomBroadcast',
            'breakoutRoomCountdown',
        ],
    },
    {
        name: 'broadcasting mode',
        pattern: /isBroadcasting|switchBroadcasting|broadcastingButton|handleRoomBroadcasting|room_broadcasting/,
        events: [],
    },
    {
        name: 'RTMP',
        pattern: /RTMP|Rtmp|\brtmp\b/,
        events: ['getRTMP', 'startRTMP', 'stopRTMP', 'startRTMPfromURL', 'stopRTMPfromURL'],
    },
]) {
    test(`${name} has no active controls, room state, or signaling`, () => {
        for (const file of [
            'public/views/Room.html',
            'public/js/Room.js',
            'public/js/RoomClient.js',
            'public/js/Rules.js',
            'app/src/Server.js',
            'app/src/Room.js',
            'app/src/config.template.js',
        ]) {
            assert.doesNotMatch(source(file), pattern, file);
        }
        for (const event of events) assert.ok(!source('app/src/Server.js').includes(`socket.on('${event}'`), event);
    });
}

test('RTMP routes, streamer modules, and standalone tools are retired', () => {
    const server = source('app/src/Server.js');
    for (const route of ['/rtmp', '/activeStreams', '/initRTMP', '/streamRTMP', '/stopRTMP']) {
        assert.ok(!server.includes(`'${route}'`), route);
    }
    for (const file of [
        'app/src/RtmpStreaming.js',
        'app/src/RtmpStreamer.js',
        'public/js/RtmpStreamer.js',
        'public/views/RtmpStreamer.html',
        'rtmpServers',
    ]) {
        assert.equal(existsSync(join(__dirname, '../..', file)), false, file);
    }
    const scripts = JSON.parse(source('package.json')).scripts;
    assert.ok(Object.keys(scripts).every((name) => !/^(rtmp|nms):/.test(name)));
    assert.match(source('app/src/Room.js'), /require\('\.\/BodrikMusic'\)/);
});

test('ordinary participants can update all local media without a broadcasting gate', () => {
    const context = {};
    vm.runInNewContext(`${source('public/js/RoomClient.js')}; globalThis.Client = RoomClient`, context);
    const client = { peer_info: {}, getPeerAudioBtn: () => null, getPeerAudioVolumeBar: () => null };
    context.Client.prototype.setIsAudio.call(client, 'peer', true);
    context.Client.prototype.setIsVideo.call(client, true);
    context.Client.prototype.setIsScreen.call(client, true);
    assert.equal(client.peer_info.peer_audio, true);
    assert.equal(client.peer_info.peer_video, true);
    assert.equal(client.peer_info.peer_screen, true);
});

test('navigation and remaining controls do not advertise retired modes', () => {
    const page = source('public/views/Room.html');
    assert.doesNotMatch(page, /Share and stream|data-participant-view="livestream"|value="livestream"/);
    assert.match(page, /id="startRecButton"/);
    assert.match(page, /id="startScreenButton"/);
    assert.match(source('public/js/RoomClient.js'), /const msgAvatarTmpId =/);
    assert.match(source('public/js/RoomClient.js'), /const audioColorTmp =/);
    assert.match(source('public/js/BodrikAbout.js'), /title: 'About the system'/);
    assert.equal(JSON.parse(source('public/lang/ru.json')).dialogs['About the system'], 'О программе');
});
