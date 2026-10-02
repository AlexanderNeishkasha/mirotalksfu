'use strict';
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '../..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const room = read('public/views/Room.html');
const client = read('public/js/Room.js');
const assets = read('public/js/BodrikBackgroundAssets.js');
const background = read('public/js/VirtualBackground.js');
const styles = ['public/css/Root.css', 'public/css/Room.css', 'public/css/GroupChat.css'].map(read).join('\n');
const generatedVendor = path.join(root, '.generated/browser-vendor');

test('browser uses native fetch instead of an axios browser global', () => {
    assert.doesNotMatch(room, /axios(?:\.min)?\.js/);
    assert.doesNotMatch(client, /\baxios\./);
    assert.match(client, /fetch\(path, \{ signal: AbortSignal\.timeout\(5000\) \}\)/);
    assert.match(client, /if \(!response\.ok\) throw new Error/);
});

test('room and lazy background runtime contain no third-party CDN URLs', () => {
    for (const [name, source] of Object.entries({ room, assets, background, styles })) {
        assert.doesNotMatch(source, /https?:\/\/(?:cdn|cdnjs|unpkg|fonts|buttons)\./, name);
    }
    assert.match(room, /\.\.\/vendor\/bootstrap\/bootstrap\.bundle\.min\.js/);
    assert.doesNotMatch(`${client}\n${read('public/js/RoomClient.js')}`, /api\.dicebear\.com|gravatar\.com/);
    assert.ok(room.indexOf('../vendor/popper/popper.min.js') < room.indexOf('../vendor/tippy/tippy-bundle.umd.min.js'));
});

test('locked browser vendor builder emits every referenced entry and license notice', () => {
    const references = [
        ...room.matchAll(/(?:src|href)="\.\.\/(vendor\/[^"?#]+)/g),
        ...assets.matchAll(/['"]\/(vendor\/[^'"?]+)/g),
    ].map((match) => match[1]);
    assert.ok(references.length > 10);
    for (const relative of references) {
        assert.ok(existsSync(path.join(generatedVendor, relative.slice('vendor/'.length))), relative);
    }
    for (const license of ['THIRD_PARTY.md', 'Apache-2.0.txt', 'fontawesome.txt', 'ua-parser-js.md']) {
        assert.ok(existsSync(path.join(generatedVendor, 'licenses', license)), license);
    }
    const pkg = JSON.parse(read('package.json'));
    assert.match(pkg.scripts.postinstall, /build:browser-vendor/);
    assert.equal(Object.hasOwn(pkg.devDependencies, 'node-fetch'), false);
});

test('emoji picker receives a same-origin locked dataset instead of its default CDN', () => {
    assert.match(client, /data: getEmojiData/);
    assert.match(client, /fetch\('\/vendor\/emoji-mart\/data-native\.json\?package=1\.2\.1'\)/);
    assert.ok(existsSync(path.join(generatedVendor, 'emoji-mart/data-native.json')));
    assert.doesNotMatch(`${room}\n${client}`, /cdn\.jsdelivr\.net\/npm\/@emoji-mart\/data/);
});

test('Font Awesome stays on the compatible fixed 6.7.2 package', () => {
    const pkg = JSON.parse(read('package.json'));
    assert.equal(pkg.dependencies['@fortawesome/fontawesome-free'], '6.7.2');
    assert.ok(existsSync(path.join(generatedVendor, 'fontawesome/webfonts/fa-solid-900.woff2')));
    assert.match(
        readFileSync(path.join(generatedVendor, 'fontawesome/css/all.min.css'), 'utf8'),
        /fa-solid-900\.woff2\?package=6\.7\.2/
    );
});

test('hidden local theme picker is retired in favor of authoritative Studio palettes', () => {
    const pkg = JSON.parse(read('package.json'));
    assert.equal(Object.hasOwn(pkg.dependencies, '@simonwep/pickr'), false);
    assert.doesNotMatch(`${room}\n${client}`, /Pickr|pickr|tabStyling|selectTheme|themeCustom/);
    assert.match(client, /BodrikTheme\.connect\(publicRoomSlug, applyTheme\)/);
    assert.equal(existsSync(path.join(generatedVendor, 'pickr')), false);
});

test('MediaPipe model/WASM requests stay local and carry their locked package version', () => {
    assert.match(assets, /\/vendor\/mediapipe\/selfie_segmentation\/selfie_segmentation\.js\?package=0\.1\.1675465747/);
    assert.match(background, /\/vendor\/mediapipe\/selfie_segmentation\/\$\{file\}\?package=0\.1\.1675465747/);
    for (const file of [
        'selfie_segmentation.binarypb',
        'selfie_segmentation_landscape.tflite',
        'selfie_segmentation_solution_simd_wasm_bin.wasm',
        'selfie_segmentation_solution_wasm_bin.wasm',
    ]) {
        assert.ok(existsSync(path.join(generatedVendor, 'mediapipe/selfie_segmentation', file)), file);
    }
});
