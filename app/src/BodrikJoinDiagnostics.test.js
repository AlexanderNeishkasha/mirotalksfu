const test = require('node:test');
const assert = require('node:assert/strict');
const { admittedPeer } = require('./BodrikJoinDiagnostics');

test('admission diagnostics include device hints but never credentials or identifiers', () => {
    const details = admittedPeer(
        'private-room',
        {
            peer_name: 'Рина\nspoofed log',
            browser_name: 'Firefox',
            browser_version: '156.0',
            peer_token: 'secret',
            peer_uuid: 'private-tab-identity',
            peer_ip: '192.0.2.1',
        },
        {
            public_room_slug: 'game-room',
            device_model: 'iPad',
            logical_cores_hint: 4,
            ram_gb_hint: 8,
        },
        'Mozilla/5.0\nother-entry'
    );
    assert.equal(details.nickname, 'Рина spoofed log');
    assert.equal(details.browser, 'Firefox');
    assert.equal(details.ram_gb_hint, 8);
    assert.equal(details.room_slug_reported, 'game-room');
    assert.equal(details.user_agent, 'Mozilla/5.0 other-entry');
    assert.doesNotMatch(JSON.stringify(details), /secret|private-tab-identity|192\.0\.2\.1/);
});

test('unavailable browser hints stay absent and implausible values are rejected', () => {
    const details = admittedPeer('room', { peer_name: 'Guest' }, { ram_gb_hint: 999999, logical_cores_hint: '16' });
    assert.equal(details.ram_gb_hint, undefined);
    assert.equal(details.logical_cores_hint, undefined);
    assert.equal(details.device_model, undefined);
});
