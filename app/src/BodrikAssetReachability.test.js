'use strict';
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '../..');

/** Check explicit local page assets against files included in the public source tree. */
function pageAssets(file) {
    const html = readFileSync(path.join(root, file), 'utf8');
    return [...html.matchAll(/(?:src|href)="(?:\.\.\/)?(css|js|images|svg)\/([^"?#]+)(?:[?#][^"]*)?"/g)].map(
        ([, directory, name]) => `public/${directory}/${name}`
    );
}

test('retained pages reference only present local assets', () => {
    for (const page of ['public/views/Room.html']) {
        for (const asset of pageAssets(page)) assert.ok(existsSync(path.join(root, asset)), `${page}: ${asset}`);
    }
});

test('runtime-configured Bodrik icons and dynamic avatar/sound families remain available', () => {
    for (const asset of [
        'public/svg/emptyChat.svg',
        'public/images/logo.svg',
        'public/images/pricing-illustration.svg',
        'public/images/mirotalksfu.png',
        'public/images/bodrik-favicon-32x32.png',
        'public/images/bodrik-apple-touch-icon.png',
        'public/sounds/alert.wav',
        'public/sounds/ban.wav',
        'public/sounds/eject.wav',
        'public/sounds/speaker.wav',
    ]) {
        assert.ok(existsSync(path.join(root, asset)), asset);
    }
});

for (const asset of [
    'public/images/avatars',
    'public/sponsors',
    'public/advertisers',
    'public/svg/aiAvatars.svg',
    'public/svg/api.svg',
    'public/svg/audioStreaming.svg',
    'public/svg/broadcasting.svg',
    'public/svg/chatgpt.svg',
    'public/svg/collaborativeWhitboard.svg',
    'public/svg/fileSharing.svg',
    'public/svg/maximumSecurity.svg',
    'public/svg/recordingMeeting.svg',
    'public/svg/rtmp.svg',
    'public/svg/screenSharing.svg',
    'public/svg/totalPrivacy.svg',
    'public/svg/virtualBackgrounds.svg',
    'public/svg/webcamChat.svg',
    'public/svg/webcamStreaming.svg',
    'public/images/cta-illustration.svg',
    'public/images/hero-back-illustration.svg',
    'public/images/hero-top-illustration.svg',
    'public/images/maintenance.gif',
    'public/images/mirotalk-mc.png',
    'public/images/architecture.svg',
    'public/images/broadcasting.png',
    'public/images/browsers.png',
    'public/images/docker.png',
    'public/images/iframe.png',
    'public/images/loader.gif',
    'public/images/loading.gif',
    'public/images/mediasoup.png',
    'public/images/mirotalksfu-header.png',
    'public/images/mirotalksfu-qr.png',
    'public/images/ngrok.png',
    'public/images/rtmp.png',
    'public/images/video-share.png',
    'public/sounds/reconnect.wav',
    'public/sounds/ring.wav',
    'public/sounds/roomActive.wav',
    'public/sounds/roomDisactive.wav',
    'public/sounds/transcript.wav',
    'public/views/permission.html',
    'public/css/Permission.css',
    'public/js/BodrikPermission.js',
    'public/views/privacy.html',
    'public/views/404.html',
    'public/views/50X.html',
    'public/views/maintenance.html',
]) {
    test(`retired orphan asset stays absent: ${asset}`, () => {
        assert.equal(existsSync(path.join(root, asset)), false);
    });
}

test('branding contains only meeting/legal metadata and About source information', () => {
    const config = readFileSync(path.join(__dirname, 'config.template.js'), 'utf8');
    const browser = readFileSync(path.join(root, 'public/js/Brand.js'), 'utf8');
    for (const source of [config, browser]) {
        assert.doesNotMatch(source, /topSponsors|pastSponsors|advertisers|supportUs|customizeApp|BRAND\.html/);
        assert.match(source, /sourceRevision/);
        assert.match(source, /appleTouchIcon/);
    }
});
