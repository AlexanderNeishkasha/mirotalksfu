'use strict';

const { createHash } = require('node:crypto');
const { readFile, readdir } = require('node:fs/promises');
const path = require('node:path');
const chokidar = require('chokidar');
const Logger = require('./Logger');
const log = new Logger('AssetVersions');

/** Add automatic cache-busting to public JS/CSS, using a deployed revision or cached content hashes. */
class AssetVersions {
    /** Use an immutable production SHA; development hashes are invalidated when synchronized assets change. */
    constructor(
        publicRoot,
        {
            development = process.env.NODE_ENV === 'development',
            revision = process.env.MIROTALK_SOURCE_REVISION || '',
        } = {}
    ) {
        this.publicRoot = path.resolve(publicRoot);
        this.revision = !development && /^[a-f0-9]{40}$/i.test(revision) ? revision.toLowerCase() : null;
        this.hashes = new Map();
        this.files = new Set();
        const directories = ['js', 'css', 'sfu'].map((directory) => path.join(this.publicRoot, directory));
        this.ready = Promise.all(directories.map((directory) => this.indexFiles(directory)));
        this.ready.catch((error) => log.error('Asset indexing failed', error));
        this.watcher = null;
        if (development) {
            this.watcher = chokidar.watch(directories, {
                // Initial add events also include files created while directory indexing is in flight.
                ignoreInitial: false,
                usePolling: true,
                interval: 250,
                awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
            });
            for (const event of ['add', 'change', 'unlink']) {
                this.watcher.on(event, (file) => {
                    const absolute = path.resolve(file);
                    if (event === 'unlink') this.files.delete(absolute);
                    else if (/\.(?:js|css)$/i.test(file)) this.files.add(absolute);
                    this.invalidate(file);
                });
            }
            this.watcher.on('error', (error) => log.error('Asset watcher failed', error));
        }
    }

    /** Index actual public files so generated routes, such as the environment-specific console script, stay untouched. */
    async indexFiles(directory) {
        const entries = await readdir(directory, { withFileTypes: true });
        await Promise.all(
            entries.map(async (entry) => {
                const file = path.join(directory, entry.name);
                if (entry.isDirectory()) await this.indexFiles(file);
                else if (entry.isFile() && /\.(?:js|css)$/i.test(entry.name)) this.files.add(file);
            })
        );
    }

    /** Resolve only known static asset namespaces; never read CDN, generated routes or paths outside public/. */
    assetFile(url) {
        const match = url.match(/^(?:\.\.?\/|\/)?((?:js|css|sfu)\/[^?#]+\.(?:js|css))(?:[?#]|$)/i);
        if (!match) return null;
        const relative = decodeURIComponent(match[1]);
        if (relative.includes('\\') || relative.split('/').includes('..')) throw new Error('Unsafe local asset path');
        const file = path.resolve(this.publicRoot, relative);
        if (!file.startsWith(this.publicRoot + path.sep)) throw new Error('Asset path escapes public directory');
        return this.files.has(file) ? file : null;
    }

    /** Forget cached content after a file event; a stale pending read cannot replace a newer entry. */
    invalidate(file) {
        this.hashes.delete(path.resolve(file));
    }

    /** Read an asset at most once between invalidations; propagate missing/unreadable files rather than hiding them. */
    version(file) {
        if (this.revision) return Promise.resolve(this.revision);
        if (!this.hashes.has(file)) {
            const pending = readFile(file).then((contents) =>
                createHash('sha256').update(contents).digest('hex').slice(0, 16)
            );
            this.hashes.set(file, pending);
            pending.catch(() => {
                if (this.hashes.get(file) === pending) this.hashes.delete(file);
            });
        }
        return this.hashes.get(file);
    }

    /** Rewrite quoted local script/stylesheet URLs while retaining other query parameters, fragments and external URLs. */
    async rewrite(html) {
        await this.ready;
        const pattern = /(<(?:script|link)\b[^>]*?\b(?:src|href)\s*=\s*)(["'])([^"']+)\2/gi;
        const matches = Array.from(html.matchAll(pattern));
        const replacements = await Promise.all(
            matches.map(async (match) => {
                const raw = match[3];
                const file = this.assetFile(raw);
                if (!file) return match[0];
                const version = await this.version(file);
                const url = raw.replace(/&amp;/g, '&');
                const fragmentIndex = url.indexOf('#');
                const fragment = fragmentIndex >= 0 ? url.slice(fragmentIndex) : '';
                const base = fragmentIndex >= 0 ? url.slice(0, fragmentIndex) : url;
                const queryIndex = base.indexOf('?');
                const pathname = queryIndex >= 0 ? base.slice(0, queryIndex) : base;
                const query = new URLSearchParams(queryIndex >= 0 ? base.slice(queryIndex + 1) : '');
                query.set('v', version);
                const next = `${pathname}?${query.toString().replace(/&/g, '&amp;')}${fragment}`;
                return `${match[1]}${match[2]}${next}${match[2]}`;
            })
        );
        let result = html;
        for (let index = matches.length - 1; index >= 0; index--) {
            const match = matches[index];
            result = result.slice(0, match.index) + replacements[index] + result.slice(match.index + match[0].length);
        }
        return result;
    }

    /** Close the development watcher and discard cached hashes during server shutdown. */
    async close() {
        await this.watcher?.close();
        this.hashes.clear();
    }
}

module.exports = AssetVersions;
