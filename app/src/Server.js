'use strict';

/*
███████ ███████ ██████  ██    ██ ███████ ██████  
██      ██      ██   ██ ██    ██ ██      ██   ██ 
███████ █████   ██████  ██    ██ █████   ██████  
     ██ ██      ██   ██  ██  ██  ██      ██   ██ 
███████ ███████ ██   ██   ████   ███████ ██   ██                                           

prod dependencies: {
    axios                   : https://www.npmjs.com/package/axios
    chokidar                : https://www.npmjs.com/package/chokidar
    colors                  : https://www.npmjs.com/package/colors
    compression             : https://www.npmjs.com/package/compression
    cors                    : https://www.npmjs.com/package/cors
    crypto-js               : https://www.npmjs.com/package/crypto-js
    dompurify               : https://www.npmjs.com/package/dompurify
    express                 : https://www.npmjs.com/package/express
    he                      : https://www.npmjs.com/package/he
    helmet                  : https://www.npmjs.com/package/helmet
    httpolyglot             : https://www.npmjs.com/package/httpolyglot
    jsdom                   : https://www.npmjs.com/package/jsdom
    jsonwebtoken            : https://www.npmjs.com/package/jsonwebtoken
    mediasoup               : https://www.npmjs.com/package/mediasoup
    mediasoup-client        : https://www.npmjs.com/package/mediasoup-client
    socket.io               : https://www.npmjs.com/package/socket.io
    uuid                    : https://www.npmjs.com/package/uuid
}

dev dependencies: {
    @babel/core             : https://www.npmjs.com/package/@babel/core
    @babel/preset-env       : https://www.npmjs.com/package/@babel/preset-env
    babel-loader            : https://www.npmjs.com/package/babel-loader
    mocha                   : https://www.npmjs.com/package/mocha
    node-fetch              : https://www.npmjs.com/package/node-fetch
    nodemon                 : https://www.npmjs.com/package/nodemon
    prettier                : https://www.npmjs.com/package/prettier
    proxyquire              : https://www.npmjs.com/package/proxyquire
    should                  : https://www.npmjs.com/package/should
    sinon                   : https://www.npmjs.com/package/sinon
    webpack                 : https://www.npmjs.com/package/webpack
    webpack-cli             : https://www.npmjs.com/package/webpack-cli
}
*/

/**
 * MiroTalk SFU - Server component
 *
 * @link    GitHub: https://github.com/miroslavpejic85/mirotalksfu
 * @link    Official Live demo: https://sfu.mirotalk.com
 * @license For open source use: AGPLv3
 * @license For commercial or closed source, contact us at license.mirotalk@gmail.com or purchase directly via CodeCanyon
 * @license CodeCanyon: https://codecanyon.net/item/mirotalk-sfu-webrtc-realtime-video-conferences/40769970
 * @author  Miroslav Pejic - miroslav.pejic.85@gmail.com
 * @version 2.4.71
 *
 */

const express = require('express');

const { admittedPeer } = require('./BodrikJoinDiagnostics');
const { registerPageRoutes, registerNotFoundRoute } = require('./BodrikPageRoutes');
const { registerRoomChat } = require('./BodrikRoomChat');
const { DiagnosticStore, registerClientDiagnostics } = require('./ClientDiagnostics');

const cors = require('cors');
const compression = require('compression');
const socketIo = require('socket.io');
const httpolyglot = require('httpolyglot');
const mediasoup = require('mediasoup');
const mediasoupClient = require('mediasoup-client');
const http = require('http');
const path = require('path');
const axios = require('axios');

const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const fs = require('fs');

const helmet = require('helmet');
const config = require('./config');
const checkXSS = require('./XSS');

const Host = require('./Host');
const Room = require('./Room');
const Peer = require('./Peer');
const { assignFallbackPresenter } = require('./PresenterManager');
const ServerApi = require('./ServerApi');
const Logger = require('./Logger');
const Validator = require('./Validator');
const { bindRejoinSecret, findDisconnectedRejoinPeers } = require('./BodrikRejoin');
const { isNamedPresenter } = require('./BodrikPresenterIdentity');
const { startRecoveryHeartbeat } = require('./BodrikRecoveryHeartbeat');
const { createRecoveryGrace } = require('./BodrikRecoveryGrace');
const HtmlInjector = require('./HtmlInjector');
const { browserConsoleScript } = require('./BodrikBrowserConsole');
const log = new Logger('Server');

const restrictAccessByIP = require('./middleware/IpWhitelist');
const { applyEmbedHeaders, embedAllowedOrigins, embedCsp } = require('./middleware/EmbedHeaders');
const packageJson = require('../../package.json');
const { createAvatarUploadHandler } = require('./BodrikAvatarUpload');
const { createChatImageUploadHandler, startChatImageCleanup } = require('./BodrikChatImageUpload');

// Login attempts limit
const rateLimit = require('express-rate-limit');

// minutes
// Extract client IP (only trust X-Forwarded-For when behind a trusted reverse proxy)
const ipKeyGenerator = (req) => {
    const forwarded = Boolean(config?.server?.trustProxy)
        ? req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For']
        : null;
    return (forwarded || '').split(',')[0].trim() || req.socket?.remoteAddress || req.ip;
};
// Pluralize "N minute(s)" consistently across limiter messages
const minutesLabel = (n) => `${n} minute${n === 1 ? '' : 's'}`;

// Limit public room enumeration by requester IP.

// Socket.IO createRoom rate limiter (per IP) — sliding window in memory.
// Prevents unauthenticated sockets from spamming arbitrary room entries
// into the in-memory roomList (which feeds /api/v1/activeRooms).
const createRoomLimiterCfg = config.features?.createRoomRateLimit || {};
const createRoomLimiterWindowMs = createRoomLimiterCfg.windowMs || 60 * 1000;
const createRoomLimiterMax = createRoomLimiterCfg.max || 10;
const createRoomLimiterMinutes = Math.ceil(createRoomLimiterWindowMs / (60 * 1000));
const createRoomHits = new Map(); // ip -> number[] (timestamps)
function checkCreateRoomLimit(ip) {
    const now = Date.now();
    const windowStart = now - createRoomLimiterWindowMs;
    const hits = (createRoomHits.get(ip) || []).filter((t) => t > windowStart);
    if (hits.length >= createRoomLimiterMax) {
        createRoomHits.set(ip, hits);
        return false;
    }
    hits.push(now);
    createRoomHits.set(ip, hits);
    return true;
}
// Periodic cleanup to bound memory.
setInterval(
    () => {
        const cutoff = Date.now() - createRoomLimiterWindowMs;
        for (const [ip, hits] of createRoomHits) {
            const kept = hits.filter((t) => t > cutoff);
            if (kept.length === 0) createRoomHits.delete(ip);
            else createRoomHits.set(ip, kept);
        }
    },
    Math.max(createRoomLimiterWindowMs, 60 * 1000)
).unref?.();

// Branding configuration
const brandHtmlInjection = config?.ui?.brand?.htmlInjection ?? true;

// Incoming Stream to RTPM
// Secrets previously shipped as defaults: treated as unset so they can never authorize a request.

const app = express();

const options = {
    cert: fs.readFileSync(path.join(__dirname, config?.server?.ssl.cert || '../ssl/cert.pem'), 'utf-8'),
    key: fs.readFileSync(path.join(__dirname, config?.server?.ssl.key || '../ssl/key.pem'), 'utf-8'),
};

const corsOptions = {
    origin: config.server?.cors?.origin || '*',
    methods: config.server?.cors?.methods || ['GET', 'POST'],
};

const server = httpolyglot.createServer(options, app);

const io = socketIo(server, {
    maxHttpBufferSize: 1e7,
    transports: ['websocket'],
    cors: corsOptions,
    connectionStateRecovery: {
        maxDisconnectionDuration: 120000,
        skipMiddlewares: false,
    },
});

const stopRecoveryHeartbeat = startRecoveryHeartbeat(io);
server.on('close', stopRecoveryHeartbeat);

const host = config?.server?.hostUrl || `http://localhost:${config?.server?.listen?.port || 3010}`;
const trustProxy = Boolean(config?.server?.trustProxy);

const jwtCfg = {
    JWT_KEY: config?.security?.jwt?.key || 'mirotalksfu_jwt_secret',
    JWT_EXP: config?.security?.jwt?.exp || '1h',
};

const hostCfg = {
    protected: config?.security?.host?.protected,
    authenticated: !config?.security?.host?.protected,
    user_auth: config?.security?.host?.user_auth,
    users: config?.security?.host?.users,
    users_from_db: config?.security?.host?.users_from_db,
    users_api_room_allowed: config?.security?.host?.users_api_room_allowed,
    users_api_rooms_allowed: config?.security?.host?.users_api_rooms_allowed,
    users_api_endpoint: config?.security?.host?.users_api_endpoint,
    users_api_secret_key: config?.security?.host?.users_api_secret_key,
    api_room_exists: config?.security?.host?.api_room_exists,
    presenters: config?.security?.host?.presenters,
};

// Validate host user passwords if host protection or user authentication is enabled
if (
    (hostCfg.protected || hostCfg.user_auth) &&
    (!Array.isArray(hostCfg.users) || hostCfg.users.some((user) => !user || !Validator.isValidPassword(user.password)))
) {
    throw new Error('HOST_USERS passwords must contain between 1 and 36 characters');
}

const restApi = {
    basePath: '/api/v1', // api endpoint path
    allowed: config.api?.allowed || {},
};

// directory
const dir = {
    public: path.join(__dirname, '../../public'),
};

// html views
const views = {
    html: path.join(__dirname, '../../public/views'),

    room: path.join(__dirname, '../../', 'public/views/Room.html'),
};

