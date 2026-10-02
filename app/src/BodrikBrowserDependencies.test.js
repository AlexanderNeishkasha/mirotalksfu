'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '../..');
const room = readFileSync(path.join(root, 'public/views/Room.html'), 'utf8');
const client = readFileSync(path.join(root, 'public/js/Room.js'), 'utf8');
const assets = readFileSync(path.join(root, 'public/js/BodrikBackgroundAssets.js'), 'utf8');
const background = readFileSync(path.join(root, 'public/js/VirtualBackground.js'), 'utf8');

test('browser uses native fetch instead of a racing axios CDN global', () => {
    assert.doesNotMatch(room, /axios(?:\.min)?\.js/);
    assert.doesNotMatch(client, /\baxios\./);
    assert.match(client, /fetch\(path, \{ signal: AbortSignal\.timeout\(5000\) \}\)/);
    assert.match(client, /if \(!response\.ok\) throw new Error/);
});

test('explicit Popper is absent because retained bundles already provide it', () => {
    assert.doesNotMatch(room, /popper(?:\.min)?\.js/);
    assert.match(room, /bootstrap\.bundle\.min\.js/);
    assert.match(room, /tippy-bundle\.umd\.min\.js/);
});

test('every npm-style CDN dependency is version-pinned during the migration to local hosting', () => {
    const sources = [room, assets, background].join('\n');
    for (const match of sources.matchAll(/https:\/\/cdn\.jsdelivr\.net\/npm\/([^'"`]+)/g)) {
        const segments = match[1].split('/');
        const packageSegment = segments[0].startsWith('@') ? segments[1] : segments[0];
        assert.match(packageSegment, /@\d/, match[0]);
    }
    assert.doesNotMatch(sources, /@latest/);
});
