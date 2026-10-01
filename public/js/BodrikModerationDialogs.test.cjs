'use strict';
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const source = readFileSync(join(__dirname, 'RoomClient.js'), 'utf8');
const ru = JSON.parse(readFileSync(join(__dirname, '../lang/ru.json'), 'utf8'));

for (const action of ['ban', 'eject', 'mute', 'unmute', 'hide', 'unhide', 'stop', 'start']) {
    for (const broadcast of [false, true]) {
        test(`moderation dialog is fully localizable and cancellation sends nothing: ${action}, all=${broadcast}`, async () => {
            const popups = [];
            let emitted = 0;
            const context = {
                console: { log() {} },
                swalBackground: '#222',
                Swal: {
                    fire: (popup) => {
                        popups.push(popup);
                        return Promise.resolve({ isConfirmed: false });
                    },
                },
            };
            vm.runInNewContext(`${source}; globalThis.Client = RoomClient`, context);
            context.Client.prototype.confirmPeerAction.call({ socket: { emit: () => emitted++ } }, action, {
                broadcast,
                peer_id: 'test-peer',
            });
            await Promise.resolve();
            await Promise.resolve();
            for (const field of ['title', 'text', 'inputPlaceholder', 'confirmButtonText', 'denyButtonText']) {
                const key = popups[0][field];
                if (key) assert.ok(ru.dialogs[key] && ru.dialogs[key] !== key, `${field}: ${key}`);
            }
            assert.equal(emitted, 0);
        });
    }
}

test('Document PiP is removed while ordinary video PiP remains', () => {
    assert.doesNotMatch(source, /documentPictureInPicture|toggleDocumentPIP|showDocumentPipBtn/);
    assert.match(source, /requestPictureInPicture\(/);
    const page = readFileSync(join(__dirname, '../views/Room.html'), 'utf8');
    assert.doesNotMatch(page, /documentPiPButton|Toggle document PIP/);
    assert.equal(existsSync(join(__dirname, '../css/DocumentPiP.css')), false);
    assert.match(page, /cameraAccessNotice/);
    assert.match(page, /BodrikCameraAccess\.js\?v=3/);
});
