'use strict';
const assert = require('node:assert/strict');
const { mkdtemp, mkdir, writeFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const test = require('node:test');
// Logger loads generated runtime config; isolate only logging so these tests need no secrets/config.js.
const loggerPath = require.resolve('./Logger');
const previousLogger = require.cache[loggerPath];
require.cache[loggerPath] = {
    exports: class {
        info() {}
        debug() {}
        error() {}
    },
};
const AssetVersions = require('./AssetVersions');
const HtmlInjector = require('./HtmlInjector');
if (previousLogger) require.cache[loggerPath] = previousLogger;
else delete require.cache[loggerPath];

/** Provide isolated public files and close watchers before removing their directory. */
async function fixture(t, options = {}) {
    const root = await mkdtemp(path.join(tmpdir(), 'bodrik-assets-'));
    for (const directory of ['js', 'css', 'sfu']) await mkdir(path.join(root, directory));
    await writeFile(path.join(root, 'js/app.js'), 'console.log("first");');
    await writeFile(path.join(root, 'css/app.css'), 'body { color: red; }');
    const versions = new AssetVersions(root, { development: false, ...options });
    const watcherReady = versions.watcher ? once(versions.watcher, 'ready') : Promise.resolve();
    t.after(async () => {
        await versions.close();
        await rm(root, { recursive: true, force: true });
    });
    return { root, versions, watcherReady };
}

for (const [name, url] of [
    ['relative', '../js/app.js'],
    ['absolute', '/css/app.css'],
    ['plain', 'js/app.js'],
]) {
    test(`production versions actual local assets with the pinned SHA: ${name}`, async (t) => {
        const { versions } = await fixture(t, { revision: 'a'.repeat(40) });
        assert.match(await versions.rewrite(`<script src="${url}"></script>`), /\?v=a{40}/);
    });
}

test('external URLs and generated backend scripts remain untouched; queries and fragments survive', async (t) => {
    const { versions } = await fixture(t, { revision: 'b'.repeat(40) });
    const html =
        '<script src="https://cdn.example/js/app.js?v=remote"></script><script src="/js/bodrik-console.js"></script><script src="/socket.io/socket.io.js"></script>';
    assert.equal(await versions.rewrite(html), html);
    const rewritten = await versions.rewrite('<script src="../js/app.js?v=manual&amp;mode=quiet#section"></script>');
    assert.match(rewritten, /v=b{40}&amp;mode=quiet#section/);
    assert.doesNotMatch(rewritten, /manual/);
});

test('hashes are cached and change after invalidation, without changing unrelated asset versions', async (t) => {
    const { root, versions } = await fixture(t);
    const html = '<script src="../js/app.js"></script><link href="../css/app.css" rel="stylesheet">';
    const first = await versions.rewrite(html);
    await writeFile(path.join(root, 'js/app.js'), 'console.log("second");');
    assert.equal(await versions.rewrite(html), first);
    versions.invalidate(path.join(root, 'js/app.js'));
    const next = await versions.rewrite(html);
    assert.notEqual(next, first);
    assert.equal(next.split('<link')[1], first.split('<link')[1]);
});

test(
    'development watcher invalidates hashes after file changes even when a revision is supplied',
    { timeout: 6000 },
    async (t) => {
        const { root, versions, watcherReady } = await fixture(t, { development: true, revision: 'c'.repeat(40) });
        await watcherReady;
        const html = '<script src="../js/app.js"></script>';
        const first = await versions.rewrite(html);
        assert.doesNotMatch(first, /c{40}/);
        const changed = once(versions.watcher, 'change');
        await writeFile(path.join(root, 'js/app.js'), 'console.log("updated");');
        await changed;
        assert.notEqual(await versions.rewrite(html), first);
    }
);

test('traversal is rejected and unreadable known files do not produce default-success versions', async (t) => {
    const { root, versions } = await fixture(t);
    await assert.rejects(versions.rewrite('<script src="../js/../../secret.js"></script>'), /Unsafe local asset path/);
    await versions.ready;
    await rm(path.join(root, 'js/app.js'));
    await assert.rejects(versions.rewrite('<script src="../js/app.js"></script>'), { code: 'ENOENT' });
});

test('HTML asset versions work with branding disabled', async (t) => {
    const { root } = await fixture(t);
    const page = path.join(root, 'page.html');
    await writeFile(page, '<script src="../js/app.js"></script>');
    const injector = new HtmlInjector([page], { htmlInjection: false }, root);
    try {
        let html;
        const response = {
            headersSent: false,
            send: (value) => {
                html = value;
            },
        };
        await injector.injectHtml(page, response);
        assert.match(html, /app\.js\?v=[a-f0-9]{16}/);
    } finally {
        await injector.cleanup();
    }
});
