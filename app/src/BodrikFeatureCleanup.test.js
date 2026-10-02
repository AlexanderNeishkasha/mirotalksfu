'use strict';
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const espree = require('espree');
const { JSDOM } = require('jsdom');
const { ESLint } = require('eslint');

/** Read a fork-owned source file without loading runtime configuration or secrets. */
function read(file) {
    return readFileSync(path.join(__dirname, '../..', file), 'utf8');
}

/** Extract the actual registered socket callback rather than duplicating its behavior. */
function socketHandler(event, context) {
    if (event === 'message') {
        const { room, peer } = context.getRoomAndPeer(context.socket);
        room.id = 'test-room';
        const target = context.testTarget === 'all' ? 'other' : context.testTarget;
        room.peers = new Map([
            [context.socket.id, peer],
            [target, { peer_name: 'Target' }],
        ]);
        room.getPeer = (id) => room.peers.get(id);
        room.send = (...args) => room.sendTo(...args);
        let handler;
        const socket = {
            ...context.socket,
            room_id: room.id,
            on: (name, callback) => {
                if (name === event) handler = callback;
            },
        };
        require('./BodrikRoomChat').registerRoomChat(socket, new Map([[room.id, room]]), context.log);
        return handler;
    }
    const source = read('app/src/Server.js');
    const ast = espree.parse(source, { ecmaVersion: 'latest', range: true });
    let callback;
    /** Find registration by socket event name within the server's startup body. */
    function visit(node) {
        if (!node || typeof node !== 'object') return;
        if (
            node.type === 'CallExpression' &&
            node.callee.object?.name === 'socket' &&
            node.callee.property?.name === 'on' &&
            node.arguments[0]?.value === event
        ) {
            callback = node.arguments[1];
        }
        for (const [key, value] of Object.entries(node)) {
            if (key === 'range') continue;
            if (Array.isArray(value)) value.forEach(visit);
            else if (value && typeof value === 'object') visit(value);
        }
    }
    visit(ast);
    assert.ok(callback, `missing retained event: ${event}`);
    return vm.runInNewContext(`(${source.slice(...callback.range)})`, context);
}

/** Build a browser class without running join, device capture, or network initialization. */
function browser(context = {}) {
    vm.runInNewContext(
        `${read('public/js/RoomClient.js')}; globalThis.Client = RoomClient; globalThis.recordingChunks = recordedBlobs`,
        context
    );
    return context.Client.prototype;
}