const filesPath = [views.room];

const htmlInjector = new HtmlInjector(filesPath, config.ui.brand, dir.public);

const authHost = new Host(); // Authenticated IP by Login

const roomList = new Map(); // All Rooms
const recoveryGrace = createRecoveryGrace(io, roomList, log);
const clientDiagnosticsEnabled = process.env.CLIENT_DIAGNOSTICS_ENABLED === 'true';
const clientDiagnostics = clientDiagnosticsEnabled ? new DiagnosticStore() : null;

const presenters = {}; // Collect presenters grp by roomId

const webRtcServerActive = config.mediasoup.webRtcServerActive;

// ip (server local IPv4)
const IP = webRtcServerActive
    ? config.mediasoup.webRtcServerOptions.listenInfos[0].ip
    : config.mediasoup.webRtcTransport.listenInfos[0].ip;

// announcedAddress (server public IPv4)
let announcedAddress = webRtcServerActive
    ? config.mediasoup.webRtcServerOptions.listenInfos[0].announcedAddress
    : config.mediasoup.webRtcTransport.listenInfos[0].announcedAddress;

// All mediasoup workers
const workers = [];
let nextMediasoupWorkerIdx = 0;

// Autodetect announcedAddress with multiple fallback services
if (!announcedAddress && IP === '0.0.0.0') {
    const detectPublicIp = async () => {
        const services = config.system?.services?.ip || [
            'http://api.ipify.org',
            'http://ipinfo.io/ip',
            'http://ifconfig.me/ip',
        ];

        for (const service of services) {
            try {
                const ip = await fetchPublicIp(service);
                if (ip) {
                    announcedAddress = ip;
                    updateAnnouncedAddress(ip);
                    startServer();
                    return;
                }
            } catch (err) {
                log.warn(`Failed to detect IP from ${service}`, err.message);
            }
        }
        throw new Error('All public IP detection services failed! Please check your network connection');
    };

    detectPublicIp().catch((err) => {
        log.error('Public IP detection failed', err.message);
        process.exit(1);
    });
} else {
    startServer();
}

function fetchPublicIp(serviceUrl) {
    return new Promise((resolve, reject) => {
        http.get(serviceUrl, (resp) => {
            if (resp.statusCode !== 200) {
                return reject(new Error(`HTTP ${resp.statusCode}`));
            }
            let data = '';
            resp.on('data', (chunk) => (data += chunk));
            resp.on('end', () => resolve(data.toString().trim()));
        }).on('error', reject);
    });
}

function updateAnnouncedAddress(ip) {
    const target = webRtcServerActive
        ? config.mediasoup.webRtcServerOptions.listenInfos
        : config.mediasoup.webRtcTransport.listenInfos;

    target.forEach((info) => {
        info.announcedAddress = ip;
    });
}

