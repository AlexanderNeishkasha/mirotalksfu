'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const espree = require('espree');

const source = readFileSync(path.join(__dirname, 'Room.js'), 'utf8');

/** Extract the actual prejoin gate without initializing sockets, devices, or the room DOM. */
function initRoomFunction() {
    const ast = espree.parse(source, { ecmaVersion: 'latest', range: true });
    const fn = ast.body.find((node) => node.type === 'FunctionDeclaration' && node.id.name === 'initRoom');
    return source.slice(...fn.range);
}

test('participants without camera and microphone still reach prejoin and device selectors', async () => {
    const calls = [];
    const context = {
        setButtonsInit: () => calls.push('buttons'),
        handleSelectsInit: () => calls.push('selects'),
        handleUsernameEmojiPicker: () => calls.push('name'),
        whoAreYou: async () => calls.push('prejoin'),
        setSelectsInit: async () => calls.push('devices'),
        isAudioAllowed: false,
        isVideoAllowed: false,
    };
    vm.runInNewContext(`${initRoomFunction()}; globalThis.run = initRoom`, context);
    await context.run();
    assert.deepEqual(calls, ['buttons', 'selects', 'name', 'prejoin', 'devices']);
});

test('listener admission has no obsolete permission redirect or mandatory-device flag', () => {
    assert.doesNotMatch(source, /joinRoomWithoutAudioVideo|openURL\(`\/permission|Not allowed both Audio and Video/);
});
