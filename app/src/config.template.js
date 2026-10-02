'use strict';

/**
 * ==============================================
 * MiroTalk SFU v2.4.71 - Configuration File
 * ==============================================
 *
 * This file contains all configurable settings for the MiroTalk SFU application.
 * Environment variables can override most settings (see each section for details).
 *
 * Structure:
 * 1. Core System Configuration
 * 2. Server Settings
 * 3. Media Handling
 * 4. Security & Authentication
 * 5. API Configuration
 * 6. Third-Party Integrations
 * 7. UI/UX Customization
 * 8. Feature Flags
 * 9. Mediasoup (WebRTC) Settings
 */

const dotenv = require('dotenv').config();
const packageJson = require('../../package.json');
const os = require('os');
const fs = require('fs');
const splitChar = ',';

// ==============================================
// 1. Environment Detection & System Configuration
// ==============================================

const PLATFORM = os.platform();
const IS_DOCKER = fs.existsSync('/.dockerenv');
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const ANNOUNCED_IP = process.env.SFU_ANNOUNCED_IP || '';
const LISTEN_IP = process.env.SFU_LISTEN_IP || '0.0.0.0';
const IPv4 = getIPv4();

// ==============================================
// 2. WebRTC Port Configuration
// ==============================================

const RTC_MIN_PORT = parseInt(process.env.SFU_MIN_PORT) || 40000;
const RTC_MAX_PORT = parseInt(process.env.SFU_MAX_PORT) || 40100;
const NUM_CPUS = os.cpus().length;
const NUM_WORKERS = Math.min(process.env.SFU_NUM_WORKERS || NUM_CPUS, NUM_CPUS);

// ==============================================
// 3. FFmpeg Path Configuration
// ==============================================

// ==============================================
// Main Configuration Export
// ==============================================

