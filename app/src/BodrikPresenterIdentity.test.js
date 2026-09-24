const assert = require('node:assert/strict');
const test = require('node:test');
const { isNamedPresenter } = require('./BodrikPresenterIdentity');

test('an editable nickname never grants presenter rights to token-admitted guests', () => {
    assert.equal(
        isNamedPresenter({ bodrikTokenAuthenticated: true, peer_info: { peer_name: 'Host' } }, ['Host']),
        false
    );
    assert.equal(
        isNamedPresenter({ bodrikTokenAuthenticated: true, peer_info: { peer_name: 'Guest' } }, ['Host']),
        false
    );
});

test('legacy non-token peers still use explicitly configured presenter names', () => {
    assert.equal(isNamedPresenter({ peer_info: { peer_name: 'Host' } }, ['Host']), true);
    assert.equal(isNamedPresenter({ peer_info: { peer_name: 'Guest' } }, ['Host']), false);
    assert.equal(isNamedPresenter(null, ['Host']), false);
});
