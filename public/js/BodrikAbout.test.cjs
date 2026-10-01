'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

/** Inspect the shipped room rather than a generated image. */
function source(file) {
    return readFileSync(join(__dirname, '..', file), 'utf8');
}

for (const [name, revision, expected] of [
    ['pinned deployment', 'a'.repeat(40), 'a'.repeat(40)],
    ['missing revision', undefined, 'main'],
    ['invalid revision', 'bad" onclick="alert(1)', 'main'],
]) {
    test(`About links to public source: ${name}`, () => {
        let popup;
        let rendered;
        const context = {
            BRAND: { about: { sourceRevision: revision, version: '2.4.71' } },
            swalBackground: '#222',
            sound() {},
            renderRoomTemplate: (id, options) => {
                rendered = { id, ...options };
                return 'rendered';
            },
            Swal: {
                fire: (options) => {
                    popup = options;
                },
            },
        };
        vm.runInNewContext(source('js/BodrikAbout.js'), context);
        context.showAbout();
        assert.equal(rendered.attrs.sourceUrl, `https://github.com/AlexanderNeishkasha/mirotalksfu/tree/${expected}`);
        assert.equal(rendered.text.version, 'MiroTalk SFU · v2.4.71');
        const ru = JSON.parse(source('lang/ru.json'));
        for (const field of ['platformDescription', 'licenseDescription']) {
            assert.ok(ru.dialogs[rendered.text[field]], field);
            assert.equal(rendered.text[field].includes('\n'), false);
        }
        assert.equal(popup.title, 'About the system');
        assert.equal(popup.confirmButtonText, 'Close');
    });
}

test('About has explanatory translated sections and accessible external links', () => {
    const page = source('views/Room.html');
    const about = page.split('<template id="popupAboutTemplate">')[1].split('</template>')[0];
    assert.match(about, /https:\/\/sfu\.mirotalk\.com/);
    assert.match(source('js/BodrikAbout.js'), /AGPL-3\.0/);
    assert.match(about, /data-template-text="licenseDescription"/);
    assert.match(about, /data-template-attr-href="sourceUrl"/);
    assert.equal((about.match(/rel="noopener noreferrer"/g) || []).length, 2);
    const ru = JSON.parse(source('lang/ru.json'));
    for (const key of [
        'About the system',
        'Meeting platform',
        'Learn more about MiroTalk SFU',
        'License and source code',
        'Source code of our version',
    ]) {
        assert.ok(ru.dialogs[key] && ru.dialogs[key] !== key);
    }
    assert.match(page, /MeetingAbout\.css\?v=1/);
});

test('snapshots are retired and recording belongs to Tools', () => {
    const page = source('views/Room.html');
    assert.doesNotMatch(page, /snapshotRoomButton|RECORDING & CAPTURE|Snapshot screen/);
    assert.match(page, /data-buttons="startRecButton,stopRecButton"/);
    for (const file of ['js/Room.js', 'js/RoomClient.js', 'js/Rules.js']) {
        assert.doesNotMatch(source(file), /snapshotRoom|snapShotButton|handleTS|html\.snapshot/);
    }
    assert.match(source('js/RoomClient.js'), /startRecording\(/);
});