module.exports = {
    // ==============================================
    // 1. Core System Configuration
    // ==============================================

    system: {
        /**
         * System Information
         * ------------------
         * - Hardware/OS details collected automatically
         * - Used for diagnostics and optimization
         */
        info: {
            environment: ENVIRONMENT,
            os: {
                type: os.type(),
                release: os.release(),
                arch: os.arch(),
            },
            cpu: {
                cores: NUM_CPUS,
                model: os.cpus()[0].model,
            },
            memory: {
                total: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            },
            isDocker: IS_DOCKER,
        },

        /**
         * Console Configuration
         * ---------------------
         * - timeZone: IANA timezone (e.g., 'Europe/Rome')
         * - debug: Enable debug logging in non-production
         * - colors: Colorized console output
         * - json: Log output in JSON format
         * - json_pretty: Pretty-print JSON logs
         */
        console: {
            timeZone: 'UTC',
            debug: ENVIRONMENT !== 'production',
            json: process.env.LOGS_JSON === 'true',
            json_pretty: process.env.LOGS_JSON_PRETTY === 'true',
            colors: process.env.LOGS_JSON === 'true' ? false : true,
        },

        /**
         * External Services Configuration
         * -------------------------------
         * - ip: Services to detect public IP address
         */
        services: {
            ip: ['http://api.ipify.org', 'http://ipinfo.io/ip', 'http://ifconfig.me/ip'],
        },
    },

    // ==============================================
    // 2. Server Configuration
    // ==============================================

    server: {
        /**
         * Host Configuration
         * ------------------
         * - hostUrl: Public URL (e.g., 'https://yourdomain.com')
         * - listen: IP and port to bind to
         */
        hostUrl: process.env.SERVER_HOST_URL || 'https://localhost:3010',
        listen: {
            ip: process.env.SERVER_LISTEN_IP || '0.0.0.0',
            port: process.env.SERVER_LISTEN_PORT || 3010,
        },

        /**
         * Security Settings
         * -----------------
         * - trustProxy: Trust X-Forwarded-* headers
         * - ssl: SSL certificate paths
         * - cors: Cross-origin resource sharing
         */
        trustProxy: process.env.TRUST_PROXY === 'true',
        ssl: {
            cert: process.env.SERVER_SSL_CERT || '../ssl/cert.pem',
            key: process.env.SERVER_SSL_KEY || '../ssl/key.pem',
        },
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST'],
        },

        /**
         * Embed (iframe) Restrictions
         * ---------------------------
         * Controls which origins are allowed to embed MiroTalk SFU in an <iframe>
         * via the HTTP `Content-Security-Policy: frame-ancestors` header
         * (also mirrored to `X-Frame-Options` when possible for legacy browsers).
         *
         * Behavior:
         * - Empty / unset  → header NOT set, embedding allowed anywhere (default).
         * - 'none'         → block ALL embedding (frame-ancestors 'none' + X-Frame-Options: DENY).
         * - 'self'         → only same-origin embedding (frame-ancestors 'self' + X-Frame-Options: SAMEORIGIN).
         * - list           → comma-separated origins, 'self' is always implicitly included.
         *                    Wildcards like https://*.example.com are valid in CSP.
         *
         * Sites embedding the retained meeting page must be listed here.
         */
        embed: {
            allowedOrigins: process.env.ALLOWED_EMBED_ORIGINS
                ? process.env.ALLOWED_EMBED_ORIGINS.split(',')
                      .map((o) => o.trim())
                      .filter(Boolean)
                : [],
        },
    },

    // ==============================================
    // 3. Media Handling Configuration
    // ==============================================

    media: {},

    // ==============================================
    // 4. Security & Authentication
    // ==============================================

    security: {
        /**
         * IP Whitelisting
         * ------------------------
         * - enabled: Restrict access to specified IPs
         * - allowedIPs: Array of permitted IP addresses
         */
        middleware: {
            IpWhitelist: {
                enabled: process.env.IP_WHITELIST_ENABLED === 'true',
                allowedIPs: process.env.IP_WHITELIST_ALLOWED
                    ? process.env.IP_WHITELIST_ALLOWED.split(splitChar)
                          .map((ip) => ip.trim())
                          .filter((ip) => ip !== '')
                    : ['127.0.0.1', '::1'],
            },
        },

        /**
         * JWT Configuration
         * ------------------------
         * - key: Secret for JWT signing
         * - exp: Token expiration time
         */
        jwt: {
            key: process.env.JWT_SECRET || 'mirotalksfu_jwt_secret',
            exp: process.env.JWT_EXPIRATION || '1h',
        },

        /**
         * Host Protection Configuration
         * ============================
         * Controls access to host-level functionality and room management.
         *
         * Authentication Methods:
         * ----------------------
         * - Local users (defined in config or via HOST_USERS env variable)
         * - API/database validation (users_from_db=true)
         *
         * Core Settings:
         * --------------
         * - protected      : Enable/disable host protection globally
         * - user_auth      : Require user authentication for host access
         * - users_from_db  : Fetch users from API/database instead of local config
         *
         * API Integration:
         * ---------------
         * - users_api_secret_key    : Secret key for API authentication
         * - users_api_endpoint      : Endpoint to validate user credentials
         * - users_api_room_allowed  : Endpoint to check if user can access a room
         * - users_api_rooms_allowed : Endpoint to get allowed rooms for a user
         * - api_room_exists         : Endpoint to verify if a room exists
         *
         * Local User Configuration:
         * ------------------------
         * - users: Array of authorized users (used if users_from_db=false)
         *   - Define via HOST_USERS env variable:
         *     HOST_USERS=username:password:displayname:room1,room2|username2:password2:displayname2:*
         *     (Each user separated by '|', fields by ':', allowed_rooms comma-separated or '*' for all)
         *   - If HOST_USERS is not set, falls back to DEFAULT_USERNAME, DEFAULT_PASSWORD, etc.
         *   - Fields:
         *     - username      : Login username
         *     - password      : Login password
         *     - displayname   : User's display name
         *     - allowed_rooms : List of rooms user can access ('*' for all)
         *
         * Presenter Management:
         * --------------------
         * - list        : Array of usernames who can be presenters.
         *                 WARNING: with no auth provider enabled (protected / user_auth),
         *                 the display name is unverified client input, so each entry acts as a
         *                 shared secret. Use unique, non-guessable values (never a real name or
         *                 email) or anyone who guesses it becomes presenter. Empty by default.
         * - join_first  : First joiner becomes presenter; when the last presenter leaves,
         *                 promote the first admitted participant (default: true)
         *
         * Documentation:
         * -------------
         * https://docs.mirotalk.com/mirotalk-sfu/host-protection/
         */
        host: {
            protected: process.env.HOST_PROTECTED === 'true',
            user_auth: process.env.HOST_USER_AUTH === 'true',

            users_from_db: process.env.HOST_USERS_FROM_DB === 'true',
            users_api_secret_key: process.env.USERS_API_SECRET || 'mirotalkweb_default_secret',
            users_api_endpoint: process.env.USERS_API_ENDPOINT || 'http://localhost:9000/api/v1/user/isAuth', // 'https://webrtc.mirotalk.com/api/v1/user/isAuth'
            users_api_room_allowed:
                process.env.USERS_ROOM_ALLOWED_ENDPOINT || 'http://localhost:9000/api/v1/user/isRoomAllowed', // 'https://webrtc.mirotalk.com/api/v1/user/isRoomAllowed'
            users_api_rooms_allowed:
                process.env.USERS_ROOMS_ALLOWED_ENDPOINT || 'http://localhost:9000/api/v1/user/roomsAllowed', // 'https://webrtc.mirotalk.com/api/v1/user/roomsAllowed'
            api_room_exists: process.env.ROOM_EXISTS_ENDPOINT || 'http://localhost:9000/api/v1/room/exists', // 'https://webrtc.mirotalk.com//api/v1/room/exists'

            users: process.env.HOST_USERS
                ? process.env.HOST_USERS.split('|').map((userStr) => {
                      const [username, password, displayname, allowedRoomsStr] = userStr.split(':');
                      return {
                          username: username || '',
                          password: password || '',
                          displayname: displayname || '',
                          allowed_rooms: allowedRoomsStr
                              ? allowedRoomsStr
                                    .split(',')
                                    .map((room) => room.trim())
                                    .filter((room) => room !== '')
                              : ['*'],
                      };
                  })
                : [
                      {
                          username: 'username',
                          password: 'password',
                          displayname: 'username displayname',
                          allowed_rooms: ['*'],
                      },
                      {
                          username: 'username2',
                          password: 'password2',
                          displayname: 'username2 displayname',
                          allowed_rooms: ['room1', 'room2'],
                      },
                      {
                          username: 'username3',
                          password: 'password3',
                          displayname: 'username3 displayname',
                      },
                      //...
                  ],

            presenters: {
                list: process.env.PRESENTERS
                    ? process.env.PRESENTERS.split(splitChar)
                          .map((presenter) => presenter.trim())
                          .filter((presenter) => presenter !== '')
                    : [], // Empty by default: a shipped name is a public credential. Set PRESENTERS to unique, non-guessable values.
                join_first: process.env.PRESENTER_JOIN_FIRST !== 'false',
            },
        },
    },

    // ==============================================
    // 5. API Configuration
    // ==============================================

    /**
     * API Security & Endpoint Configuration
     * ====================================
     * Controls access to the SFU's API endpoints and integration settings.
     *
     * Security Settings:
     * -----------------
     * - keySecret : Authentication secret for API requests
     *               (Always override default in production)
     *
     * Retained endpoints:
     * -------------------
     * - join       : Issue a room-bound participant URL for the Bodrik backend.
     * - meetingEnd : Terminate an authoritative conference target.
     */
    api: {
        keySecret: process.env.API_KEY_SECRET,
        allowed: {
            meetingEnd: process.env.API_ALLOW_MEETING_END === 'true',
            join: process.env.API_ALLOW_JOIN !== 'false',
        },
    },

    // ==============================================
    // 6. UI/UX Customization
    // ==============================================

    ui: {
        /**
         * Branding & Appearance Configuration
         * -----------------------------------
         * Controls all aspects of the application's visual identity, content, and metadata.
         * Supports environment variable overrides for deployment-specific customization.
         *
         * ==============================================
         * LICENSE REQUIRED:
         * ==============================================
         * - https://codecanyon.net/item/mirotalk-sfu-webrtc-realtime-video-conferences/40769970
         */

        brand: {
            htmlInjection: process.env.BRAND_HTML_INJECTION !== 'false',

            app: {
                language: 'ru',
                translationMode: 'native', // Bodrik FM provides only human-maintained Russian and English.
                name: process.env.APP_NAME || 'MiroTalk SFU',
            },

            /**
             * Website Configuration
             * --------------------
             * Site-wide settings including icons and page-specific content.
             */
            site: {
                title: process.env.SITE_TITLE || 'MiroTalk SFU - Open Source WebRTC Video Conferencing',
                icon: process.env.SITE_ICON_PATH || '../images/logo.svg',
                appleTouchIcon: process.env.APPLE_TOUCH_ICON_PATH || '../images/logo.svg',
            },

            /**
             * SEO Metadata
             * ------------
             * Search engine optimization elements.
             */
            meta: {
                description:
                    process.env.META_DESCRIPTION ||
                    'Build your own Zoom alternative with MiroTalk SFU, an open-source, self-hosted WebRTC platform powered by Mediasoup for scalable video meetings.',
                keywords: process.env.META_KEYWORDS || 'webrtc, video calls, conference, screen sharing, mirotalk, sfu',
            },

            /**
             * OpenGraph/Social Media
             * ---------------------
             * Metadata for rich social media sharing.
             */
            og: {
                type: process.env.OG_TYPE || 'app-webrtc',
                siteName: process.env.OG_SITE_NAME || 'MiroTalk SFU',
                title: process.env.OG_TITLE || 'MiroTalk SFU - Open Source WebRTC Video Conferencing',
                description:
                    process.env.OG_DESCRIPTION ||
                    'Build your own Zoom alternative with MiroTalk SFU, an open-source self-hosted WebRTC video conferencing platform powered by Mediasoup. Host scalable meetings, webinars, classrooms, screen sharing and real-time collaboration.',
                image: process.env.OG_IMAGE_URL || 'https://sfu.mirotalk.com/images/mirotalksfu.png',
                url: process.env.OG_URL || 'https://sfu.mirotalk.com',
            },

            /**
             * Who Are You? Section
             * ---------------------
             * Prompts users to identify themselves before joining a room.
             * Customizable text and button labels.
             */

            /** About dialog for the meeting, with the deployed source revision. */
            about: {
                sourceRevision: process.env.MIROTALK_SOURCE_REVISION || '',
                version: packageJson.version,
            },

            //...
        },

        /**
         * Theme definitions — CSS custom properties for each theme.
         * Admins can override individual themes or add new ones.
         * The client merges these with built-in defaults, so you
         * only need to specify the properties you want to change.
         */
        themes: {
            /* Example: override default theme background
            default: {
                '--body-bg': 'linear-gradient(135deg, #1a1a2e, #0a0a14)',
                '--msger-bg': 'linear-gradient(135deg, #1a1a2e, #0a0a14)',
            },
            */
            /* Example: add a custom theme
            ocean: {
                '--body-bg': 'linear-gradient(135deg, #0d2137, #061220)',
                '--trx-bg': 'linear-gradient(135deg, #0d2137, #061220)',
                '--msger-bg': 'linear-gradient(135deg, #0d2137, #061220)',
                '--left-msg-bg': '#112d4a',
                '--right-msg-bg': '#0a1f35',
                '--private-msg-bg': '#0e2540',
                '--select-bg': '#0f2a45',
                '--select-focus-color': 'rgba(56, 189, 248, 0.5)',
                '--tab-btn-active': '#163d5e',
                '--settings-bg': 'linear-gradient(135deg, #0d2137, #061220)',
                '--btns-bg-color': 'rgba(6, 18, 32, 0.75)',
                '--dd-color': '#38BDF8',
            },
            */
        },

        /**
         * UI Button Configuration
         * ---------------------
         * Organized by component/functionality area
         */
        buttons: {
            // Popup Configuration
            popup: {
                shareRoomPopup: process.env.SHOW_SHARE_ROOM_POPUP !== 'false',
            },
            // Main control buttons visible in the UI
            main: {
                shareButton: process.env.SHOW_SHARE_BUTTON !== 'false',

                fullScreenButton: process.env.SHOW_FULLSCREEN_BUTTON !== 'false',
                startAudioButton: process.env.SHOW_AUDIO_BUTTON !== 'false',
                startVideoButton: process.env.SHOW_VIDEO_BUTTON !== 'false',
                startScreenButton: process.env.SHOW_SCREEN_BUTTON !== 'false',
                swapCameraButton: process.env.SHOW_SWAP_CAMERA !== 'false',
                chatButton: process.env.SHOW_CHAT_BUTTON !== 'false',
                participantsButton: process.env.SHOW_PARTICIPANTS_BUTTON !== 'false',

                raiseHandButton: process.env.SHOW_RAISE_HAND !== 'false',

                settingsButton: process.env.SHOW_SETTINGS !== 'false',
                aboutButton: process.env.SHOW_ABOUT !== 'false',
                exitButton: process.env.SHOW_EXIT_BUTTON !== 'false',
                extraButton: process.env.SHOW_EXTRA_BUTTON !== 'false',
            },
            // Settings panel buttons and options
            settings: {
                fileSharing: process.env.ENABLE_FILE_SHARING !== 'false',
                lockRoomButton: process.env.SHOW_LOCK_ROOM !== 'false',
                unlockRoomButton: process.env.SHOW_UNLOCK_ROOM !== 'false',

                lobbyButton: process.env.SHOW_LOBBY !== 'false',
                joinLockButton: process.env.SHOW_JOIN_LOCK !== 'false',
                micOptionsButton: process.env.SHOW_MIC_OPTIONS !== 'false',

                tabModerator: process.env.SHOW_MODERATOR_TAB !== 'false',

                tabRecording: process.env.SHOW_RECORDING_TAB !== 'false',
                host_only_recording: process.env.HOST_ONLY_RECORDING !== 'false',
                pushToTalk: process.env.ENABLE_PUSH_TO_TALK !== 'false',
                keyboardShortcuts: process.env.SHOW_KEYBOARD_SHORTCUTS !== 'false',
                virtualBackground: process.env.SHOW_VIRTUAL_BACKGROUND !== 'false',
                customNoiseSuppression: process.env.CUSTOM_NOISE_SUPPRESSION_ENABLED !== 'false',
            },

            // Video controls for producer (local user)
            producerVideo: {
                videoPictureInPicture: process.env.ENABLE_PIP !== 'false',
                videoMirrorButton: process.env.SHOW_MIRROR_BUTTON !== 'false',
                pinVideoButton: process.env.SHOW_PIN_BUTTON !== 'false',
                fullScreenButton: process.env.SHOW_FULLSCREEN !== 'false',

                focusVideoButton: process.env.SHOW_FOCUS_BUTTON !== 'false',
                muteAudioButton: process.env.SHOW_MUTE_AUDIO !== 'false',
                videoPrivacyButton: process.env.SHOW_PRIVACY_TOGGLE !== 'false',
            },

            // Video controls for consumer (remote users)
            consumerVideo: {
                videoPictureInPicture: process.env.ENABLE_PIP !== 'false',
                videoMirrorButton: process.env.SHOW_MIRROR_BUTTON !== 'false',
                pinVideoButton: process.env.SHOW_PIN_BUTTON !== 'false',
                fullScreenButton: process.env.SHOW_FULLSCREEN !== 'false',

                focusVideoButton: process.env.SHOW_FOCUS_BUTTON !== 'false',
                hideFromGridButton: process.env.SHOW_HIDE_FROM_GRID_BUTTON !== 'false',
                sendMessageButton: process.env.SHOW_SEND_MESSAGE !== 'false',
                sendFileButton: process.env.SHOW_SEND_FILE !== 'false',

                muteVideoButton: process.env.SHOW_MUTE_VIDEO !== 'false',
                muteAudioButton: process.env.SHOW_MUTE_AUDIO !== 'false',

                banButton: process.env.SHOW_BAN_BUTTON !== 'false',
                ejectButton: process.env.SHOW_EJECT_BUTTON !== 'false',
                presenterRoleButton: process.env.SHOW_PRESENTER_ROLE_BUTTON !== 'false',
            },

            // Controls when video is off
            videoOff: {
                pinVideoButton: process.env.SHOW_PIN_BUTTON !== 'false',
                hideFromGridButton: process.env.SHOW_HIDE_FROM_GRID_BUTTON !== 'false',
                sendMessageButton: process.env.SHOW_SEND_MESSAGE !== 'false',
                sendFileButton: process.env.SHOW_SEND_FILE !== 'false',

                muteAudioButton: process.env.SHOW_MUTE_AUDIO !== 'false',
                audioVolumeInput: process.env.SHOW_VOLUME_CONTROL !== 'false',

                banButton: process.env.SHOW_BAN_BUTTON !== 'false',
                ejectButton: process.env.SHOW_EJECT_BUTTON !== 'false',
                presenterRoleButton: process.env.SHOW_PRESENTER_ROLE_BUTTON !== 'false',
            },

            // Chat interface controls
            chat: {
                chatPinButton: process.env.SHOW_CHAT_PIN !== 'false',
                chatMaxButton: process.env.SHOW_CHAT_MAXIMIZE !== 'false',
                chatSaveButton: process.env.SHOW_CHAT_SAVE !== 'false',
                chatEmojiButton: process.env.SHOW_CHAT_EMOJI !== 'false',
                chatMarkdownButton: process.env.SHOW_CHAT_MARKDOWN !== 'false',
            },

            // Participants list controls
            participantsList: {
                sendFileAllButton: process.env.SHOW_SEND_FILE_ALL !== 'false',
                ejectAllButton: process.env.SHOW_EJECT_ALL !== 'false',
                sendFileButton: process.env.SHOW_SEND_FILE !== 'false',

                banButton: process.env.SHOW_BAN_BUTTON !== 'false',
                ejectButton: process.env.SHOW_EJECT_BUTTON !== 'false',
                presenterRoleButton: process.env.SHOW_PRESENTER_ROLE_BUTTON !== 'false',
            },
        },
    },

    // ==============================================
    // 8. Feature Flags
    // ==============================================

    features: {
        /**
         * Post-Call Redirect
         * ---------------------
         * - enabled: Redirect after call ends
         * - url: Redirect destination URL
         */
        redirect: {
            enabled: process.env.REDIRECT_ENABLED === 'true',
            url: process.env.REDIRECT_URL || '',
        },

        /**
         * Socket.IO createRoom rate limit (per IP)
         * ----------------------------------------
         * Prevents unauthenticated sockets from spamming arbitrary entries
         * into the in-memory roomList (which feeds /api/v1/activeRooms).
         */
        createRoomRateLimit: {
            windowMs: Math.max(parseInt(process.env.CREATE_ROOM_RATE_LIMIT_WINDOW_MINUTES, 10) || 1, 1) * 60 * 1000,
            max: Math.max(parseInt(process.env.CREATE_ROOM_RATE_LIMIT_MAX, 10) || 10, 1),
        },
    },

    /**
     * Moderation Configuration
     * =======================
     * Controls global moderation features.
     *
     * Core Settings:
     * --------------
     * - room.maxParticipants: Maximum number of participants allowed per room.
     * - lobby: Enable/disable lobby feature for pre-approval of participants.
     *   Adjust to limit room size and manage server load.
     */
    moderation: {
        room: {
            maxParticipants: parseInt(process.env.ROOM_MAX_PARTICIPANTS) || 1000, // Maximum participants per room
            lobby: process.env.ROOM_LOBBY === 'true', // Enable lobby feature
        },
    },

    // ==============================================
    // 9. Mediasoup (WebRTC) Configuration
    // ==============================================

    /**
     * Mediasoup Integration Resources
     * ==============================
     * Core WebRTC components powering MiroTalk SFU
     *
     * Essential Links:
     * ---------------
     * - 🌐 Website     : https://mediasoup.org
     * - 💬 Forum       : https://mediasoup.discourse.group
     *
     * 📚 Documentation:
     * ----------------
     * - Client API     : https://mediasoup.org/documentation/v3/mediasoup-client/api/
     * - Server API     : https://mediasoup.org/documentation/v3/mediasoup/api/
     * - Protocols      : https://mediasoup.org/documentation/v3/mediasoup/rtp-parameters-and-capabilities/
     *
     * 🔧 Key Components:
     * -----------------
     * - Router         : Manages RTP streams
     * - Transport      : Network connection handler
     * - Producer       : Media sender
     * - Consumer       : Media receiver
     *
     * Mediasoup Configuration
     * -----------------------
     * This configuration defines settings for mediasoup workers, routers,
     * WebRTC servers, and transports. These settings control how the SFU
     * (Selective Forwarding Unit) handles media processing and networking.
     */
    mediasoup: {
        /**
         * Worker Configuration
         * --------------------
         * Workers are separate processes that handle media processing.
         * Multiple workers can run in parallel for load balancing.
         */
        worker: {
            rtcMinPort: RTC_MIN_PORT, // Minimum UDP/TCP port for ICE, DTLS, RTP
            rtcMaxPort: RTC_MAX_PORT, // Maximum UDP/TCP port for ICE, DTLS, RTP

            // Disable Linux io_uring for certain operations (false = use if available)
            disableLiburing: false,

            // Logging level (error, warn, debug, etc.)
            logLevel: process.env.MEDIASOUP_LOG_LEVEL || 'error',

            // Detailed logging for specific components:
            logTags: [
                'info', // General information
                'ice', // ICE (Interactive Connectivity Establishment) events
                'dtls', // DTLS handshake and encryption
                'rtp', // RTP packet flow
                'srtp', // Secure RTP encryption
                'rtcp', // RTCP control protocol
                'rtx', // Retransmissions
                'bwe', // Bandwidth estimation
                'score', // Network score calculations
                'simulcast', // Simulcast layers
                'svc', // Scalable Video Coding
            ],
        },
        numWorkers: NUM_WORKERS, // Number of mediasoup worker processes to create

        /**
         * Router Configuration
         * --------------------
         * Routers manage media streams and define what codecs are supported.
         * Each mediasoup worker can host multiple routers.
         */
        router: {
            // Enable audio level monitoring (for detecting who is speaking)
            audioLevelObserverEnabled: process.env.MEDIASOUP_ROUTER_AUDIO_LEVEL_OBSERVER_ENABLED !== 'false',

            // Disable active speaker detection (uses more CPU)
            activeSpeakerObserverEnabled: process.env.MEDIASOUP_ROUTER_ACTIVE_SPEAKER_OBSERVER_ENABLED === 'true',

            /**
             * Supported Media Codecs
             * ----------------------
             * Defines what codecs the SFU can receive and forward.
             * Order matters - first is preferred during negotiation.
             */
            mediaCodecs: [
                // Opus audio codec (standard for WebRTC)
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000, // Standard sample rate for WebRTC
                    channels: 2, // Stereo audio
                },

                // VP8 video codec (widely supported, good for compatibility)
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000, // Standard video clock rate
                    parameters: {
                        'x-google-start-bitrate': 1000, // Initial bitrate (kbps)
                    },
                },

                // VP9 video codec (better compression than VP8)
                // Profile 0: Most widely supported VP9 profile
                {
                    kind: 'video',
                    mimeType: 'video/VP9',
                    clockRate: 90000,
                    parameters: {
                        'profile-id': 0, // Baseline profile
                        'x-google-start-bitrate': 1000,
                    },
                },

                // VP9 Profile 2: Supports HDR and 10/12-bit color
                {
                    kind: 'video',
                    mimeType: 'video/VP9',
                    clockRate: 90000,
                    parameters: {
                        'profile-id': 2, // Advanced profile
                        'x-google-start-bitrate': 1000,
                    },
                },

                // H.264 Baseline profile (widest hardware support)
                {
                    kind: 'video',
                    mimeType: 'video/h264',
                    clockRate: 90000,
                    parameters: {
                        'packetization-mode': 1, // Required for WebRTC
                        'profile-level-id': '42e01f', // Baseline 3.1
                        'level-asymmetry-allowed': 1, // Allows different levels
                        'x-google-start-bitrate': 1000,
                    },
                },

                // H.264 Main profile (better compression than Baseline)
                {
                    kind: 'video',
                    mimeType: 'video/h264',
                    clockRate: 90000,
                    parameters: {
                        'packetization-mode': 1,
                        'profile-level-id': '4d0032', // Main 4.0
                        'level-asymmetry-allowed': 1,
                        'x-google-start-bitrate': 1000,
                    },
                },
            ],
        },

        /**
         * WebRTC Server Configuration
         * ---------------------------
         * WebRTC servers handle ICE (connection establishment) and DTLS (encryption).
         * Can be disabled if using plain WebRtcTransport instead.
         *
         * Best used when:
         * - Running in controlled environments with fixed IPs
         * - Need to minimize port usage across workers
         * - Using StatefulSets/DaemonSets in Kubernetes
         *
         * Kubernetes considerations:
         * - Requires stable network identity (use StatefulSet)
         * - Needs NodePort/LoadBalancer with externalTrafficPolicy: Local
         * - Port ranges must be carefully allocated to avoid conflicts
         *
         * Optional Config:
         * - https://mediasoup.discourse.group/t/mediasoup-3-17-0-released/6805
         */
        webRtcServerActive: process.env.SFU_SERVER === 'true', // Enable if SFU_SERVER=true
        webRtcServerOptions: {
            // Network interfaces and ports for ICE candidates
            listenInfos: [
                /**
                 * UDP Configuration
                 * Preferred for media transport (lower latency)
                 * Kubernetes implications:
                 * - Each Pod needs unique ports if sharing host network
                 * - Consider using hostPort when not using LoadBalancer
                 */
                {
                    protocol: 'udp',
                    ip: LISTEN_IP, // Local IP to bind to
                    announcedAddress: IPv4, // Public IP sent to clients
                    portRange: {
                        min: RTC_MIN_PORT,
                        max: RTC_MIN_PORT + NUM_WORKERS, // Port range per worker
                    },
                },
                /**
                 * TCP Configuration
                 * Fallback for restrictive networks (higher latency)
                 * Kubernetes implications:
                 * - Helps with networks blocking UDP
                 * - May require separate Service definition in k8s
                 */
                {
                    protocol: 'tcp',
                    ip: LISTEN_IP,
                    announcedAddress: IPv4,
                    portRange: {
                        min: RTC_MIN_PORT,
                        max: RTC_MIN_PORT + NUM_WORKERS,
                    },
                },
            ],
        },

        /**
         * WebRTC Transport Configuration
         * ------------------------------
         * Transports handle the actual media flow between clients and the SFU.
         * These settings affect bandwidth management and network behavior.
         *
         * Preferred when:
         * - Running in cloud environments with auto-scaling
         * - Need dynamic port allocation
         * - Kubernetes Pods are ephemeral
         *
         * Kubernetes considerations:
         * - Requires wide port range exposure (50000-60000 typical)
         * - Works better with ClusterIP Services
         * - More resilient to Pod restarts
         */
        webRtcTransport: {
            // Network interfaces for media transmission
            listenInfos: [
                /**
                 * UDP Transport Settings
                 * Kubernetes implications:
                 * - Needs hostNetwork or privileged Pod for port access
                 * - Consider port range size based on expected scale
                 */
                {
                    protocol: 'udp',
                    ip: LISTEN_IP,
                    announcedAddress: IPv4,
                    portRange: {
                        min: RTC_MIN_PORT,
                        max: RTC_MAX_PORT, // Wider range than WebRtcServer
                    },
                },
                /**
                 * TCP Transport Settings
                 * Kubernetes implications:
                 * - Less efficient but more compatible
                 * - May require different Service configuration
                 */
                {
                    protocol: 'tcp',
                    ip: LISTEN_IP,
                    announcedAddress: IPv4,
                    portRange: {
                        min: RTC_MIN_PORT,
                        max: RTC_MAX_PORT,
                    },
                },
            ],

            iceConsentTimeout: 35, // Timeout for ICE consent (seconds)

            /**
             * Bandwidth Control Settings
             * Kubernetes implications:
             * - These values should be tuned based on Node resources
             * - Consider network plugin overhead (Calico, Cilium etc.)
             */
            initialAvailableOutgoingBitrate: 2500000, // 2.5 Mbps initial bitrate
            minimumAvailableOutgoingBitrate: 1000000, // 1 Mbps minimum guaranteed
            maxIncomingBitrate: 3000000, // 3 Mbps max per producer

            // 256 KB max outgoing data-channel message size
            // 256 KB max incoming data-channel message size
        },
    },
};

