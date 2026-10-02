'use strict';
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '../..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('provider HTTP API exposes only Bodrik join and termination operations', () => {
    const server = read('app/src/Server.js');
    assert.match(server, /app\.post\(restApi\.basePath \+ '\/join'/);
    assert.match(server, /app\.delete\(restApi\.basePath \+ '\/meeting\/:room'/);
    for (const pattern of [
        /app\.get\(restApi\.basePath \+ '\/stats'/,
        /app\.get\(restApi\.basePath \+ '\/meetings'/,
        /app\.post\(restApi\.basePath \+ '\/meeting'/,
        /app\.post\(restApi\.basePath \+ '\/token'/,
        /app\.get\(restApi\.basePath \+ '\/activeRooms'/,
        /swaggerUi|swaggerDocument|\/api\/v1\/docs/,
    ])
        assert.doesNotMatch(server, pattern);
});

test('retired API implementation, Swagger, examples, catalog flags and dependencies are absent', () => {
    assert.equal(existsSync(path.join(root, 'app/api')), false);
    const config = read('app/src/config.template.js');
    assert.doesNotMatch(config, /SHOW_ACTIVE_ROOMS|ACTIVE_ROOMS_RATE_LIMIT|shareRoomQrOnHover|tabNotificationsBtn/);
    const pkg = JSON.parse(read('package.json'));
    assert.equal(Object.hasOwn(pkg.dependencies, 'swagger-ui-express'), false);
    assert.equal(Object.hasOwn(pkg.dependencies, 'js-yaml'), false);
});

test('retained ServerApi no longer exposes generic catalog/statistics/token methods', () => {
    const api = read('app/src/ServerApi.js');
    for (const method of ['getStats', 'getActiveRooms', 'getMeetings', 'getMeetingURL']) {
        assert.doesNotMatch(api, new RegExp(`\\b${method}\\s*\\(`), method);
    }
    for (const method of ['isAuthorized', 'getJoinURL', 'getToken', 'endMeeting']) {
        assert.match(api, new RegExp(`\\b${method}\\s*\\(`), method);
    }
});