for (const [name, patterns] of [
    ['AI chat', /chatGPT|deepSeek|chat_cant_chatgpt|chat_cant_deep_seek/i],
    ['scheduling and mail', /scheduleMeeting|shareRoomByEmail|nodemailer|SCHEDULE_MEETING|EMAIL_ALERTS/],
    [
        'external integrations',
        /require\(['"]\.\/(Discord|Mattermost)|integrations\??\.(slack|discord|mattermost|webhook)|WEBHOOK_|handleJoinWebHook/,
    ],
    ['geolocation', /navigator\.geolocation|GeoLocation|IPLookup|geoLocationButton|geolocationButton/],
    ['server recording', /recSync|recUploadToken|recServerFileName|S3Client|@aws-sdk|handleServerRecordingStop/],
]) {
    test(`retired ${name} has no active room/server/config wiring`, () => {
        for (const file of [
            'app/src/Server.js',
            'app/src/Room.js',
            'app/src/config.template.js',
            'public/js/Room.js',
            'public/js/RoomClient.js',
            'public/js/LocalStorage.js',
            'public/js/Rules.js',
        ]) {
            assert.doesNotMatch(read(file), patterns, file);
        }
    });
}

test('retired pages/assets/packages are removed without removing the ordinary meeting page', () => {
    for (const file of [
        'app/src/Discord.js',
        'app/src/Mattermost.js',
        'app/src/lib/nodemailer.js',
        'app/src/MutexManager.js',
        'app/src/FixDurationOrRemux.js',
        'app/src/FixWebmDurationBuffer.js',
        'public/js/ScheduleMeeting.js',
        'public/css/ScheduleMeeting.css',
        'public/views/scheduleMeeting.html',
        'docker-compose-mailpit.yml',
        'public/images/chatgpt.png',
        'public/images/deepSeek.png',
        'public/images/email.png',
        'public/images/geolocation.png',
        'webhook/server.js',
        'webhook/package.json',
        'webhook/README.md',
        'public/css/Translate.css',
    ]) {
        assert.equal(existsSync(path.join(__dirname, '../..', file)), false, file);
    }
    const pkg = JSON.parse(read('package.json'));
    for (const name of [
        '@aws-sdk/client-s3',
        '@aws-sdk/lib-storage',
        '@mattermost/client',
        'discord.js',
        'async-mutex',
        'ical-generator',
        'nodemailer',
        'openai',
        'qs',
        'sanitize-filename',
        'mime-types',
        'express-openid-connect',
        '@ngrok/ngrok',
        '@sentry/node',
    ]) {
        assert.equal(Object.hasOwn(pkg.dependencies, name), false, name);
    }
    for (const name of ['mediasoup', 'socket.io', 'crypto-js']) {
        assert.ok(pkg.dependencies[name], name);
    }
    assert.ok(read('public/views/Room.html').includes('RoomClient.js'));
    assert.ok(read('app/src/BodrikMusic.js').includes('createPlainTransport'));
});

test('retained server wiring has no unresolved identifiers after feature removal', async () => {
    const globals = Object.fromEntries(
        ['__dirname', 'process', 'console', 'setInterval', 'setTimeout', 'URL', 'structuredClone'].map((name) => [
            name,
            'readonly',
        ])
    );
    const lint = new ESLint({ overrideConfig: { languageOptions: { globals }, rules: { 'no-undef': 'error' } } });
    const [result] = await lint.lintText(read('app/src/Server.js'), { filePath: path.join(__dirname, 'Server.js') });
    assert.deepEqual(result.messages, []);
});

test('room retires local theme controls while keeping retained meeting controls', () => {
    const dom = new JSDOM(read('public/views/Room.html'));
    try {
        const doc = dom.window.document;
        assert.equal(doc.querySelector('script[src*="pickr"], link[href*="pickr"]'), null);
        assert.equal(doc.querySelector('#tabStylingBtn, #tabStyling, #selectTheme, #keepCustomTheme'), null);
        for (const selector of [
            '[id="switchServerRecording"]',
            '[id="chatGPTMessages"]',
            '[id="deepSeekMessages"]',
            '[id="popupGeoLocationPromptTemplate"]',
            'script[src*="flatpickr"]',
        ]) {
            assert.equal(doc.querySelector(selector), null, selector);
        }
        assert.ok(doc.querySelector('#switchHostOnlyRecording'));
        assert.ok(doc.querySelector('script[src*="VirtualBackground.js"]'));
    } finally {
        dom.window.close();
    }
});

for (const [name, target, publiclyBlocked, privatelyBlocked, delivered] of [
    ['public allowed', 'all', false, true, true],
    ['public blocked', 'all', true, false, false],
    ['private allowed', 'peer', true, false, true],
    ['private blocked', 'peer', false, true, false],
    ['assistant-like participant name has private restrictions', 'ChatGPT', false, true, false],
]) {
    test(`ordinary signaling chat: ${name}`, async () => {
        const messages = [];
        const room = {
            getPeer: () => ({ peer_name: 'Human' }),
            _moderator: { chat_cant_publicly: publiclyBlocked, chat_cant_privately: privatelyBlocked },
            broadCast: (...args) => messages.push(args),
            sendTo: (...args) => messages.push(args),
        };
        const handler = socketHandler('message', {
            socket: { id: 'sender' },
            roomExists: () => true,
            checkXSS: (data) => data,
            Validator: { isValidData: () => true },
            getRoomAndPeer: () => ({ room, peer: { peer_name: 'Human' } }),
            testTarget: target,
            log: { warn() {}, debug() {} },
        });
        await handler({ peer_name: 'Human', to_peer_id: target, peer_msg: 'hello' });
        assert.equal(messages.length, delivered ? 1 : 0);
    });
}

for (const [name, target, blocked] of [
    ['public blocked', 'all', true],
    ['private blocked', 'peer', true],
    ['assistant-like private identity blocked', 'DeepSeek', true],
    ['private allowed', 'peer', false],
]) {
    test(`browser incoming chat: ${name}`, () => {
        const messages = [];
        const context = { console: { log() {}, warn() {} } };
        // Class-field handlers need the owning instance; constructor would start real signaling.
        const source = read('public/js/RoomClient.js');
        const ast = espree.parse(source, { ecmaVersion: 'latest', range: true });
        const cls = ast.body.find((node) => node.type === 'ClassDeclaration');
        const field = cls.body.body.find((node) => node.key.name === 'handleMessage');
        const client = {
            _moderator: { chat_cant_publicly: blocked, chat_cant_privately: blocked },
            showMessage: (msg) => messages.push(msg),
        };
        const handler = vm
            .runInNewContext(`(function() { return ${source.slice(...field.value.range)}; })`, context)
            .call(client);
        handler({ to_peer_id: target, peer_name: 'Human' });
        assert.equal(messages.length, blocked ? 0 : 1);
    });
}

for (const [name, presenter] of [
    ['promoted', true],
    ['demoted', false],
]) {
    test(`existing tile moderation menus survive geolocation removal: ${name}`, () => {
        const dom = new JSDOM(
            '<div id="tiles"><div class="Camera" id="consumer__video" data-peer-id="camera-peer"></div><div class="Camera" id="off-peer__videoOff" data-peer-id="off-peer"></div></div>'
        );
        try {
            const calls = [];
            const context = {
                isPresenter: presenter,
                BUTTONS: {
                    consumerVideo: { presenterRoleButton: true, banButton: true, ejectButton: true },
                    videoOff: { presenterRoleButton: true, banButton: true, ejectButton: true },
                },
            };
            const proto = browser(context);
            const client = {
                peer_id: 'self',
                videoMediaContainer: dom.window.document.querySelector('#tiles'),
                peers: new Map(),
                getId: () => ({ querySelector: () => ({ _dropdownContent: {} }) }),
                reconcilePresenterMenuItem: (_menu, id, enabled) => calls.push({ id, enabled }),
            };
            proto.refreshRemoteVideoMenus.call(client);
            assert.equal(calls.length, 6);
            for (const peer of ['camera-peer', 'off-peer']) {
                for (const action of ['role', 'ban', 'kickOut']) {
                    assert.ok(
                        calls.some(
                            (call) => call.id.includes(peer) && call.id.endsWith(action) && call.enabled === presenter
                        )
                    );
                }
            }
        } finally {
            dom.window.close();
        }
    });
}

for (const [event, name, payload, delivered] of [
    ['cmd', 'privacy retained', { type: 'privacy', active: true, broadcast: true }, true],
    ['cmd', 'geolocation retired', { type: 'geoLocation', broadcast: true }, false],
    ['cmd', 'geolocation reply retired', { type: 'geoLocationOK', broadcast: true }, false],
    ['cmd', 'unknown command rejected', { type: 'unknown', broadcast: true }, false],
    ['peerAction', 'moderation retained', { action: 'mute', broadcast: true }, true],
    ['peerAction', 'geolocation action retired', { action: 'geoLocation', broadcast: true }, false],
    ['peerAction', 'unknown action rejected', { action: 'unknown', broadcast: true }, false],
]) {
    test(`server socket boundary: ${name}`, async () => {
        const messages = [];
        const room = { broadCast: (...args) => messages.push(args), sendTo: (...args) => messages.push(args) };
        const handler = socketHandler(event, {
            socket: { id: 'self' },
            roomExists: () => true,
            checkXSS: (data) => data,
            Validator: { isValidData: () => true },
            getRoom: () => room,
            getPeer: () => ({ updatePeerInfo() {} }),
            isPeerPresenter: () => true,
            log: { debug() {} },
        });
        await handler(payload);
        assert.equal(messages.length, delivered ? 1 : 0);
    });
}

test('local recorder buffers final chunks without any server-recording state', () => {
    const context = {};
    const starts = [];
    const proto = browser(context);
    const recorder = { addEventListener() {}, start: (slice) => starts.push(slice) };
    proto.handleMediaRecorder.call({ mediaRecorder: recorder });
    assert.deepEqual(starts, [1000]);
    for (const data of [null, { size: 0 }, { size: 10 }, { size: 2 }]) {
        proto.handleMediaRecorderData({ data });
    }
    assert.deepEqual(
        Array.from(context.recordingChunks, (chunk) => chunk.size),
        [10, 2]
    );
});
