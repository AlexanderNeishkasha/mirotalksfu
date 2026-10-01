const fs = require('fs');

const chokidar = require('chokidar');

const Logger = require('./Logger');
const AssetVersions = require('./AssetVersions');

const log = new Logger('HtmlInjector');

/** Serve cached branded pages with centrally managed versions for their static assets. */
class HtmlInjector {
    /** Initialize page caching and asset versioning for the server's public directory. */
    constructor(filesPath, config, publicRoot) {
        this.filesPath = filesPath; // Array of file paths to cache
        this.cache = {}; // Object to store cached files
        this.config = config; // Configuration containing metadata (OG, title, etc.)
        this.injectData = this.getInjectData(); // Initialize dynamic injection data
        this.watcher = null; // File watcher instance
        this.assets = new AssetVersions(publicRoot);
        this.preloadPages(filesPath); // Preload pages at startup
        this.watchFiles(filesPath); // Watch files for changes
        log.info('filesPath cached', this.filesPath);
    }

    // Function to get dynamic data for injection (e.g., OG data, title, etc.)
    getInjectData() {
        return {
            OG_TYPE: this.config?.og?.type || 'app-webrtc',
            OG_SITE_NAME: this.config?.og?.siteName || 'MiroTalk SFU',
            OG_TITLE: this.config?.og?.title || 'MiroTalk SFU - Open Source WebRTC Video Conferencing',
            OG_DESCRIPTION:
                this.config?.og?.description ||
                'Build your own Zoom alternative with MiroTalk SFU, an open-source self-hosted WebRTC video conferencing platform powered by Mediasoup. Host scalable meetings, webinars, classrooms, screen sharing and real-time collaboration.',
            OG_IMAGE: this.config?.og?.image || 'https://sfu.mirotalk.com/images/mirotalksfu.png',
            OG_URL: this.config?.og?.url || 'https://sfu.mirotalk.com',
            // Add more data here as needed with fallbacks
        };
    }

    // Function to load a file into the cache
    loadFileToCache(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            this.cache[filePath] = content; // Store the content in cache
        } catch (err) {
            log.error(`Error reading file: ${filePath}`, err);
        }
    }

    // Function to preload pages into the cache
    preloadPages(filePaths) {
        filePaths.forEach((filePath) => this.loadFileToCache(filePath));
    }

    /** Keep cached pages current across native writes and Docker Compose file replacement/sync. */
    watchFiles(filePaths) {
        if (this.watcher) {
            this.watcher.close(); // Close existing watcher if any
        }

        this.watcher = chokidar.watch(filePaths, {
            persistent: true,
            ignoreInitial: true, // Ignore initial 'add' events
            // Docker sync can miss native change events; poll only in local development.
            usePolling: process.env.NODE_ENV === 'development',
            interval: 250,
            // Compose sync writes HTML in chunks; cache only after the write settles.
            awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
        });

        this.watcher
            .on('add', (filePath) => this.loadFileToCache(filePath))
            .on('change', (filePath) => {
                log.debug(`File changed: ${filePath}`);
                this.loadFileToCache(filePath);
                log.debug(`Reloaded file ${filePath} into cache`);
            })
            .on('error', (error) => {
                log.error(`Watcher error: ${error.message}`);
            });
    }

    /** Inject optional branding and automatic JS/CSS versions; return a useful server error on asset I/O failure. */
    async injectHtml(filePath, res) {
        if (!this.cache[filePath]) {
            log.error(`File not cached: ${filePath}`);
            if (!res.headersSent) {
                return res.status(500).send('Server Error');
            }
            return;
        }

        try {
            // Replace placeholders with dynamic data (OG, TITLE, etc.)
            const branded = this.config?.htmlInjection
                ? this.cache[filePath].replace(/{{(OG_[A-Z_]+)}}/g, (_, key) => this.injectData[key] || '')
                : this.cache[filePath];
            const html = await this.assets.rewrite(branded);
            if (!res.headersSent) res.send(html);
        } catch (error) {
            log.error('Error injecting HTML data:', error);
            if (!res.headersSent) {
                res.status(500).send('Server Error');
            }
        }
    }

    /** Release both page and asset watchers when the server shuts down. */
    async cleanup() {
        await Promise.all([this.watcher?.close(), this.assets.close()]);
    }
}

module.exports = HtmlInjector;