// ==============================================
// Helper Functions
// ==============================================

/**
 * Get IPv4 Address
 * ----------------
 * - Prioritizes ANNOUNCED_IP if set
 * - Falls back to local IP detection
 */
function getIPv4() {
    if (ANNOUNCED_IP) return ANNOUNCED_IP;

    switch (ENVIRONMENT) {
        case 'development':
            return IS_DOCKER ? '127.0.0.1' : getLocalIPv4();
        case 'production':
            return ANNOUNCED_IP;
        default:
            return getLocalIPv4();
    }
}

/**
 * Detect Local IPv4 Address
 * -------------------------
 * - Handles different OS network interfaces
 * - Filters out virtual/docker interfaces
 */
function getLocalIPv4() {
    const ifaces = os.networkInterfaces();
    const platform = os.platform();

    const PRIORITY_CONFIG = {
        win32: [{ name: 'Ethernet' }, { name: 'Wi-Fi' }, { name: 'Local Area Connection' }],
        darwin: [{ name: 'en0' }, { name: 'en1' }],
        linux: [{ name: 'eth0' }, { name: 'wlan0' }],
    };

    const VIRTUAL_INTERFACES = {
        all: ['docker', 'veth', 'tun', 'lo'],
        win32: ['Virtual', 'vEthernet', 'Teredo', 'Bluetooth'],
        darwin: ['awdl', 'bridge', 'utun'],
        linux: ['virbr', 'kube', 'cni'],
    };

    const platformPriorities = PRIORITY_CONFIG[platform] || [];
    const virtualExcludes = [...VIRTUAL_INTERFACES.all, ...(VIRTUAL_INTERFACES[platform] || [])];

    // Check priority interfaces first
    for (const { name: ifName } of platformPriorities) {
        const matchingIfaces = platform === 'win32' ? Object.keys(ifaces).filter((k) => k.includes(ifName)) : [ifName];
        for (const interfaceName of matchingIfaces) {
            const addr = findValidAddress(ifaces[interfaceName]);
            if (addr) return addr;
        }
    }

    // Fallback to scanning all non-virtual interfaces
    const fallbackAddress = scanAllInterfaces(ifaces, virtualExcludes);
    if (fallbackAddress) return fallbackAddress;

    return '0.0.0.0';
}

