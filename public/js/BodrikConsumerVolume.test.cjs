'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

/** Load the active button policy without running moderator or meeting initialization. */
function policy() {
    return vm.runInNewContext(readFileSync(join(__dirname, 'Rules.js'), 'utf8') + '\nBUTTONS;');
}

for (const tile of ['consumerVideo', 'videoOff']) {
    test(`listener volume is enabled for ${tile}`, () => {
        assert.equal(policy()[tile].audioVolumeInput, true);
    });
}

test('remote camera/screen builders expose the enabled slider in the toolbar and dropdown', () => {
    const source = readFileSync(join(__dirname, 'RoomClient.js'), 'utf8');
    assert.match(
        source,
        /BUTTONS\.consumerVideo\.audioVolumeInput &&\s*eVc\.appendChild\(this\.createResponsiveDropdownRangeItem\(pv, 'Volume'/
    );
    assert.match(source, /BUTTONS\.consumerVideo\.audioVolumeInput && vb\.appendChild\(pv\)/);
});
