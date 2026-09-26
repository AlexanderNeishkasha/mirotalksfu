'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const root = join(__dirname, '../..');

/** Read the shipped source rather than a generated development bundle. */
function source(path) {
    return readFileSync(join(root, path), 'utf8');
}

test('meeting no longer loads speech recognition or transcription controls', () => {
    const page = source('public/views/Room.html');
    assert.doesNotMatch(
        page,
        /SpeechRec\.js|Transcription\.js|speechRecButton|transcriptionRoom|chatSpeechStartButton/
    );
    assert.match(page, /id="chatMessage"/);
    assert.match(page, /id="chatSendButton"/);
});

test('removed speech globals cannot break chat, layout, or socket recovery', () => {
    for (const path of ['public/js/Room.js', 'public/js/RoomClient.js', 'public/js/VideoGrid.js']) {
        assert.doesNotMatch(source(path), /\b(?:speechRecognition|transcription|startSpeech|stopSpeech)\b/i, path);
    }
});

test('server does not accept Whisper audio or advertise a transcription capability', () => {
    assert.doesNotMatch(source('app/src/Server.js'), /getWhisperTranscription/);
    assert.doesNotMatch(source('app/src/Room.js'), /whisperEnabled/);
    assert.doesNotMatch(source('app/src/config.template.js'), /WHISPER_ENABLED/);
});