/**
 * Scan All Network Interfaces
 * ---------------------------
 * - Checks all interfaces excluding virtual ones
 */
function scanAllInterfaces(ifaces, excludes) {
    for (const [name, addresses] of Object.entries(ifaces)) {
        if (excludes.some((ex) => name.toLowerCase().includes(ex.toLowerCase()))) {
            continue;
        }
        const addr = findValidAddress(addresses);
        if (addr) return addr;
    }
    return null;
}

/**
 * Find Valid Network Address
 * --------------------------
 * - Filters out internal and link-local addresses
 */
function findValidAddress(addresses) {
    return addresses?.find((addr) => addr.family === 'IPv4' && !addr.internal && !addr.address.startsWith('169.254.'))
        ?.address;
}

/**
 * Get FFmpeg Path
 * ---------------
 * - Checks common installation locations
 * - Platform-specific paths
 */
function getFFmpegPath(platform) {
    const paths = {
        darwin: ['/usr/local/bin/ffmpeg', '/opt/homebrew/bin/ffmpeg'],
        linux: ['/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg'],
        win32: ['C:\\ffmpeg\\bin\\ffmpeg.exe', 'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe'],
    };

    const platformPaths = paths[platform] || ['/usr/bin/ffmpeg'];

    for (const path of platformPaths) {
        try {
            fs.accessSync(path);
            return path;
        } catch (e) {
            continue;
        }
    }

    return platformPaths[0];
}