function startServer() {
    // Start the app
    app.set('trust proxy', trustProxy); // Enables trust for proxy headers (e.g., X-Forwarded-For) based on the trustProxy setting
    app.use(helmet.noSniff()); // Enable content type sniffing prevention
    app.use(applyEmbedHeaders); // Apply iframe embedding restrictions (CSP frame-ancestors / X-Frame-Options)
    // Serve the environment-specific console policy before static assets, without caching across environments.
    app.get('/js/bodrik-console.js', (req, res) => {
        res.set('Cache-Control', 'no-store')
            .type('application/javascript')
            .send(browserConsoleScript(process.env.NODE_ENV));
    });
    // Use all static files from the public folder
    app.use(
        express.static(dir.public, {
            setHeaders: (res, filePath) => {
                if (filePath.endsWith('.js')) {
                    res.setHeader('Content-Type', 'application/javascript');
                } //...
            },
        })
    );
    app.use(cors(corsOptions));
    app.use(compression());
    app.post(
        '/api/bodrik/avatar',
        rateLimit({
            windowMs: 60 * 60 * 1000,
            max: 20,
            standardHeaders: true,
            legacyHeaders: false,
            keyGenerator: ipKeyGenerator,
        }),
        express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '256kb' }),
        createAvatarUploadHandler({
            directory: process.env.BODRIK_AVATAR_DIR || path.join(dir.public, 'uploads', 'avatars'),
            verifyToken: isValidToken,
        })
    );
    const chatImageDirectory = path.join(dir.public, 'uploads', 'chat');
    server.on('close', startChatImageCleanup(chatImageDirectory));
    app.post(
        '/api/bodrik/chat-image',
        rateLimit({
            windowMs: 60 * 60 * 1000,
            max: 30,
            standardHeaders: true,
            legacyHeaders: false,
            keyGenerator: ipKeyGenerator,
        }),
        express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '5mb' }),
        createChatImageUploadHandler({
            directory: chatImageDirectory,
            verifyToken: isValidToken,
            decodeToken,
            getRoom: (roomId) => roomList.get(roomId),
        })
    );
    app.use(express.json({ limit: '50mb' })); // Handles JSON payloads
    app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Handles URL-encoded payloads
    // api docs

    // IP Whitelist check ...
    app.use(restrictAccessByIP);

    // Logs requests
    /*
    app.use((req, res, next) => {
        log.debug('New request:', {
            headers: req.headers,
            body: req.body,
            method: req.method,
            path: req.originalUrl,
        });
        next();
    });
    */

    // Remove trailing slashes in url handle bad requests
    app.use((err, req, res, next) => {
        if (err && (err instanceof SyntaxError || err.status === 400 || 'body' in err)) {
            log.error('Request Error', {
                header: req.headers,
                body: req.body,
                error: err.message,
            });
            return res.status(400).send({ status: 404, message: err.message }); // Bad request
        }

        // Prevent open redirect attacks by checking if the path is an external domain
        const cleanPath = req.path.replace(/^\/+/, '');
        if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/.test(cleanPath)) {
            return res.status(400).send('Bad Request: Potential Open Redirect Detected');
        }

        if (req.path.endsWith('/') && req.path.length > 1) {
            let query = req.url.substring(req.path.length).replace(/\/$/, ''); // Ensure query params don't end in '/'
            return res.redirect(301, req.path.slice(0, -1) + query);
        }

        next();
    });

    // Route to display user information

    // Authentication Callback Route

    // Logout Route

    // Favicon
    registerPageRoutes(app, {
        inviteBaseUrl: process.env.BODRIK_INVITE_BASE_URL,
        byeUrl: process.env.BODRIK_BYE_URL,
        renderRoom: (res) => htmlInjector.injectHtml(views.room, res),
        isValidToken,
        decodeToken,
        isAuthPeer,
        isRoomAllowedForUser,
        hostCfg,
        authorizeHost: (req) => {
            hostCfg.authenticated = true;
            authHost.setAuthorizedIP(getIP(req), true);
        },
    });

    app.get('/favicon.ico', (req, res) => res.status(204).end());

    // UI buttons configuration
    app.get('/config', (req, res) => {
        res.set('Cache-Control', 'no-store')
            .status(200)
            .json({
                message: config?.ui?.buttons || false,
                inviteBaseUrl: process.env.BODRIK_INVITE_BASE_URL || '',
            });
    });

    // Brand configuration
    app.get('/brand', (req, res) => {
        res.status(200).json({ message: brandHtmlInjection ? config?.ui?.brand : false });
    });

    // UI themes configuration
    app.get('/themes', (req, res) => {
        res.status(200).json({ message: config?.ui?.themes ? config.ui.themes : false });
    });

    // main page

    // set new room name and join

    // Get Active rooms

    // Get Customize room

    // Check if room active (exists)

    // Check if Widget room active (exists)

    // Handle Direct join room with params

    // Refreshing the clean in-room URL re-enters through the canonical invitation exchange.

    // join room by id

    // not specified correctly the room id

    // handle who are you: Presenter or Guest

    // handle login if user_auth enabled

    // handle logged on host protected

    // ####################################################
    // AXIOS
    // ####################################################

    // handle login on host protected

    // ####################################################
    // REST API
    // ####################################################

    // request join room endpoint
    app.post(restApi.basePath + '/join', (req, res) => {
        // Check if endpoint allowed
        if (restApi.allowed && !restApi.allowed.join) {
            return res.status(403).json({
                error: 'This endpoint has been disabled. Please contact the administrator for further information.',
            });
        }
        // check if user was authorized for the api call
        const { host, authorization } = req.headers;
        const api = new ServerApi(host, authorization);
        if (!api.isAuthorized()) {
            log.debug('MiroTalk get join - Unauthorized', {
                header: req.headers,
                body: req.body,
            });
            return res.status(403).json({ error: 'Unauthorized!' });
        }
        // setup Join URL
        const joinURL = api.getJoinURL(req.body);
        if (!joinURL) return res.status(400).json({ error: 'Room is required' });
        res.json({ join: joinURL });
        // log.debug the output if all done
        log.debug('MiroTalk get join - Authorized', {
            header: req.headers,
            body: req.body,
            join: joinURL,
        });
    });

    // request end meeting room endpoint
    app.delete(restApi.basePath + '/meeting/:room', (req, res) => {
        try {
            // Check if endpoint allowed
            if (restApi.allowed && !restApi.allowed.meetingEnd) {
                return res.status(403).json({
                    success: false,
                    error: 'This endpoint has been disabled. Please contact the administrator for further information.',
                });
            }
            // check if user was authorized for the api call
            const { host, authorization } = req.headers;
            const api = new ServerApi(host, authorization);
            if (!api.isAuthorized()) {
                log.debug('MiroTalk end meeting - Unauthorized', {
                    header: req.headers,
                    body: req.body,
                });
                return res.status(403).json({ error: 'Unauthorized!' });
            }
            // End the meeting
            const { room } = req.params;
            const { redirect } = req.body || {};
            const result = api.endMeeting(roomList, room, redirect);
            const status = result.success ? 200 : 404;
            res.status(status).json(result);
            // log.debug the output if all done
            log.debug('MiroTalk end meeting - Authorized', {
                header: req.headers,
                room: room,
                result: result,
            });
        } catch (error) {
            console.error('Error ending meeting', error);
            res.status(500).json({ success: false, error: 'Failed to end meeting.' });
        }
    });

    // ####################################################

    // ####################################################

    // ####################################################
    // ####################################################

    registerNotFoundRoute(app, process.env.BODRIK_BYE_URL);

    // Global error handler for URIError and other errors
    app.use((err, req, res, next) => {
        if (err instanceof URIError) {
            log.warn('Malformed URI detected', {
                url: req.url,
                ip: getIP(req),
                error: err.message,
            });
            return res.status(400).send({ status: 400, message: 'Invalid URL encoding' });
        }
        // Handle other errors
        log.error('Unhandled error', {
            url: req.url,
            error: err.message,
            stack: err.stack,
        });
        res.status(500).send({ status: 500, message: 'Internal server error' });
    });

    // ####################################################
    // SERVER CONFIG
    // ####################################################

    /** Summarize retained runtime capabilities for operational logging. */
    function getServerConfig() {
        const safeConfig = {
            // Network & Connectivity
            network: {
                server_listen: host,
                trust_proxy: trustProxy,
                sfu: {
                    announcedIP: announcedAddress,
                    listenIP: IP,
                    numWorker: config.mediasoup?.numWorkers,
                    rtcMinPort: config.mediasoup?.worker?.rtcMinPort,
                    rtcMaxPort: config.mediasoup?.worker?.rtcMaxPort,
                },
            },

            // Security & Authentication
            security: {
                cors: corsOptions,
                embed: {
                    allowedOrigins: embedAllowedOrigins.length ? embedAllowedOrigins : 'any',
                    csp: embedCsp ? embedCsp.csp : 'not set (embedding allowed from any origin)',
                },
                jwtCfg: jwtCfg,
                host: hostCfg?.protected || hostCfg?.user_auth ? hostCfg : { presenters: hostCfg.presenters },

                middleware: {
                    IpWhitelist: config?.security?.middleware?.IpWhitelist?.enabled
                        ? config.security.middleware.IpWhitelist
                        : false,
                    //...
                },
            },

            // API & Services
            api: {
                rest_api: restApi,
            },

            // Media Configuration
            media: {
                mediasoup: {
                    listenInfos: config.mediasoup?.webRtcTransport?.listenInfos,
                    worker_bin: mediasoup?.workerBin,
                },
            },

            // Communication Integrations
            integrations: {},

            // UI & Branding
            ui: {
                brand: config.ui?.brand,
                buttons: config.ui?.buttons,
            },

            // Monitoring & Analytics
            monitoring: {
                system_info: config.system?.info,
            },

            // Features & Functionality
            features: {
                redirect: config.features?.redirect?.enabled ? config.features.redirect : false,
            },

            // Global Moderation & Management
            moderation: {
                room: {
                    maxParticipants: config?.moderation?.room?.maxParticipants || 1000,
                    lobby: config?.moderation?.room?.lobby || false,
                },
            },

            // Version Information
            versions: {
                app: packageJson?.version,
                node: process.versions.node,
                server_version: mediasoup?.version,
                client_version: mediasoupClient?.version,
            },
        };

        return safeConfig;
    }

    // ####################################################
    // ####################################################

    // ####################################################
    // HANDLE SERVER CLIENT ERRORS
    // ####################################################

    server.on('clientError', (err, socket) => {
        if (socket.writable) {
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        }
        socket.destroy();
        log.warn('Client connection error', { error: err.message, code: err.code });
    });

    // ####################################################
    // START SERVER
    // ####################################################

    function startServer() {
        server.listen(config?.server?.listen?.port || 3010, config?.server?.listen?.ip || '127.0.0.1', () => {
            log.log(
                `%c

        ███████╗██╗ ██████╗ ███╗   ██╗      ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗ 
        ██╔════╝██║██╔════╝ ████╗  ██║      ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
        ███████╗██║██║  ███╗██╔██╗ ██║█████╗███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
        ╚════██║██║██║   ██║██║╚██╗██║╚════╝╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
        ███████║██║╚██████╔╝██║ ╚████║      ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
        ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝      ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝ started...

        `,
                'font-family:monospace'
            );

            log.info('Server config', getServerConfig());

            // Warn if default secrets are still in use
            if (config.api?.keySecret === 'mirotalksfu_default_secret') {
                log.warn('WARNING: API_KEY_SECRET is set to the default value. Change it before deploying!');
            }
            if (jwtCfg.JWT_KEY === 'mirotalksfu_jwt_secret') {
                log.warn('WARNING: JWT_SECRET is set to the default value. Change it before deploying!');
            }
        });
    }

    // ####################################################
    // WORKERS
    // ####################################################

    (async () => {
        try {
            await createWorkers();
            startServer();
        } catch (err) {
            log.error('Create Worker ERROR --->', err);
            process.exit(1);
        }
    })();

    /** Start mediasoup workers and exit on fatal worker failure. */
    async function createWorkers() {
        const { numWorkers } = config.mediasoup;

        const { logLevel, logTags, disableLiburing } = config.mediasoup.worker;

        log.info('WORKERS:', numWorkers);

        for (let i = 0; i < numWorkers; i++) {
            //
            const worker = await mediasoup.createWorker({
                logLevel: logLevel,
                logTags: logTags,
                disableLiburing: Boolean(disableLiburing),
            });

            if (webRtcServerActive) {
                const webRtcServerOptions = clone(config.mediasoup.webRtcServerOptions);
                const portIncrement = i;

                for (const listenInfo of webRtcServerOptions.listenInfos) {
                    if (!listenInfo.portRange) {
                        listenInfo.port += portIncrement;
                    }
                }

                log.info('Create a WebRtcServer', {
                    worker_pid: worker.pid,
                    webRtcServerOptions: webRtcServerOptions,
                });

                const webRtcServer = await worker.createWebRtcServer(webRtcServerOptions);
                worker.appData.webRtcServer = webRtcServer;
            }

            worker.on('died', () => {
                log.error('Mediasoup worker died, exiting in 5 seconds...', worker.pid);

                setTimeout(() => process.exit(1), 5000);
            });

            workers.push(worker);

            /*
            setInterval(async () => {
                const usage = await worker.getResourceUsage();
                log.debug('mediasoup Worker resource usage', { worker_pid: worker.pid, usage: usage });
                const dump = await worker.dump();
                log.debug('mediasoup Worker dump', { worker_pid: worker.pid, dump: dump });
            }, 120000);
            */
        }
    }

    async function getMediasoupWorker() {
        const worker = workers[nextMediasoupWorkerIdx];
        if (++nextMediasoupWorkerIdx === workers.length) nextMediasoupWorkerIdx = 0;
        return worker;
    }

    // ####################################################
    // SOCKET IO
    // ####################################################

    io.on('connection', (socket) => {
        registerRoomChat(socket, roomList, log);
        recoveryGrace.cancel(socket.id);
        if (clientDiagnostics) registerClientDiagnostics(socket, roomList, clientDiagnostics, getIpSocket(socket));
        log.info('[Recovery] socket connected', {
            socket_id: socket.id,
            recovered: socket.recovered,
            room_id: socket.data.room_id || null,
            peer_present: Boolean(socket.data.room_id && roomList.get(socket.data.room_id)?.getPeer(socket.id)),
        });
        if (socket.recovered && socket.data.room_id) {
            socket.room_id = socket.data.room_id;
            log.info('[Reconnect] - restored socket session', {
                room_id: socket.room_id,
                socket_id: socket.id,
            });
            if (clientDiagnosticsEnabled) socket.emit('bodrikDiagnosticsReady');
        }
        socket.on('clientError', (error) => {
            try {
                log.error('Client error', error.message);
                socket.disconnect(true); // true indicates a forced disconnection
            } catch (error) {
                log.error('Error handling Client error', error.message);
            }
        });

        socket.on('error', (error) => {
            try {
                log.error('Socket error', error.message);
                socket.disconnect(true); // true indicates a forced disconnection
            } catch (error) {
                log.error('Error handling socket error', error.message);
            }
        });

        socket.on('createRoom', async ({ room_id }, callback) => {
            // Security: reject invalid room ids (XSS / path traversal / empty).
            if (!Validator.isValidRoomName(room_id)) {
                log.warn('[createRoom] - Invalid room name', { room_id });
                return callback({ error: 'invalid room name' });
            }

            // Security: per-IP rate limit to prevent roomList spam/enumeration.
            const ip = getIpSocket(socket);
            if (!checkCreateRoomLimit(ip)) {
                log.warn('[createRoom] - Rate limit exceeded', { ip, room_id });
                return callback({
                    error: `Too many room creation requests. Please try again after ${minutesLabel(createRoomLimiterMinutes)}.`,
                });
            }

            socket.room_id = room_id;
            socket.data.room_id = room_id;

            if (roomList.has(socket.room_id)) {
                callback({ error: 'already exists' });
            } else {
                try {
                    const worker = await getMediasoupWorker();
                    const room = await new Room(socket.room_id, worker, io).ready();
                    roomList.set(socket.room_id, room);
                    log.debug('Created room', { room_id: socket.room_id });
                    callback({ room_id: socket.room_id });
                } catch (error) {
                    log.error('Create room failed', { room_id: socket.room_id, error: error.message });
                    callback({ error: 'Failed to initialize room' });
                }
            }
        });

        socket.on('join', async (dataObject, cb) => {
            if (!roomExists(socket)) {
                return cb({
                    error: 'Room does not exist',
                });
            }

            const peer_ip = getIpSocket(socket);
            const data = checkXSS(dataObject);

            log.debug('User joined', { room_id: socket.room_id });

            if (!Validator.isValidRoomName(socket.room_id)) {
                log.warn('[Join] - Invalid room name', socket.room_id);
                return cb('invalid');
            }

            const room = getRoom(socket);

            const {
                peer_name,
                peer_id,
                peer_uuid,
                peer_token,
                peer_presenter,
                os_name,
                os_version,
                browser_name,
                browser_version,
            } = data.peer_info;

            let is_presenter = peer_presenter;

            let authenticatedUsername = peer_name;
            // User Auth required or detect token, we check if peer valid
            if (hostCfg.user_auth || peer_token) {
                // Check JWT
                if (peer_token) {
                    try {
                        const validToken = await isValidToken(peer_token);

                        if (!validToken) {
                            log.warn('[Join] - Invalid token', peer_token);
                            return cb('unauthorized');
                        }

                        const { username, password, presenter, room: tokenRoom } = checkXSS(decodeToken(peer_token));
                        if (tokenRoom && tokenRoom !== socket.room_id) {
                            return cb('unauthorized');
                        }

                        authenticatedUsername = username;
                        const isPeerValid = await isAuthPeer(username, password);

                        if (!isPeerValid) {
                            // redirect peer to login page
                            log.warn('[Join] - Invalid peer not authenticated', isPeerValid);
                            return cb('unauthorized');
                        }

                        const tokenPresenter = presenter === '1' || presenter === 'true';

                        {
                            is_presenter =
                                tokenPresenter || (hostCfg?.presenters?.join_first && room?.getPeersCount() === 0);
                        }

                        log.debug('[Join] - HOST PROTECTED - USER AUTH check peer', {
                            ip: peer_ip,
                            peer_username: username,
                            peer_password: password,
                            peer_valid: isPeerValid,
                            peer_presenter: is_presenter,
                        });
                    } catch (err) {
                        log.error('[Join] - JWT error', {
                            error: err.message,
                            token: peer_token,
                        });
                        return cb('unauthorized');
                    }
                } else {
                    if (!hostCfg.users_from_db) return cb('unauthorized');
                }

                if (!hostCfg.users_from_db) {
                    const roomAllowedForUser = isRoomAllowedForUser('[Join]', authenticatedUsername, room.id);
                    if (!roomAllowedForUser) {
                        log.warn('[Join] - Room not allowed for this peer', { peer_name, room_id: room.id });
                        return cb('notAllowed');
                    }
                }
            }

            // check if banned...
            if (room.isBanned(peer_uuid)) {
                log.debug('[Join] - peer is banned!', {
                    room_id: data.room_id,
                    peer: {
                        name: peer_name,
                        uuid: peer_uuid,
                        os_name: os_name,
                        os_version: os_version,
                        browser_name: browser_name,
                        browser_version: browser_version,
                    },
                });
                return cb('isBanned');
            }

            const existingPeer = room.getPeer(socket.id);
            const oldPeers = findDisconnectedRejoinPeers(room, io.sockets.sockets, data.rejoin_secret, socket.id);
            const newPeer = new Peer(socket.id, data);
            // Only the validated admission token, never an editable nickname, controls token-based roles.
            newPeer.bodrikTokenAuthenticated = Boolean(peer_token);
            bindRejoinSecret(newPeer, data.rejoin_secret);
            if (existingPeer) {
                // Replacing the last peer must not close the room's router between admissions.
                existingPeer.close();
                room.delPeer(existingPeer);
            }
            room.addPeer(newPeer);
            for (const oldPeer of oldPeers) {
                const wasPresenter = isPeerPresenter(socket.room_id, oldPeer.id, oldPeer.peer_name, oldPeer.peer_uuid);
                room.removePeer(oldPeer.id);
                if (presenters[socket.room_id]) delete presenters[socket.room_id][oldPeer.id];
                room.broadCast(socket.id, 'removeMe', {
                    ...removeMeData(room, oldPeer.peer_name, wasPresenter),
                    peer_id: oldPeer.id,
                });
                log.info('[Recovery] replaced disconnected tab peer', {
                    room_id: socket.room_id,
                    old_socket_id: oldPeer.id,
                    new_socket_id: socket.id,
                });
            }

            if (!(socket.room_id in presenters)) presenters[socket.room_id] = {};

            // Set the presenters
            const presenter = {
                peer_ip: peer_ip,
                peer_name: peer_name,
                peer_uuid: peer_uuid,
                is_presenter: is_presenter,
            };

            if (
                isNamedPresenter(newPeer, hostCfg?.presenters?.list) ||
                (hostCfg?.presenters?.join_first && Object.keys(presenters[socket.room_id]).length === 0) ||
                (peer_token && is_presenter)
            ) {
                presenter.is_presenter = true;
                presenters[socket.room_id][socket.id] = presenter;
            }

            log.debug('[Join] - Connected presenters grp by roomId', presenters);

            const isPresenter = peer_token
                ? is_presenter
                : isPeerPresenter(socket.room_id, socket.id, peer_name, peer_uuid);

            const peer = room.getPeer(socket.id);

            if (!peer) {
                return cb({
                    error: 'Peer does not exist in the room',
                });
            }

            log.debug('[Join] - Is Peer presenter', {
                roomId: socket.room_id,
                peer_name: peer_name,
                peer_presenter: isPresenter,
            });

            peer.updatePeerInfo({ type: 'presenter', status: isPresenter });

            if (room.isJoinLocked() && !isPresenter) {
                log.debug('The user was rejected because the room is locked for new participants');
                return cb('isJoinLocked');
            }

            if (room.isLocked() && !isPresenter) {
                log.debug('The user was rejected because the room is locked, and they are not a presenter');
                return cb('isLocked');
            }

            if ((room.isLobbyEnabled() || room.isGlobalLobbyEnabled()) && !isPresenter) {
                log.debug(
                    'The user is currently waiting to join the room because the lobby is enabled, and they are not a presenter'
                );
                peer.updatePeerInfo({ type: 'lobby', status: true });
                room.broadCast(socket.id, 'roomLobby', {
                    peer_id: peer_id,
                    peer_name: peer_name,
                    lobby_status: 'waiting',
                });
                return cb('isLobby');
            }

            if ((hostCfg.protected || hostCfg.user_auth) && isPresenter && !hostCfg.users_from_db) {
                const roomAllowedForUser = isRoomAllowedForUser('[Join]', peer_name, room.id);
                if (!roomAllowedForUser) {
                    log.warn('[Join] - Room not allowed for this peer', { peer_name, room_id: room.id });
                    return cb('notAllowed');
                }
            }

            const roomJson = room.toJson();

            roomJson.clientDiagnosticsEnabled = clientDiagnosticsEnabled;
            cb(roomJson);
            log.info(
                '[Join] admitted peer',
                admittedPeer(room.id, peer.peer_info, data.diagnostics, socket.handshake.headers['user-agent'])
            );
            if (clientDiagnosticsEnabled) socket.emit('bodrikDiagnosticsReady');
        });

        socket.on('getRouterRtpCapabilities', (_, callback) => {
            if (!roomExists(socket)) {
                return callback({ error: 'Room not found' });
            }

            const { room, peer } = getRoomAndPeer(socket);

            if (isPeerInLobby(peer)) {
                return callback({ error: 'In lobby' });
            }

            const peerInfo = getPeerInfo(peer);

            log.debug('Request: getRouterRtpCapabilities', peerInfo);

            try {
                const rtpCapabilities = room.getRtpCapabilities();
                callback(rtpCapabilities);
            } catch (err) {
                log.error('Failed to get Router RTP Capabilities', {
                    error: err.message,
                    peerInfo,
                });
                callback({ error: err.message });
            }
        });

        socket.on('createWebRtcTransport', async (_, callback) => {
            if (!roomExists(socket)) {
                return callback({ error: 'Room not found' });
            }

            const { room, peer } = getRoomAndPeer(socket);

            if (isPeerInLobby(peer)) {
                return callback({ error: 'In lobby' });
            }

            const peerInfo = getPeerInfo(peer);

            log.debug('Create WebRTC transport request received', peerInfo);

            try {
                const createWebRtcTransport = await room.createWebRtcTransport(socket.id);
                callback(createWebRtcTransport);
            } catch (err) {
                log.warn('Create WebRTC Transport warning', { error: err.message, peerInfo });
                callback({ error: err.message });
            }
        });

        socket.on('connectTransport', async ({ transport_id, dtlsParameters }, callback) => {
            if (!roomExists(socket)) {
                return callback({ error: 'Room not found' });
            }

            const { room, peer } = getRoomAndPeer(socket);

            if (isPeerInLobby(peer)) {
                return callback({ error: 'In lobby' });
            }

            const peerInfo = getPeerInfo(peer);

            log.debug('Connect transport request received', { transport_id, peerInfo });

            try {
                const connectTransport = await room.connectPeerTransport(socket.id, transport_id, dtlsParameters);
                callback(connectTransport);
            } catch (err) {
                log.warn('Connect transport warning', { error: err.message, peerInfo });
                callback({ error: err.message });
            }
        });

        socket.on('restartIce', async ({ transport_id }, callback) => {
            if (!roomExists(socket)) {
                return callback({ error: 'Room not found' });
            }

            const peer = getPeer(socket);

            if (!peer) {
                return callback({ error: 'Peer not found' });
            }

            if (isPeerInLobby(peer)) {
                return callback({ error: 'In lobby' });
            }

            const peerInfo = getPeerInfo(peer);

            log.debug('Restart ICE request received', { transport_id: transport_id, peerInfo });

            try {
                const transport = peer.getTransport(transport_id);

                if (!transport) {
                    log.warn(`Restart ICE attempt failed. Transport with ID "${transport_id}" not found.`);
                    return callback({ error: `Transport with id "${transport_id}" not found` });
                }

                const iceParameters = await transport.restartIce();

                log.debug('ICE Restart successful', { transport_id: transport_id, iceParameters });

                callback(iceParameters);
            } catch (err) {
                log.warn('Restart ICE warning', { error: err.message, peerInfo });
                callback({ error: err.message });
            }
        });

        socket.on('produce', async ({ producerTransportId, kind, appData, rtpParameters }, callback, errback) => {
            if (!roomExists(socket)) {
                return callback({ error: 'Room not found' });
            }

            const { room, peer } = getRoomAndPeer(socket);

            if (!peer) {
                return callback({ error: 'Peer not found' });
            }

            if (isPeerInLobby(peer)) {
                return callback({ error: 'In lobby' });
            }

            const peerInfo = getPeerInfo(peer);

            const data = {
                room_id: room.id,
                peer_name: peerInfo.peer_name,
                peer_id: socket.id,
                kind: kind,
                type: appData.mediaType,
                status: true,
            };

            peer.updatePeerInfo(data);

            try {
                const producer_id = await room.produce(
                    socket.id,
                    producerTransportId,
                    rtpParameters,
                    kind,
                    appData.mediaType
                );

                log.debug('Produce', {
                    kind: kind,
                    type: appData.mediaType,
                    producer_id: producer_id,
                    peer_id: socket.id,
                    peerInfo: peerInfo,
                });

                // add & monitor producer audio level and dominant speaker
                if (kind === 'audio') {
                    await Promise.all([
                        room.addProducerToAudioLevelObserver({ producerId: producer_id }),
                        room.addProducerToActiveSpeakerObserver({ producerId: producer_id }),
                    ]);
                }

                callback({ producer_id });
            } catch (err) {
                log.warn('Producer transport error', {
                    error: err,
                    peerInfo,
                });
                callback({ error: err.message });
            }
        });

        socket.on('consume', async ({ consumerTransportId, producerId, rtpCapabilities, type }, callback) => {
            if (!roomExists(socket)) {
                return callback({ error: 'Room not found' });
            }

            const { room, peer } = getRoomAndPeer(socket);

            if (!peer) {
                return callback({ error: 'Peer not found' });
            }

            if (isPeerInLobby(peer)) {
                return callback({ error: 'In lobby' });
            }

            const peerInfo = getPeerInfo(peer);

            try {
                const params = await room.consume(socket.id, consumerTransportId, producerId, rtpCapabilities, type);

                log.debug('Consuming', {
                    producer_type: type,
                    producer_id: producerId,
                    consumer_id: params ? params.id : undefined,
                    peerInfo: peerInfo,
                });

                callback(params);
            } catch (err) {
                const producerUnavailable = err.code === 'PRODUCER_NOT_FOUND';
                const details = {
                    error: err,
                    type,
                    consumerTransportId,
                    producerId,
                    rtpCapabilities,
                    peerInfo,
                };

                if (producerUnavailable) {
                    log.debug('Consumer skipped because producer is no longer available', details);
                } else {
                    log.warn('Consumer transport error', details);
                }

                callback({ error: err.message, code: err.code, retryable: err.retryable });
            }
        });

        socket.on('producerClosed', (data) => {
            if (!roomExists(socket)) return;

            const { room, peer } = getRoomAndPeer(socket);

            if (isPeerInLobby(peer)) return;

            const peerInfo = getPeerInfo(peer);

            if (peer) peer.updatePeerInfo(data); // peer_info.audio OR video OFF

            try {
                room.closeProducer(socket.id, data.producer_id);
            } catch (err) {
                log.warn('Producer Close error', {
                    error: err.message,
                    peerInfo,
                });
            }
        });

        socket.on('pauseProducer', async ({ producer_id, type }, callback) => {
            if (!roomExists(socket)) {
                return callback({ error: 'Room not found' });
            }

            const peer = getPeer(socket);

            if (!peer) {
                return callback({
                    error: `Peer with ID: ${socket.id} for producer with id "${producer_id}" type "${type}" not found`,
                });
            }

            if (isPeerInLobby(peer)) {
                return callback({ error: 'In lobby' });
            }

            const producer = peer.getProducer(producer_id);

            if (!producer) {
                return callback({ error: `Producer with id "${producer_id}" type "${type}" not found` });
            }

            const peerInfo = getPeerInfo(peer);

            try {
                await producer.pause();

                log.debug('Producer paused', { producer_id, type, peerInfo });

                callback('successfully');
            } catch (error) {
                log.warn('Pause producer', {
                    error: error,
                    peerInfo,
                });
                callback({ error: error.message });
            }
        });

        socket.on('resumeProducer', async ({ producer_id, type }, callback) => {
            if (!roomExists(socket)) {
                return callback({ error: 'Room not found' });
            }

            const peer = getPeer(socket);

            if (!peer) {
                return callback({
                    error: `peer with ID: "${socket.id}" for producer with id "${producer_id}" type "${type}" not found`,
                });
            }

            if (isPeerInLobby(peer)) {
                return callback({ error: 'In lobby' });
            }

            const producer = peer.getProducer(producer_id);

            if (!producer) {
                return callback({ error: `producer with id "${producer_id}" type "${type}" not found` });
            }

            const peerInfo = getPeerInfo(peer);

            try {
                await producer.resume();

                log.debug('Producer resumed', { producer_id, type, peerInfo });

                callback('successfully');
            } catch (error) {
                log.warn('Resume producer', {
                    error: error,
                    peerInfo,
                });
                callback({ error: error.message });
            }
        });

        socket.on('resumeConsumer', async ({ consumer_id, type }, callback) => {
            if (!roomExists(socket)) {
                return callback({ error: 'Room not found' });
            }

            const peer = getPeer(socket);

            if (!peer) {
                return callback({
                    error: `peer with ID: "${socket.id}" for consumer with id "${consumer_id}" type "${type}" not found`,
                });
            }

            if (isPeerInLobby(peer)) {
                return callback({ error: 'In lobby' });
            }

            const consumer = peer.getConsumer(consumer_id);

            if (!consumer) {
                return callback({ error: `consumer with id "${consumer_id}" type "${type}" not found` });
            }

            const peerInfo = getPeerInfo(peer);

            try {
                await consumer.resume();

                log.debug('Consumer resumed', { consumer_id, type, peerInfo });

                callback('successfully');
            } catch (error) {
                log.warn('Resume consumer', {
                    error: error,
                    peerInfo,
                });
                callback({ error: error.message });
            }
        });

        socket.on('getProducers', (data, callback) => {
            if (!roomExists(socket)) return callback?.({ error: 'Room not found' });

            const { room, peer } = getRoomAndPeer(socket);

            if (isPeerInLobby(peer)) return callback?.({ error: 'In lobby' });

            const { peer_name } = peer || 'undefined';

            log.debug('Get producers', peer_name);

            // send all the current producer to newly joined member (excluding own producers)
            const producerList = room.getProducerListForPeer(socket.id);
            const knownProducerIds = new Set(
                Array.isArray(data?.knownProducerIds)
                    ? data.knownProducerIds
                          .slice(0, producerList.length)
                          .filter((producerId) => typeof producerId === 'string')
                    : []
            );
            const missingProducers = knownProducerIds.size
                ? producerList.filter(({ producer_id }) => !knownProducerIds.has(producer_id))
                : producerList;

            callback ? callback(missingProducers) : socket.emit('newProducers', missingProducers);
        });

        socket.on('getPeerCounts', async ({}, callback) => {
            if (!roomExists(socket)) {
                return callback({ error: 'Room not found' });
            }

            const room = getRoom(socket);

            const peerCounts = room.getPeersCount();

            log.debug('Peer counts', { peerCounts: peerCounts });

            callback({ peerCounts: peerCounts });
        });

        socket.on('cmd', async (dataObject) => {
            if (!roomExists(socket)) return;

            const data = checkXSS(dataObject);

            log.debug('cmd', data);

            if (!Validator.isValidData(data)) return;

            const room = getRoom(socket);

            const peer = getPeer(socket);

            if (!room || !peer) return;

            switch (data.type) {
                case 'privacy':
                    peer.updatePeerInfo({ type: data.type, status: data.active });
                    break;
                case 'ejectAll':
                    const { peer_name, peer_uuid } = data;
                    const isPresenter = isPeerPresenter(socket.room_id, socket.id, peer_name, peer_uuid);
                    if (!isPresenter) return;
                    // Only the server API (endMeeting) may force a redirect, never a peer
                    delete data.redirect;
                    break;
                case 'roomEmoji':
                    // Do not relay retired room reactions from stale clients.
                    return;
                case 'peerAudio':
                    // Legacy clients must not change participant volume for the whole room.
                    return;
                default:
                    return;
                //...
            }

            data.broadcast ? room.broadCast(socket.id, 'cmd', data) : room.sendTo(data.peer_id, 'cmd', data);
        });

        socket.on('roomAction', async (dataObject) => {
            if (!roomExists(socket)) return;

            const data = checkXSS(dataObject);

            if (!Validator.isValidData(data)) {
                log.warn('Room action invalid data', { peer_id: socket.id, room_id: socket.room_id });
                return;
            }

            log.debug('Room action:', data);

            const isPresenter = isPeerPresenter(socket.room_id, socket.id, data.peer_name, data.peer_uuid);

            const room = getRoom(socket);

            switch (data.action) {
                case 'lock':
                    if (!isPresenter) return;
                    if (!room.isLocked()) {
                        room.setLocked(true, data.password);
                        room.broadCast(socket.id, 'roomAction', data.action);
                    }
                    break;
                case 'checkPassword':
                    let roomData = {
                        room: null,
                        password: 'KO',
                    };
                    if (data.password == room.getPassword()) {
                        roomData.room = room.toJson();
                        roomData.password = 'OK';
                    }
                    room.sendTo(socket.id, 'roomPassword', roomData);
                    break;
                case 'unlock':
                    if (!isPresenter) return;
                    room.setLocked(false);
                    room.broadCast(socket.id, 'roomAction', data.action);
                    break;
                case 'globalLobbyOn':
                    if (!room.isGlobalLobbyEnabled()) return;
                    room.setLobbyEnabled(true);
                    break;
                case 'lobbyOn':
                    if (!isPresenter) return;
                    room.setLobbyEnabled(true);
                    room.broadCast(socket.id, 'roomAction', data.action);
                    break;
                case 'lobbyOff':
                    if (!isPresenter) return;
                    room.setLobbyEnabled(false);
                    room.broadCast(socket.id, 'roomAction', data.action);
                    break;
                case 'joinLockOn':
                    if (!isPresenter) return;
                    room.setJoinLocked(true);
                    room.broadCast(socket.id, 'roomAction', data.action);
                    break;
                case 'joinLockOff':
                    if (!isPresenter) return;
                    room.setJoinLocked(false);
                    room.broadCast(socket.id, 'roomAction', data.action);
                    break;
                case 'hostOnlyRecordingOn':
                    if (!isPresenter) return;
                    room.setHostOnlyRecording(true);
                    room.broadCast(socket.id, 'roomAction', data.action);
                    break;
                case 'hostOnlyRecordingOff':
                    if (!isPresenter) return;
                    room.setHostOnlyRecording(false);
                    room.broadCast(socket.id, 'roomAction', data.action);
                    break;
                case 'isBanned':
                    if (!isPresenter) return;
                    log.debug('The user has been banned from the room due to spamming messages', data);
                    room.addBannedPeer(data.peer_uuid);
                    break;
                default:
                    break;
            }
            log.debug('Room status', {
                locked: room.isLocked(),
                lobby: room.isLobbyEnabled(),
                joinLocked: room.isJoinLocked(),
                hostOnlyRecording: room.isHostOnlyRecording(),
            });
        });

        socket.on('roomLobby', (dataObject) => {
            if (!roomExists(socket)) return;

            const data = checkXSS(dataObject);

            const room = getRoom(socket);

            const peer = room.getPeer(socket.id);
            if (!peer) return;
            const isPresenter = isPeerPresenter(
                socket.room_id,
                socket.id,
                peer.peer_info?.peer_name,
                peer.peer_info?.peer_uuid
            );
            if (!isPresenter) return;

            data.room = room.toJson();

            log.debug('Room lobby', {
                peer_id: data.peer_id,
                peer_name: data.peer_name,
                peers_id: data.peers_id,
                lobby: data.lobby_status,
                broadcast: data.broadcast,
            });

            const pears_id = data.peers_id ? data.peers_id : [data.peer_id];

            // Also send to all presenters to update lobby UI on there side
            const send_to_pears_id = pears_id.concat(room.getPresenterPeers().map((peer) => peer.id));

            for (const peer_id of send_to_pears_id) {
                room.sendTo(peer_id, 'roomLobby', data);
            }

            if (data.lobby_status === 'accept') {
                for (const peer_id of pears_id) {
                    const peer = room.getPeer(peer_id);
                    if (!peer) {
                        log.warn('Lobby accept skipped - peer not found', {
                            peer_id: peer_id,
                            room_id: room.id,
                        });
                        continue;
                    }
                    if (!peer.peer_lobby) continue;

                    peer.updatePeerInfo({ type: 'lobby', status: false });
                }
            }
        });

        // ####################################################

        // ####################################################

        // ####################################################

        // ####################################################

        socket.on('peerAction', async (dataObject) => {
            if (!roomExists(socket)) return;

            const data = checkXSS(dataObject);

            log.debug('Peer action', data);

            if (!Validator.isValidData(data)) return;

            const presenterActions = ['mute', 'unmute', 'hide', 'unhide', 'stop', 'start', 'eject', 'ban'];
            if (!presenterActions.includes(data.action)) return;

            if (presenterActions.includes(data.action)) {
                const isPresenter = isPeerPresenter(
                    socket.room_id,
                    socket.id,
                    data.from_peer_name,
                    data.from_peer_uuid
                );
                if (!isPresenter) return;
            }

            const room = getRoom(socket);

            if (data.action === 'ban') room.addBannedPeer(data.to_peer_uuid);

            data.broadcast
                ? room.broadCast(data.peer_id, 'peerAction', data)
                : room.sendTo(data.peer_id, 'peerAction', data);
        });

        socket.on('setPresenterRole', async (dataObject) => {
            if (!roomExists(socket)) return;

            const data = checkXSS(dataObject);

            if (!Validator.isValidData(data)) return;

            // Only an existing presenter can grant or revoke the presenter role
            const isPresenter = isPeerPresenter(socket.room_id, socket.id, data.from_peer_name, data.from_peer_uuid);
            if (!isPresenter) return;

            const room = getRoom(socket);
            if (!room) return;

            const targetPeer = room.getPeer(data.peer_id);
            if (!targetPeer) return;

            const grant = data.action === 'grant';

            // A presenter defined in the host configuration cannot be demoted at runtime
            if (!grant && hostCfg?.presenters?.list?.includes(targetPeer.peer_name)) {
                log.debug('setPresenterRole - cannot revoke a configured presenter', {
                    peer_name: targetPeer.peer_name,
                });
                return;
            }

            if (!(socket.room_id in presenters)) presenters[socket.room_id] = {};

            if (grant) {
                presenters[socket.room_id][data.peer_id] = {
                    peer_ip: targetPeer.peer_info?.peer_ip || '',
                    peer_name: targetPeer.peer_name,
                    peer_uuid: targetPeer.peer_uuid,
                    is_presenter: true,
                };
            } else if (presenters[socket.room_id]) {
                delete presenters[socket.room_id][data.peer_id];
            }

            targetPeer.updatePeerInfo({ type: 'presenter', status: grant });

            log.debug('setPresenterRole', {
                room_id: socket.room_id,
                from: data.from_peer_name,
                target: targetPeer.peer_name,
                grant: grant,
            });

            // Notify everyone (including the target and the sender) to refresh roles/UI
            room.sendToAll('setPresenterRole', {
                peer_id: data.peer_id,
                peer_name: targetPeer.peer_name,
                is_presenter: grant,
                from_peer_name: data.from_peer_name,
            });
        });

        socket.on('updatePeerInfo', (dataObject) => {
            if (!roomExists(socket)) return;

            const { room, peer } = getRoomAndPeer(socket);

            if (!peer) return;

            const data = checkXSS(dataObject);

            if (!Validator.isValidData(data)) return;
            if (data.type === 'name') {
                const name = String(data.status || '').trim();
                if (!name || name.length > 32) return;
                data.status = name;
                data.peer_name = name;
                data.peer_id = socket.id;
                data.peer_presenter = peer.peer_info.peer_presenter;
            }

            peer.updatePeerInfo(data);

            if (data.broadcast) {
                log.debug('updatePeerInfo broadcast data');
                room.broadCast(socket.id, 'updatePeerInfo', data);
            }
        });

        socket.on('updateRoomModerator', (dataObject) => {
            if (!roomExists(socket)) return;

            const data = checkXSS(dataObject);

            if (!Validator.isValidData(data)) return;

            const room = getRoom(socket);

            const isPresenter = isPeerPresenter(socket.room_id, socket.id, data.peer_name, data.peer_uuid);

            if (!isPresenter) return;

            const moderator = data.moderator;

            room.updateRoomModerator(moderator);

            switch (moderator.type) {
                case 'video_start_privacy':
                case 'audio_start_muted':
                case 'video_start_hidden':
                case 'audio_cant_unmute':
                case 'video_cant_unhide':
                case 'screen_cant_share':
                case 'chat_cant_privately':
                case 'chat_cant_publicly':

                default:
                    break;
            }
        });

        socket.on('updateRoomModeratorALL', (dataObject) => {
            if (!roomExists(socket)) return;

            const data = checkXSS(dataObject);

            if (!Validator.isValidData(data)) return;

            const room = getRoom(socket);

            const isPresenter = isPeerPresenter(socket.room_id, socket.id, data.peer_name, data.peer_uuid);

            if (!isPresenter) return;

            const moderator = data.moderator;

            room.updateRoomModeratorALL(moderator);

            room.broadCast(socket.id, 'updateRoomModeratorALL', moderator);
        });

        socket.on('followMe', (dataObject) => {
            if (!roomExists(socket)) return;

            const data = checkXSS(dataObject);

            if (!Validator.isValidData(data)) return;

            const room = getRoom(socket);

            const isPresenter = isPeerPresenter(socket.room_id, socket.id, data.peer_name, data.peer_uuid);

            if (!isPresenter) return;

            log.debug('Follow me', data);

            switch (data.action) {
                case 'toggle':
                    room.setFollowMe(data.status ? { enabled: true, peerId: null, action: null } : null);
                    break;
                case 'pin':
                case 'focus':
                    room.setFollowMe({ enabled: true, peerId: data.peerId, action: data.action });
                    break;
                case 'unpin':
                case 'unfocus':
                    room.setFollowMe({ enabled: true, peerId: null, action: null });
                    break;
                default:
                    break;
            }

            room.broadCast(socket.id, 'followMe', data);
        });

        socket.on('getRoomInfo', async (_, cb) => {
            if (!roomExists(socket)) {
                return cb({ error: 'Room not found' });
            }

            const { room, peer } = getRoomAndPeer(socket);

            const { peer_name } = peer || 'undefined';

            log.debug('Send Room Info to', peer_name);

            cb(room.toJson());
        });

        socket.on('fileInfo', (dataObject) => {
            if (!roomExists(socket)) return;

            const data = checkXSS(dataObject);

            if (!Validator.isValidData(data)) return;

            if (!isValidFileName(data.fileName)) {
                log.debug('File name not valid', data);
                return;
            }

            log.debug('Send File Info', data);

            const room = getRoom(socket);

            data.broadcast ? room.broadCast(socket.id, 'fileInfo', data) : room.sendTo(data.peer_id, 'fileInfo', data);
        });

        socket.on('file', (data) => {
            if (!roomExists(socket)) return;

            const room = getRoom(socket);

            data.broadcast ? room.broadCast(socket.id, 'file', data) : room.sendTo(data.peer_id, 'file', data);
        });

        socket.on('fileAbort', (dataObject) => {
            if (!roomExists(socket)) return;

            const data = checkXSS(dataObject);

            if (!Validator.isValidData(data)) return;

            const room = getRoom(socket);

            room.broadCast(socket.id, 'fileAbort', data);
        });

        socket.on('receiveFileAbort', (dataObject) => {
            if (!roomExists(socket)) return;

            const data = checkXSS(dataObject);

            if (!Validator.isValidData(data)) return;

            const room = getRoom(socket);

            room.broadCast(socket.id, 'receiveFileAbort', data);
        });

        // Video drawing overlay: relay batched drawing strokes to all peers in the room

        socket.on('setVideoOff', (dataObject) => {
            if (!roomExists(socket)) return;

            const data = checkXSS(dataObject);

            if (!Validator.isValidData(data)) return;

            log.debug('Video off data', data.peer_name);

            const { room, peer } = getRoomAndPeer(socket);

            // Persist peer_video=false so new participants joining later

            if (peer) peer.updatePeerInfo({ type: 'video', status: false });

            room.broadCast(socket.id, 'setVideoOff', data);
        });

        socket.on('recordingAction', async (dataObject) => {
            if (!roomExists(socket)) return;

            const data = checkXSS(dataObject);

            if (!Validator.isValidData(data)) return;

            const room = getRoom(socket);

            // Resolve sender from server-side state — never trust client-supplied identity
            const peer = room.getPeer(socket.id);
            if (!peer) return;

            // If host-only recording is enabled, only the presenter may broadcast recording state
            if (room.isHostOnlyRecording()) {
                const isPresenter = isPeerPresenter(
                    socket.room_id,
                    socket.id,
                    peer.peer_info?.peer_name,
                    peer.peer_info?.peer_uuid
                );
                if (!isPresenter) return;
            }

            // Override client-supplied identity with server-side values to prevent spoofing
            data.peer_name = peer.peer_info?.peer_name;
            data.peer_id = socket.id;

            log.debug('Recording action', data);

            room.broadCast(socket.id, 'recordingAction', data);
        });

        socket.on('refreshParticipantsCount', () => {
            if (!roomExists(socket)) return;

            const room = getRoom(socket);

            const peerCounts = room.getPeersCount();

            const data = {
                room_id: socket.room_id,
                peer_counts: peerCounts,
            };
            log.debug('Refresh Participants count', data);
            room.broadCast(socket.id, 'refreshParticipantsCount', data);
        });

        socket.on('disconnect', (reason) => {
            const recoverable = ['transport close', 'transport error', 'ping timeout'].includes(reason);
            const disconnectedPeer = socket.room_id && roomList.get(socket.room_id)?.getPeer(socket.id);
            log.info('[Recovery] socket disconnected', {
                socket_id: socket.id,
                room_id: socket.room_id || null,
                reason,
                recoverable,
                peer_present: Boolean(socket.room_id && roomList.get(socket.room_id)?.getPeer(socket.id)),
            });
            const cleanup = () => {
                if (!roomExists(socket)) {
                    // Clean up socket listeners even if room doesn't exist
                    socket.removeAllListeners();
                    return;
                }

                const { room, peer } = getRoomAndPeer(socket);
                if (!peer || peer !== disconnectedPeer) {
                    // A newer admission already replaced this disconnected tab peer.
                    socket.room_id = null;
                    socket.removeAllListeners();
                    return;
                }

                const { peer_name, peer_uuid } = peer || {};

                const isPresenter = isPeerPresenter(socket.room_id, socket.id, peer_name, peer_uuid);

                log.debug('[Disconnect] - peer name', { peer_name, reason });

                room.removePeer(socket.id);

                room.broadCast(socket.id, 'removeMe', removeMeData(room, peer_name, isPresenter));

                // Clean up this peer's presenter entry immediately
                if (socket.room_id in presenters && socket.id in presenters[socket.room_id]) {
                    delete presenters[socket.room_id][socket.id];
                }

                const fallbackPresenter = assignFallbackPresenter(
                    socket.room_id,
                    room,
                    presenters,
                    hostCfg?.presenters?.join_first
                );
                if (fallbackPresenter) {
                    log.info('[Disconnect] - assigned fallback presenter', {
                        room_id: socket.room_id,
                        peer_id: fallbackPresenter.id,
                        peer_name: fallbackPresenter.peer_name,
                    });
                }

                if (room.getPeersCount() === 0) {
                    //

                    roomList.delete(socket.room_id);

                    delete presenters[socket.room_id];

                    log.debug('[Disconnect] - Last peer - current presenters grouped by roomId', presenters);
                }

                removeIP(socket);

                socket.room_id = null;

                // Clean up all socket event listeners to prevent memory leaks
                socket.removeAllListeners();
            };

            if (recoverable) {
                recoveryGrace.defer(socket, cleanup);
                return;
            }
            recoveryGrace.cancel(socket.id);
            cleanup();
        });

        socket.on('exitRoom', (_, callback) => {
            if (!roomExists(socket)) {
                return callback({
                    error: 'Not currently in a room',
                });
            }

            const { room, peer } = getRoomAndPeer(socket);

            const { peer_name, peer_uuid } = peer || {};

            const isPresenter = isPeerPresenter(socket.room_id, socket.id, peer_name, peer_uuid);

            log.debug('Exit room', peer_name);

            room.removePeer(socket.id);

            room.broadCast(socket.id, 'removeMe', removeMeData(room, peer_name, isPresenter));

            // Clean up this peer's presenter entry immediately
            if (socket.room_id in presenters && socket.id in presenters[socket.room_id]) {
                delete presenters[socket.room_id][socket.id];
            }

            const fallbackPresenter = assignFallbackPresenter(
                socket.room_id,
                room,
                presenters,
                hostCfg?.presenters?.join_first
            );
            if (fallbackPresenter) {
                log.info('[REMOVE ME] - assigned fallback presenter', {
                    room_id: socket.room_id,
                    peer_id: fallbackPresenter.id,
                    peer_name: fallbackPresenter.peer_name,
                });
            }

            if (room.getPeersCount() === 0) {
                //

                roomList.delete(socket.room_id);

                delete presenters[socket.room_id];

                log.debug('[REMOVE ME] - Last peer - current presenters grouped by roomId', presenters);
            }

            removeIP(socket);

            socket.room_id = null;

            callback('Successfully exited room');
        });

        // Helpers

        function getRoomAndPeer(socket) {
            const room = getRoom(socket);

            const peer = getPeer(socket);

            return { room, peer };
        }

        function getRoom(socket) {
            return roomList.get(socket.room_id) || null;
        }

        function getPeer(socket) {
            const room = getRoom(socket); // Reusing getRoom to retrieve the room

            return room.getPeer ? room.getPeer(socket.id) || null : null;
        }

        function roomExists(socket) {
            return roomList.has(socket.room_id);
        }

        // Security: block lobby-waiting peers from WebRTC/media handlers.
        function isPeerInLobby(peer) {
            return Boolean(peer && peer.peer_lobby === true);
        }

        function getPeerInfo(peer) {
            if (!peer || !peer.peer_info) {
                return {
                    peer_name: peer?.peer_name || 'Unknown',
                    isDesktop: false,
                    os: 'Unknown',
                    browser: 'Unknown',
                };
            }

            const { peer_name, peer_info } = peer;
            const { is_desktop_device, os_name, os_version, browser_name, browser_version } = peer_info;

            return {
                peer_name: peer_name || 'Unknown',
                isDesktop: Boolean(is_desktop_device),
                os: os_name && os_version ? `${os_name} ${os_version}` : os_name || 'Unknown',
                browser:
                    browser_name && browser_version ? `${browser_name} ${browser_version}` : browser_name || 'Unknown',
            };
        }

        function isValidFileName(fileName) {
            const invalidChars = /[\\\/\?\*\|:"<>]/;
            return !invalidChars.test(fileName);
        }

        function isValidHttpURL(input) {
            try {
                const url = new URL(input);
                return url.protocol === 'http:' || url.protocol === 'https:';
            } catch (_) {
                return false;
            }
        }

        function removeMeData(room, peerName, isPresenter) {
            const roomId = room && socket.room_id;
            const peerCounts = room && room.getPeersCount();
            const data = {
                room_id: roomId,
                peer_id: socket.id,
                peer_name: peerName,
                peer_counts: peerCounts,
                isPresenter: isPresenter,
            };
            log.debug('Peer removed from the room', data);
            return data;
        }
    });

    function bytesToSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    function clone(value) {
        if (value === undefined) return undefined;
        if (Number.isNaN(value)) return NaN;
        if (typeof structuredClone === 'function') return structuredClone(value);
        return JSON.parse(JSON.stringify(value));
    }

    function isPeerPresenter(room_id, peer_id, peer_name, peer_uuid) {
        try {
            // 1. Direct lookup by peer_id (server-assigned socket.id — not user-controlled)
            const storedPresenter = presenters[room_id]?.[peer_id];
            if (storedPresenter) {
                const isPresenter =
                    storedPresenter.peer_name === peer_name &&
                    storedPresenter.peer_uuid === peer_uuid &&
                    storedPresenter.is_presenter === true;

                log.debug('isPeerPresenter Check (stored)', {
                    room_id: room_id,
                    peer_id: peer_id,
                    peer_name: peer_name,
                    peer_uuid: peer_uuid,
                    isPresenter: isPresenter,
                });

                return isPresenter;
            }

            // 2. Static presenter list — verify against server-side registered name, not user input
            const room = roomList.get(room_id);
            const peer = room?.getPeer(peer_id);
            if (isNamedPresenter(peer, hostCfg?.presenters?.list)) {
                log.debug('isPeerPresenter Check (static list)', {
                    room_id: room_id,
                    peer_id: peer_id,
                    peer_name: peer.peer_info.peer_name,
                    isPresenter: true,
                });
                return true;
            }

            // 3. Not a presenter
            log.debug('isPeerPresenter Check (denied)', {
                room_id: room_id,
                peer_id: peer_id,
                peer_name: peer_name,
                peer_uuid: peer_uuid,
                isPresenter: false,
            });

            return false;
        } catch (err) {
            log.error('isPeerPresenter Check error', err);
            return false;
        }
    }

    async function isAuthPeer(username, password) {
        if (!Validator.isValidPassword(password)) {
            return false;
        }

        if (hostCfg.users_from_db && hostCfg.users_api_endpoint) {
            try {
                // Using either email or username, as the username can also be an email here.
                const response = await axios.post(
                    hostCfg.users_api_endpoint,
                    {
                        email: username,
                        username: username,
                        password: password,
                        api_secret_key: hostCfg.users_api_secret_key,
                    },
                    {
                        timeout: 5000, // Timeout set to 5 seconds (5000 milliseconds)
                    }
                );
                return response.data && response.data.message === true;
            } catch (error) {
                log.error('AXIOS isAuthPeer error', error.message);
                return false;
            }
        } else {
            return (
                hostCfg.users && hostCfg.users.some((user) => user.username === username && user.password === password)
            );
        }
    }

    async function isValidToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, jwtCfg.JWT_KEY, (err, decoded) => {
                if (err) {
                    // Token is invalid
                    resolve(false);
                } else {
                    // Token is valid
                    resolve(true);
                }
            });
        });
    }

    function decodeToken(jwtToken) {
        if (!jwtToken) return null;

        // Verify and decode the JWT token
        const decodedToken = jwt.verify(jwtToken, jwtCfg.JWT_KEY);
        if (!decodedToken || !decodedToken.data) {
            throw new Error('Invalid token');
        }

        // Decrypt the payload using AES decryption
        const decryptedPayload = CryptoJS.AES.decrypt(decodedToken.data, jwtCfg.JWT_KEY).toString(CryptoJS.enc.Utf8);

        // Parse the decrypted payload as JSON
        const payload = JSON.parse(decryptedPayload);

        return payload;
    }

    async function isRoomAllowedForUser(message, username, room) {
        if (!username || !room) {
            log.debug('isRoomAllowedForUser - missing username or room', { username, room });
            return false;
        }

        const logData = { message, username, room };
        log.debug('isRoomAllowedForUser ------>', logData);

        try {
            if (hostCfg.protected || hostCfg.user_auth) {
                // Check API first if configured
                if (hostCfg.users_from_db && hostCfg.users_api_room_allowed) {
                    try {
                        const response = await axios.post(
                            hostCfg.users_api_room_allowed,
                            {
                                email: username,
                                username: username,
                                room: room,
                                api_secret_key: hostCfg.users_api_secret_key,
                            },
                            {
                                timeout: hostCfg.users_api_timeout || 5000,
                            }
                        );

                        if (response.data && (response.data === true || response.data.message === true)) {
                            log.debug('AXIOS isRoomAllowedForUser - allowed access', { room, username });
                            return true;
                        }
                        log.debug('AXIOS isRoomAllowedForUser - denied access', { room, username });
                        return false;
                    } catch (error) {
                        log.error('AXIOS isRoomAllowedForUser - check failed', error.message);
                        // Fail closed (deny access) if API check fails
                        return false;
                    }
                }

                // Check presenter list
                if (hostCfg?.presenters?.list?.includes(username)) {
                    log.debug('isRoomAllowedForUser - User in presenters list', { username });
                    return true;
                }

                // Find user in configuration
                const user = hostCfg.users?.find((u) => u.displayname === username || u.username === username);

                if (!user) {
                    log.debug('isRoomAllowedForUser - User not found in configuration', { username });
                    return false;
                }

                // Check allowed rooms
                const isAllowed =
                    !user.allowed_rooms || user.allowed_rooms.includes('*') || user.allowed_rooms.includes(room);

                log.debug(
                    isAllowed ? 'isRoomAllowedForUser - Room allowed' : 'isRoomAllowedForUser - Room not allowed',
                    { room, username }
                );
                return isAllowed;
            }

            log.debug('isRoomAllowedForUser - No protection enabled, allowing access', { room, username });
            return true;
        } catch (error) {
            log.error('isRoomAllowedForUser - Unexpected error', error);
            return false; // Fail closed
        }
    }

    function getIP(req) {
        // Security: only trust X-Forwarded-For when behind a trusted reverse proxy.
        const forwarded = trustProxy ? req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'] : null;
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return req.socket.remoteAddress || req.ip;
    }

    function getIpSocket(socket) {
        // Security: only trust X-Forwarded-For when behind a trusted reverse proxy.
        const forwarded = trustProxy
            ? socket.handshake.headers['x-forwarded-for'] || socket.handshake.headers['X-Forwarded-For']
            : null;
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return socket.handshake.address;
    }

    function updateHostAuthenticatedFlag() {
        hostCfg.authenticated = !hostCfg.protected || authHost.getAuthorizedIPs().length > 0;
    }

    function allowedIP(ip) {
        const authorizedIPs = authHost.getAuthorizedIPs();
        const authorizedIP = authHost.isAuthorizedIP(ip);
        log.debug('Allowed IPs', {
            ip: ip,
            authorizedIP: authorizedIP,
            authorizedIPs: authorizedIPs,
        });
        return authHost != null && authorizedIP;
    }

    function removeIP(socket) {
        if (hostCfg.protected) {
            const ip = getIpSocket(socket);
            if (ip && allowedIP(ip)) {
                authHost.deleteIP(ip);
                hostCfg.authenticated = false;
                log.debug('Remove IP from auth', {
                    removedIp: ip,
                    authorizedIps: authHost.getAuthorizedIPs(),
                });
            }
        }
    }
}

