'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

/** Read the actual browser implementation without loading the room or capturing devices. */
function read(name) {
    return readFileSync(path.join(__dirname, name), 'utf8');
}

/** Exercise actual audio-only tile construction with unrelated media handlers isolated. */
function tile(mobile, remote, actions) {
    const dom = new JSDOM('<body><div id="tiles"></div></body>');
    const doc = dom.window.document;
    const context = {
        window: dom.window,
        document: doc,
        console: { log() {} },
        BUTTONS: { videoOff: actions },
        isParticipantsListOpen: false,
        handleAspectRatio() {},
    };
    vm.createContext(context);
    vm.runInContext(read('BodrikVideoDropdown.js'), context);
    vm.runInContext(`${read('RoomClient.js')}; globalThis.Client = RoomClient`, context);
    const client = Object.create(context.Client.prototype);
    Object.assign(client, {
        isMobileDevice: mobile,
        peer_id: 'self',
        _isRecording: false,
        videoMediaContainer: doc.querySelector('#tiles'),
        attached: 0,
        getId: (id) => doc.getElementById(id),
        createButton: (id) => {
            const button = doc.createElement('button');
            button.id = id;
            return button;
        },
        createElement: (id, tag, classes) => {
            const element = doc.createElement(tag);
            element.id = id;
            element.className = classes;
            return element;
        },
        setPeerNameWithPresenter: (element, _role, name) => {
            element.textContent = name;
        },
        meSuffix: () => ' (you)',
        handleDropdownEvents() {
            this.attached++;
        },
    });
    for (const name of [
        'removeVideoOff',
        'handleAU',
        'handleCV',
        'handleSM',
        'handleSF',
        'handleBAN',
        'handleKO',
        'handleHFG',
        'handleRole',
        'handleVB',
        'handleDD',
        'handlePN',
        'popupPeerInfo',
        'checkPeerInfoStatus',
        'setVideoAvatarImgName',
        'setPeerAudio',
        'setIsAudio',
        'setTippy',
    ])
        client[name] = () => {};
    const peer = remote ? 'other' : 'self';
    client.setVideoOff({ peer_id: peer, peer_name: peer, peer_audio: true }, remote);
    return { dom, doc, client, peer };
}

for (const [name, mobile, remote, actions, expected] of [
    ['own mobile tile without camera', true, false, { pinVideoButton: true, audioVolumeInput: true }, false],
    ['own desktop tile retains pin', false, false, { pinVideoButton: true }, true],
    [
        'other mobile participant retains volume menu',
        true,
        true,
        { pinVideoButton: true, audioVolumeInput: true },
        true,
    ],
    ['no configured actions on desktop', false, false, {}, false],
    ['no configured actions for other mobile participant', true, true, {}, false],
]) {
    test(`camera-off participant menu: ${name}`, () => {
        const { dom, doc, client, peer } = tile(mobile, remote, actions);
        try {
            const button = doc.getElementById(`${peer}_video_off_expandBtn`);
            assert.equal(Boolean(button && button.parentElement.style.display !== 'none'), expected);
            assert.equal(doc.querySelectorAll('.navbar-dropdown-content').length, expected || remote ? 1 : 0);
            assert.equal(client.attached, expected || remote ? 1 : 0);
            assert.ok(doc.getElementById(`${peer}__videoOff`), 'the participant tile must remain visible');
            if (!remote) assert.ok(doc.getElementById(`${peer}__sessionTime`), 'ordinary tile controls remain');
            if (expected) {
                const content = doc.querySelector('.navbar-dropdown-content');
                assert.ok(content.childElementCount > 0);
                assert.match(content.textContent, remote ? /Volume/ : /Pin/);
            }
        } finally {
            dom.window.close();
        }
    });
}

test('an empty remote shell can gain and lose moderation actions after a role change', () => {
    const { dom, doc, client } = tile(true, true, {});
    try {
        const content = doc.querySelector('.navbar-dropdown-content');
        const container = content._dropdownContainer;
        assert.equal(container.style.display, 'none');
        client.reconcilePresenterMenuItem(content, 'role-action', true, () => {
            content.appendChild(client.createDropdownItem(client.createButton('role-action'), 'Set as presenter'));
        });
        assert.equal(container.style.display, '');
        content.classList.add('show');
        client.reconcilePresenterMenuItem(content, 'role-action', false, () => {});
        assert.equal(container.style.display, 'none');
        assert.equal(content.classList.contains('show'), false);
    } finally {
        dom.window.close();
    }
});

test('all camera/screen and camera-off tile builders use the same empty-menu admission', () => {
    const client = read('RoomClient.js');
    assert.equal((client.match(/BodrikVideoDropdown\.attach\(/g) || []).length, 3);
    const page = readFileSync(path.join(__dirname, '../views/Room.html'), 'utf8');
    assert.ok(page.indexOf('BodrikVideoDropdown.js') < page.indexOf('RoomClient.js'));
});
