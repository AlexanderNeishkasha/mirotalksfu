'use strict';
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { registerPageRoutes, registerNotFoundRoute, sitePage } = require('./BodrikPageRoutes');

/** Collect registered callbacks with deterministic admission decisions and an inspectable response. */
function harness(overrides = {}) {
    const routes = new Map();
    const actions = [];
    registerPageRoutes(
        { get: (route, callback) => routes.set(route, callback) },
        {
            inviteBaseUrl: 'https://bodrik.test/api/conferences',
            byeUrl: 'https://bodrik.test/bye',
            hostCfg: { protected: true, authenticated: false, users_from_db: false },
            isValidToken: async () => true,
            decodeToken: () => ({ room: 'private-id', username: 'host', password: 'test', presenter: 'false' }),
            isAuthPeer: async () => true,
            isRoomAllowedForUser: async () => true,
            authorizeHost: () => actions.push('authorize'),
            renderRoom: () => actions.push('render'),
            ...overrides,
        }
    );
    const response = {
        code: 200,
        headers: {},
        status(code) {
            this.code = code;
            return this;
        },
        set(name, value) {
            this.headers[name] = value;
            return this;
        },
        send(body) {
            this.body = body;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
        redirect(code, url) {
            this.code = code;
            this.location = url;
            return this;
        },
    };
    return { routes, actions, response };
}

for (const [name, overrides, query, status, rendered, authorized] of [
    ['guest', {}, { room: 'private-id', token: 'opaque-token' }, 200, true, false],
    [
        'presenter',
        { decodeToken: () => ({ room: 'private-id', username: 'host', password: 'test', presenter: 'true' }) },
        { room: 'private-id', token: 'opaque-token' },
        200,
        true,
        true,
    ],
    [
        'wrong room',
        { decodeToken: () => ({ room: 'another-room' }) },
        { room: 'private-id', token: 'opaque-token' },
        401,
        false,
        false,
    ],
    [
        'unbound token',
        { decodeToken: () => ({ username: 'host' }) },
        { room: 'private-id', token: 'opaque-token' },
        401,
        false,
        false,
    ],
    [
        'expired token',
        { isValidToken: async () => false },
        { room: 'private-id', token: 'opaque-token' },
        401,
        false,
        false,
    ],
    [
        'malformed payload',
        {
            decodeToken: () => {
                throw new Error('opaque-token');
            },
        },
        { room: 'private-id', token: 'opaque-token' },
        401,
        false,
        false,
    ],
    [
        'unauthorized identity',
        { isAuthPeer: async () => false },
        { room: 'private-id', token: 'opaque-token' },
        403,
        false,
        false,
    ],
    [
        'presenter without room access',
        { decodeToken: () => ({ room: 'private-id', presenter: 'true' }), isRoomAllowedForUser: async () => false },
        { room: 'private-id', token: 'opaque-token' },
        403,
        false,
        false,
    ],
    ['missing token', {}, { room: 'private-id' }, 401, false, false],
    ['invalid room', {}, { room: '../private-id', token: 'opaque-token' }, 401, false, false],
    ['non-string token', {}, { room: 'private-id', token: ['opaque-token'] }, 401, false, false],
]) {
    test(`Bodrik direct admission without standalone login: ${name}`, async () => {
        const { routes, response, actions } = harness(overrides);
        await routes.get('/join/')({ query, get: () => 'meet.bodrik.test' }, response);
        assert.equal(response.code, status);
        assert.equal(actions.includes('render'), rendered);
        assert.equal(actions.includes('authorize'), authorized);
        assert.equal(response.headers['Cache-Control'], 'no-store');
        assert.ok(!JSON.stringify(response.body || {}).includes('opaque-token'));
    });
}

for (const [name, invitation, location] of [
    ['same-host canonical invitation', 'https://meet.bodrik.test/join/game', '/join/game'],
    ['foreign host', 'https://evil.test/join/game', null],
    ['wrong scheme', 'http://meet.bodrik.test/join/game', null],
    ['wrong path', 'https://meet.bodrik.test/elsewhere/game', null],
    ['nested path', 'https://meet.bodrik.test/join/one/two', null],
    ['malformed URL', 'not a URL', null],
]) {
    test(`expired token invitation recovery: ${name}`, async () => {
        const { routes, response, actions } = harness({ isValidToken: async () => false });
        await routes.get('/join/')(
            { query: { room: 'private-id', token: 'expired', invite: invitation }, get: () => 'meet.bodrik.test' },
            response
        );
        assert.equal(response.location || null, location);
        assert.equal(response.code, location ? 307 : 401);
        assert.deepEqual(actions, []);
    });
}

for (const [route, params] of [
    ['/join/:roomId', { roomId: 'my-game' }],
    ['/room/:slug', { slug: 'my-game' }],
]) {
    test(`canonical invitation exchange retained: ${route}`, () => {
        const { routes, response } = harness();
        routes.get(route)({ params }, response);
        assert.equal(response.code, 307);
        assert.equal(response.location, 'https://bodrik.test/api/conferences/my-game');
        assert.equal(response.headers['Cache-Control'], 'no-store');
    });
}

for (const [name, settings, slug, status] of [
    ['malformed slug', {}, '../bad', 404],
    ['missing exchange URL', { inviteBaseUrl: '' }, 'game', 404],
]) {
    test(`canonical invitation fails closed: ${name}`, () => {
        const { routes, response } = harness(settings);
        routes.get('/room/:slug')({ params: { slug } }, response);
        assert.equal(response.code, status);
    });
}

for (const [base, pathname, expected] of [
    ['https://bodrik.fm/bye?old=1#fragment', '/privacy', 'https://bodrik.fm/privacy'],
    ['http://pc.local:3000/bye', '/404', 'http://pc.local:3000/404'],
    ['', '/privacy', null],
    ['not a URL', '/404', null],
]) {
    test(`retained Bodrik page URL: ${base || 'missing'} → ${pathname}`, () => {
        assert.equal(sitePage(base, pathname), expected);
    });
}

test('privacy redirects to the retained same-site Bodrik privacy page', () => {
    const { routes, response } = harness();
    routes.get('/privacy')({}, response);
    assert.equal(response.code, 302);
    assert.equal(response.location, 'https://bodrik.test/privacy');
});

for (const [name, requestPath, byeUrl, status, location, json] of [
    ['browser route', '/anything', 'https://bodrik.test/bye', 302, 'https://bodrik.test/404', false],
    ['API route', '/api/v1/unknown', 'https://bodrik.test/bye', 404, undefined, true],
    ['API root', '/api', 'https://bodrik.test/bye', 404, undefined, true],
    ['missing destination', '/anything', '', 404, undefined, false],
]) {
    test(`final route fallback: ${name}`, () => {
        let fallback;
        registerNotFoundRoute(
            {
                use: (callback) => {
                    fallback = callback;
                },
            },
            byeUrl
        );
        const { response } = harness();
        fallback({ path: requestPath }, response);
        assert.equal(response.code, status);
        assert.equal(response.location, location);
        assert.equal(Boolean(response.body?.message), json);
    });
}

test('standalone pages redirect to Bodrik or return Gone when no destination is configured', () => {
    for (const byeUrl of ['https://bodrik.test/bye', '']) {
        const { routes } = harness({ byeUrl });
        for (const route of [
            '/',
            '/newroom',
            '/activeRooms',
            '/customizeRoom',
            '/login',
            '/logged',
            '/logout',
            '/whoAreYou/:roomId',
            '/iframe',
            '/views/login.html',
        ]) {
            const { response } = harness();
            routes.get(route)({}, response);
            assert.equal(response.code, byeUrl ? 302 : 410, route);
            if (byeUrl) assert.equal(response.location, byeUrl);
        }
    }
});

test('retired standalone artifacts and unused authentication/monitoring integrations are absent', () => {
    const root = path.join(__dirname, '../..');
    for (const name of ['landing', 'newroom', 'login', 'whoAreYou', 'customizeRoom', 'activeRooms', 'iframe']) {
        assert.equal(existsSync(path.join(root, `public/views/${name}.html`)), false, name);
    }
    for (const file of [
        'public/js/Widget.js',
        'public/js/Iframe.js',
        'public/js/Login.js',
        'public/js/WhoAreYou.js',
        'public/js/ActiveRooms.js',
        'public/js/CustomizeRoom.js',
        'public/js/Common.js',
        'public/js/Utils.js',
        'public/js/Snow.js',
    ]) {
        assert.equal(existsSync(path.join(root, file)), false, file);
    }
    const server = readFileSync(path.join(__dirname, 'Server.js'), 'utf8');
    const config = readFileSync(path.join(__dirname, 'config.template.js'), 'utf8');
    const browser = readFileSync(path.join(root, 'public/js/Room.js'), 'utf8');
    assert.doesNotMatch(
        server,
        /OIDC|ngrok|Sentry|sentry|views\.(landing|login|whoAreYou|newRoom|activeRooms|customizeRoom)/
    );
    assert.doesNotMatch(config, /process\.env\.(OIDC_|NGROK_|SENTRY_)/);
    assert.doesNotMatch(browser, /axios\.get\('\/profile'|force_peer_name/);
    for (const endpoint of ['/meeting/:room', '/join']) {
        assert.ok(server.includes(`restApi.basePath + '${endpoint}'`), endpoint);
    }
    for (const endpoint of ['/stats', '/meetings', '/token', '/activeRooms']) {
        assert.equal(server.includes(`restApi.basePath + '${endpoint}'`), false, endpoint);
    }
    assert.doesNotMatch(server, /app\.post\(restApi\.basePath \+ '\/meeting'/);
    for (const name of ['permission', 'privacy', '404', '50X', 'maintenance']) {
        assert.equal(existsSync(path.join(root, `public/views/${name}.html`)), false, name);
    }
});