// ####################################################
// AUTHENTICATION HELPERS
// ####################################################

// ####################################################
// GRACEFUL SHUTDOWN HANDLERS
// ####################################################

let isShuttingDown = false;

async function gracefulShutdown(signal) {
    if (isShuttingDown) {
        log.warn(`${signal} received again, forcing exit...`);
        process.exit(1);
    }

    isShuttingDown = true;
    log.info(`${signal} received, starting graceful shutdown...`);

    try {
        // 1. Stop accepting new connections
        log.debug('Closing HTTP server...');
        server.close(() => {
            log.info('HTTP server closed');
        });

        // 2. Close all active rooms and notify peers
        log.debug(`Closing ${roomList.size} active rooms...`);
        for (const [roomId, room] of roomList.entries()) {
            try {
                // Notify all peers in the room
                room.sendToAll('serverShutdown', { message: 'Server is shutting down' });

                // Remove all peers from the room
                const peers = room.getPeers();
                for (const [peerId] of peers) {
                    room.removePeer(peerId);
                }

                roomList.delete(roomId);
            } catch (err) {
                log.error(`Error closing room ${roomId}:`, err.message);
            }
        }

        // 4. Disconnect all Socket.IO clients
        log.debug('Disconnecting all Socket.IO clients...');
        const sockets = await io.fetchSockets();
        for (const socket of sockets) {
            socket.disconnect(true);
        }

        // 5. Close Socket.IO server
        log.debug('Closing Socket.IO server...');
        io.close();

        // 6. Close all mediasoup workers
        log.debug(`Closing ${workers.length} mediasoup workers...`);
        for (const worker of workers) {
            try {
                worker.close();
            } catch (err) {
                log.error('Error closing mediasoup worker:', err.message);
            }
        }

        // 7. Cleanup HTML injector
        log.debug('Cleaning up HTML injector...');
        await Promise.all([htmlInjector.cleanup(), clientDiagnostics?.close()]);

        log.info('Graceful shutdown completed successfully');
        process.exit(0);
    } catch (err) {
        log.error('Error during graceful shutdown:', err.message);
        process.exit(1);
    }
}

// Set a timeout for forced shutdown if graceful shutdown takes too long
function forceShutdown(signal) {
    setTimeout(() => {
        log.error(`Graceful shutdown timeout exceeded, forcing exit...`);
        process.exit(1);
    }, 30000); // 30 seconds timeout
}

process.on('SIGINT', () => {
    log.debug('PROCESS', 'SIGINT');
    forceShutdown('SIGINT');
    gracefulShutdown('SIGINT');
});

process.on('SIGTERM', () => {
    log.debug('PROCESS', 'SIGTERM');
    forceShutdown('SIGTERM');
    gracefulShutdown('SIGTERM');
});

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
    log.error('Uncaught Exception:', err);
    forceShutdown('uncaughtException');
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    log.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit on unhandled rejection, just log it
});
