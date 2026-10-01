'use strict';

/**
 * MiroTalk SFU - Client component
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

const cfg = {
    useAvatarSvg: true,
};

const html = {
    newline: '\n', //'<br />',

    audioOn: 'fas fa-microphone',
    audioOff: 'fas fa-microphone-slash',
    videoOn: 'fas fa-video',
    videoOff: 'fas fa-video-slash',
    userName: 'username notranslate fadein',
    userHand: 'fas fa-hand-paper user-hand pulsate',
    pip: 'fas fa-images',
    fullScreen: 'fas fa-expand',
    fullScreenOn: 'fas fa-compress-alt',
    fullScreenOff: 'fas fa-expand-alt',

    sendFile: 'fas fa-upload',
    sendMsg: 'fas fa-paper-plane',

    geolocation: 'fas fa-location-dot',
    ban: 'fas fa-ban',
    kickOut: 'fas fa-times',
    presenterRole: 'fa-solid fa-user-shield',
    presenterRoleRemove: 'fa-solid fa-user-shield',
    ghost: 'fas fa-ghost',
    undo: 'fas fa-undo',
    bg: 'fas fa-circle-half-stroke',
    pin: 'fas fa-map-pin',
    videoPrivacy: 'far fa-circle',
    expand: 'fas fa-ellipsis-vertical',
    hideALL: 'fas fa-eye',
    hideFromGrid: 'fas fa-eye-slash',
    mirror: 'fas fa-arrow-right-arrow-left',

    close: 'fas fa-times',
    stop: 'fas fa-circle-stop',
    share: 'fas fa-share-alt',
    robot: 'fas fa-robot',
    volume: 'fas fa-volume-mute',
};

const icons = {
    room: '<i class="fas fa-home"></i>',
    chat: '<i class="fas fa-comments"></i>',
    user: '<i class="fas fa-user"></i>',
    speech: '<i class="fas fa-volume-high"></i>',
    share: '<i class="fas fa-share-alt"></i>',
    ptt: '<i class="fa-solid fa-hand-pointer"></i>',
    lobby: '<i class="fas fa-shield-halved"></i>',
    lock: '<i class="fa-solid fa-lock"></i>',
    unlock: '<i class="fa-solid fa-lock-open"></i>',
    pitchBar: '<i class="fas fa-microphone-lines"></i>',
    mirror: '<i class="fas fa-arrow-right-arrow-left"></i>',
    sounds: '<i class="fas fa-music"></i>',
    fileSend: '<i class="fa-solid fa-file-export"></i>',
    fileReceive: '<i class="fa-solid fa-file-import"></i>',
    recording: '<i class="fas fa-record-vinyl"></i>',
    moderator: '<i class="fas fa-user-shield"></i>',
    broadcaster: '<i class="fa-solid fa-wifi"></i>',
    codecs: '<i class="fa-solid fa-film"></i>',
    theme: '<i class="fas fa-fill-drip"></i>',
    recSync: '<i class="fa-solid fa-cloud-arrow-up"></i>',
    refresh: '<i class="fas fa-rotate"></i>',

    up: '<i class="fas fa-chevron-up"></i>',
    down: '<i class="fas fa-chevron-down"></i>',
    infoBrowser: '<i class="fa-solid fa-globe"></i>',
    infoCpu: '<i class="fa-solid fa-microchip"></i>',
    infoDevice: '<i class="fa-solid fa-laptop"></i>',
    infoEngine: '<i class="fa-solid fa-gear"></i>',
    infoOs: '<i class="fa-solid fa-layer-group"></i>',
    infoDefault: '<i class="fa-solid fa-circle-info"></i>',
    signIn: '<i class="fas fa-sign-in-alt"></i>',
    clock: '<i class="fas fa-clock"></i>',
    infinity: '<i class="fas fa-infinity"></i>',
    arrowRight: '<i class="fas fa-arrow-right"></i>',
    paste: '<i class="fas fa-paste"></i>',
    smile: '<i class="fas fa-face-smile"></i>',
    trash: '<i class="fas fa-trash"></i>',
    youtube: '<i class="fab fa-youtube"></i>',
    times: '<i class="fas fa-times"></i>',
    statusCircle: (status) => `<i class="fa fa-circle ${status}"></i>`,
    robot: '<i class="fas fa-robot"></i>',
};

const image = {
    about: '../images/mirotalk-logo.gif',
    avatar: '../images/mirotalksfu-logo.png',
    audio: '../images/audio.gif',
    rec: '../images/rec.png',
    recording: '../images/recording.png',
    delete: '../images/delete.png',
    locked: '../images/locked.png',
    mute: '../images/mute.png',
    hide: '../images/hide.png',
    stop: '../images/stop.png',
    unmute: '../images/unmute.png',
    unhide: '../images/unhide.png',
    start: '../images/start.png',
    users: '../images/participants.png',
    user: '../images/participant.png',
    username: '../images/user.png',

    message: '../images/message.png',
    share: '../images/share.png',
    exit: '../images/exit.png',
    feedback: '../images/feedback.png',
    lobby: '../images/lobby.png',
    email: '../images/email.png',
    chatgpt: '../images/chatgpt.png',
    deepSeek: '../images/deepSeek.png',
    all: '../images/all.png',
    forbidden: '../images/forbidden.png',

    geolocation: '../images/geolocation.png',
    network: '../images/network.gif',

    save: '../images/save.png',
    back: '../images/back.png',
    blur: '../images/blur.png',
    blurLow: '../images/blur-low.png',
    blurHigh: '../images/blur-high.png',
    transparentBg: '../images/transparentBg.png',
    link: '../images/link.png',
    upload: '../images/upload.png',
    virtualBackground: {
        one: '../images/virtual-background/default/background-1.jpg',
        two: '../images/virtual-background/default/background-2.webp',
        three: '../images/virtual-background/default/background-3.jpg',
        four: '../images/virtual-background/default/background-4.jpg',
        five: '../images/virtual-background/default/background-5.jpg',
        six: '../images/virtual-background/default/background-6.jpg',
        seven: '../images/virtual-background/default/background-7.jpg',
        eight: '../images/virtual-background/default/background-8.jpg',
        nine: '../images/virtual-background/default/background-9.jpg',
        ten: '../images/virtual-background/default/background-10.jpg',
        eleven: '../images/virtual-background/default/background-11.gif',
    },
};

const mediaType = {
    audio: 'audioType',
    audioTab: 'audioTab',
    video: 'videoType',
    camera: 'cameraType',
    screen: 'screenType',
    speaker: 'speakerType',
};

const _EVENTS = {
    openRoom: 'openRoom',
    exitRoom: 'exitRoom',
    startRec: 'startRec',
    pauseRec: 'pauseRec',
    resumeRec: 'resumeRec',
    stopRec: 'stopRec',
    raiseHand: 'raiseHand',
    lowerHand: 'lowerHand',
    startVideo: 'startVideo',
    pauseVideo: 'pauseVideo',
    resumeVideo: 'resumeVideo',
    stopVideo: 'stopVideo',
    startAudio: 'startAudio',
    pauseAudio: 'pauseAudio',
    resumeAudio: 'resumeAudio',
    stopAudio: 'stopAudio',
    startScreen: 'startScreen',
    pauseScreen: 'pauseScreen',
    resumeScreen: 'resumeScreen',
    stopScreen: 'stopScreen',
    roomLock: 'roomLock',
    lobbyOn: 'lobbyOn',
    lobbyOff: 'lobbyOff',
    joinLockOn: 'joinLockOn',
    joinLockOff: 'joinLockOff',
    roomUnlock: 'roomUnlock',
    hostOnlyRecordingOn: 'hostOnlyRecordingOn',
    hostOnlyRecordingOff: 'hostOnlyRecordingOff',
};

// Enums
const enums = {
    recording: {
        started: 'Started conference recording',
        start: 'Start conference recording',
        stop: 'Stop conference recording',
    },
    //...
};

// Recording
let recordedBlobs = [];

class RoomClient {
    constructor(
        localAudioEl,
        remoteAudioEl,
        videoMediaContainer,
        videoPinMediaContainer,
        mediasoupClient,
        socket,
        room_id,
        peer_name,
        peer_uuid,
        peer_info,
        isAudioAllowed,
        isVideoAllowed,
        isScreenAllowed,
        joinRoomWithScreen,
        isSpeechSynthesisSupported,
        successCallback
    ) {
        this.room_id = room_id;
        this.peer_id = socket.id;
        this.peer_name = peer_name;
        this.peer_uuid = peer_uuid;
        this.peer_info = peer_info;
        this.peer_avatar = peer_info.peer_avatar;

        // Device type
        this.isDesktopDevice = peer_info.is_desktop_device;
        this.isMobileDevice = peer_info.is_mobile_device;
        this.isMobileSafari = this.isMobileDevice && peer_info.browser_name.toLowerCase().includes('safari');

        this.pendingSinkId = null; // store desired sink id until next user gesture

        this.localAudioEl = localAudioEl;
        this.remoteAudioEl = remoteAudioEl;
        this.videoMediaContainer = videoMediaContainer;
        this.videoPinMediaContainer = videoPinMediaContainer;
        this.mediasoupClient = mediasoupClient;

        // Handle Socket
        this.socket = socket;
        this.reconnectAlert = null;
        this.reconnectBanner = null;
        this.reconnectBannerHideTimer = null;
        this.maxReconnectAttempts = Number(this.socket?.io?.opts?.reconnectionAttempts) || 10;
        this.reconnectInterval = Number(this.socket?.io?.opts?.reconnectionDelay) || 3000;
        this.maxReconnectInterval = Number(this.socket?.io?.opts?.reconnectionDelayMax) || 15000;
        this.serverAwayShown = false;
        this.silentReconnect = false; // If true, no popup will be shown on reconnect

        this.cacheReconnectBannerElements();

        // Handle ICE
        this.iceRestarting = false;
        this.iceProducerRestarting = false;
        this.iceConsumerRestarting = false;

        // Moderator
        this._moderator = {
            video_start_privacy: false,
            audio_start_muted: false,
            video_start_hidden: false,
            audio_cant_unmute: false,
            video_cant_unhide: false,
            screen_cant_share: false,
            chat_cant_privately: false,
            chat_cant_publicly: false,
            chat_cant_chatgpt: false,
            chat_cant_deep_seek: false,
        };

        // Chat messages
        this.chatMessageLengthCheck = false;
        this.chatMessageLength = 4000; // chars
        this.chatMessageTimeLast = 0;
        this.chatMessageTimeBetween = 1000; // ms
        this.chatMessageNotifyDelay = 10000; // ms
        this.chatMessageSpamCount = 0;
        this.chatMessageSpamCountToBan = 10;
        this.chatPeerId = 'all';
        this.chatPeerName = 'all';
        this.chatPeerAvatar = '';
        this.unreadMessageCounts = {};

        this.dominantSpeaker = false;
        this.isAudioAllowed = isAudioAllowed;
        this.isVideoAllowed = isVideoAllowed;
        this.isScreenAllowed = isScreenAllowed;
        this.joinRoomWithScreen = joinRoomWithScreen;
        this.producerTransport = null;
        this.consumerTransport = null;
        this.device = null;

        // DataChannel chat
        this.chatDataProducer = null;
        this.chatDataConsumers = new Map();
        this.useDataChannel = true; // prefer DataChannel for chat

        this.isScreenShareSupported =
            navigator.getDisplayMedia || navigator.mediaDevices.getDisplayMedia ? true : false;

        this.isMySettingsOpen = false;

        this._isConnected = false;
        this.isVideoBarDropDownOpen = false;
        this.isDocumentOnFullScreen = false;
        this.isVideoOnFullScreen = false;
        this.isVideoFullScreenSupported = this.isFullScreenSupported();
        this.isVideoPictureInPictureSupported = document.pictureInPictureEnabled;
        this.isZoomCenterMode = false;
        this.isChatOpen = false;
        this.isChatEmojiOpen = false;

        this.isSpeechSynthesisSupported = isSpeechSynthesisSupported;
        this.isParticipantsOpen = false;
        this.isChatOpenedByParticipantsBtn = false;
        this.speechInMessages = false;
        this.showChatOnMessage = true;
        this.isChatBgTransparent = false;
        this.isVideoPinned = false;
        this.isApplyingParticipantViewMode = false;
        this.participantViewRestoreTimer = null;
        this.isFollowMeActive = false;
        this.isChatPinned = false;
        this.isChatMaximized = false;
        this.isToggleUnreadMsg = false;
        this.isToggleRaiseHand = false;

        this.pinnedVideoPlayerId = null;
        this.camVideo = false;
        this.videoQualitySelectedIndex = 0;

        this.chatGPTContext = [];
        this.deepSeekContext = [];
        this.chatGPTEnabled = false;
        this.chatMessages = [];
        this.leftMsgAvatar = null;
        this.rightMsgAvatar = null;

        this.localVideoElement = null;
        this.localVideoStream = null;
        this.localAudioStream = null;
        this.localScreenStream = null;

        // Room Password
        this.RoomIsLocked = false;
        this.RoomPassword = false;
        this.RoomPasswordValid = false;

        // Room Lobby
        this.RoomIsLobby = false;
        this.RoomLobbyAccepted = false;
        this.lobbyPears = {};

        // File transfer settings
        this.fileToSend = null;
        this.fileReader = null;
        this.receiveBuffer = [];
        this.receivedSize = 0;
        this.incomingFileInfo = null;
        this.incomingFileData = null;
        this.sendInProgress = false;
        this.receiveInProgress = false;
        this.fileSharingInput = '*';
        this.chunkSize = 1024 * 16; // 16kb/s

        // Recording
        this._isRecording = false;
        this._recStartTs = null;
        this.mediaRecorder = null;
        this._recordingStarted = false;
        this._recordingStopping = false;
        this.audioRecorder = null;
        this.screenAudioRecorder = null; // mixes participant audio with system/tab audio
        this.recScreenStream = null;
        this.recScreenAudioTracks = []; // raw system/tab audio tracks to stop on recording end
        this.recording = {
            recSyncServerRecording: false,
            recSyncServerToS3: false,
            recSyncServerEndpoint: '',
        };
        this.recSyncTime = 4000; // 4 sec
        this.recSyncChunkSize = 1000000; // 1MB
        this.recUploadToken = ''; // Per-session token authorizing /recSync* uploads (issued on join)

        this.sessionId = ''; // Server-side unique conference-instance ID (issued on join)

        // Encodings
        // Opt-in RTP header extensions (mediasoup-client 3.23.0+), currently honored only by Chrome.
        // Example: { 'http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time': true }
        this.forcedRtpExtensions = null;
        this.preferLocalCodecsOrder = false; // Prefer local codecs order
        this.forceVP8 = false; // Force VP8 codec for webcam and screen sharing
        this.forceVP9 = false; // Force VP9 codec for webcam and screen sharing
        this.forceH264 = false; // Force H264 codec for webcam and screen sharing
        this.forceAV1 = false; // Force AV1 codec for webcam and screen sharing
        this.enableWebcamLayers = true; // Enable simulcast or SVC for webcam
        this.enableSharingLayers = true; // Enable simulcast or SVC for screen sharing
        this.numSimulcastStreamsWebcam = 3; // Number of streams for simulcast in webcam
        this.numSimulcastStreamsSharing = 1; // Number of streams for simulcast in screen sharing
        this.webcamScalabilityMode = 'L3T3'; // Scalability Mode for webcam | 'L1T3' for VP8/H264 (in each simulcast encoding), 'L3T3_KEY' for VP9
        this.sharingScalabilityMode = 'L1T3'; // Scalability Mode for screen sharing | 'L1T3' for VP8/H264 (in each simulcast encoding), 'L3T3' for VP9

        this.myVideoEl = null;
        this.myAudioEl = null;
        this.showPeerInfo = false; // on peerName mouse hover show additional info

        // Noise Suppression
        this.RNNoiseProcessor = null;
        this.isRNNoiseSupported = true; // Will be set to false if AudioWorklet/WASM not available

        this.videoProducerId = null;
        this.screenProducerId = null;
        this.audioProducerId = null;
        this.audioConsumers = new Map();

        this.masterOutputVolume = 1; // 0..1 master speaker volume, multiplied with each per-peer volume
        this.bodrikMusicVolume = 1;

        this.peers = new Map();
        this.consumers = new Map();
        this.consumersProducer = new Map(); // producer_id -> consumer_id (reconcile/dedup)
        this.consumingProducers = new Set(); // producer_ids with an in-flight consume() (dedup)
        this.resumedConsumers = new Set(); // consumer_ids confirmed resumed (skip redundant reconcile)
        this.producers = new Map();
        this.producerLabel = new Map();
        this.eventListeners = new Map();
        this.consumerReconcileInterval = null;
        this.consumerReconcileInProgress = false;

        this.debug = false;
        this.debug ? window.localStorage.setItem('debug', 'mediasoup*') : window.localStorage.removeItem('debug');

        // TEST PURPOSES
        this.test = {
            device: {
                enabled: false,
                handlerName: 'Chrome111', // |Chrome74|Firefox120|Safari12|ReactNative106|
            },
        };

        console.log('06 ----> Load MediaSoup Client v', mediasoupClient.version);
        console.log('06.1 ----> PEER_ID', this.peer_id);

        Object.keys(_EVENTS).forEach((evt) => {
            this.eventListeners.set(evt, []);
        });

        this.socket.request = function request(type, data = {}, timeout = 20000) {
            return new Promise((resolve, reject) => {
                let settled = false;
                let timer = null;
                const finish = (fn, arg) => {
                    if (settled) return;
                    settled = true;
                    if (timer) clearTimeout(timer);
                    fn(arg);
                };
                if (timeout && timeout > 0) {
                    timer = setTimeout(() => {
                        finish(reject, new Error(`Request '${type}' timed out after ${timeout}ms`));
                    }, timeout);
                }
                socket.emit(type, data, (response) => {
                    if (response && response.error) {
                        if (response.code || typeof response.error === 'object') {
                            const error = new Error(
                                typeof response.error === 'string'
                                    ? response.error
                                    : response.error.message || 'Request failed'
                            );
                            error.code = response.code || response.error.code;
                            error.retryable = response.retryable ?? response.error.retryable;
                            finish(reject, error);
                        } else {
                            finish(reject, response.error);
                        }
                    } else {
                        finish(resolve, response);
                    }
                });
            });
        };

        this.socket.requestWithRetry = async function requestWithRetry(
            type,
            data = {},
            { attempts = 3, timeout = 5000, delay = 500 } = {}
        ) {
            let lastError;
            for (let attempt = 1; attempt <= attempts; attempt++) {
                try {
                    return await socket.request(type, data, timeout);
                } catch (error) {
                    lastError = error;
                    if (error.retryable === false) break;
                    if (attempt < attempts) {
                        console.warn(`Retrying '${type}' request`, { attempt, error });
                        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
                    }
                }
            }
            throw lastError;
        };

        // ####################################################
        // CREATE ROOM AND JOIN
        // ####################################################

        this.createRoom(this.room_id).then(async () => {
            const data = {
                room_id: this.room_id,
                peer_info: this.peer_info,
                diagnostics: collectBodrikJoinDiagnostics(parserResult, publicRoomSlug, deviceType),
                rejoin_secret: this.getRejoinSecret(),
            };
            await this.join(data);
            this.initSockets();
            this._isConnected = true;
            successCallback();
        });
    }
    /** Persist a cryptographic tab proof across reloads, scoped to this private room. */
    getRejoinSecret() {
        const key = `bodrik-rejoin:${this.room_id}`;
        try {
            const saved = window.sessionStorage.getItem(key);
            if (saved) return saved;
        } catch (error) {
            console.warn('Unable to read meeting tab proof', error);
        }
        const secret = window.crypto.randomUUID();
        try {
            window.sessionStorage.setItem(key, secret);
        } catch (error) {
            console.warn('Unable to persist meeting tab proof', error);
        }
        return secret;
    }

    // ####################################################
    // GET STARTED
    // ####################################################

    async createRoom(room_id) {
        await this.socket
            .request('createRoom', {
                room_id,
            })
            .catch((err) => {
                console.log('Create room:', err);
            });
    }

    /** Admit the peer, retain recording/session credentials, and initialize the room or report rejection. */
    async join(data) {
        this.socket
            .request('join', data)
            .then(async (room) => {
                console.log('##### JOIN ROOM #####', room);

                if (room?.maxParticipantsReached) {
                    console.warn('00-WARNING ----> Room is full, maximum participants reached!');
                    endRoomSession();
                    return popupHtmlMessage(
                        null,
                        image.forbidden,
                        'Join Room',
                        `Room is full, maximum participants${room?.maxParticipants ? ` (${room.maxParticipants})` : ''} reached!`,
                        'center',
                        '/',
                        false
                    );
                }
                if (room === 'invalid') return this.roomInvalid();
                if (room === 'notAllowed') return this.userRoomNotAllowed();
                if (room === 'unauthorized') return this.userUnauthorized();
                if (room === 'isJoinLocked') return this.roomJoinLocked();
                if (room === 'isLocked') {
                    this.RoomIsLocked = true;
                    this.event(_EVENTS.roomLock);
                    return this.unlockTheRoom();
                }
                if (room === 'isLobby') {
                    this.RoomIsLobby = true;
                    this.event(_EVENTS.lobbyOn);
                    return this.waitJoinConfirm();
                }
                if (room === 'isBanned') return this.isBanned();

                this.peers = new Map(JSON.parse(room.peers));
                if (room.recUploadToken) this.recUploadToken = room.recUploadToken;
                if (room.sessionId) this.sessionId = room.sessionId;
                await this.joinAllowed(room);
            })
            .catch((error) => {
                console.error('Join error:', error);
                popupHtmlMessage(null, image.network, 'Join Room', error, 'center', false, true);
            });
    }

    async joinAllowed(room) {
        console.log('07 ----> Join Room allowed');

        await this.handleRoomInfo(room);

        await this.loadDeviceAndInitTransports();

        // ###############################################
        this.socket.emit('getProducers'); // newProducers
        // ###############################################

        // Periodically reconcile consumers so a missed newProducers broadcast or a failed
        // resume can't leave a peer permanently silent for one participant.
        this.startConsumerReconcile();

        // Initialize chat DataChannel
        await this.initChatDataProducer();

        // Request existing data producers from other peers
        this.socket.emit('getDataProducers');

        {
            await this.startLocalMedia();
        }

        // Ensure my own tile shows the presenter shield once media/tile exists,
        // regardless of the order in which the local video tile was built.
        this.updatePeerPresenterBadge(this.peer_id, isPresenter);
    }

    async loadDeviceAndInitTransports() {
        // Get Router Capabilities
        const routerRtpCapabilities = await this.socket.request('getRouterRtpCapabilities');
        routerRtpCapabilities.headerExtensions = routerRtpCapabilities.headerExtensions.filter(
            (ext) => ext.uri !== 'urn:3gpp:video-orientation'
        );

        // Load device
        this.device = await this.loadDevice(routerRtpCapabilities);
        console.log('07.3 ----> Get Router Rtp Capabilities codecs: ', this.device.rtpCapabilities.codecs);

        // Init Send/Receive Transports
        await this.initTransports(this.device);
    }

    async handleRoomInfo(room) {
        // ##########################################
        this.peers = new Map(JSON.parse(room.peers));
        // ##########################################

        console.log('07.0 ----> Room Survey', room.survey);
        survey = room.survey;

        console.log('07.0 ----> Room Leave Redirect', room.redirect);
        redirect = room.redirect;

        participantsCount = this.peers.size;

        // ME
        for (let peer of Array.from(this.peers.keys()).filter((id) => id == this.peer_id)) {
            let my_peer_info = this.peers.get(peer).peer_info;
            console.log('07.1 ----> My Peer info', my_peer_info);
            isPresenter = my_peer_info.peer_presenter;
            this.peer_info.peer_presenter = isPresenter;
            this.getId('isUserPresenter').innerText = presenterLabel(isPresenter);
            window.localStorage.isReconnected = false;

            // GLOBAL LOBBY ENABLED
            if (room?.globalLobby) {
                if (isPresenter) {
                    localStorageSettings.lobby = true;
                    lS.setSettings(localStorageSettings);
                    console.warn('7.1-WARNING ----> GLOBAL Room Lobby detected, save the config');
                }
                rc.roomAction('globalLobbyOn', true, false);
                console.warn('7.1-WARNING ----> GLOBAL Room Lobby detected');
            }

            // both at join and when a peer is promoted/demoted mid-session.

            handleRules(isPresenter);

            // ###################################################################################################

            // ###################################################################################################

            if (BUTTONS.settings.tabRecording) {
                room.config.hostOnlyRecording
                    ? (console.log('07.1 ----> WARNING Room Host only recording enabled'),
                      this.event(_EVENTS.hostOnlyRecordingOn))
                    : this.event(_EVENTS.hostOnlyRecordingOff);
            }

            this.event(room.config.isJoinLocked ? _EVENTS.joinLockOn : _EVENTS.joinLockOff);

            // ###################################################################################################
            if (room.recording) this.recording = room.recording;
            if (room.recording && room.recording.recSyncServerRecording) {
                console.log('07.1 WARNING ----> SERVER SYNC RECORDING ENABLED!', this.recording);
                this.recording.recSyncServerRecording = localStorageSettings.rec_server;
                if (BUTTONS.settings.tabRecording && !room.config.hostOnlyRecording) {
                    show(roomRecordingServer);
                }
                switchServerRecording.checked = this.recording.recSyncServerRecording;
            }
            console.log('07.1 ----> SERVER SYNC RECORDING', this.recording);
            // ###################################################################################################

            // Handle Room moderator rules
            if (room.moderator && (!isRulesActive || !isPresenter)) {
                console.log('07.2 ----> ROOM MODERATOR', room.moderator);

                // Update `this._moderator` with properties from `room.moderator`, keeping existing ones.
                this._moderator = { ...this._moderator, ...room.moderator };

                if (this._moderator.video_start_privacy || localStorageSettings.moderator_video_start_privacy) {
                    this.peer_info.peer_video_privacy = true;
                    this.emitCmd({
                        type: 'privacy',
                        peer_id: this.peer_id,
                        active: true,
                        broadcast: true,
                    });
                    this.userLog('warning', 'The Moderator starts your video in privacy mode', 'top-end');
                }
                if (this._moderator.audio_start_muted && this._moderator.video_start_hidden) {
                    this.userLog('warning', 'The Moderator disabled your audio and video', 'top-end');
                } else {
                    if (this._moderator.audio_start_muted && !this._moderator.video_start_hidden) {
                        this.userLog('warning', 'The Moderator disabled your audio', 'top-end');
                    }
                    if (!this._moderator.audio_start_muted && this._moderator.video_start_hidden) {
                        this.userLog('warning', 'The Moderator disabled your video', 'top-end');
                    }
                }
                //
                this._moderator.audio_cant_unmute ? hide(tabAudioDevicesBtn) : show(tabAudioDevicesBtn);
                this._moderator.video_cant_unhide ? hide(tabVideoDevicesBtn) : show(tabVideoDevicesBtn);
                if (this._moderator.video_cant_unhide) hide(tabVirtualBackgroundBtn);
            }
            // Handle Follow Me state for late joiners
            if (room.followMe && room.followMe.enabled && !isPresenter) {
                this._pendingFollowMe = room.followMe;
            }

            this.chatGPTEnabled = room.chatGPTEnabled || false;

            {
            }

            // Dominant Speaker
            this.dominantSpeaker = room.dominantSpeaker || false;
            if (this.dominantSpeaker) {
                show('audioFocusControlsDiv');
                show('dominantSpeakerFocusDiv');
            }

            // Open Chat on Join
            if (chat) {
                const chatButton = getId('chatButton');
                if (chatButton) {
                    chatButton.click();
                }
            }
        }

        // PARTICIPANTS
        for (let peer of Array.from(this.peers.keys()).filter((id) => id !== this.peer_id)) {
            let peer_info = this.peers.get(peer).peer_info;
            // console.log('07.1 ----> Remote Peer info', peer_info);
            const { peer_id, peer_name, peer_avatar, peer_presenter, peer_video, peer_recording, peer_lobby } =
                peer_info;

            if (peer_lobby) {
                this.lobbyAddPear({ peer_id, peer_avatar, peer_name });
                continue;
            }

            const canSetVideoOff = true;

            if (!peer_video && canSetVideoOff) {
                console.log('Detected peer video off ' + peer_name);
                this.setVideoOff(peer_info, true);
            }

            if (peer_recording) {
                this.handleRecordingAction({
                    peer_id: peer_id,
                    peer_name: peer_name,
                    peer_avatar: peer_avatar,
                    action: enums.recording.started,
                });
            }
        }

        this.refreshParticipantsCount();

        console.log('07.2 Participants Count ---->', participantsCount);

        if (!this.rejoining && BUTTONS.popup.shareRoomPopup && notify && participantsCount == 1) {
            shareRoom();
        } else if (!this.rejoining) {
            if (this.isScreenAllowed) this.shareScreen();
            sound('joined');
        }
    }

    async loadDevice(routerRtpCapabilities) {
        if (!routerRtpCapabilities) {
            console.error('Router RTP Capabilities are required to load the device.');
            this.userLog('error', 'Router RTP Capabilities are missing.', 'center', 6000);
            return null;
        }

        let device;
        try {
            const deviceOptions = {};
            if (this.test.device.enabled) deviceOptions.handlerName = this.test.device.handlerName;
            if (this.forcedRtpExtensions) deviceOptions.forcedRtpExtensions = this.forcedRtpExtensions;

            device = await this.mediasoupClient.Device.factory(deviceOptions);

            console.log('Device created successfully:', device.handlerName);
        } catch (error) {
            if (error.name === 'UnsupportedError') {
                console.error('Browser not supported:', error);
                this.userLog('error', 'Browser not supported. Please try a different browser.', 'center', 6000);
            } else {
                console.error('Error creating device:', error);
                this.userLog('error', `Failed to create device: ${error.message}`, 'center', 6000);
            }
            return null;
        }

        try {
            await device.load({
                routerRtpCapabilities,
                preferLocalCodecsOrder: !!this.preferLocalCodecsOrder,
            });
            console.log(
                `Device loaded successfully with router RTP capabilities (preferLocalCodecsOrder: ${!!this.preferLocalCodecsOrder})`,
                device.rtpCapabilities
            );
        } catch (error) {
            console.error('Error loading device with router RTP capabilities:', error);
            this.userLog('error', `Failed to load device: ${error.message}`, 'center', 6000);
            return null;
        }

        return device;
    }

    // ####################################################
    // TRANSPORTS
    // ####################################################

    async initTransports(device) {
        await this.initProducerTransport(device);
        await this.initConsumerTransport(device);
    }

    // ####################################################
    // PRODUCER TRANSPORT
    // ####################################################

    async initProducerTransport(device) {
        const producerTransportData = await this.socket.request('createWebRtcTransport', {
            forceTcp: false,
            rtpCapabilities: device.rtpCapabilities,
        });

        if (producerTransportData.error) {
            console.error('Producer Transport creation failed', producerTransportData.error);
            return;
        }

        this.producerTransport = device.createSendTransport(producerTransportData);
        this.setupProducerTransportHandlers();
    }

    setupProducerTransportHandlers() {
        this.producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
                await this.socket.request('connectTransport', {
                    transport_id: this.producerTransport.id,
                    dtlsParameters,
                });
                callback();
            } catch (err) {
                console.error('Producer Transport connection error', err);
                errback(err);
            }
        });

        this.producerTransport.on('produce', async ({ kind, appData, rtpParameters }, callback, errback) => {
            try {
                const { producer_id } = await this.socket.request('produce', {
                    producerTransportId: this.producerTransport.id,
                    kind,
                    appData,
                    rtpParameters,
                });
                callback({ id: producer_id });
            } catch (err) {
                errback(err);
            }
        });

        this.producerTransport.on(
            'producedata',
            async ({ sctpStreamParameters, label, protocol, appData }, callback, errback) => {
                try {
                    const { id } = await this.socket.request('produceData', {
                        transportId: this.producerTransport.id,
                        sctpStreamParameters,
                        label,
                        protocol,
                        appData,
                    });
                    callback({ id });
                } catch (err) {
                    errback(err);
                }
            }
        );

        const transport = this.producerTransport;
        transport.on('connectionstatechange', async (state) => {
            console.log(`Producer Transport state changed to: ${state}`, { id: transport.id });

            switch (state) {
                case 'connecting':
                    console.log('Producer Transport connecting...');
                    break;
                case 'connected':
                    console.log('✅ Producer Transport connected', { id: this.producerTransport.id });
                    break;
                case 'disconnected':
                    console.warn('⚠️ Producer Transport disconnected', { id: this.producerTransport.id });
                    console.warn('⚠️ Producer Attempting ICE restart...');
                    if (!this.socket.connected) {
                        console.info('Deferring producer ICE restart until signaling reconnects');
                        break;
                    }
                    if (!(await this.restartTransportWithRetry(transport, 'Producer'))) {
                        this.readmitAfterTransportFailure(transport);
                    }
                    break;
                case 'failed':
                    console.warn('❌ Producer Transport failed', { id: transport.id });
                    this.readmitAfterTransportFailure(transport);
                    break;
                default:
                    console.log('Producer transport connection state changed', {
                        state,
                        id: this.producerTransport.id,
                    });
                    break;
            }
        });

        this.producerTransport.on('icegatheringstatechange', (state) => {
            const normalStates = new Set(['new', 'gathering', 'complete']);
            normalStates.has(state)
                ? console.log('Producer ICE gathering state', { state, id: this.producerTransport.id })
                : console.warn('Unexpected Producer ICE gathering state', { state, id: this.producerTransport.id });
        });

        this.producerTransport.on('icecandidateerror', (error) => {
            console.error('❌ Producer ICE candidate error', {
                error: error,
                id: this.producerTransport.id,
            });
        });
    }

    // ####################################################
    // CONSUMER TRANSPORT
    // ####################################################

    async initConsumerTransport(device) {
        const consumerTransportData = await this.socket.request('createWebRtcTransport', {
            forceTcp: false,
        });

        if (consumerTransportData.error) {
            console.error('Consumer Transport creation failed', consumerTransportData.error);
            return;
        }

        this.consumerTransport = device.createRecvTransport(consumerTransportData);
        this.setupConsumerTransportHandlers();
    }

    setupConsumerTransportHandlers() {
        this.consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
                await this.socket.request('connectTransport', {
                    transport_id: this.consumerTransport.id,
                    dtlsParameters,
                });
                callback();
            } catch (err) {
                console.error('Consumer Transport connection error', err);
                errback(err);
            }
        });

        const transport = this.consumerTransport;
        transport.on('connectionstatechange', async (state) => {
            console.log(`Consumer Transport state changed to: ${state}`, { id: transport.id });

            switch (state) {
                case 'connecting':
                    console.log('Consumer Transport connecting...');
                    break;
                case 'connected':
                    console.log('✅ Consumer Transport connected', { id: this.consumerTransport.id });
                    break;
                case 'disconnected':
                    console.warn('⚠️ Consumer Transport disconnected', { id: this.consumerTransport.id });
                    console.warn('⚠️ Consumer Attempting ICE restart...');
                    if (!this.socket.connected) {
                        console.info('Deferring consumer ICE restart until signaling reconnects');
                        break;
                    }
                    if (!(await this.restartTransportWithRetry(transport, 'Consumer'))) {
                        this.readmitAfterTransportFailure(transport);
                    }
                    break;
                case 'failed':
                    console.warn('❌ Consumer Transport failed', { id: transport.id });
                    this.readmitAfterTransportFailure(transport);
                    break;
                default:
                    console.log('Consumer transport connection state changed', {
                        state,
                        id: this.consumerTransport.id,
                    });
                    break;
            }
        });

        this.consumerTransport.on('icegatheringstatechange', (state) => {
            const normalStates = new Set(['new', 'gathering', 'complete']);
            normalStates.has(state)
                ? console.log('Consumer ICE gathering state', { state, id: this.consumerTransport.id })
                : console.warn('Unexpected Consumer ICE gathering state', { state, id: this.consumerTransport.id });
        });

        this.consumerTransport.on('icecandidateerror', (error) => {
            console.error('❌ Consumer ICE candidate error', {
                error: error,
                id: this.consumerTransport.id,
            });
        });
    }

    // ####################################################
    // HANDLE ICE
    // ####################################################

    async restartTransportIce(transport, type) {
        if (!transport || typeof transport !== 'object' || transport.closed) return false;

        try {
            console.warn(`🔄 ${type} Restarting ICE...`, {
                id: transport.id,
                state: transport.connectionState,
            });

            const iceParameters = await this.socket.request('restartIce', {
                transport_id: transport.id,
            });

            if (!iceParameters) {
                console.warn(`⚠️ No ${type} ICE Parameters received`);
                return false;
            }

            console.info(`🚀 ${type} Restarting transport ICE`, iceParameters);

            await transport.restartIce({ iceParameters });

            console.info(`✅ Successfully restarted ${type} ICE`);
            return true;
        } catch (error) {
            console.error(`🔥 ${type} Restart ICE error`, {
                id: transport?.id,
                error: error,
            });
            return false;
        }
    }

    async restartTransportWithRetry(transport, transportType, maxRetries = 5, initialDelay = 1000) {
        let delay = initialDelay;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const reconnected = await this.restartTransportIce(transport, transportType);

            if (reconnected) {
                console.info(`✅ ${transportType} reconnected successfully on attempt ${attempt}.`);
                return true;
            }

            if (attempt < maxRetries) {
                console.warn(`🌀 ${transportType} reconnection attempt ${attempt} failed. Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff: 1s -> 2s -> 4s -> 8s -> 16s
            } else {
                console.error(`❌ ${transportType} failed to reconnect after ${maxRetries} attempts.`);
            }
        }

        return false;
    }

    async restartProducerIce(retries = 5, delay = 1000) {
        return this.restartTransportWithRetry(this.producerTransport, 'Producer', retries, delay);
    }

    async restartConsumerIce(retries = 5, delay = 1000) {
        return this.restartTransportWithRetry(this.consumerTransport, 'Consumer', retries, delay);
    }

    async restartIce() {
        if (this.iceRestarting) return false;

        console.warn('Restart ICE...', {
            producerTransportConnectionState: this.producerTransport.connectionState,
            consumerTransportConnectionState: this.consumerTransport.connectionState,
        });

        try {
            this.iceRestarting = true;
            const producerRecovered = await this.restartProducerIce();
            const consumerRecovered = await this.restartConsumerIce();
            if (!producerRecovered || !consumerRecovered) throw new Error('transport ICE recovery failed');
            console.log('✅ Restart ICE done');
            return true;
        } catch (error) {
            console.error('❌ Restart ICE error', error);
            return false;
        } finally {
            this.iceRestarting = false;
        }
    }

    // ####################################################
    // SOCKET ON
    // ####################################################

    initSockets() {
        this.socket.io.on('reconnect_attempt', this.handleSocketReconnectAttempt);
        this.socket.io.on('reconnect_failed', this.handleSocketReconnectFailed);
        this.socket.on('connect', this.handleSocketConnect);
        this.socket.on('connect_error', this.handleSocketConnectionError);
        this.socket.on('disconnect', this.handleSocketDisconnect);
        this.socket.on('transportClosed', this.handleTransportClosed);
        this.socket.on('consumerClosed', this.handleConsumerClosed);
        this.socket.on('setVideoOff', this.handleSetVideoOff);
        this.socket.on('removeMe', this.handleRemoveMe);
        this.socket.on('refreshParticipantsCount', this.handleRefreshParticipantsCount);
        this.socket.on('newProducers', this.handleNewProducers);
        this.socket.on('newDataProducer', this.handleNewDataProducer);
        this.socket.on('dataConsumerClosed', this.handleDataConsumerClosed);
        this.socket.on('message', this.handleMessage);
        this.socket.on('roomAction', this.handleRoomAction);
        this.socket.on('roomPassword', this.handleRoomPassword);
        this.socket.on('roomLobby', this.handleRoomLobby);
        this.socket.on('cmd', this.handleCmdData);
        this.socket.on('peerAction', this.handlePeerAction);
        this.socket.on('updatePeerInfo', this.handleUpdatePeerInfo);
        this.socket.on('bodrikMusicVolume', this.handleBodrikMusicVolume);
        this.socket.on('setPresenterRole', this.handleSetPresenterRole);
        this.socket.on('fileInfo', this.handleFileInfoData);
        this.socket.on('file', this.handleFileData);

        this.socket.on('fileAbort', this.handleFileAbortData);
        this.socket.on('receiveFileAbort', this.handleReceiveFileAbortData);

        this.socket.on('audioVolume', this.handleAudioVolumeData);
        this.socket.on('dominantSpeaker', this.handleDominantSpeakerData);
        this.socket.on('updateRoomModerator', this.handleUpdateRoomModeratorData);
        this.socket.on('updateRoomModeratorALL', this.handleUpdateRoomModeratorALLData);
        this.socket.on('recordingAction', this.handleRecordingActionData);

        this.socket.on('followMe', this.handleFollowMeData);
        this.socket.on('chatReaction', this.handleChatReaction);
    }

    // ####################################################
    // HANDLE SOCKET DATA
    // ####################################################

    handleSocketConnect = () => {
        console.info('[Recovery] signaling connected', { socketId: this.socket.id, recovered: this.socket.recovered });
        // Manager reconnect fires before the namespace socket receives its id and
        // recovery state. Only the Socket connect event can decide how to resume.
        if (this.recoveryDisconnectedAt != null && !this.isLeaving) {
            console.info('[Recovery] namespace reconnected', {
                socketId: this.socket.id,
                recovered: this.socket.recovered,
                elapsedMs: Date.now() - this.recoveryDisconnectedAt,
            });
            this.handleReconnect();
        }
    };

    handleSocketDisconnect = (reason) => {
        if (this.isLeaving) return;
        this.recoveryDisconnectedAt = Date.now();
        console.warn('[Recovery] signaling disconnected', { socketId: this.socket.id, reason });
        this.handleDisconnect(reason);
    };

    handleSocketConnectionError = (err) => {
        console.warn('[Recovery] connection error', { message: err.message, type: err.type });
    };

    handleSocketReconnectAttempt = (attempt) => {
        console.info('[Recovery] reconnect attempt', { attempt, elapsedMs: Date.now() - this.recoveryDisconnectedAt });
        this.handleReconnectAttempt(attempt);
    };

    handleSocketReconnectFailed = () => {
        console.error('SocketOn Reconnect failed');
        this.handleReconnectFailed();
    };
    handleBodrikMusicVolume = ({ volume }) => {
        const value = Number(volume);
        if (!Number.isFinite(value)) return;
        this.bodrikMusicVolume = Math.min(1, Math.max(0, value));
        this.getOutputAudioElements()
            .filter((element) => element.dataset.bodrikMusic === 'true')
            .forEach((element) => this.applyOutputVolume(element));
    };

    handleConsumerClosed = ({ consumer_id, consumer_kind }) => {
        console.log('SocketOn Closing consumer', { consumer_id, consumer_kind });
        this.removeConsumer(consumer_id, consumer_kind);
    };

    handleTransportClosed = ({ transport_id }) => {
        if (this.isLeaving) return;
        const transport = [this.producerTransport, this.consumerTransport].find(
            (candidate) => candidate?.id === transport_id
        );
        if (transport && !transport.closed) {
            console.warn('SocketOn Closing transport', { transport_id });
            this.readmitAfterTransportFailure(transport);
            if (!transport.closed) transport.close();
        }
    };

    /** Recover media when signaling survived but the current WebRTC transport did not. */
    readmitAfterTransportFailure(transport) {
        if (this.isLeaving || !this.socket.connected || !this._isConnected) return;
        if (transport !== this.producerTransport && transport !== this.consumerTransport) return;
        this.needsReadmission = true;
        if (this.rejoinInProgress) return;
        this._isConnected = false;
        this.showReconnectAlert();
        this.handleReconnect();
    }

    handleSetVideoOff = (data) => {
        {
            console.log('SocketOn setVideoOff', {
                peer_name: data.peer_name,
                peer_presenter: data.peer_presenter,
            });
            this.setVideoOff(data, true);
        }
    };

    handleRemoveMe = (data) => {
        console.log('SocketOn Remove me:', data);
        this.removeVideoOff(data.peer_id);
        this.lobbyRemoveMe(data.peer_id);
        participantsCount = data.peer_counts;
        adaptAspectRatio(participantsCount);
        if (isParticipantsListOpen) getRoomParticipants();
    };

    handleRefreshParticipantsCount = (data) => {
        console.log('SocketOn Participants Count:', data);
        participantsCount = data.peer_counts;
        {
            adaptAspectRatio(participantsCount);
        }
    };

    handleNewProducers = async (data, reconcile = false) => {
        if (data.length > 0) {
            // The music peer may publish while this client is still loading mediasoup.
            // joinAllowed requests all producers once the receive transport is ready.
            if (!this.device || !this.consumerTransport) {
                console.debug('Deferring producers until receive transport is ready');
                return;
            }
            if (!reconcile) {
                console.log('SocketOn New producers', {
                    data,
                    password: {
                        roomIsLocked: this.RoomIsLocked,
                        roomPasswordValid: this.RoomPasswordValid,
                    },
                    lobby: {
                        roomIsLobby: this.RoomIsLobby,
                        roomLobbyAccepted: this.RoomLobbyAccepted,
                    },
                });
            }

            if (this.RoomIsLocked && !this.RoomPasswordValid) {
                console.log('Access denied: Room is locked and password has not been validated yet', data);
                return;
            }

            if (this.RoomIsLobby && !this.RoomLobbyAccepted) {
                console.log('Access pending: Lobby mode is active, waiting for approval to join', data);
                return;
            }

            for (let { producer_id, peer_name, peer_info, type } of data) {
                // Skip own producers to prevent echo from self-consumption
                if (peer_info.peer_id === this.peer_id) {
                    console.warn('Skipping own producer to prevent echo', { producer_id, type });
                    continue;
                }
                await this.consume(producer_id, peer_name, peer_info, type);
            }

            this.applyPendingFollowMe();
        }
    };

    handleNewDataProducer = async (data) => {
        console.log('SocketOn New data producer:', data);
        if (data.peer_id === this.peer_id) return;
        await this.consumeData(data.dataProducerId);
    };

    handleDataConsumerClosed = (data) => {
        console.log('SocketOn Data consumer closed:', data);
        const { dataConsumer_id } = data;
        if (this.chatDataConsumers.has(dataConsumer_id)) {
            this.chatDataConsumers.delete(dataConsumer_id);
            console.log('DataConsumer removed', { dataConsumer_id });
        }
    };

    handleMessage = (data) => {
        console.log('SocketOn New message:', data);
        // Drop messages that violate the current moderator restrictions (defense-in-depth
        // in case a peer bypasses the client-side send guards).
        const isPublicMessage = data.to_peer_id === 'all';
        const isAIMessage = ['ChatGPT', 'DeepSeek'].includes(data.to_peer_id);
        if (!isAIMessage) {
            if (isPublicMessage && this._moderator.chat_cant_publicly) {
                console.warn('Dropping public message: disabled by moderator', data);
                return;
            }
            if (!isPublicMessage && this._moderator.chat_cant_privately) {
                console.warn('Dropping private message: disabled by moderator', data);
                return;
            }
        }
        this.showMessage(data);
    };

    handleRoomAction = (data) => {
        console.log('SocketOn Room action:', data);
        const action = typeof data === 'string' ? data : data.action;

        this.roomAction(action, false);
    };

    handleRoomPassword = (data) => {
        console.log('SocketOn Room password:', data.password);
        this.roomPassword(data);
    };

    handleRoomLobby = (data) => {
        console.log('SocketOn Room lobby:', data);
        this.roomLobby(data);
    };

    handleCmdData = (data) => {
        console.log('SocketOn Peer cmd:', data);
        this.handleCmd(data);
    };

    handlePeerAction = (data) => {
        console.log('SocketOn Peer action:', data);
        this.peerAction(data.from_peer_name, data.peer_id, data.action, false, data.broadcast, true, data.message);
    };

    handleUpdatePeerInfo = (data) => {
        console.log('SocketOn Peer info update:', data);
        this.updatePeerInfo(data.peer_name, data.peer_id, data.type, data.status, false, data.peer_presenter);
    };

    handleSetPresenterRole = (data) => {
        console.log('SocketOn setPresenterRole:', data);
        this.handlePresenterRole(data);
    };

    handleFileInfoData = (data) => {
        console.log('SocketOn File info:', data);
        this.handleFileInfo(data);
    };

    handleFileData = (data) => {
        this.handleFile(data);
    };

    handleFileAbortData = (data) => {
        this.handleFileAbort(data);
    };

    handleReceiveFileAbortData = (data) => {
        this.handleReceiveFileAbort(data);
    };

    handleAudioVolumeData = (data) => {
        this.handleAudioVolume(data);
    };

    handleDominantSpeakerData = (data) => {
        this.handleDominantSpeaker(data);
    };

    handleUpdateRoomModeratorData = (data) => {
        console.log('SocketOn Update room moderator', data);
        this.handleUpdateRoomModerator(data);
    };

    handleUpdateRoomModeratorALLData = (data) => {
        console.log('SocketOn Update room moderator ALL', data);
        this.handleUpdateRoomModeratorALL(data);
    };

    handleRecordingActionData = (data) => {
        console.log('SocketOn Recording action:', data);
        this.handleRecordingAction(data);
    };

    // ####################################################
    // SOCKET RECONNECT/DISCONNECT
    // ####################################################

    cacheReconnectBannerElements() {
        this.reconnectBanner = {
            root: this.getId('disconnectBanner'),
            overlay: this.getId('disconnectOverlay'),
            iconWrap: this.getId('disconnectBanner')?.querySelector('.disconnect-banner__icon-wrap'),
            icon: this.getId('disconnectBannerIcon'),
            title: this.getId('disconnectBannerTitle'),
            message: this.getId('disconnectBannerMessage'),
            meta: this.getId('disconnectBannerMeta'),
            action: this.getId('disconnectBannerAction'),
            spinner: this.getId('disconnectBannerSpinner'),
        };
    }

    getReconnectBanner() {
        if (!this.reconnectBanner?.root) {
            this.cacheReconnectBannerElements();
        }
        return this.reconnectBanner;
    }

    /** Render the reconnect notice using the selected meeting language. */
    renderReconnectBanner({
        title,
        message,
        meta = '',
        icon = 'fa-solid fa-plug',
        state = 'reconnecting',
        showSpinner = true,
        actionLabel = '',
        onAction = null,
        blockUi = state !== 'restored',
    }) {
        if (this.silentReconnect) return;

        const banner = this.getReconnectBanner();
        if (!banner?.root) return;

        if (this.reconnectBannerHideTimer) {
            clearTimeout(this.reconnectBannerHideTimer);
            this.reconnectBannerHideTimer = null;
        }

        banner.root.style.display = 'flex';
        banner.root.setAttribute('aria-hidden', 'false');
        banner.root.classList.remove('is-reconnecting', 'is-restored', 'is-failed', 'is-interactive');
        banner.root.classList.add('is-visible', `is-${state}`);

        if (banner.overlay) {
            banner.overlay.style.display = blockUi ? 'block' : 'none';
            banner.overlay.setAttribute('aria-hidden', blockUi ? 'false' : 'true');
            banner.overlay.classList.toggle('is-visible', blockUi);
        }

        if (banner.iconWrap) {
            banner.iconWrap.style.display = 'inline-flex';
        }

        const t = (key, namespace = 'labels') => window.i18n?.t(key, namespace) || key;
        if (banner.icon) banner.icon.className = icon;
        if (banner.title) banner.title.textContent = t(title);
        if (banner.message) banner.message.textContent = t(message);

        if (banner.meta) {
            banner.meta.textContent = t(meta);
            banner.meta.style.display = meta ? 'inline-flex' : 'none';
        }

        if (banner.action) {
            banner.action.textContent = t(actionLabel || 'Join Room', 'buttons');
            banner.action.style.display = actionLabel ? 'inline-flex' : 'none';
            banner.action.onclick = typeof onAction === 'function' ? () => onAction() : null;
        }

        if (banner.spinner) {
            banner.spinner.style.display = showSpinner ? 'inline-flex' : 'none';
        }

        if (actionLabel && typeof onAction === 'function') {
            banner.root.classList.add('is-interactive');
        }
    }

    hideReconnectBanner(delay = 0) {
        const banner = this.getReconnectBanner();
        if (!banner?.root) return;

        if (this.reconnectBannerHideTimer) {
            clearTimeout(this.reconnectBannerHideTimer);
        }

        const hide = () => {
            banner.root.classList.remove('is-visible', 'is-reconnecting', 'is-restored', 'is-failed', 'is-interactive');
            banner.root.setAttribute('aria-hidden', 'true');
            banner.root.style.display = 'none';
            if (banner.overlay) {
                banner.overlay.classList.remove('is-visible');
                banner.overlay.setAttribute('aria-hidden', 'true');
                banner.overlay.style.display = 'none';
            }
            if (banner.action) {
                banner.action.style.display = 'none';
                banner.action.onclick = null;
            }
            this.reconnectBannerHideTimer = null;
        };

        if (delay > 0) {
            this.reconnectBannerHideTimer = setTimeout(hide, delay);
            return;
        }

        hide();
    }

    /** Show a readable interruption notice while signaling retries. */
    showReconnectAlert() {
        this.renderReconnectBanner({
            title: 'Connection lost',
            message: 'Network connection interrupted.',
            meta: 'Retrying',
            icon: 'fa-solid fa-plug',
            state: 'reconnecting',
            showSpinner: true,
        });
    }

    showMaxAttemptsAlert() {
        this.renderReconnectBanner({
            title: 'Unable to reconnect',
            message: 'Connection could not be restored.',
            meta: '',
            icon: 'fa-solid fa-triangle-exclamation',
            state: 'failed',
            showSpinner: false,
            actionLabel: 'Try again',
            onAction: () => this.retryMeetingConnection(),
        });
    }

    showServerAwayMessage() {
        if (this.serverAwayShown) return;
        this.serverAwayShown = true;
        console.warn('Server away or in maintenance, please wait...');
        this.ServerAway();
        this.exit(true);
    }

    attemptReconnect(attempt) {
        if (this._isConnected) return;

        const currentAttempt = Math.min(attempt, this.maxReconnectAttempts);

        const delay = Math.min(this.reconnectInterval * currentAttempt, this.maxReconnectInterval);

        this.updateReconnectAlert(delay, currentAttempt);
    }

    handleDisconnect(reason) {
        endRoomSession();

        window.localStorage.isReconnected = true;
        console.log('Disconnected.', reason);

        // Immediately save recording if there is one, a paused one included.
        if (this.isRecording() || this.hasActiveRecorder()) {
            this.saveRecording('Socket disconnected');
        }

        this.serverAwayShown = false;
        this._isConnected = false;

        this.showReconnectAlert();
    }

    handleReconnectAttempt(attempt) {
        if (this.isLeaving || this._isConnected || attempt > this.maxReconnectAttempts) return;
        this.attemptReconnect(attempt);
    }

    async handleReconnect() {
        if (this.isLeaving || this.rejoinInProgress) return;
        this.rejoinInProgress = true;
        const reconnectId = this.socket.id;
        console.info('[Recovery] meeting recovery started', {
            socketId: reconnectId,
            recovered: this.socket.recovered,
            elapsedMs: Date.now() - this.recoveryDisconnectedAt,
        });
        try {
            if (!this.socket.recovered || this.needsReadmission) {
                await window.BodrikNetworkRecovery.rejoin(this);
            } else {
                const iceRecovered = await this.restartIce();
                if (!iceRecovered || this.needsReadmission) await window.BodrikNetworkRecovery.rejoin(this);
                else {
                    this.socket.emit('getProducers');
                    try {
                        await this.reconcileConsumers();
                    } catch (error) {
                        console.warn('Initial consumer reconciliation after recovery failed', error);
                    }
                    this.startConsumerReconcile();
                }
            }
            if (this.isLeaving || !this.socket.connected || this.socket.id !== reconnectId) return;
            this.needsReadmission = false;
            this._isConnected = true;
            startRoomSession();
            this.closeReconnectAlert(true);
            console.info('Recovered meeting without reloading the page');
        } catch (error) {
            if (this.isLeaving || !this.socket.connected || this.socket.id !== reconnectId) return;
            console.error('In-place meeting recovery failed', error);
            this.needsReadmission = true;
            this._isConnected = false;
            this.showMaxAttemptsAlert();
        } finally {
            this.rejoinInProgress = false;
            if (!this.isLeaving && this.socket.connected && this.socket.id !== reconnectId) this.handleReconnect();
        }
    }

    /** Retry signaling or readmit this tab without navigating to a pre-join screen. */
    retryMeetingConnection() {
        if (this.socket.connected) this.handleReconnect();
        else this.socket.connect();
    }

    handleReconnectFailed() {
        if (!this._isConnected && !this.isLeaving) {
            this.closeReconnectAlert();
            this.showMaxAttemptsAlert();
        }
    }

    /** Display the current attempt and the next retry delay in the selected language. */
    updateReconnectAlert(delay, attempt = 1) {
        const seconds = Math.max(1, Math.round(delay / 1000));

        const t = (key) => window.i18n?.t(key, 'labels') || key;
        this.renderReconnectBanner({
            title: 'Reconnecting',
            message: t('Attempt {attempt} of {max}.')
                .replace('{attempt}', attempt)
                .replace('{max}', this.maxReconnectAttempts),
            meta: t('Retry in {seconds}s').replace('{seconds}', seconds),
            icon: 'fa-solid fa-rotate-right',
            state: 'reconnecting',
            showSpinner: true,
        });
    }

    closeReconnectAlert(showRestoredState = false) {
        if (this.reconnectAlert) {
            this.reconnectAlert.close();
            this.reconnectAlert = null;
        }

        if (!showRestoredState) {
            this.hideReconnectBanner();
            return;
        }

        this.renderReconnectBanner({
            title: 'Back online',
            message: 'Connection restored.',
            meta: 'Media restored',
            icon: 'fa-solid fa-wifi',
            state: 'restored',
            showSpinner: false,
            blockUi: false,
        });

        this.hideReconnectBanner(1500);
    }

    // ####################################################
    // SERVER AWAY/MAINTENANCE
    // ####################################################

    ServerAway() {
        this.sound('alert');
        Swal.fire({
            allowOutsideClick: false,
            allowEscapeKey: false,
            showDenyButton: false,
            showConfirmButton: false,
            background: swalBackground,
            position: 'top',
            icon: 'warning',
            title: 'Server away',
            html: renderRoomTemplate('popupServerAwayTemplate'),
            denyButtonText: `Leave room`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then((result) => {
            if (!result.isConfirmed) {
                this.event(_EVENTS.exitRoom);
            }
        });
    }

    removePeerInfoFromLocalStorage() {
        try {
            localStorage.removeItem('sfu_peer_info');
        } catch (e) {
            console.warn('Unable to remove sfu_peer_info from localStorage:', e);
        }
    }

    updatePeerInfoInLocalStorage() {
        try {
            localStorage.setItem('sfu_peer_info', JSON.stringify(this.peer_info));
        } catch (e) {
            console.warn('Unable to save peer_info to localStorage:', e);
        }
    }

    getPeerInfoFromLocalStorage() {
        try {
            const sfu_peer_info = localStorage.getItem('sfu_peer_info');
            return sfu_peer_info ? JSON.parse(sfu_peer_info) : null;
        } catch (e) {
            console.warn('Unable to get sfu_peer_info from localStorage:', e);
            return null;
        }
    }

    refreshBrowser() {
        endRoomSession();
        this.updatePeerInfoInLocalStorage();
        const reconnectDirectJoinURL = this.getReconnectDirectJoinURL();
        setTimeout(() => {
            this.exit(true);
            openURL(reconnectDirectJoinURL);
            this.removePeerInfoFromLocalStorage();
        }, 100);
    }

    getReconnectDirectJoinURL() {
        const sfu_peer_info = this.getPeerInfoFromLocalStorage();
        const publicRoomMatch = window.location.pathname.match(/^\/room\/([^/]+)$/);
        if (publicRoomMatch) {
            return `${window.location.origin}/join/${encodeURIComponent(decodeURIComponent(publicRoomMatch[1]))}`;
        }

        const { peer_audio, peer_video, peer_screen, peer_token } = sfu_peer_info ? sfu_peer_info : this.peer_info;
        const baseUrl = `${window.location.origin}/join`;
        const queryParams = {
            room: this.room_id,
            roomPassword: this.RoomPassword,
            name: this.peer_name,
            audio: peer_audio,
            video: peer_video,
            screen: peer_screen,
            notify: 0,
        };
        if (peer_token) queryParams.token = peer_token;
        const url = `${baseUrl}?${Object.entries(queryParams)
            .map(([key, value]) => `${key}=${value}`)
            .join('&')}`;
        return url;
    }

    // ####################################################
    // CHECK USER
    // ####################################################

    // ####################################################

    // ####################################################

    // ####################################################
    // START LOCAL AUDIO VIDEO MEDIA
    // ####################################################

    async startLocalMedia() {
        console.log('08 ----> START LOCAL MEDIA...');
        const audioProducerExist = this.producerExist(mediaType.audio);
        if (this.isAudioAllowed) {
            if (!audioProducerExist) {
                await this.produce(mediaType.audio, microphoneSelect.value);
                console.log('09 ----> START AUDIO MEDIA');
            }
            if (this._moderator.audio_start_muted || this.rejoiningMuted) {
                if (!this.rejoiningMuted) await this.sleep(300);
                await this.pauseAudioProducer();
            }
        } else {
            if (isEnumerateAudioDevices && !audioProducerExist) {
                await this.produce(mediaType.audio, microphoneSelect.value);
                console.log('09 ----> START AUDIO MEDIA');
                if (!this.rejoiningMuted) await this.sleep(300);
                await this.pauseAudioProducer();
            } else {
                setColor(startAudioButton, 'red');
            }
        }

        if (this.isVideoAllowed && !this._moderator.video_start_hidden) {
            await this.produce(mediaType.video, videoSelect.value);
            console.log('10 ----> START VIDEO MEDIA');
        } else {
            setColor(startVideoButton, 'red');
            this.setVideoOff(this.peer_info, false);
            this.sendVideoOff();
            if (BUTTONS.main.startVideoButton) this.event(_EVENTS.stopVideo);
            this.updatePeerInfo(this.peer_name, this.peer_id, 'video', false);
            console.log('10 ----> VIDEO IS OFF');
        }

        if (!isEnumerateAudioDevices) {
            hide(startAudioButton);
            hide(stopAudioButton);
            hide(startAudioDeviceDropdown);
        }

        if (this.joinRoomWithScreen && !this._moderator.screen_cant_share) {
            await this.produce(mediaType.screen, null, false, true);
            console.log('11 ----> START SCREEN MEDIA');
        }

        console.log('[startLocalMedia] - PRODUCER LABEL', this.producerLabel);
    }

    async pauseAudioProducer() {
        setColor(startAudioButton, 'red');
        this.setIsAudio(this.peer_id, false);
        if (BUTTONS.main.startAudioButton) this.event(_EVENTS.stopAudio);
        await this.pauseProducer(mediaType.audio);
        console.log('09 ----> PAUSE AUDIO MEDIA');
        this.updatePeerInfo(this.peer_name, this.peer_id, 'audio', false);
    }

    // ####################################################
    // PRODUCER
    // ####################################################

    /** Capture and publish local media, releasing failed camera captures and restoring video-off state. */
    async produce(type, deviceId = null, swapCamera = false, init = false) {
        let mediaConstraints = {};
        let elem;
        let stream;
        let audio = false;
        let video = false;
        let screen = false;

        switch (type) {
            case mediaType.audio:
                if (!BUTTONS.main.startAudioButton) return;
                this.isAudioAllowed = true;
                mediaConstraints = this.getAudioConstraints(deviceId);
                this.peer_info.peer_audio = true;
                audio = true;
                break;
            case mediaType.video:
                if (!BUTTONS.main.startVideoButton) return;
                this.isVideoAllowed = true;
                mediaConstraints = swapCamera ? this.getCameraConstraints() : this.getVideoConstraints(deviceId);
                this.peer_info.peer_video = true;
                video = true;
                break;
            case mediaType.screen:
                if (!BUTTONS.main.startScreenButton) return;
                mediaConstraints = this.getScreenConstraints();
                this.peer_info.peer_screen = true;
                screen = true;
                break;
            default:
                return;
        }

        if (!this.device.canProduce('video') && !audio) {
            return console.error('Cannot produce video');
        }

        if (this.producerLabel.has(type)) {
            return console.warn('Producer already exists for this type ' + type);
        }

        const videoPrivacyBtn = this.getId(this.peer_id + '__vp');
        if (videoPrivacyBtn) videoPrivacyBtn.style.display = screen ? 'none' : 'inline';

        console.log(`Media constraints ${type}:`, mediaConstraints);

        try {
            if (init) {
                stream = initStream;
            } else {
                stream = screen
                    ? await navigator.mediaDevices.getDisplayMedia(mediaConstraints)
                    : await navigator.mediaDevices.getUserMedia(mediaConstraints);

                // Handle Virtual Background and Blur using MediaPipe
                if (video && isMediaStreamTrackAndTransformerSupported) {
                    const videoTrack = stream.getVideoTracks()[0];

                    if (virtualBackgroundBlurLevel) {
                        // Apply blur before sending it to WebRTC stream
                        stream = await virtualBackground.applyBlurToWebRTCStream(
                            videoTrack,
                            virtualBackgroundBlurLevel
                        );
                    } else if (virtualBackgroundSelectedImage) {
                        // Apply virtual background to WebRTC stream
                        stream = await virtualBackground.applyVirtualBackgroundToWebRTCStream(
                            videoTrack,
                            virtualBackgroundSelectedImage
                        );
                    } else if (virtualBackgroundTransparent) {
                        // Apply Transparent virtual background to WebRTC stream
                        stream = await virtualBackground.applyTransparentVirtualBackgroundToWebRTCStream(videoTrack);
                    }
                }
            }

            if (audio && BUTTONS.settings.customNoiseSuppression) {
                /*
                 * Initialize RNNoise Suppression if enabled and supported
                 * This will only apply to audio tracks
                 * and will not affect video tracks.
                 */
                await this.initRNNoiseSuppression();
                stream = await this.getRNNoiseSuppressionStream(stream);
            }

            console.log('Supported Constraints', navigator.mediaDevices.getSupportedConstraints());

            const track = audio ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
            // A muted microphone must never transmit even briefly during a hard readmission.
            if (audio && this.rejoiningMuted) track.enabled = false;

            if (screen) {
                /*
                 * track.contentHint helps optimize media tracks for specific use cases:
                 * - 'motion': For high frame rate (video playback, game streaming)
                 * - 'detail': For high fidelity (screen sharing with text/graphics)
                 */
                if ('contentHint' in track) {
                    show(ScreenOptimizationDiv);

                    const contentHint = screenOptimization.value;
                    if (contentHint !== 'None') {
                        track.contentHint = contentHint;
                        console.info(`Optimized video track for screen sharing: ${contentHint}`);
                    }
                } else {
                    hide(ScreenOptimizationDiv);
                    console.warn('contentHint is not supported in this browser');
                }
            }

            console.log(`${type} settings ->`, track.getSettings());

            const params = {
                track,
                appData: {
                    mediaType: type,
                },
            };

            if (audio) {
                console.log('AUDIO ENABLE OPUS (channelCount: 2)');
                params.codecOptions = {
                    opusStereo: true,
                    opusDtx: true,
                    opusFec: true,
                    opusNack: true,
                };
            }

            if (video) {
                const { encodings, codec } = this.getWebCamEncoding();
                console.log('GET WEBCAM ENCODING', {
                    encodings: encodings,
                    codecs: codec,
                });
                params.encodings = encodings;
                params.codecs = codec;
                params.codecOptions = {
                    videoGoogleStartBitrate: 1000,
                };
            }

            if (screen) {
                const { encodings, codec } = this.getScreenEncoding();
                console.log('GET SCREEN ENCODING', {
                    encodings: encodings,
                    codecs: codec,
                });
                params.encodings = encodings;
                params.codecs = codec;
                params.codecOptions = {
                    videoGoogleStartBitrate: 1000,
                };
            }

            console.log('PRODUCER TYPE AND PARAMS', {
                type: type,
                params: params,
            });

            const producer = await this.producerTransport.produce(params);

            if (!producer) {
                throw new Error('Producer not found!');
            }

            console.log('PRODUCER MEDIA TYPE ----> ' + type);
            console.log('PRODUCER', producer);

            this.producers.set(producer.id, producer);
            this.producerLabel.set(type, producer.id);

            // if screen sharing produce the tab audio + microphone
            if (screen && stream.getAudioTracks()[0]) {
                await this.produceScreenAudio(stream);
            }

            if (!audio) {
                this.localVideoStream = stream;

                elem = await this.handleProducer(producer.id, type, stream);

                if (video) {
                    this.localVideoElement = elem;
                    this.videoProducerId = producer.id;
                    camera = detectCameraFacingMode(stream);
                    handleCameraMirror(elem);
                }

                if (screen) {
                    this.screenProducerId = producer.id;
                    if (elem.classList.contains('mirror')) {
                        elem.classList.remove('mirror');
                    }
                }
            } else {
                this.localAudioStream = stream;

                elem = await this.handleProducer(producer.id, type, stream);

                this.audioProducerId = producer.id;

                getMicrophoneVolumeIndicator(stream);
            }

            if (video) {
            }

            producer.on('trackended', () => {
                this.closeProducer(type, 'trackended');
            });

            producer.on('transportclose', () => {
                this.closeProducer(type, 'transportclose');
            });

            producer.on('close', () => {
                this.closeProducer(type, 'close');
            });

            switch (type) {
                case mediaType.audio:
                    this.setIsAudio(this.peer_id, true);
                    this.event(_EVENTS.startAudio);
                    break;
                case mediaType.video:
                    this.setIsVideo(true);
                    this.event(_EVENTS.startVideo);
                    break;
                case mediaType.screen:
                    this.setIsScreen(true);
                    this.event(_EVENTS.startScreen);
                    break;
                default:
                    break;
            }

            this.sound('joined');
            return producer;
        } catch (err) {
            console.error('Produce error:', err);
            if (type === mediaType.video) {
                stream?.getTracks().forEach((track) => track.stop());
                this.isVideoAllowed = false;
                this.peer_info.peer_video = false;
                this.event(_EVENTS.stopVideo);
            }
            handleMediaError(type, err);
        }
    }

    // ####################################################
    // HANDLE VIRTUAL BACKGROUND AND BLUR
    // ####################################################

    showVideoImageSelector() {
        const videoVirtualBackground = document.getElementById('videoVirtualBackground');
        const imageGrid = document.getElementById('imageGrid');
        const imageGridVideo = document.getElementById('imageGridVideo');
        const imageGridVideoControls = document.getElementById('imageGridVideoControls');

        // Grid elements missing: keep the whole section (label + grid) hidden to avoid a lonely label
        if (!imageGrid || !imageGridVideo) {
            if (videoVirtualBackground) hide(videoVirtualBackground);
            return;
        }

        elemDisplay('imageGridVideo', true, 'grid');
        if (imageGridVideoControls) elemDisplay('imageGridVideoControls', true, 'grid');
        // Reveal the section (label + grid) only now that the grid is visible/populated
        if (videoVirtualBackground) show(videoVirtualBackground);
        if (imageGridVideo.innerHTML != '') return;

        imageGrid.innerHTML = ''; // Clear previous init images
        imageGridVideo.innerHTML = ''; // Clear previous images
        if (imageGridVideoControls) imageGridVideoControls.innerHTML = ''; // Clear previous controls

        function createImage(id, src, tooltip, index, clickHandler, target = imageGridVideo) {
            const img = document.createElement('img');
            img.id = id;
            img.src = src;
            img.dataset.index = index;
            img.addEventListener('click', clickHandler);
            target.appendChild(img);
            if (tooltip) {
                setTippy(img.id, tooltip, 'top');
            }
        }

        // Highlight the currently selected virtual background / control with a border
        function setSelectedVb(el) {
            document
                .querySelectorAll('#imageGridVideoControls img.vb-selected, #imageGridVideo img.vb-selected')
                .forEach((img) => img.classList.remove('vb-selected'));
            if (el) el.classList.add('vb-selected');
        }

        // Common function to handle virtual background changes
        async function handleVirtualBackground(blurLevel = null, imgSrc = null, transparentBg = null) {
            if (!blurLevel && !imgSrc && !transparentBg) {
                virtualBackgroundBlurLevel = null;
                virtualBackgroundSelectedImage = null;
                virtualBackgroundTransparent = null;
            }
            await rc.applyVirtualBackground(blurLevel, imgSrc, transparentBg);
        }

        // Create clean virtual bg Image
        createImage(
            'cleanVbImg',
            image.user,
            'Remove virtual background',
            'cleanVb',
            (e) => {
                setSelectedVb(e.currentTarget);
                handleVirtualBackground(null, null);
            },
            imageGridVideoControls
        );
        // Create High Blur Image
        createImage(
            'highBlurImg',
            image.blurHigh,
            'High Blur',
            'high',
            (e) => {
                setSelectedVb(e.currentTarget);
                handleVirtualBackground(20);
            },
            imageGridVideoControls
        );

        // Create Low Blur Image
        createImage(
            'lowBlurImg',
            image.blurLow,
            'Low Blur',
            'low',
            (e) => {
                setSelectedVb(e.currentTarget);
                handleVirtualBackground(10);
            },
            imageGridVideoControls
        );

        // Create transparent virtual bg Image
        createImage(
            'transparentBg',
            image.transparentBg,
            'Transparent Virtual background',
            'transparentVb',
            (e) => {
                setSelectedVb(e.currentTarget);
                handleVirtualBackground(null, null, true);
            },
            imageGridVideoControls
        );

        // Handle file upload (common logic for file selection)
        function setupFileUploadButton(buttonId, sourceImg, tooltip, handler) {
            const imgButton = document.createElement('img');
            imgButton.id = buttonId;
            imgButton.src = sourceImg;
            imgButton.addEventListener('click', handler);
            imageGridVideoControls.appendChild(imgButton);
            setTippy(imgButton.id, tooltip, 'top');
        }

        function handleFileUpload(file) {
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const imgData = e.target.result;
                    await indexedDBHelper.saveImage(imgData);
                    addImageToUI(imgData);
                };
                reader.readAsDataURL(file);
            }
        }

        function createUploadImageButton() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            fileInput.addEventListener('change', (event) => {
                handleFileUpload(event.target.files[0]);
            });

            setupFileUploadButton('uploadImg', image.upload, 'Upload your custom image', () => fileInput.click());

            return fileInput;
        }

        // Function to add an image to UI
        function addImageToUI(imgData) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-wrapper';

            const customImg = document.createElement('img');
            customImg.src = imgData;
            customImg.addEventListener('click', (e) => {
                setSelectedVb(e.currentTarget);
                handleVirtualBackground(null, imgData);
            });

            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-icon fas fa-times';
            deleteBtn.addEventListener('click', async (event) => {
                event.stopPropagation();
                await indexedDBHelper.removeImage(imgData);
                imageContainer.remove();
            });

            imageContainer.appendChild(customImg);
            imageContainer.appendChild(deleteBtn);
            imageGridVideo.appendChild(imageContainer);
        }

        // Function to fetch and store an image from URL
        async function fetchAndStoreImage(url) {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const imgData = e.target.result;
                    await indexedDBHelper.saveImage(imgData);
                    addImageToUI(imgData);
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.error('Error fetching image:', error);
                // Detect CORS issue and provide a clearer error message
                error.message.includes('Failed to fetch')
                    ? showError(errorMessage, 'Error: Unable to fetch image. CORS policy may be blocking the request.')
                    : showError(errorMessage, `Error fetching image: ${error.message}`);
            }
        }

        // Paste image from URL
        function askForImageURL() {
            elemDisplay(imageUrlModal.id, true);
            navigator.clipboard
                .readText()
                .then((clipboardText) => {
                    if (isValidImageURL(filterXSS(clipboardText))) {
                        imageUrlInput.value = clipboardText;
                    }
                })
                .catch(() => {});
        }

        saveImageUrlBtn.addEventListener('click', async () => {
            elemDisplay(imageUrlModal.id, false);
            if (isValidImageURL(imageUrlInput.value)) {
                await fetchAndStoreImage(imageUrlInput.value);
                imageUrlInput.value = '';
            }
        });

        cancelImageUrlBtn.addEventListener('click', () => {
            elemDisplay(imageUrlModal.id, false);
            imageUrlInput.value = '';
        });

        // Upload from file button
        createUploadImageButton();

        // Upload from URL button
        setupFileUploadButton('linkImage', image.link, 'Upload Image from URL', askForImageURL);

        // Load default virtual backgrounds
        virtualBackgrounds.forEach((imageUrl, index) => {
            createImage(`virtualBg${index}`, imageUrl, null, index + 1, (e) => {
                setSelectedVb(e.currentTarget);
                handleVirtualBackground(null, imageUrl);
            });
        });

        // Load stored images and add to image grid UI
        indexedDBHelper.getAllImages().then((images) => images.forEach(addImageToUI));

        // Upload image with drag and drop
        imageGridVideo.addEventListener('dragover', (event) => {
            event.preventDefault();
            imageGridVideo.classList.add('drag-over');
        });

        imageGridVideo.addEventListener('dragleave', () => {
            imageGridVideo.classList.remove('drag-over');
        });

        imageGridVideo.addEventListener('drop', (event) => {
            event.preventDefault();
            imageGridVideo.classList.remove('drag-over');
            if (event.dataTransfer.files.length > 0) {
                handleFileUpload(event.dataTransfer.files[0]);
            }
        });
    }

    // ####################################################
    // VIRTUAL BACKGROUND HELPER
    // ####################################################

    async applyVirtualBackground(blurLevel, backgroundImage, backgroundTransparent) {
        if (blurLevel) {
            virtualBackgroundBlurLevel = blurLevel;
            virtualBackgroundSelectedImage = null;
            virtualBackgroundTransparent = null;
        } else if (backgroundImage) {
            virtualBackgroundBlurLevel = null;
            virtualBackgroundSelectedImage = backgroundImage;
            virtualBackgroundTransparent = null;
        } else if (backgroundTransparent) {
            virtualBackgroundBlurLevel = null;
            virtualBackgroundSelectedImage = null;
            virtualBackgroundTransparent = true;
        } else {
            virtualBackgroundBlurLevel = null;
            virtualBackgroundSelectedImage = null;
            virtualBackgroundTransparent = null;
        }

        videoSelect.onchange();
        saveVirtualBackgroundSettings(blurLevel, backgroundImage, backgroundTransparent);
    }

    // ####################################################
    // NOISE SUPPRESSION
    // ####################################################

    async initRNNoiseSuppression() {
        if (typeof RNNoiseProcessor === 'undefined') {
            console.warn('RNNoiseProcessor is not available.');
            this.handleRNNoiseNotSupported();
            return;
        }

        if (!RNNoiseProcessor.isSupported()) {
            console.warn('RNNoise: AudioWorklet or WebAssembly not supported on this device, skipping.');
            this.handleRNNoiseNotSupported();
            return;
        }

        const supports48k = await RNNoiseProcessor.isSampleRateSupported();
        if (!supports48k) {
            console.warn('RNNoise: device does not support 48 kHz sample rate, skipping.');
            this.handleRNNoiseNotSupported();
            return;
        }

        this.disableRNNoiseSuppression();

        this.RNNoiseProcessor = new RNNoiseProcessor();
    }

    handleRNNoiseNotSupported() {
        this.isRNNoiseSupported = false;

        // Uncheck the toggle so localStorage stays consistent
        if (switchNoiseSuppression) switchNoiseSuppression.checked = false;
        localStorageSettings.mic_noise_suppression = false;
        lS.setSettings(localStorageSettings);

        // Hide the custom noise suppression toggle in audio settings
        elemDisplay('noiseSuppressionButton', false);
    }

    async getRNNoiseSuppressionStream(stream) {
        if (!this.RNNoiseProcessor) {
            console.warn('RNNoiseProcessor not initialized.');
            //
            return stream;
        }

        try {
            const processedStream = await this.RNNoiseProcessor.startProcessing(stream);

            if (localStorageSettings.mic_noise_suppression) {
                this.RNNoiseProcessor.toggleNoiseSuppression();
                switchNoiseSuppression.checked = this.RNNoiseProcessor.noiseSuppressionEnabled;
            }

            if (typeof labelNoiseSuppression !== 'undefined') {
                labelNoiseSuppression.style.color = this.RNNoiseProcessor.noiseSuppressionEnabled ? 'lime' : 'white';
            }

            return processedStream;
        } catch (err) {
            console.warn('RNNoiseProcessor failed, using original stream:', err);
            return stream;
        }
    }

    disableRNNoiseSuppression() {
        if (this.RNNoiseProcessor) {
            try {
                this.RNNoiseProcessor.stopProcessing();
            } catch (err) {
                // ignore
            }
            this.RNNoiseProcessor = null;
            console.warn('RNNoiseProcessor already initialized, stopping previous instance.');
        }
    }

    // ####################################################
    // AUDIO/VIDEO/SCREEN CONSTRAINTS
    // ####################################################

    getAudioConstraints(deviceId) {
        // Use the browser fallback only when noise suppression is enabled but RNNoise is unavailable.
        const useBuiltInNoiseSuppression =
            localStorageSettings.mic_noise_suppression &&
            (!BUTTONS.settings.customNoiseSuppression || !this.isRNNoiseSupported);

        const audioConstraints = {
            echoCancellation: localStorageSettings.mic_echo_cancellation === true,
            autoGainControl: localStorageSettings.mic_auto_gain_control === true,
            noiseSuppression: useBuiltInNoiseSuppression,
        };
        /* 
        deviceId handling is platform-dependent:
            - iOS Safari: routing is OS-controlled; ignore deviceId.
            - Mobile (Android): best-effort with `ideal`.
            - Desktop: `exact` is reliable.
        */
        if (deviceId) {
            if (this.isMobileSafari) {
                // ignore
            } else if (this.isMobileDevice) {
                audioConstraints.deviceId = { ideal: deviceId };
            } else {
                audioConstraints.deviceId = { exact: deviceId };
            }
        }

        return {
            audio: audioConstraints,
        };
    }

    getCameraConstraints() {
        camera = camera == 'user' ? 'environment' : 'user';
        if (camera != 'user') this.camVideo = { facingMode: { exact: camera } };
        else this.camVideo = true;
        return {
            audio: false,
            video: this.camVideo,
        };
    }

    getResolutionMap() {
        return {
            qvga: [320, 240],
            vga: [640, 480],
            hd: [1280, 720],
            fhd: [1920, 1080],
            '2k': [2560, 1440],
            '4k': [3840, 2160],
            '6k': [6144, 3456],
            '8k': [7680, 4320],
        };
    }

    getVideoConstraints(deviceId) {
        const selectedValue = this.getSelectedIndexValue(videoFps);
        const customFrameRate = parseInt(selectedValue, 10);

        const resolutionMap = this.getResolutionMap();

        // Default to HD
        const [width, height] = resolutionMap[videoQuality.value] || [1280, 720];

        const constraints = {
            width: { ideal: width },
            height: { ideal: height },
            frameRate: { ideal: customFrameRate || 30 },
        };

        if (deviceId) {
            constraints.deviceId = { exact: deviceId };
        }

        return {
            audio: false,
            video: constraints,
        };
    }

    getScreenConstraints() {
        const selectedValue = this.getSelectedIndexValue(screenFps);
        const customFrameRate = parseInt(selectedValue, 10);

        const screenResolutionMap = this.getResolutionMap();

        // Default to Full HD
        const [width, height] = screenResolutionMap[screenQuality.value] || [1920, 1080];

        const videoConstraints = {
            width: { ideal: width },
            height: { ideal: height },
            frameRate: { ideal: customFrameRate || 30 },
        };

        return {
            audio: true,
            video: videoConstraints,
        };
    }

    // ####################################################
    // WEBCAM ENCODING
    // ####################################################

    getWebCamEncoding() {
        let encodings;
        let codec;

        console.log('WEBCAM ENCODING', {
            forceVP8: this.forceVP8,
            forceVP9: this.forceVP9,
            forceH264: this.forceH264,
            forceAV1: this.forceAV1,
            numSimulcastStreamsWebcam: this.numSimulcastStreamsWebcam,
            enableWebcamLayers: this.enableWebcamLayers,
            webcamScalabilityMode: this.webcamScalabilityMode,
            rtpCapabilitiesCodecs: this.device.rtpCapabilities.codecs,
        });

        if (this.forceVP8) {
            codec = this.device.rtpCapabilities.codecs.find((c) => c.mimeType.toLowerCase() === 'video/vp8');
            if (!codec) throw new Error('Desired VP8 codec+configuration is not supported');
        } else if (this.forceH264) {
            codec = this.device.rtpCapabilities.codecs.find((c) => c.mimeType.toLowerCase() === 'video/h264');
            if (!codec) throw new Error('Desired H264 codec+configuration is not supported');
        } else if (this.forceVP9) {
            codec = this.device.rtpCapabilities.codecs.find((c) => c.mimeType.toLowerCase() === 'video/vp9');
            if (!codec) throw new Error('Desired VP9 codec+configuration is not supported');
        } else if (this.forceAV1) {
            codec = this.device.rtpCapabilities.codecs.find((c) => c.mimeType.toLowerCase() === 'video/av1');
            if (!codec) throw new Error('Desired AV1 codec+configuration is not supported');
        }

        if (this.enableWebcamLayers) {
            console.log('WEBCAM SIMULCAST/SVC ENABLED');

            const firstVideoCodec = this.device.rtpCapabilities.codecs.find((c) => c.kind === 'video');
            console.log('WEBCAM ENCODING: first codec available', { firstVideoCodec: firstVideoCodec });

            // If VP9 is the only available video codec then use SVC.
            if (
                ((this.forceVP9 || this.forceAV1) && codec) ||
                (firstVideoCodec?.mimeType &&
                    ['video/vp9', 'video/av1'].includes(firstVideoCodec.mimeType.toLowerCase()))
            ) {
                console.log('WEBCAM ENCODING: VP9 or AV1 with SVC');
                encodings = [
                    {
                        maxBitrate: 5000000,
                        scalabilityMode: this.webcamScalabilityMode || 'L3T3_KEY',
                    },
                ];
            } else {
                console.log('WEBCAM ENCODING: VP8 or H264 with simulcast');
                encodings = [
                    {
                        scaleResolutionDownBy: 1,
                        maxBitrate: 5000000,
                        scalabilityMode: this.webcamScalabilityMode || 'L1T3',
                    },
                ];
                if (this.numSimulcastStreamsWebcam > 1) {
                    encodings.unshift({
                        scaleResolutionDownBy: 2,
                        maxBitrate: 1000000,
                        scalabilityMode: this.webcamScalabilityMode || 'L1T3',
                    });
                }
                if (this.numSimulcastStreamsWebcam > 2) {
                    encodings.unshift({
                        scaleResolutionDownBy: 4,
                        maxBitrate: 500000,
                        scalabilityMode: this.webcamScalabilityMode || 'L1T3',
                    });
                }
            }
        }
        return { encodings, codec };
    }

    // ####################################################
    // SCREEN ENCODING
    // ####################################################

    getScreenEncoding() {
        let encodings;
        let codec;

        console.log('SCREEN ENCODING', {
            forceVP8: this.forceVP8,
            forceVP9: this.forceVP9,
            forceH264: this.forceH264,
            forceAV1: this.forceAV1,
            numSimulcastStreamsSharing: this.numSimulcastStreamsSharing,
            enableSharingLayers: this.enableSharingLayers,
            sharingScalabilityMode: this.sharingScalabilityMode,
            rtpCapabilitiesCodecs: this.device.rtpCapabilities.codecs,
        });

        if (this.forceVP8) {
            codec = this.device.rtpCapabilities.codecs.find((c) => c.mimeType.toLowerCase() === 'video/vp8');
            if (!codec) throw new Error('Desired VP8 codec+configuration is not supported');
        } else if (this.forceH264) {
            codec = this.device.rtpCapabilities.codecs.find((c) => c.mimeType.toLowerCase() === 'video/h264');
            if (!codec) throw new Error('Desired H264 codec+configuration is not supported');
        } else if (this.forceVP9) {
            codec = this.device.rtpCapabilities.codecs.find((c) => c.mimeType.toLowerCase() === 'video/vp9');
            if (!codec) throw new Error('Desired VP9 codec+configuration is not supported');
        } else if (this.forceAV1) {
            codec = this.device.rtpCapabilities.codecs.find((c) => c.mimeType.toLowerCase() === 'video/av1');
            if (!codec) throw new Error('Desired AV1 codec+configuration is not supported');
        }

        if (this.enableSharingLayers) {
            console.log('SCREEN SIMULCAST/SVC ENABLED');

            const firstVideoCodec = this.device.rtpCapabilities.codecs.find((c) => c.kind === 'video');
            console.log('SCREEN ENCODING: first codec available', { firstVideoCodec: firstVideoCodec });

            // If VP9 is the only available video codec then use SVC.
            if (
                ((this.forceVP9 || this.forceAV1) && codec) ||
                (firstVideoCodec?.mimeType &&
                    ['video/vp9', 'video/av1'].includes(firstVideoCodec.mimeType.toLowerCase()))
            ) {
                console.log('SCREEN ENCODING: VP9 or AV1 with SVC');
                encodings = [
                    {
                        maxBitrate: 5000000,
                        scalabilityMode: this.sharingScalabilityMode || 'L3T3',
                        dtx: true,
                    },
                ];
            } else {
                console.log('SCREEN ENCODING: VP8 or H264 with simulcast.');
                encodings = [
                    {
                        scaleResolutionDownBy: 1,
                        maxBitrate: 5000000,
                        scalabilityMode: this.sharingScalabilityMode || 'L1T3',
                        dtx: true,
                    },
                ];
                if (this.numSimulcastStreamsSharing > 1) {
                    encodings.unshift({
                        scaleResolutionDownBy: 2,
                        maxBitrate: 1000000,
                        scalabilityMode: this.sharingScalabilityMode || 'L1T3',
                        dtx: true,
                    });
                }
                if (this.numSimulcastStreamsSharing > 2) {
                    encodings.unshift({
                        scaleResolutionDownBy: 4,
                        maxBitrate: 500000,
                        scalabilityMode: this.sharingScalabilityMode || 'L1T3',
                        dtx: true,
                    });
                }
            }
        } else {
            // No simulcast or SVC enabled.
            encodings = [
                {
                    scaleResolutionDownBy: 1,
                    maxBitrate: 5000000,
                    dtx: true,
                },
            ];
        }
        return { encodings, codec };
    }

    // ####################################################
    // HELPERS
    // ####################################################

    createButton(id, className) {
        const button = document.createElement('button');
        button.id = id;
        button.className = className;
        return button;
    }

    createVideoLoader(id) {
        const loader = document.createElement('div');
        loader.id = id;
        loader.className = 'video-loader';
        loader.innerHTML = renderRoomTemplate('videoLoaderTemplate');
        return loader;
    }

    hideVideoLoader(container) {
        const loader = container.querySelector('.video-loader');
        if (loader) loader.style.display = 'none';
    }

    hideVideoLoaderOnPlay(videoElem) {
        const container = videoElem.parentElement;
        if (!container) return;
        const hide = () => {
            this.hideVideoLoader(container);
            videoElem.removeEventListener('playing', hide);
        };
        videoElem.addEventListener('playing', hide);
    }

    createElement(id, type, className) {
        const element = document.createElement(type);
        element.id = id;
        element.className = className;
        return element;
    }

    getConsumerIdByProducerId(producerId) {
        for (let [consumerId, consumer] of this.consumers.entries()) {
            if (consumer._producerId === producerId) {
                return consumerId;
            }
        }
        return null;
    }

    getProducerIdByConsumerId(consumerId) {
        const consumer = this.consumers.get(consumerId);
        if (consumer) {
            return consumer._producerId;
        }
        return null;
    }

    // ####################################################
    // PRODUCER
    // ####################################################

    producerExist(type) {
        return this.producerLabel.has(type);
    }

    closeThenProduce(type, deviceId = null, swapCamera = false) {
        const previousCamera = camera;
        this.closeProducer(type, 'closeThenProduce');
        setTimeout(async function () {
            try {
                await rc.produce(type, deviceId, swapCamera);
            } catch (err) {
                console.error('closeThenProduce error, restoring previous camera', err);
                if (swapCamera) {
                    camera = previousCamera;
                    try {
                        await rc.produce(type, deviceId, false);
                    } catch (restoreErr) {
                        console.error('Failed to restore previous camera', restoreErr);
                    }
                }
            }
        }, 1000);
    }

    async handleProducer(id, type, stream) {
        let elem, vb, vp, d, p, i, au, pip, ha, fs, pm, pb, pn, mv, st, ri;
        switch (type) {
            case mediaType.video:
            case mediaType.screen:
                let isScreen = type === mediaType.screen;
                this.removeVideoOff(this.peer_id);

                d = document.createElement('div');
                d.className = 'Camera';
                d.id = id + '__video';
                d.dataset.peerId = this.peer_id;
                d.dataset.cameraOff = 'false';

                elem = document.createElement('video');
                elem.setAttribute('id', id);
                elem.setAttribute('volume', this.peer_id + '___pVolume');
                !isScreen && elem.setAttribute('name', this.peer_id);
                elem.setAttribute('playsinline', true);
                elem.controls = isVideoControlsOn;
                elem.autoplay = true;
                elem.muted = true;
                elem.volume = 0;
                elem.style.objectFit = isScreen ? 'contain' : 'var(--videoObjFit)';

                const localVideoLoader = this.createVideoLoader(id + '__loader');

                vb = document.createElement('div');
                vb.id = id + '__vb';
                vb.className = 'videoMenuBar hidden';

                pip = this.createButton(id + '__pictureInPicture', html.pip);
                ha = this.createButton(id + '__hideALL', html.hideALL + ' focusMode');
                fs = this.createButton(id + '__fullScreen', html.fullScreen);

                mv = this.createButton(id + '__mirror', html.mirror);

                pn = this.createButton(id + '__pin', html.pin);
                st = this.createElement(
                    id + '__sessionTime',
                    'span',
                    'current-session-time notranslate navbar-session-time'
                );
                vp = this.createButton(this.peer_id + '__vp', html.videoPrivacy);
                au = this.createButton(
                    this.peer_id + '__audio',
                    this.peer_info.peer_audio ? html.audioOn : html.audioOff
                );
                au.style.cursor = 'default';

                p = document.createElement('p');
                p.id = this.peer_id + '__name';
                p.className = html.userName;
                this.setPeerNameWithPresenter(p, isPresenter, this.peer_name + this.meSuffix());

                ri = this.createElement(this.peer_id + '__recIndicator', 'span', 'rec-indicator');
                ri.innerHTML = '🔴 ';
                p.appendChild(ri);
                if (this._isRecording) ri.classList.add('active');

                i = document.createElement('i');
                i.id = this.peer_id + '__hand';
                i.className = html.userHand;
                i.style.display = this.peer_info.peer_hand ? 'inline-flex' : 'none';

                pm = document.createElement('div');
                pb = document.createElement('div');
                pm.setAttribute('id', this.peer_id + '_pitchMeter');
                pb.setAttribute('id', this.peer_id + '_pitchBar');
                pm.className = 'speechbar';
                pb.className = 'bar';
                pb.style.height = '1%';
                pm.appendChild(pb);

                BUTTONS.producerVideo.muteAudioButton && vb.appendChild(au);
                BUTTONS.producerVideo.videoPrivacyButton && !isScreen && vb.appendChild(vp);

                BUTTONS.producerVideo.videoPictureInPicture &&
                    this.isVideoPictureInPictureSupported &&
                    vb.appendChild(pip);

                // Local dropdown menu
                const myDropdownDiv = document.createElement('div');
                const myDropdownBtn = this.createButton(id + '__dropdownBtn', html.expand);
                const myDropdownContent = document.createElement('div');
                myDropdownDiv.className = 'navbar-dropdown';
                myDropdownContent.className = 'navbar-dropdown-content';

                BUTTONS.producerVideo.pinVideoButton &&
                    !this.isMobileDevice &&
                    myDropdownContent.appendChild(this.createResponsiveDropdownItem(pn, 'Pin Video', 'compact'));
                BUTTONS.producerVideo.focusVideoButton &&
                    myDropdownContent.appendChild(this.createResponsiveDropdownItem(ha, 'Focus Mode'));
                BUTTONS.producerVideo.videoPictureInPicture &&
                    this.isVideoPictureInPictureSupported &&
                    myDropdownContent.appendChild(this.createResponsiveDropdownItem(pip, 'Picture in Picture'));

                BUTTONS.producerVideo.videoPrivacyButton &&
                    !isScreen &&
                    myDropdownContent.appendChild(this.createResponsiveDropdownItem(vp, 'Video Privacy'));

                BUTTONS.producerVideo.videoMirrorButton &&
                    myDropdownContent.appendChild(this.createDropdownItem(mv, 'Mirror', myDropdownContent));
                BUTTONS.producerVideo.fullScreenButton &&
                    this.isVideoFullScreenSupported &&
                    myDropdownContent.appendChild(this.createDropdownItem(fs, 'Full Screen', myDropdownContent));

                myDropdownDiv.appendChild(myDropdownBtn);
                document.body.appendChild(myDropdownContent);
                myDropdownBtn._dropdownContent = myDropdownContent;
                this.handleDropdownEvents(myDropdownDiv, myDropdownBtn, myDropdownContent);

                vb.appendChild(myDropdownDiv);
                BUTTONS.producerVideo.muteAudioButton && vb.appendChild(au);
                BUTTONS.producerVideo.videoPrivacyButton && !isScreen && vb.appendChild(vp);

                BUTTONS.producerVideo.videoPictureInPicture &&
                    this.isVideoPictureInPictureSupported &&
                    vb.appendChild(pip);

                BUTTONS.producerVideo.focusVideoButton && vb.appendChild(ha);
                if (BUTTONS.producerVideo.pinVideoButton && !this.isMobileDevice) vb.appendChild(pn);

                vb.appendChild(st);

                d.appendChild(elem);
                d.appendChild(localVideoLoader);
                d.appendChild(pm);
                d.appendChild(i);
                d.appendChild(p);

                const hideVideoMenu = () => {
                    if (vb && !vb.classList.contains('hidden')) {
                        hide(vb);
                        setCamerasBorderNone();
                    }
                };

                if (this.isMobileDevice) {
                    vb.classList.add('mobile-floating');
                    document.body.appendChild(vb);
                } else {
                    vb.classList.remove('mobile-floating');
                    d.appendChild(vb);
                    d.addEventListener('mouseleave', hideVideoMenu);
                }
                vb.addEventListener('click', (e) => e.stopPropagation());

                this.videoMediaContainer.appendChild(d);
                if (typeof applyParticipantGridVisibility === 'function') applyParticipantGridVisibility();

                await this.attachMediaStream(elem, stream, type, 'Producer');

                this.myVideoEl = elem;
                this.isVideoPictureInPictureSupported && this.handlePIP(elem.id, pip.id);
                this.isVideoFullScreenSupported && this.handleFS(elem.id, fs.id);
                this.handleVB(d.id, vb.id);
                this.handleDD(elem.id, this.peer_id, true);

                this.handleMV(elem.id, mv.id);
                this.handleHA(ha.id, d.id);

                this.handlePN(elem.id, pn.id, d.id, isScreen);
                this.handleZV(elem.id, d.id, this.peer_id);
                if (!isScreen) this.handleVP(elem.id, vp.id);

                this.popupPeerInfo(p.id, this.peer_info);
                this.checkPeerInfoStatus(this.peer_info);

                if (isScreen && this.videoMediaContainer.childElementCount > 1) pn.click();

                if (!this.isMobileDevice) {
                    this.setTippy(pn.id, 'Toggle Pin', 'bottom');
                    this.setTippy(ha.id, 'Toggle Focus mode', 'bottom');
                    this.setTippy(pip.id, 'Toggle picture in picture', 'bottom');

                    this.setTippy(vp.id, 'Toggle video privacy', 'bottom');
                    this.setTippy(au.id, 'Audio status', 'bottom');
                }

                handleAspectRatio();
                console.log('[addProducer] Video-element-count', this.videoMediaContainer.childElementCount);
                break;
            case mediaType.audio:
                elem = document.createElement('audio');
                elem.setAttribute('id', id);
                elem.setAttribute('name', 'LOCAL-AUDIO');
                elem.setAttribute('volume', this.peer_id + '___pVolume');
                elem.controls = false;
                elem.autoplay = true;
                elem.muted = true;
                elem.volume = 0;
                this.myAudioEl = elem;
                this.localAudioEl.appendChild(elem);

                await this.attachMediaStream(elem, stream, type, 'Producer');

                console.log('[addProducer] audio-element-count', this.localAudioEl.childElementCount);
                break;
            default:
                break;
        }
        return elem;
    }

    async pauseProducer(type) {
        if (!this.producerLabel.has(type)) {
            return console.warn('There is no producer for this type ' + type);
        }

        const producer_id = this.producerLabel.get(type);
        this.producers.get(producer_id).pause();

        try {
            const response = await this.socket.request('pauseProducer', { producer_id, type });
            console.log('Producer paused', response);
        } catch (error) {
            console.error('Error pausing producer', error);
        }

        switch (type) {
            case mediaType.audio:
                this.event(_EVENTS.pauseAudio);
                break;
            case mediaType.video:
                this.event(_EVENTS.pauseVideo);
                break;
            case mediaType.screen:
                this.event(_EVENTS.pauseScreen);
                break;
            default:
                return;
        }
    }

    async resumeProducer(type) {
        if (!this.producerLabel.has(type)) {
            return console.warn('There is no producer for this type ' + type);
        }

        const producer_id = this.producerLabel.get(type);
        this.producers.get(producer_id).resume();

        try {
            const response = await this.socket.request('resumeProducer', { producer_id, type });
            console.log('Producer resumed', response);
        } catch (error) {
            console.error('Error resuming producer', error);
        }

        switch (type) {
            case mediaType.audio:
                this.event(_EVENTS.resumeAudio);
                break;
            case mediaType.video:
                this.event(_EVENTS.resumeVideo);
                break;
            case mediaType.screen:
                this.event(_EVENTS.resumeScreen);
                break;
            default:
                return;
        }
    }

    closeProducer(type, event = 'Close Producer') {
        if (!this.producerLabel.has(type)) {
            return console.warn('There is no producer for this type ' + type);
        }

        const producer_id = this.producerLabel.get(type);
        const producer = this.producers.get(producer_id);

        // Stop all tracks of the producer's stream
        if (producer && producer.track) {
            try {
                producer.track.stop();
            } catch (err) {
                console.warn('Error stopping producer track:', err);
            }
        }

        const data = {
            peer_name: this.peer_name,
            producer_id: producer_id,
            type: type,
            status: false,
        };
        console.log(`${event} ${type}`, data);

        this.socket.emit('producerClosed', data);

        this.producers.get(producer_id).close();
        this.producers.delete(producer_id);
        this.producerLabel.delete(type);

        console.log(`[${event}] - PRODUCER LABEL`, this.producerLabel);

        if (type === mediaType.video || type === mediaType.screen) {
            if (this.isVideoPinned && this.pinnedVideoPlayerId == producer_id) {
                this.removeVideoPinMediaContainer();
                console.log('Remove pin container due the Producer close', {
                    producer_id: producer_id,
                    producer_type: type,
                });
            }

            const video = this.getId(producer_id);
            this.removeVideoProducer(video, event);
        }

        if (type === mediaType.audio) {
            const audio = this.getId(producer_id);
            this.removeAudioProducer(audio, event);
        }

        if (type === mediaType.audioTab) {
            const auTab = this.getId(producer_id);
            this.removeAudioProducer(auTab, event);
        }

        switch (type) {
            case mediaType.audioTab:
                console.log('Closed audio tab');
                break;
            case mediaType.audio:
                this.setIsAudio(this.peer_id, false);
                this.event(_EVENTS.stopAudio);
                break;
            case mediaType.video:
                this.setIsVideo(false);
                this.event(_EVENTS.stopVideo);
                break;
            case mediaType.screen:
                this.setIsScreen(false);
                this.event(_EVENTS.stopScreen);
                if (this.producerLabel.has(mediaType.audioTab)) {
                    this.closeProducer(mediaType.audioTab, event);
                }
                break;
            default:
                break;
        }
        this.sound('left');
    }

    async produceScreenAudio(stream) {
        try {
            if (this.producerLabel.has(mediaType.audioTab)) {
                return console.warn('Producer already exists for this type ' + mediaType.audioTab);
            }

            const track = stream.getAudioTracks()[0];
            const params = {
                track,
                appData: {
                    mediaType: mediaType.audio,
                },
            };

            const producerSa = await this.producerTransport.produce(params);

            console.log('PRODUCER SCREEN AUDIO', producerSa);

            this.producers.set(producerSa.id, producerSa);
            this.producerLabel.set(mediaType.audioTab, producerSa.id);

            console.log('[produceScreenAudio] - PRODUCER LABEL', this.producerLabel);

            await this.handleProducer(producerSa.id, mediaType.audio, stream);

            producerSa.on('trackended', () => {
                this.closeProducer(mediaType.audioTab, 'trackended');
            });

            producerSa.on('transportclose', () => {
                this.closeProducer(mediaType.audioTab, 'transportclose');
            });

            producerSa.on('close', () => {
                this.closeProducer(mediaType.audioTab, 'close');
            });
        } catch (err) {
            console.error('Produce Screen Audio error:', err);
        }
    }

    // ####################################################
    // REMOVE PRODUCER VIDEO/AUDIO
    // ####################################################

    removeVideoProducer(video, event) {
        const d = this.getId(video.id + '__video');
        const vb = this.getId(video.id + '__vb');

        // Destroy drawing overlay if present

        // Clean up dropdown menus appended to body
        if (vb) {
            const dropdownBtns = vb.querySelectorAll('[id$="_expandBtn"], [id$="__dropdownBtn"]');
            dropdownBtns.forEach((btn) => {
                if (btn._dropdownContent) {
                    btn._dropdownContent.remove();
                }
            });
        }

        video.srcObject.getTracks().forEach(function (track) {
            track.stop();
        });
        video.parentNode.removeChild(video);

        d.parentNode.removeChild(d);
        vb.parentNode.removeChild(vb);

        handleAspectRatio();

        console.log(`[${event}] Video-element-count`, this.videoMediaContainer.childElementCount);
    }

    removeAudioProducer(audio, event) {
        audio.srcObject.getTracks().forEach(function (track) {
            track.stop();
        });
        audio.parentNode.removeChild(audio);

        console.log(`[${event}] audio-element-count`, this.localAudioEl.childElementCount);
    }

    // ####################################################
    // CONSUMER
    // ####################################################

    async consume(producer_id, peer_name, peer_info, type) {
        let createdConsumer = null;
        const existingConsumerId = this.consumersProducer.get(producer_id);
        if (existingConsumerId && this.consumers.has(existingConsumerId)) {
            if (this.resumedConsumers.has(existingConsumerId)) return;
            const resumed = await this.resumeConsumerWithRetry(existingConsumerId, type);
            if (!resumed) {
                console.error('Reconcile: could not resume existing consumer, removing for recreate', {
                    producer_id,
                    consumer_id: existingConsumerId,
                    type,
                });
                this.removeConsumer(existingConsumerId, this.consumers.get(existingConsumerId).kind);
            }
            return;
        }

        if (this.consumingProducers.has(producer_id)) return;
        this.consumingProducers.add(producer_id);

        try {
            const { consumer, stream, kind } = await this.getConsumeStream(producer_id, peer_info.peer_id, type);
            createdConsumer = consumer;

            console.log('CONSUMER MEDIA TYPE ----> ' + type);
            console.log('CONSUMER', consumer);

            this.consumers.set(consumer.id, consumer);
            this.consumersProducer.set(producer_id, consumer.id);

            await this.handleConsumer(consumer.id, type, stream, peer_name, peer_info);

            // https://mediasoup.discourse.group/t/create-server-side-consumers-with-paused-true/244
            const resumed = await this.resumeConsumerWithRetry(consumer.id, type);
            if (!resumed) {
                console.error('Failed to resume consumer after retries, removing it for later reconcile', {
                    consumer_id: consumer.id,
                    producer_id,
                    type,
                });
                this.removeConsumer(consumer.id, kind);
                return;
            }

            if (kind === 'video' && isParticipantsListOpen) {
                await getRoomParticipants();
            }

            consumer.on('trackended', () => {
                console.log('Consumer track end', { id: consumer.id, type });
                this.removeConsumer(consumer.id, consumer.kind);
            });

            consumer.on('transportclose', () => {
                console.log('Consumer transport close', { id: consumer.id, type });
                this.removeConsumer(consumer.id, consumer.kind);
            });
        } catch (error) {
            if (error.code === 'PRODUCER_NOT_FOUND') {
                console.debug('Consume skipped: producer is no longer available', { producer_id, type });
                return;
            }

            console.error('Error in consume', error);

            if (createdConsumer && this.consumers.has(createdConsumer.id)) {
                this.removeConsumer(createdConsumer.id, createdConsumer.kind);
            }

            popupHtmlMessage(null, image.network, 'Consume', error, 'center', false, false);
        } finally {
            this.consumingProducers.delete(producer_id);
        }
    }

    async resumeConsumerWithRetry(consumer_id, type) {
        try {
            const response = await this.socket.requestWithRetry('resumeConsumer', { consumer_id, type });
            this.resumedConsumers.add(consumer_id);
            console.log('Consumer resumed', { consumer_id, type, response });
            return true;
        } catch (error) {
            console.error('Error resuming consumer after retries', { consumer_id, type, error });
            return false;
        }
    }

    // ####################################################
    // CONSUMER RECONCILIATION
    // ####################################################

    startConsumerReconcile(intervalMs = 30000) {
        if (this.consumerReconcileInterval) return;
        const schedule = () => {
            const delay = Math.round(intervalMs * (0.8 + Math.random() * 0.4));
            this.consumerReconcileInterval = setTimeout(async () => {
                await this.reconcileConsumers();
                if (this.consumerReconcileInterval) schedule();
            }, delay);
        };
        schedule();
        console.log('Consumer reconcile started', { intervalMs });
    }

    stopConsumerReconcile() {
        if (this.consumerReconcileInterval) {
            clearTimeout(this.consumerReconcileInterval);
            this.consumerReconcileInterval = null;
            console.log('Consumer reconcile stopped');
        }
    }

    async reconcileConsumers() {
        if (!this._isConnected || !this.socket || !this.socket.connected) return;
        if (this.RoomIsLocked && !this.RoomPasswordValid) return;
        if (this.RoomIsLobby && !this.RoomLobbyAccepted) return;
        if (this.consumerReconcileInProgress) return;
        this.consumerReconcileInProgress = true;
        try {
            const producers = await this.socket.request(
                'getProducers',
                { knownProducerIds: [...this.consumersProducer.keys()] },
                5000
            );
            await this.handleNewProducers(producers, true);
        } catch (error) {
            console.warn('Consumer reconcile failed', error);
        } finally {
            this.consumerReconcileInProgress = false;
        }
    }

    // ####################################################
    // DATA CHANNEL (Chat via mediasoup DataChannel)
    // ####################################################

    async initChatDataProducer() {
        if (!this.producerTransport) {
            console.warn('Producer transport not available, skipping chat DataProducer creation');
            return;
        }

        try {
            this.chatDataProducer = await this.producerTransport.produceData({
                ordered: true,
                maxRetransmits: 3,
                label: 'chat',
                appData: { type: 'chat' },
            });

            this.chatDataProducer.on('open', () => {
                console.log('✅ Chat DataProducer open');
            });

            this.chatDataProducer.on('close', () => {
                console.log('Chat DataProducer closed');
                this.chatDataProducer = null;
            });

            this.chatDataProducer.on('error', (error) => {
                console.error('Chat DataProducer error', error);
            });

            this.chatDataProducer.on('transportclose', () => {
                console.log('Chat DataProducer transport closed');
                this.chatDataProducer = null;
            });

            console.log('Chat DataProducer created', { id: this.chatDataProducer.id });
        } catch (error) {
            console.error('Failed to create chat DataProducer', error);
            this.chatDataProducer = null;
        }
    }

    async consumeData(dataProducerId) {
        if (!this.consumerTransport) {
            console.warn('Consumer transport not available, skipping DataConsumer creation');
            return;
        }

        try {
            const params = await this.socket.request('consumeData', {
                consumerTransportId: this.consumerTransport.id,
                dataProducerId,
            });

            if (!params || params.error) {
                console.error('ConsumeData error', params?.error);
                return;
            }

            const dataConsumer = await this.consumerTransport.consumeData({
                id: params.id,
                dataProducerId: params.dataProducerId,
                sctpStreamParameters: params.sctpStreamParameters,
                label: params.label,
                protocol: params.protocol,
                appData: params.appData,
            });

            dataConsumer.on('message', (data) => {
                try {
                    const msg = JSON.parse(data);
                    if (msg.type === 'chat') {
                        console.log('DataChannel chat message received', msg);
                        // Drop messages that violate current moderator restrictions
                        const isPublicMessage = msg.to_peer_id === 'all';
                        const isAIMessage = ['ChatGPT', 'DeepSeek'].includes(msg.to_peer_id);
                        if (!isAIMessage) {
                            if (isPublicMessage && this._moderator.chat_cant_publicly) {
                                console.warn('Dropping DataChannel public message: disabled by moderator', msg);
                                return;
                            }
                            if (!isPublicMessage && this._moderator.chat_cant_privately) {
                                console.warn('Dropping DataChannel private message: disabled by moderator', msg);
                                return;
                            }
                        }
                        this.showMessage(msg);
                    }
                } catch (error) {
                    console.error('Failed to parse DataChannel message', error);
                }
            });

            dataConsumer.on('close', () => {
                console.log('DataConsumer closed', { id: dataConsumer.id });
                this.chatDataConsumers.delete(dataConsumer.id);
            });

            dataConsumer.on('error', (error) => {
                console.error('DataConsumer error', { id: dataConsumer.id, error });
            });

            dataConsumer.on('transportclose', () => {
                console.log('DataConsumer transport closed', { id: dataConsumer.id });
                this.chatDataConsumers.delete(dataConsumer.id);
            });

            this.chatDataConsumers.set(dataConsumer.id, dataConsumer);

            console.log('DataConsumer created', {
                id: dataConsumer.id,
                dataProducerId: params.dataProducerId,
                label: params.label,
            });
        } catch (error) {
            console.error('Failed to consume data', error);
        }
    }

    isChatDataChannelOpen() {
        return this.chatDataProducer && !this.chatDataProducer.closed && this.chatDataProducer.readyState === 'open';
    }

    sendChatDataChannelMessage(data) {
        if (!this.isChatDataChannelOpen()) return false;

        try {
            const message = JSON.stringify(data);
            this.chatDataProducer.send(message);
            return true;
        } catch (error) {
            console.error('Failed to send DataChannel message', error);
            return false;
        }
    }

    async getConsumeStream(producerId, peer_id, type) {
        if (!this.device) {
            throw new Error('Device not initialized');
        }

        // Check if consumer transport exists
        if (!this.consumerTransport) {
            throw new Error('Consumer transport not initialized');
        }

        const { rtpCapabilities } = this.device;

        const data = await this.socket.requestWithRetry('consume', {
            consumerTransportId: this.consumerTransport.id,
            rtpCapabilities,
            producerId,
            type,
        });

        const { id, kind, rtpParameters } = data;
        const codecOptions = {};
        const streamId = peer_id + (type == mediaType.screen ? '-screen-sharing' : '-mic-webcam');
        const consumer = await this.consumerTransport.consume({
            id,
            producerId,
            kind,
            rtpParameters,
            codecOptions,
            streamId,
        });

        const stream = new MediaStream();
        stream.addTrack(consumer.track);

        return {
            consumer,
            stream,
            kind,
        };
    }

    async handleConsumer(id, type, stream, peer_name, peer_info) {
        let elem, vb, d, p, i, cm, au, pip, fs, sf, sm, gl, ban, ko, pb, pm, pv, pn, ha, hg, mv, role;

        let eDiv, eBtn, eVc; // expand buttons

        console.log('PEER-INFO', peer_info);

        const remotePeerId = peer_info.peer_id;
        const remoteIsScreen = type == mediaType.screen;
        const remotePeerAudio = peer_info.peer_audio;
        const remotePeerAudioVolume = peer_info.peer_audio_volume;
        const remotePrivacyOn = peer_info.peer_video_privacy;
        if (peer_info.peer_bot && Number.isFinite(Number(peer_info.peer_music_volume))) {
            this.bodrikMusicVolume = Math.min(1, Math.max(0, Number(peer_info.peer_music_volume)));
        }
        const remotePeerPresenter = peer_info.peer_presenter;

        switch (type) {
            case mediaType.video:
            case mediaType.screen:
                this.removeVideoOff(remotePeerId);

                d = document.createElement('div');
                d.className = 'Camera';
                d.id = id + '__video';
                d.dataset.peerId = remotePeerId;
                d.dataset.cameraOff = 'false';

                elem = document.createElement('video');
                elem.setAttribute('id', id);
                elem.setAttribute('volumeBar', remotePeerId + '___pVolume');
                !remoteIsScreen && elem.setAttribute('name', remotePeerId);
                elem.setAttribute('playsinline', true);
                elem.controls = isVideoControlsOn;
                elem.autoplay = true;
                elem.muted = true;
                elem.className = '';
                elem.style.objectFit = remoteIsScreen ? 'contain' : 'var(--videoObjFit)';

                const remoteVideoLoader = this.createVideoLoader(id + '__loader');

                vb = document.createElement('div');
                vb.id = id + '__vb';
                vb.className = 'videoMenuBar hidden';

                eDiv = document.createElement('div');
                eDiv.className = 'navbar-dropdown';

                eBtn = this.createButton(
                    remotePeerId + (type === mediaType.screen ? '_screen_' : '_video_') + '_expandBtn',
                    html.expand
                );

                eVc = document.createElement('div');
                eVc.className = 'navbar-dropdown-content';
                eVc.id = remotePeerId + (type === mediaType.screen ? '_screen_' : '_video_') + '_videoExpandContent';

                pip = this.createButton(id + '__pictureInPicture', html.pip);
                mv = this.createButton(id + '__videoMirror', html.mirror);
                fs = this.createButton(id + '__fullScreen', html.fullScreen);

                pn = this.createButton(id + '__pin', html.pin);
                ha = this.createButton(id + '__hideALL', html.hideALL + ' focusMode');
                hg = this.createButton(id + '___' + remotePeerId + '___hideFromGrid', html.hideFromGrid);
                sf = this.createButton(id + '___' + remotePeerId + '___sendFile', html.sendFile);
                sm = this.createButton(id + '___' + remotePeerId + '___sendMsg', html.sendMsg);

                cm = this.createButton(id + '___' + remotePeerId + '___video', html.videoOn);
                au = this.createButton(remotePeerId + '__audio', remotePeerAudio ? html.audioOn : html.audioOff);
                gl = this.createButton(id + '___' + remotePeerId + '___geoLocation', html.geolocation);
                ban = this.createButton(id + '___' + remotePeerId + '___ban', html.ban);
                ko = this.createButton(id + '___' + remotePeerId + '___kickOut', html.kickOut);
                role = this.createButton(
                    id + '___' + remotePeerId + '___role',
                    remotePeerPresenter ? html.presenterRoleRemove : html.presenterRole
                );
                if (remotePeerPresenter) role.classList.add('presenter-role-active');

                i = document.createElement('i');
                i.id = remotePeerId + '__hand';
                i.className = html.userHand;
                i.style.display = peer_info.peer_hand ? 'inline-flex' : 'none';

                p = document.createElement('p');
                p.id = remotePeerId + '__name';
                p.className = html.userName;
                this.setPeerNameWithPresenter(p, remotePeerPresenter, peer_name);

                pm = document.createElement('div');
                pb = document.createElement('div');
                pm.setAttribute('id', remotePeerId + '__pitchMeter');
                pb.setAttribute('id', remotePeerId + '__pitchBar');
                pm.className = 'speechbar';
                pb.className = 'bar';
                pb.style.height = '1%';
                pm.appendChild(pb);

                pv = document.createElement('input');
                pv.id = remotePeerId + '___pVolume';
                pv.type = 'range';
                pv.min = 0;
                pv.max = 100;
                pv.value = 100;

                // Build dropdown items
                pv.dataset.volumeKey = peer_info.peer_uuid || remotePeerId;
                BUTTONS.consumerVideo.pinVideoButton &&
                    !this.isMobileDevice &&
                    eVc.appendChild(this.createResponsiveDropdownItem(pn, 'Pin Video', 'compact'));
                BUTTONS.consumerVideo.focusVideoButton &&
                    eVc.appendChild(this.createResponsiveDropdownItem(ha, 'Focus Mode'));
                BUTTONS.consumerVideo.videoPictureInPicture &&
                    this.isVideoPictureInPictureSupported &&
                    eVc.appendChild(this.createResponsiveDropdownItem(pip, 'Picture in Picture'));

                BUTTONS.consumerVideo.audioVolumeInput &&
                    eVc.appendChild(this.createResponsiveDropdownRangeItem(pv, 'Volume', 'fa-volume-high'));
                BUTTONS.consumerVideo.presenterRoleButton &&
                    eVc.appendChild(
                        this.createDropdownItem(
                            role,
                            remotePeerPresenter ? 'Remove presenter role' : 'Set as presenter',
                            eVc
                        )
                    );
                BUTTONS.consumerVideo.hideFromGridButton &&
                    eVc.appendChild(this.createDropdownItem(hg, 'Hide from grid', eVc));
                BUTTONS.consumerVideo.videoMirrorButton && eVc.appendChild(this.createDropdownItem(mv, 'Mirror', eVc));
                BUTTONS.consumerVideo.fullScreenButton &&
                    this.isVideoFullScreenSupported &&
                    eVc.appendChild(this.createDropdownItem(fs, 'Full Screen', eVc));
                BUTTONS.consumerVideo.sendMessageButton &&
                    eVc.appendChild(this.createDropdownItem(sm, 'Private Message', eVc));
                BUTTONS.consumerVideo.geolocationButton &&
                    eVc.appendChild(this.createDropdownItem(gl, 'Geo Location', eVc));
                BUTTONS.consumerVideo.sendFileButton && eVc.appendChild(this.createDropdownItem(sf, 'Send File', eVc));

                BUTTONS.consumerVideo.banButton && eVc.appendChild(this.createDropdownItem(ban, 'Ban', eVc, 'red'));
                BUTTONS.consumerVideo.ejectButton &&
                    eVc.appendChild(this.createDropdownItem(ko, 'Kick Out', eVc, 'red'));

                eDiv.appendChild(eBtn);
                document.body.appendChild(eVc);
                eBtn._dropdownContent = eVc;
                this.handleDropdownEvents(eDiv, eBtn, eVc);

                vb.appendChild(eDiv);
                BUTTONS.consumerVideo.audioVolumeInput && vb.appendChild(pv);
                BUTTONS.consumerVideo.muteAudioButton && vb.appendChild(au);
                BUTTONS.consumerVideo.muteVideoButton && vb.appendChild(cm);

                BUTTONS.consumerVideo.videoPictureInPicture &&
                    this.isVideoPictureInPictureSupported &&
                    vb.appendChild(pip);

                BUTTONS.consumerVideo.focusVideoButton && vb.appendChild(ha);

                if (BUTTONS.consumerVideo.pinVideoButton && !this.isMobileDevice) vb.appendChild(pn);

                d.appendChild(elem);
                d.appendChild(remoteVideoLoader);
                d.appendChild(i);
                d.appendChild(p);
                d.appendChild(pm);

                if (this.isMobileDevice) {
                    vb.classList.add('mobile-floating');
                    document.body.appendChild(vb);
                } else {
                    vb.classList.remove('mobile-floating');
                    d.appendChild(vb);
                }
                vb.addEventListener('click', (e) => e.stopPropagation());

                this.videoMediaContainer.appendChild(d);

                await this.attachMediaStream(elem, stream, type, 'Consumer');

                this.isVideoPictureInPictureSupported && this.handlePIP(elem.id, pip.id);
                this.isVideoFullScreenSupported && this.handleFS(elem.id, fs.id);
                this.handleVB(d.id, vb.id);
                this.handleDD(elem.id, remotePeerId);

                this.handleMV(elem.id, mv.id);

                this.handleSF(sf.id, peer_name, remotePeerId);
                this.handleHA(ha.id, d.id);
                this.handleHFG(hg.id, remotePeerId);
                this.handleSM(sm.id, peer_name, remotePeerId);

                BUTTONS.consumerVideo.muteVideoButton && this.handleCM(cm.id, remotePeerId);
                BUTTONS.consumerVideo.muteAudioButton && this.handleAU(au.id, remotePeerId);
                this.handleCV(pv.id);
                this.handleGL(gl.id, remotePeerId);
                this.handleBAN(ban.id, remotePeerId);
                this.handleKO(ko.id, remotePeerId);
                this.handleRole(role.id, remotePeerId, remotePeerPresenter);
                this.handlePN(elem.id, pn.id, d.id, remoteIsScreen);
                this.handleZV(elem.id, d.id, remotePeerId);
                this.popupPeerInfo(p.id, peer_info);
                this.checkPeerInfoStatus(peer_info);

                if (!remoteIsScreen && remotePrivacyOn) this.setVideoPrivacyStatus(remotePeerId, remotePrivacyOn);

                if (remoteIsScreen && !isHideALLVideosActive) pn.click();

                if (isHideALLVideosActive) {
                    isHideALLVideosActive = false;
                    const children = this.videoMediaContainer.children;
                    const btnsHA = document.querySelectorAll('.focusMode');
                    for (let child of children) {
                        child.style.display = 'block';
                    }
                    btnsHA.forEach((btn) => {
                        btn.style.color = 'white';
                    });
                }

                if (typeof applyParticipantGridVisibility === 'function') applyParticipantGridVisibility();

                if (!this.isMobileDevice) {
                    this.setTippy(pn.id, 'Toggle Pin', 'bottom');
                    this.setTippy(ha.id, 'Toggle Focus mode', 'bottom');
                    this.setTippy(pip.id, 'Toggle picture in picture', 'bottom');

                    this.setTippy(cm.id, 'Hide', 'bottom');
                    this.setTippy(au.id, 'Mute', 'bottom');
                    this.setTippy(pv.id, '🔊 Volume', 'bottom');
                }

                // Use helper function to set audio volume
                this.setAV(
                    this.audioConsumers.get(remotePeerId + '___pVolume'),
                    remotePeerId + '___pVolume',
                    remotePeerAudioVolume,
                    true
                );

                this.setPeerAudio(remotePeerId, remotePeerAudio);

                handleAspectRatio();
                console.log('[addConsumer] Video-element-count', this.videoMediaContainer.childElementCount);

                this.sound('joined');
                break;
            case mediaType.audio:
                elem = document.createElement('audio');
                elem.setAttribute('id', id);
                elem.setAttribute('volumeBar', remotePeerId + '___pVolume');
                elem.autoplay = true;
                elem.volume = 1.0;

                if (!this.hasAudioTrack(stream)) {
                    elem.muted = true;
                }

                this.remoteAudioEl.appendChild(elem);

                await this.attachMediaStream(elem, stream, type, 'Consumer');

                // Store audio consumer and set volume
                const audioConsumerId = remotePeerId + '___pVolume';
                this.audioConsumers.set(audioConsumerId, id);

                // Use helper function to set audio volume
                this.setAV(id, audioConsumerId, remotePeerAudioVolume);
                this.handleCV(audioConsumerId);

                this.setPeerAudio(remotePeerId, remotePeerAudio);

                if (sinkId && speakerSelect.value) {
                    this.changeAudioDestination(elem, false);
                }

                //elem.addEventListener('play', () => { elem.volume = 0.1 });
                console.log('[Add audioConsumers]', this.audioConsumers);
                break;
            default:
                break;
        }
        return elem;
    }

    removeConsumer(consumer_id, consumer_kind) {
        if (!this.consumers.get(consumer_id)) return;

        console.log('Remove consumer', { consumer_id: consumer_id, consumer_kind: consumer_kind });

        const elem = this.getId(consumer_id);
        if (elem) {
            elem.srcObject?.getTracks().forEach((track) => track.stop());
            elem.remove();
        }

        if (consumer_kind === 'video') {
            const d = this.getId(consumer_id + '__video');
            const vb = this.getId(consumer_id + '__vb');

            if (d) {
                // Destroy drawing overlay if present

                // Clean up dropdown menus appended to body
                const dropdownBtns = vb ? vb.querySelectorAll('[id$="_expandBtn"], [id$="__dropdownBtn"]') : [];
                dropdownBtns.forEach((btn) => {
                    if (btn._dropdownContent) {
                        btn._dropdownContent.remove();
                    }
                });

                // Check if video is in focus-mode...
                if (d.hasAttribute('focus-mode')) {
                    const dhaBtn = this.getId(consumer_id + '__hideALL');
                    if (dhaBtn) {
                        dhaBtn.click();
                    }
                }
                d.remove();
                vb?.remove();

                //alert(this.pinnedVideoPlayerId + '==' + consumer_id);
                if (this.isVideoPinned && this.pinnedVideoPlayerId == consumer_id) {
                    this.removeVideoPinMediaContainer();
                    console.log('Remove pin container due the Consumer close', {
                        consumer_id: consumer_id,
                        consumer_kind: consumer_kind,
                    });
                }
            }

            handleAspectRatio();
            console.log(
                '[removeConsumer - ' + consumer_kind + '] Video-element-count',
                this.videoMediaContainer.childElementCount
            );
        }

        if (consumer_kind === 'audio') {
            const audioConsumerPlayerId = this.getMapKeyByValue(this.audioConsumers, consumer_id);
            if (audioConsumerPlayerId) {
                const inputPv = this.getId(audioConsumerPlayerId);
                if (inputPv) inputPv.style.display = 'none';
                this.audioConsumers.delete(audioConsumerPlayerId);
                console.log('Remove audio Consumer', {
                    consumer_id: consumer_id,
                    audioConsumerPlayerId: audioConsumerPlayerId,
                    audioConsumers: this.audioConsumers,
                });
            }
        }

        this.consumers.get(consumer_id).close();
        this.consumers.delete(consumer_id);
        this.consumersProducer.forEach((cId, pId) => {
            if (cId === consumer_id) this.consumersProducer.delete(pId);
        });
        this.resumedConsumers.delete(consumer_id);
        this.sound('left');
    }

    // ####################################################
    // HANDLE VIDEO OFF
    // ####################################################

    setVideoOff(peer_info, remotePeer = false) {
        //console.log('setVideoOff', peer_info);
        let d, vb, i, h, au, sf, sm, gl, ban, ko, hg, p, pm, pb, pv, pn, st, ri, role;
        let eDiv, eBtn, eVc;

        const { peer_id, peer_name, peer_avatar, peer_audio, peer_presenter } = peer_info;

        this.removeVideoOff(peer_id);

        d = document.createElement('div');
        d.className = 'Camera';
        d.id = peer_id + '__videoOff';
        d.dataset.peerId = peer_id;
        d.dataset.cameraOff = 'true';

        vb = document.createElement('div');
        vb.id = peer_id + '__vb';
        vb.className = 'videoMenuBar hidden';

        eDiv = document.createElement('div');
        eDiv.className = 'navbar-dropdown';
        eBtn = this.createButton(peer_id + '_video_off_expandBtn', html.expand);
        eVc = document.createElement('div');
        eVc.className = 'navbar-dropdown-content';
        eVc.id = peer_id + '_video_off_videoExpandContent';

        au = this.createButton(peer_id + '__audio', peer_audio ? html.audioOn : html.audioOff);
        pn = this.createButton(peer_id + '__img__pin', html.pin);

        pv = document.createElement('input');
        pv.id = peer_id + '___pVolume';
        pv.type = 'range';
        pv.min = 0;
        pv.max = 100;
        pv.value = 100;

        pv.dataset.volumeKey = peer_info.peer_uuid || peer_id;
        if (remotePeer) {
            sf = this.createButton('remotePeer___' + peer_id + '___sendFile', html.sendFile);
            sm = this.createButton('remotePeer___' + peer_id + '___sendMsg', html.sendMsg);

            gl = this.createButton('remotePeer___' + peer_id + '___geoLocation', html.geolocation);
            ban = this.createButton('remotePeer___' + peer_id + '___ban', html.ban);
            ko = this.createButton('remotePeer___' + peer_id + '___kickOut', html.kickOut);
            hg = this.createButton('remotePeer___' + peer_id + '___hideFromGrid', html.hideFromGrid);
            role = this.createButton(
                'remotePeer___' + peer_id + '___role',
                peer_presenter ? html.presenterRoleRemove : html.presenterRole
            );
            if (peer_presenter) role.classList.add('presenter-role-active');
        } else {
            st = this.createElement(
                peer_id + '__sessionTime',
                'span',
                'current-session-time notranslate navbar-session-time'
            );
        }

        i = document.createElement('img');
        i.className = 'videoAvatarImage center'; // pulsate
        i.id = peer_id + '__img';

        p = document.createElement('p');
        p.id = peer_id + '__name';
        p.className = html.userName;
        this.setPeerNameWithPresenter(p, peer_presenter, peer_name + (remotePeer ? '' : this.meSuffix() + ' '));

        if (!remotePeer) {
            ri = this.createElement(peer_id + '__recIndicator', 'span', 'rec-indicator');
            ri.innerHTML = '🔴 ';
            p.appendChild(ri);
            if (this._isRecording) ri.classList.add('active');
        }

        h = document.createElement('i');
        h.id = peer_id + '__hand';
        h.className = html.userHand;
        h.style.display = peer_info.peer_hand ? 'inline-flex' : 'none';

        pm = document.createElement('div');
        pb = document.createElement('div');
        pm.setAttribute('id', peer_id + '__pitchMeter');
        pb.setAttribute('id', peer_id + '__pitchBar');
        pm.className = 'speechbar';
        pb.className = 'bar';
        pb.style.height = '1%';
        pm.appendChild(pb);

        BUTTONS.videoOff.pinVideoButton &&
            !this.isMobileDevice &&
            eVc.appendChild(this.createResponsiveDropdownItem(pn, 'Pin', 'compact'));
        remotePeer &&
            BUTTONS.videoOff.audioVolumeInput &&
            eVc.appendChild(this.createResponsiveDropdownRangeItem(pv, 'Volume', 'fa-volume-high'));
        if (remotePeer) {
            BUTTONS.videoOff.presenterRoleButton &&
                eVc.appendChild(
                    this.createDropdownItem(role, peer_presenter ? 'Remove presenter role' : 'Set as presenter', eVc)
                );
            BUTTONS.videoOff.hideFromGridButton && eVc.appendChild(this.createDropdownItem(hg, 'Hide from grid', eVc));
            BUTTONS.videoOff.sendMessageButton && eVc.appendChild(this.createDropdownItem(sm, 'Private Message', eVc));
            BUTTONS.videoOff.geolocationButton && eVc.appendChild(this.createDropdownItem(gl, 'Geo Location', eVc));
            BUTTONS.videoOff.sendFileButton && eVc.appendChild(this.createDropdownItem(sf, 'Send File', eVc));

            BUTTONS.videoOff.banButton && eVc.appendChild(this.createDropdownItem(ban, 'Ban', eVc, 'red'));
            BUTTONS.videoOff.ejectButton && eVc.appendChild(this.createDropdownItem(ko, 'Kick Out', eVc, 'red'));
        }

        eDiv.appendChild(eBtn);
        document.body.appendChild(eVc);
        eBtn._dropdownContent = eVc;
        this.handleDropdownEvents(eDiv, eBtn, eVc);

        vb.appendChild(eDiv);
        remotePeer && BUTTONS.videoOff.audioVolumeInput && vb.appendChild(pv);
        BUTTONS.videoOff.muteAudioButton && vb.appendChild(au);
        if (BUTTONS.videoOff.pinVideoButton && !this.isMobileDevice) vb.appendChild(pn);
        if (!remotePeer) vb.appendChild(st);

        d.appendChild(i);
        d.appendChild(p);
        d.appendChild(h);
        d.appendChild(pm);

        const hideVideoMenu = () => {
            if (vb && !vb.classList.contains('hidden')) {
                hide(vb);
                setCamerasBorderNone();
            }
        };

        if (this.isMobileDevice) {
            vb.classList.add('mobile-floating');
            document.body.appendChild(vb);
        } else {
            vb.classList.remove('mobile-floating');
            d.appendChild(vb);
            d.addEventListener('mouseleave', hideVideoMenu);
        }
        vb.addEventListener('click', (e) => e.stopPropagation());

        this.videoMediaContainer.appendChild(d);
        if (typeof applyParticipantGridVisibility === 'function') applyParticipantGridVisibility();
        BUTTONS.videoOff.muteAudioButton && this.handleAU(au.id, peer_id);

        if (remotePeer) {
            this.handleCV(pv.id);
            this.handleSM(sm.id, peer_name, peer_id);
            this.handleSF(sf.id, peer_name, peer_id);

            this.handleGL(gl.id, peer_id);
            this.handleBAN(ban.id, peer_id);
            this.handleKO(ko.id, peer_id);
            this.handleHFG(hg.id, peer_id);
            this.handleRole(role.id, peer_id, peer_presenter);
        }

        this.handleVB(d.id, vb.id);
        this.handleDD(d.id, peer_id, !remotePeer);
        this.handlePN(i.id, pn.id, d.id);
        this.popupPeerInfo(p.id, peer_info);
        this.checkPeerInfoStatus(peer_info);
        this.setVideoAvatarImgName(i.id, peer_name, peer_avatar);
        this.getId(i.id).style.display = 'block';

        if (isParticipantsListOpen) getRoomParticipants();

        if (!this.isMobileDevice && remotePeer) {
            this.setTippy(sm.id, 'Send message', 'bottom');
            this.setTippy(sf.id, 'Send file', 'bottom');

            this.setTippy(au.id, 'Mute', 'bottom');
            this.setTippy(pv.id, '🔊 Volume', 'bottom');
            this.setTippy(pn.id, 'Pin', 'bottom');
            this.setTippy(gl.id, 'Geolocation', 'bottom');
            this.setTippy(ban.id, 'Ban', 'bottom');
            this.setTippy(ko.id, 'Eject', 'bottom');
            this.setTippy(hg.id, 'Hide from grid', 'bottom');
            this.setTippy(role.id, peer_presenter ? 'Remove presenter role' : 'Set as presenter', 'bottom');
        }

        remotePeer ? this.setPeerAudio(peer_id, peer_audio) : this.setIsAudio(peer_id, peer_audio);

        handleAspectRatio();

        console.log('[setVideoOff] Video-element-count', this.videoMediaContainer.childElementCount);
    }

    removeVideoOff(peer_id) {
        const pvOff = this.getId(peer_id + '__videoOff');
        const vb = this.getId(peer_id + '__vb');

        if (pvOff?.hasAttribute('focus-mode')) this.toggleFocusMode(pvOff.id);
        if (this.isVideoPinned && this.pinnedVideoPlayerId === peer_id + '__img') {
            this.getId(peer_id + '__img__pin')?.click();
        }

        if (vb) {
            vb.querySelectorAll('[id$="_expandBtn"], [id$="__dropdownBtn"]').forEach((btn) => {
                btn._dropdownContent?.remove();
            });
            vb.parentNode.removeChild(vb);
        }

        if (pvOff) {
            pvOff.parentNode.removeChild(pvOff);
            handleAspectRatio();
            console.log('[removeVideoOff] Video-element-count', this.videoMediaContainer.childElementCount);
            if (peer_id != this.peer_id) this.sound('left');
        }
    }

    // ####################################################
    // SHARE SCREEN ON JOIN
    // ####################################################

    shareScreen() {
        if (!this.isMobileDevice && (navigator.getDisplayMedia || navigator.mediaDevices.getDisplayMedia)) {
            this.sound('open');
            // startScreenButton.click(); // Chrome - Opera - Edge - Brave
            // handle error: getDisplayMedia requires transient activation from a user gesture on Safari - FireFox
            Swal.fire({
                background: swalBackground,
                position: 'center',
                icon: 'question',
                text: 'Do you want to share your screen?',
                showDenyButton: true,
                confirmButtonText: `Yes`,
                denyButtonText: `No`,
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' },
            }).then((result) => {
                if (result.isConfirmed) {
                    startScreenButton.click();
                    console.log('11 ----> Screen is on');
                } else {
                    console.log('11 ----> Screen is on');
                }
            });
        } else {
            console.log('11 ----> Screen is off');
        }
    }

    // ####################################################
    // EXIT ROOM
    // ####################################################

    /** Suppress recovery during a deliberate leave, then release media after exit acknowledgment or timeout. */
    exit(offline = false) {
        this.isLeaving = true;
        this._isConnected = false;
        this.closeReconnectAlert();

        if (this.RNNoiseProcessor) this.disableRNNoiseSuppression();

        const clean = () => {
            this.stopConsumerReconcile();
            if (this.consumerTransport) this.consumerTransport.close();
            if (this.producerTransport) this.producerTransport.close();
            if (this._outputAudioContext) {
                this._outputAudioContext.close().catch((err) => console.warn('Close output AudioContext', err));
                this._outputAudioContext = null;
            }
            if (this.socket) {
                this.socket.off('disconnect');
                this.socket.off('transportClosed');
                this.socket.off('newProducers');
                this.socket.off('consumerClosed');
                this.socket.off('connect');
                this.socket.off('connect_error');
                this.socket.off('setVideoOff');
                this.socket.off('removeMe');
                this.socket.off('refreshParticipantsCount');
                this.socket.off('message');
                this.socket.off('roomAction');
                this.socket.off('roomPassword');
                this.socket.off('roomLobby');
                this.socket.off('cmd');
                this.socket.off('peerAction');
                this.socket.off('updatePeerInfo');
                this.socket.off('setPresenterRole');
                this.socket.off('fileInfo');
                this.socket.off('file');

                this.socket.off('fileAbort');
                this.socket.off('receiveFileAbort');

                this.socket.off('audioVolume');
                this.socket.off('dominantSpeaker');
                this.socket.off('updateRoomModerator');
                this.socket.off('updateRoomModeratorALL');
                this.socket.off('recordingAction');

                this.socket.io.off('reconnect_attempt');
                this.socket.io.off('reconnect_failed');
            }
        };

        const done = () => {
            clean();
            if (!offline) this.event(_EVENTS.exitRoom);
        };
        if (!offline && this.socket?.connected) {
            this.socket
                .request('exitRoom', {}, 1500)
                .catch((error) => console.warn('Exit Room', error))
                .finally(done);
        } else done();
    }

    exitRoom(disconnectAll = false) {
        const switchDisconnectAllOnLeave = getId('switchDisconnectAllOnLeave');
        if (isPresenter && (disconnectAll || (switchDisconnectAllOnLeave && switchDisconnectAllOnLeave.checked))) {
            this.ejectAllOnLeave();
        }
        this.exit();
    }

    // ####################################################
    // EJECT ALL ON LEAVE ROOM
    // ####################################################

    ejectAllOnLeave() {
        const cmd = {
            type: 'ejectAll',
            peer_name: this.peer_name,
            peer_uuid: this.peer_uuid,
            broadcast: true,
        };
        this.emitCmd(cmd);
    }

    // ####################################################
    // HELPERS
    // ####################################################

    async attachMediaStream(elem, stream, type, who) {
        let track;
        switch (type) {
            case mediaType.audio:
                track = stream.getAudioTracks()[0];
                break;
            case mediaType.video:
            case mediaType.screen:
                track = stream.getVideoTracks()[0];
                break;
            default:
                break;
        }
        const consumerStream = new MediaStream();
        consumerStream.addTrack(track);
        elem.srcObject = consumerStream;
        if (type !== mediaType.audio) {
            this.hideVideoLoaderOnPlay(elem);
        }
        console.log(who + ' Success attached media ' + type);
    }

    hasUserActivation() {
        if (navigator.userActivation) return !!navigator.userActivation.isActive;
        if ('hasTransientUserActivation' in document) return !!document.hasTransientUserActivation;
        return false;
    }

    runOnNextUserActivation(callback) {
        let fired = false;

        const fire = (e) => {
            if (fired) return; // Prevent duplicate calls
            fired = true;

            try {
                // Call synchronously to keep the user-activation
                callback(e);
            } catch (err) {
                console.error('runOnNextUserActivation callback error:', err);
            }
        };

        const cleanup = () => {
            window.removeEventListener('pointerdown', fire, true);
            window.removeEventListener('click', fire, true);
            window.removeEventListener('mousedown', fire, true);
            window.removeEventListener('touchstart', fire, true);
            window.removeEventListener('keydown', fire, true);
        };

        // Note: 'once: true' auto-removes listeners, but we return cleanup for manual removal if needed
        const opts = { capture: true, once: true, passive: true };
        window.addEventListener('pointerdown', fire, opts);
        window.addEventListener('click', fire, opts);
        window.addEventListener('mousedown', fire, opts);
        window.addEventListener('touchstart', fire, opts);
        window.addEventListener('keydown', fire, opts);

        // Return cleanup function for manual removal if needed (e.g., component unmount)
        return cleanup;
    }

    async changeAudioDestination(audioElement = false, deferUntilUserActivation = true) {
        const sinkId = speakerSelect?.value;
        if (!sinkId) return;

        const outputElements = [];
        const remoteAudioElements = Array.from(this.remoteAudioEl?.querySelectorAll('audio') || []);

        audioElement ? outputElements.push(audioElement) : outputElements.push(...remoteAudioElements);

        const els = [...new Set(outputElements.filter(Boolean))];
        if (!els.length) return;

        // Defer until a user gesture if needed
        if (!this.hasUserActivation()) {
            // Automatic calls (e.g. on new audio consumer) must NOT register a global
            // user-activation listener: applying setSinkId() on an unrelated click resets
            // the audio pipeline and breaks echo cancellation. The selected speaker is
            // re-applied the next time the user explicitly interacts with speakerSelect.
            if (!deferUntilUserActivation) return;

            this.pendingSinkId = sinkId;
            console.warn('Click once to apply the selected speaker');
            this.runOnNextUserActivation(async () => {
                for (const el of els) {
                    await this.attachSinkId(el, this.pendingSinkId);
                }
                // Clear only if all succeeded or if pendingSinkId wasn't changed
                if (this.pendingSinkId === sinkId) {
                    this.pendingSinkId = null;
                }
            });
            return;
        }

        for (const el of els) {
            await this.attachSinkId(el, sinkId);
        }
    }

    async attachSinkId(elem, sinkId) {
        if (typeof elem.setSinkId !== 'function') {
            const error = `Browser doesn't support output device selection.`;
            console.warn(error);
            this.userLog('error', error, 'top-end', 6000);
            return;
        }

        return elem
            .setSinkId(sinkId)
            .then(() => {
                console.log(`Success, audio output device attached: ${sinkId}`);
                // Clear pending sink id after successful attachment
                if (this.pendingSinkId === sinkId) {
                    this.pendingSinkId = null;
                }
            })
            .catch((err) => {
                console.error('Attach SinkId error: ', err);
                const speakerSel = this.getId('speakerSelect');
                if (err?.name === 'SecurityError') {
                    const msg = `Use HTTPS to select audio output device: ${err.message || err}`;
                    console.error('Attach SinkId error: ', msg);
                    this.userLog('error', msg, 'top-end', 6000);
                } else if (err?.name === 'NotAllowedError' || /user gesture/i.test(err?.message || '')) {
                    // Retry on next user gesture
                    this.userLog('info', 'Click once to allow changing the speaker', 'top-end', 4000);
                    this.pendingSinkId = sinkId;
                    this.runOnNextUserActivation(() => {
                        // Check if pendingSinkId is still set before retrying
                        if (this.pendingSinkId === sinkId) {
                            this.attachSinkId(elem, this.pendingSinkId);
                        }
                    });
                } else {
                    this.userLog('warning', 'Attach SinkId error', err, 'top-end', 6000);
                }
                if (speakerSel) speakerSel.selectedIndex = 0;
                refreshLsDevices();
            });
    }

    event(evt) {
        if (this.eventListeners.has(evt)) {
            this.eventListeners.get(evt).forEach((callback) => callback());
        }
    }

    on(evt, callback) {
        this.eventListeners.get(evt).push(callback);
    }

    // ####################################################
    // SET
    // ####################################################

    setTippy(elem, content, placement, allowHTML = false) {
        if (this.isMobileDevice) return;
        const element = this.getId(elem);
        if (element) {
            if (element._tippy) {
                element._tippy.destroy();
            }
            try {
                tippy(element, {
                    content: content,
                    placement: placement,
                    allowHTML: allowHTML,
                });
            } catch (err) {
                console.error('setTippy error', err.message);
            }
        } else {
            console.warn('setTippy element not found with content', content);
        }
    }

    setVideoAvatarImgName(elemId, peer_name, peer_avatar = false) {
        let elem = this.getId(elemId);
        if (peer_avatar && this.isValidAvatarURL(peer_avatar)) {
            elem.setAttribute('src', peer_avatar);
        } else if (cfg.useAvatarSvg) {
            rc.isValidEmail(peer_name)
                ? elem.setAttribute('src', this.genGravatar(peer_name))
                : elem.setAttribute('src', this.genAvatarSvg(peer_name, 250));
        } else {
            elem.setAttribute('src', image.avatar);
        }
    }

    genGravatar(email, size = false) {
        const hash = md5(email.toLowerCase().trim());
        const gravatarURL = `https://www.gravatar.com/avatar/${hash}` + (size ? `?s=${size}` : '?s=250') + '?d=404';
        return gravatarURL;
        function md5(input) {
            return CryptoJS.MD5(input).toString();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailRegex.test(email);
    }

    genAvatarSvg(peerName, avatarImgSize) {
        const charCodeRed = peerName.charCodeAt(0);
        const charCodeGreen = peerName.charCodeAt(1) || charCodeRed;
        const red = Math.pow(charCodeRed, 7) % 200;
        const green = Math.pow(charCodeGreen, 7) % 200;
        const blue = (red + green) % 200;
        const bgColor = `rgb(${red}, ${green}, ${blue})`;
        const textColor = '#ffffff';
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" 
        xmlns:xlink="http://www.w3.org/1999/xlink" 
        width="${avatarImgSize}px" 
        height="${avatarImgSize}px" 
        viewBox="0 0 ${avatarImgSize} ${avatarImgSize}" 
        version="1.1">
            <circle 
                fill="${bgColor}" 
                width="${avatarImgSize}" 
                height="${avatarImgSize}" 
                cx="${avatarImgSize / 2}" 
                cy="${avatarImgSize / 2}" 
                r="${avatarImgSize / 2}"
            />
            <text 
                x="50%" 
                y="50%" 
                style="color:${textColor}; 
                line-height:1; 
                font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Fira Sans, Droid Sans, Helvetica Neue, sans-serif"
                alignment-baseline="middle" 
                text-anchor="middle" 
                font-size="${Math.round(avatarImgSize * 0.4)}" 
                font-weight="normal" 
                dy=".1em" 
                dominant-baseline="middle" 
                fill="${textColor}">${peerName.substring(0, 2).toUpperCase()}
            </text>
        </svg>`;
        return 'data:image/svg+xml,' + svg.replace(/#/g, '%23').replace(/"/g, "'").replace(/&/g, '&amp;');
    }

    setPeerAudio(peer_id, status) {
        console.log('Set peer audio enabled: ' + status);
        const audioStatus = this.getPeerAudioBtn(peer_id); // producer, consumers
        const audioVolume = this.getPeerAudioVolumeBar(peer_id); // consumers
        if (audioStatus) audioStatus.className = status ? html.audioOn : html.audioOff;
        // Guests should be able to set a listener volume even while a peer's mic is off.
        if (audioVolume) show(audioVolume);
    }

    setIsAudio(peer_id, status) {
        {
            console.log('Set local audio enabled: ' + status);
            this.peer_info.peer_audio = status;
            this.audioRecorder?.updateMicrophoneVolume(status);
            const audioStatus = this.getPeerAudioBtn(peer_id); // producer, consumers
            const audioVolume = this.getPeerAudioVolumeBar(peer_id); // consumers
            if (audioStatus) audioStatus.className = status ? html.audioOn : html.audioOff;
            if (audioVolume) status ? show(audioVolume) : hide(audioVolume);
        }
    }

    setIsVideo(status) {
        {
            this.peer_info.peer_video = status;
            if (!this.peer_info.peer_video) {
                console.log('Set local video enabled: ' + status);
                this.setVideoOff(this.peer_info, false);
                this.sendVideoOff();
            }
        }
    }

    setIsScreen(status) {
        {
            this.peer_info.peer_screen = status;
            if (!this.peer_info.peer_screen && !this.peer_info.peer_video) {
                console.log('Set local screen enabled: ' + status);
                this.setVideoOff(this.peer_info, false);
                this.sendVideoOff();
            }
        }
    }

    sendVideoOff() {
        this.socket.emit('setVideoOff', this.peer_info);
    }

    // ####################################################
    // GET
    // ####################################################

    isConnected() {
        return this._isConnected;
    }

    isRecording() {
        return this._isRecording;
    }

    showRecordingIndicator() {
        this._getRecIndicators().forEach((el) => {
            el.classList.add('active');
            el.classList.remove('paused');
        });
    }

    hideRecordingIndicator() {
        this._getRecIndicators().forEach((el) => {
            el.classList.remove('active', 'paused');
            el.innerHTML = '🔴 ';
        });
    }

    pauseRecordingIndicator() {
        this._getRecIndicators().forEach((el) => el.classList.add('paused'));
    }

    resumeRecordingIndicator() {
        this._getRecIndicators().forEach((el) => el.classList.remove('paused'));
    }

    _getRecIndicators() {
        return document.querySelectorAll(`[id^="${this.peer_id}__recIndicator"]`);
    }

    hasActiveRecorder() {
        return this.mediaRecorder !== null;
    }

    static get mediaType() {
        return mediaType;
    }

    static get EVENTS() {
        return _EVENTS;
    }

    getTimeNow() {
        return new Date().toTimeString().split(' ')[0];
    }

    getId(id) {
        return document.getElementById(id);
    }

    getName(name) {
        return document.getElementsByName(name)[0];
    }

    getEcN(cn) {
        return document.getElementsByClassName(cn);
    }

    async getRoomInfo() {
        let room_info = await this.socket.request('getRoomInfo');
        return room_info;
    }

    refreshParticipantsCount() {
        this.socket.emit('refreshParticipantsCount');
    }

    getPeerAudioBtn(peer_id) {
        return this.getId(peer_id + '__audio');
    }

    getPeerAudioVolumeBar(peer_id) {
        return this.getId(peer_id + '___pVolume');
    }

    getPeerHandBtn(peer_id) {
        return this.getId(peer_id + '__hand');
    }

    getMapKeyByValue(map, searchValue) {
        for (let [key, value] of map.entries()) {
            if (value === searchValue) return key;
        }
    }

    getSelectedIndexValue(elem) {
        return elem.options[elem.selectedIndex].value;
    }

    // ####################################################
    // UTILITY
    // ####################################################

    async sound(name, force = false, path = '../sounds/', ext = '.wav') {
        if (!isSoundEnabled && !force) return;
        let sound = path + name + ext;
        let audio = new Audio(sound);
        try {
            audio.volume = 0.5;
            await audio.play();
        } catch (err) {
            return false;
        }
    }

    /** Display localized notifications through the shared renderer, including HTML notifications. */
    userLog(icon, message, position, timer = 5000) {
        return window.BodrikToast.show(icon, message, position, timer);
    }

    toast(icon, title, text, position = 'top-end', timer = 5000, sound = false) {
        if (sound) this.sound('alert');

        const Toast = Swal.mixin({
            toast: true,
            position: position,
            showConfirmButton: false,
            timer: timer,
            timerProgressBar: true,
            background: swalBackground,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        });
        Toast.fire({
            icon: icon,
            title: title,
            text: text,
        });
    }

    msgPopup(type, message, timer = 3000, position = 'center') {
        switch (type) {
            case 'warning':
            case 'error':
                Swal.fire({
                    background: swalBackground,
                    position: position,
                    icon: type,
                    title: type,
                    text: message,
                    showClass: { popup: 'animate__animated animate__fadeInDown' },
                    hideClass: { popup: 'animate__animated animate__fadeOutUp' },
                });
                this.sound('alert');
                break;
            case 'info':
            case 'success':
                Swal.fire({
                    background: swalBackground,
                    position: position,
                    icon: type,
                    title: type,
                    text: message,
                    showClass: { popup: 'animate__animated animate__fadeInDown' },
                    hideClass: { popup: 'animate__animated animate__fadeOutUp' },
                });
                break;
            case 'html':
                Swal.fire({
                    background: swalBackground,
                    position: position,
                    icon: type,
                    html: message,
                    showClass: { popup: 'animate__animated animate__fadeInDown' },
                    hideClass: { popup: 'animate__animated animate__fadeOutUp' },
                });
                break;
            case 'toast':
                const Toast = Swal.mixin({
                    background: swalBackground,
                    position: 'top-end',
                    icon: 'info',
                    showConfirmButton: false,
                    timerProgressBar: true,
                    toast: true,
                    timer: timer,
                });
                Toast.fire({
                    icon: 'info',
                    title: message,
                    showClass: { popup: 'animate__animated animate__fadeInDown' },
                    hideClass: { popup: 'animate__animated animate__fadeOutUp' },
                });
                break;
            // ......
            default:
                alert(message);
        }
    }

    msgHTML(data, icon, imageUrl, title, html, position = 'center') {
        switch (data.type) {
            case 'recording':
                switch (data.action) {
                    case enums.recording.started:
                    case enums.recording.start:
                        html = html + '<br/> Your presence implies you agree to being recorded';
                        toastMessage(6000);
                        break;
                    case enums.recording.stop:
                        toastMessage(3000);
                        break;
                    //...
                    default:
                        break;
                }
                if (!this.speechInMessages) this.speechText(`${data.peer_name} ${data.action}`);
                break;
            //...
            default:
                defaultMessage();
                break;
        }
        // TOAST less invasive
        function toastMessage(duration = 3000) {
            const Toast = Swal.mixin({
                background: swalBackground,
                position: 'top-end',
                icon: icon,
                showConfirmButton: false,
                timerProgressBar: true,
                toast: true,
                timer: duration,
            });
            Toast.fire({
                title: title,
                html: html,
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' },
            });
        }
        // DEFAULT
        function defaultMessage() {
            Swal.fire({
                allowOutsideClick: false,
                allowEscapeKey: false,
                background: swalBackground,
                position: position,
                icon: icon,
                imageUrl: imageUrl,
                title: title,
                html: html,
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' },
            });
        }
        //...
    }

    thereAreParticipants() {
        // console.log('participantsCount ---->', participantsCount);
        return this.consumers.size > 0 || participantsCount > 1;
    }

    // ####################################################
    // MY SETTINGS
    // ####################################################

    toggleMySettings() {
        let mySettings = this.getId('mySettings');
        mySettings.style.top = '50%';
        mySettings.style.left = '50%';
        if (this.isMobileDevice) {
            mySettings.style.width = '100%';
            mySettings.style.height = '100%';
        }
        mySettings.classList.toggle('show');
        this.isMySettingsOpen = !this.isMySettingsOpen;
        this.videoMediaContainer.style.opacity = this.isMySettingsOpen ? 0.3 : 1;
    }

    openTab(evt, tabName) {
        let i, tabcontent, tablinks;
        tabcontent = this.getEcN('tabcontent');
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = 'none';
        }
        tablinks = this.getEcN('tablinks');
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(' active', '');
        }
        this.getId(tabName).style.display = 'block';
        evt.currentTarget.className += ' active';
    }

    changeBtnsBarPosition(position) {
        const positions = {
            vertical: {
                // bottomButtons horizontally
                '--bottom-btns-top': 'auto',
                '--bottom-btns-left': '50%',
                '--bottom-btns-bottom': '0',
                '--bottom-btns-translate-X': '-50%',
                '--bottom-btns-translate-Y': '0%',
                '--bottom-btns-margin-bottom': '16px',
                '--bottom-btns-flex-direction': 'row',
            },
            horizontal: {
                // bottomButtons vertically
                '--bottom-btns-top': '50%',
                '--bottom-btns-left': '15px',
                '--bottom-btns-bottom': 'auto',
                '--bottom-btns-translate-X': '0%',
                '--bottom-btns-translate-Y': '-50%',
                '--bottom-btns-margin-bottom': '0',
                '--bottom-btns-flex-direction': 'column',
            },
        };
        const props = positions[position];
        if (props) {
            const root = document.documentElement.style;
            Object.entries(props).forEach(([key, value]) => root.setProperty(key, value));
            bottomButtons.querySelectorAll('.split-btn .dropdown').forEach((dropdown) => {
                dropdown.classList.toggle('dropup', position === 'vertical');
                dropdown.classList.toggle('dropend', position === 'horizontal');
            });
            bottomButtons.dataset.position = position;
        }
    }

    // ####################################################
    // PICTURE IN PICTURE
    // ####################################################

    handlePIP(elemId, pipId) {
        let videoPlayer = this.getId(elemId);
        let btnPIP = this.getId(pipId);
        if (btnPIP) {
            btnPIP.addEventListener('click', () => {
                if (videoPlayer.pictureInPictureElement) {
                    videoPlayer.exitPictureInPicture();
                } else if (document.pictureInPictureEnabled) {
                    videoPlayer.requestPictureInPicture().catch((error) => {
                        console.error('Failed to enter Picture-in-Picture mode:', error);
                        this.userLog('warning', error.message, 'top-end', 6000);
                        elemDisplay(btnPIP.id, false);
                    });
                }
            });
        }
        if (videoPlayer) {
            videoPlayer.addEventListener('leavepictureinpicture', (event) => {
                console.log('Exited PiP mode');
                if (videoPlayer.paused) {
                    videoPlayer.play().catch((error) => {
                        console.error('Error playing video after exit PIP mode:', error);
                    });
                }
            });
        }
    }

    // ####################################################
    // HANDLE DOCUMENT PIP
    // ####################################################

    // ####################################################
    // FULL SCREEN
    // ####################################################

    isFullScreenSupported() {
        const fsSupported =
            document.fullscreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.msFullscreenEnabled;

        fsSupported ? this.handleFullScreenEvents() : (this.getId('fullScreenButton').style.display = 'none');

        return fsSupported;
    }

    handleFullScreenEvents() {
        document.addEventListener('fullscreenchange', (e) => {
            const fullscreenElement = document.fullscreenElement;
            if (!fullscreenElement) {
                const fullScreenIcon = this.getId('fullScreenIcon');
                fullScreenIcon.className = html.fullScreenOff;
                this.isDocumentOnFullScreen = false;
            }
        });
    }

    toggleRoomFullScreen() {
        const fullScreenIcon = this.getId('fullScreenIcon');
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            fullScreenIcon.className = html.fullScreenOn;
            this.isDocumentOnFullScreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fullScreenIcon.className = html.fullScreenOff;
                this.isDocumentOnFullScreen = false;
            }
        }
    }

    toggleFullScreen(elem = null) {
        if (this.isDocumentOnFullScreen) return;
        const element = elem ? elem : document.documentElement;
        const fullScreen = this.isFullScreen();
        fullScreen ? this.goOutFullscreen(element) : this.goInFullscreen(element);
        if (elem) this.isVideoOnFullScreen = !fullScreen;
    }

    isFullScreen() {
        const elementFullScreen =
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            null;
        if (elementFullScreen === null) return false;
        return true;
    }

    goInFullscreen(element) {
        if (element.requestFullscreen) element.requestFullscreen();
        else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
        else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
        else if (element.msRequestFullscreen) element.msRequestFullscreen();
        else this.userLog('warning', 'Full screen mode not supported by this browser on this device', 'top-end');
    }

    goOutFullscreen(element) {
        if (element.exitFullscreen) element.exitFullscreen();
        else if (element.mozCancelFullScreen) element.mozCancelFullScreen();
        else if (element.webkitExitFullscreen) element.webkitExitFullscreen();
        else if (element.msExitFullscreen) element.msExitFullscreen();
    }

    handleFS(elemId, fsId) {
        const videoPlayer = this.getId(elemId);
        const btnFs = this.getId(fsId);
        if (!videoPlayer || !btnFs) return;

        this.setTippy(fsId, 'Full screen', 'bottom');

        const videoWrap = this.getId(elemId + '__video');
        const fsTarget = videoWrap || videoPlayer;

        const getFsElement = () =>
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            null;

        const sync = () => {
            const fsEl = getFsElement();
            const isThisVideoFullscreen = fsEl === fsTarget;
            if (isThisVideoFullscreen) {
                this.isVideoOnFullScreen = true;
                videoPlayer.style.pointerEvents = 'none';
                return;
            }

            if (!fsEl) {
                videoPlayer.style.pointerEvents = 'auto';
                this.isVideoOnFullScreen = false;
            }
        };

        if (!videoPlayer.dataset.fsSyncAttached) {
            videoPlayer.dataset.fsSyncAttached = '1';
            document.addEventListener('fullscreenchange', sync);
            document.addEventListener('webkitfullscreenchange', sync);
        }

        btnFs.addEventListener('click', () => {
            if (videoPlayer.classList.contains('videoCircle')) {
                return this.userLog('info', 'Full Screen not allowed if video on privacy mode', 'top-end');
            }
            this.toggleFullScreen(fsTarget);
            setTimeout(sync, 0);
        });
    }

    // ####################################################
    // HANDLE VIDEO | OBJ FIT | CONTROLS | PIN-UNPIN
    // ####################################################

    handleVideoObjectFit(value) {
        document.documentElement.style.setProperty('--videoObjFit', value);
    }

    handleVideoControls(value) {
        isVideoControlsOn = value == 'on' ? true : false;
        let cameras = this.getEcN('Camera');
        for (let i = 0; i < cameras.length; i++) {
            let cameraId = cameras[i].id.replace('__video', '');
            let videoPlayer = this.getId(cameraId);
            videoPlayer.hasAttribute('controls')
                ? videoPlayer.removeAttribute('controls')
                : videoPlayer.setAttribute('controls', isVideoControlsOn);
        }
    }

    handlePN(elemId, pnId, camId, isScreen = false, isAvatar = false) {
        let videoPlayer = this.getId(elemId);
        let btnPn = this.getId(pnId);
        let cam = this.getId(camId);
        if (btnPn && videoPlayer && cam) {
            btnPn.addEventListener('click', () => {
                if (this.isMobileDevice) return;
                this.sound('click');
                this.isVideoPinned = !this.isVideoPinned;
                if (this.isVideoPinned) {
                    if (!videoPlayer.classList.contains('videoCircle')) {
                        videoPlayer.style.objectFit = 'contain';
                    }
                    cam.className = 'pinned-video-container';
                    cam.style.width = '100%';
                    cam.style.height = '100%';
                    this.toggleVideoPin(pinVideoPosition.value);
                    this.videoPinMediaContainer.appendChild(cam);
                    this.videoPinMediaContainer.style.display = 'block';
                    this.pinnedVideoPlayerId = elemId;
                    setColor(btnPn, 'lime');
                } else {
                    if (this.pinnedVideoPlayerId != videoPlayer.id) {
                        this.isVideoPinned = true;
                        if (this.isScreenAllowed) return;
                        return this.msgPopup('toast', 'Another video seems pinned, unpin it before to pin this one');
                    }
                    if (!isScreen) videoPlayer.style.objectFit = 'var(--videoObjFit)';
                    this.videoPinMediaContainer.removeChild(cam);
                    cam.className = 'Camera';
                    this.videoMediaContainer.appendChild(cam);
                    this.removeVideoPinMediaContainer();
                    setColor(btnPn, 'white');
                    if (!this.isApplyingParticipantViewMode && typeof setParticipantViewMode === 'function') {
                        clearTimeout(this.participantViewRestoreTimer);
                        this.participantViewRestoreTimer = null;
                        setParticipantViewMode('grid', true, false);
                    }
                }
                this.resizeVideoMenuBar();
                handleAspectRatio();
                if (this.isFollowMeActive && isPresenter && !this.isApplyingDominantSpeaker) {
                    if (this.isVideoPinned) {
                        const peerId = videoPlayer.getAttribute('name');
                        this.emitFollowMe({ action: 'pin', peerId: peerId });
                    } else {
                        this.emitFollowMe({ action: 'unpin' });
                    }
                }
            });

            if (isAvatar && !this.isMobileDevice && this.videoMediaContainer.childElementCount > 1) btnPn.click();
            this.scheduleParticipantViewRestore();
        }
    }

    scheduleParticipantViewRestore() {
        if (this.isMobileDevice || this.isVideoPinned) return;
        const mode = localStorageSettings?.participant_view;
        if (!mode?.startsWith('speaker-')) return;

        clearTimeout(this.participantViewRestoreTimer);
        this.participantViewRestoreTimer = setTimeout(() => {
            this.participantViewRestoreTimer = null;
            if (!this.isVideoPinned && typeof setParticipantViewMode === 'function') {
                setParticipantViewMode(mode, false, false);
            }
        }, 250);
    }

    toggleVideoPin(position) {
        if (!this.isVideoPinned) return;
        const pinnedPanelWidth = this.getPinnedSidePanelWidth();
        const contentWidth = 100 - pinnedPanelWidth;
        const speakerWidth = contentWidth * 0.75;
        const thumbnailWidth = contentWidth * 0.25;
        this.videoPinMediaContainer.style.top = 0;
        this.videoPinMediaContainer.style.left = 0;
        this.videoPinMediaContainer.style.width = contentWidth + '%';
        this.videoPinMediaContainer.style.height = '100%';
        this.videoMediaContainer.style.display = 'flex';
        this.videoMediaContainer.style.top = 0;
        this.videoMediaContainer.style.left = '';
        this.videoMediaContainer.style.right = '';
        this.videoMediaContainer.style.width = contentWidth + '%';
        this.videoMediaContainer.style.height = '100%';
        switch (position) {
            case 'speaker-bottom':
            case 'top':
                this.videoPinMediaContainer.style.top = '25%';
                this.videoPinMediaContainer.style.width = contentWidth + '%';
                this.videoPinMediaContainer.style.height = '75%';
                this.videoMediaContainer.style.height = '25%';
                break;
            case 'speaker-left':
            case 'vertical':
                this.videoPinMediaContainer.style.width = speakerWidth + '%';
                this.videoMediaContainer.style.width = thumbnailWidth + '%';
                this.videoMediaContainer.style.right = pinnedPanelWidth + '%';
                break;
            case 'speaker-top':
            case 'horizontal':
                this.videoPinMediaContainer.style.height = '75%';
                this.videoMediaContainer.style.top = '75%';
                this.videoMediaContainer.style.height = '25%';
                break;
            case 'speaker-right':
                this.videoPinMediaContainer.style.left = thumbnailWidth + '%';
                this.videoPinMediaContainer.style.width = speakerWidth + '%';
                this.videoMediaContainer.style.width = thumbnailWidth + '%';
                break;
            case 'speaker-1:1':

            default:
                break;
        }
        if (position !== 'speaker-1:1') resizeVideoMedia();
    }

    getPinnedSidePanelWidth() {
        if (this.isChatPinned) return 25;
        return 0;
    }

    refreshVideoPinLayout() {
        if (this.isVideoPinned) this.toggleVideoPin(pinVideoPosition.value);
    }

    // ####################################################
    // HANDLE VIDEO ZOOM-IN/OUT
    // ####################################################

    handleZV(elemId, divId, peerId) {
        let videoPlayer = this.getId(elemId);
        let videoWrap = this.getId(divId);
        let videoPeerId = peerId;
        let zoom = 1;

        const ZOOM_IN_FACTOR = 1.1;
        const ZOOM_OUT_FACTOR = 0.9;
        const MAX_ZOOM = 15;
        const MIN_ZOOM = 1;

        if (this.isZoomCenterMode) {
            if (videoPlayer) {
                videoPlayer.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    let delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
                    delta > 0 ? (zoom *= 1.2) : (zoom /= 1.2);
                    if (zoom < 1) zoom = 1;
                    videoPlayer.style.scale = zoom;
                });
            }
        } else {
            if (videoPlayer && videoWrap) {
                videoPlayer.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    if (isVideoPrivacyActive) return;
                    const rect = videoWrap.getBoundingClientRect();
                    const cursorX = e.clientX - rect.left;
                    const cursorY = e.clientY - rect.top;
                    const zoomDirection = e.deltaY > 0 ? 'zoom-out' : 'zoom-in';
                    const scaleFactor = zoomDirection === 'zoom-out' ? ZOOM_OUT_FACTOR : ZOOM_IN_FACTOR;
                    zoom *= scaleFactor;
                    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
                    videoPlayer.style.transformOrigin = `${cursorX}px ${cursorY}px`;
                    videoPlayer.style.transform = `scale(${zoom})`;
                    videoPlayer.style.cursor = zoom === 1 ? 'pointer' : zoomDirection;
                });

                videoWrap.addEventListener('mouseleave', () => {
                    videoPlayer.style.cursor = 'pointer';
                    if (videoPeerId === this.peer_id) {
                        zoom = 1;
                        videoPlayer.style.transform = '';
                        videoPlayer.style.transformOrigin = 'center';
                    }
                });
                videoPlayer.addEventListener('mouseleave', () => {
                    videoPlayer.style.cursor = 'pointer';
                });
            }
        }
    }

    // ####################################################
    // DROPDOWN MENU HELPERS
    // ####################################################

    createDropdownItem(btnEl, label, dropdownContent, color) {
        const item = document.createElement('div');
        item.className = 'navbar-dropdown-item';
        item.appendChild(btnEl);
        const span = document.createElement('span');
        span.textContent = label;
        item.appendChild(span);
        if (color) {
            btnEl.style.setProperty('color', color, 'important');
            span.style.setProperty('color', color, 'important');
        }
        let dispatching = false;
        item.addEventListener('click', (e) => {
            if (dispatching) return;
            e.stopPropagation();
            dispatching = true;
            btnEl.click();
            dispatching = false;
            if (dropdownContent) dropdownContent.classList.remove('show');
        });
        return item;
    }

    createResponsiveDropdownItem(sourceButton, label, tier = 'secondary') {
        sourceButton.classList.add(`navbar-${tier}-action`);
        const proxyButton = sourceButton.cloneNode(false);
        proxyButton.removeAttribute('id');
        proxyButton.removeAttribute('style');
        proxyButton.addEventListener('click', () => sourceButton.click());
        return this.createDropdownItem(proxyButton, label);
    }

    createResponsiveDropdownRangeItem(sourceRange, label, iconClass) {
        sourceRange.classList.add('navbar-secondary-action');
        const item = document.createElement('div');
        item.className = 'navbar-dropdown-item navbar-dropdown-control';

        const icon = document.createElement('i');
        icon.className = `fas ${iconClass}`;
        const span = document.createElement('span');
        span.textContent = label;
        const proxyRange = sourceRange.cloneNode(false);
        proxyRange.removeAttribute('id');
        proxyRange.removeAttribute('style');

        proxyRange.addEventListener('input', () => {
            sourceRange.value = proxyRange.value;
            sourceRange.dispatchEvent(new Event('input', { bubbles: true }));
        });
        sourceRange.addEventListener('input', () => {
            proxyRange.value = sourceRange.value;
        });

        item.append(icon, span, proxyRange);
        return item;
    }

    handleDropdownEvents(dropdownDiv, dropdownBtn, dropdownContent) {
        let closeTimer = null;

        const showDropdown = () => {
            if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
            }
            document.querySelectorAll('.navbar-dropdown-content.show').forEach((el) => {
                if (el !== dropdownContent) el.classList.remove('show');
            });
            dropdownContent.classList.add('show');

            const gap = 2;
            const viewportMargin = 8;
            const buttonRect = dropdownBtn.getBoundingClientRect();
            const menuRect = dropdownContent.getBoundingClientRect();
            const spaceBelow = window.innerHeight - buttonRect.bottom - viewportMargin;
            const top =
                spaceBelow >= menuRect.height
                    ? buttonRect.bottom + gap
                    : Math.max(viewportMargin, buttonRect.top - menuRect.height - gap);
            const left = Math.min(
                Math.max(viewportMargin, buttonRect.right - menuRect.width),
                window.innerWidth - menuRect.width - viewportMargin
            );

            dropdownContent.style.top = top + 'px';
            dropdownContent.style.right = 'auto';
            dropdownContent.style.left = Math.max(viewportMargin, left) + 'px';
        };

        const scheduleClose = () => {
            if (closeTimer) clearTimeout(closeTimer);
            closeTimer = setTimeout(() => {
                dropdownContent.classList.remove('show');
                closeTimer = null;
            }, 200);
        };

        // Desktop: open on hover
        dropdownDiv.addEventListener('mouseenter', () => showDropdown());

        // Close with delay when mouse leaves both the button and the dropdown content
        dropdownDiv.addEventListener('mouseleave', (e) => {
            if (!dropdownContent.contains(e.relatedTarget)) {
                scheduleClose();
            }
        });
        dropdownContent.addEventListener('mouseenter', () => {
            if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
            }
        });
        dropdownContent.addEventListener('mouseleave', (e) => {
            if (!dropdownDiv.contains(e.relatedTarget)) {
                scheduleClose();
            }
        });

        // Mobile: toggle on tap
        dropdownBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            } else {
                showDropdown();
            }
        });
    }

    // ####################################################
    // HANDLE VIDEO AND MENU BAR
    // ####################################################

    handleVB(videoId, videoBarId) {
        const videoPlayer = this.getId(videoId);
        const videoBar = this.getId(videoBarId);

        if (videoPlayer && videoBar) {
            const eventType = this.isDesktopDevice ? 'mouseenter' : 'click';
            videoPlayer.addEventListener(eventType, async () => {
                hideVideoMenuBar(videoBarId);
                rc.resizeVideoMenuBar();
                setCamerasBorderNone();
                if (videoBar.classList.contains('hidden')) {
                    show(videoBar);
                    animateCSS(videoBar, 'fadeInDown');
                    if (participantsCount > 1) {
                        videoPlayer.style.setProperty('border', 'var(--videoBar-active)', 'important');
                    }
                } else {
                    setCamerasBorderNone();
                    hide(videoBar);
                }
            });

            if (this.isDesktopDevice) {
                videoPlayer.addEventListener('mouseleave', () => {
                    setCamerasBorderNone();
                    hideVideoMenuBar('ALL');
                });
            }
        }
    }

    resizeVideoMenuBar() {
        const somethingPinned = this.isVideoPinned || this.isChatPinned;
        const menuBarWidth = somethingPinned ? '75%' : '70%';
        const videoMenuBar = rc.getEcN('videoMenuBar');
        for (let i = 0; i < videoMenuBar.length; i++) {
            const menuBar = videoMenuBar[i];
            menuBar.style.width = this.isMobileDevice && somethingPinned ? menuBarWidth : '100%';
        }
    }

    // ####################################################
    // REMOVE VIDEO PIN MEDIA CONTAINER
    // ####################################################

    removeVideoPinMediaContainer() {
        this.videoPinMediaContainer.style.display = 'none';
        this.videoMediaContainerUnpin();
        this.pinnedVideoPlayerId = null;
        this.isVideoPinned = false;
        if (this.isChatPinned) {
            this.chatPin();
        }
    }

    videoMediaContainerPin() {
        this.videoMediaContainer.style.top = 0;
        this.videoMediaContainer.style.width = '75%';
        this.videoMediaContainer.style.height = '100%';
        this.resizeVideoMenuBar();
    }

    videoMediaContainerUnpin() {
        this.videoMediaContainer.style.display = 'flex';
        this.videoMediaContainer.style.top = 0;
        this.videoMediaContainer.style.left = '';
        this.videoMediaContainer.style.right = '';
        this.videoMediaContainer.style.width = '100%';
        this.videoMediaContainer.style.height = '100%';
        this.resizeVideoMenuBar();
    }

    adaptVideoObjectFit(index) {
        // 1 (cover) 2 (contain)
        BtnVideoObjectFit.selectedIndex = index;
        BtnVideoObjectFit.onchange();
    }

    // ####################################################
    // TAKE SNAPSHOT
    // ####################################################

    // ####################################################
    // HANDLE VIDEO DRAWING OVERLAY
    // ####################################################

    // ####################################################
    // HANDLE VIDEO MIRROR
    // ####################################################

    handleMV(elemId, tsId) {
        let videoPlayer = this.getId(elemId);
        let btnMv = this.getId(tsId);
        if (btnMv && videoPlayer) {
            btnMv.addEventListener('click', () => {
                videoPlayer.classList.toggle('mirror');
                // Update only current session local webcam mirror preference.
                const isLocalWebcam = videoPlayer.getAttribute('name') === this.peer_id;
                if (isLocalWebcam) {
                    sessionVideoMirror = videoPlayer.classList.contains('mirror');
                }
            });
        }
    }

    // ####################################################
    // VIDEO CIRCLE - PRIVACY MODE
    // ####################################################

    handleVP(elemId, vpId) {
        const startVideoInPrivacyMode =
            this._moderator.video_start_privacy || localStorageSettings.moderator_video_start_privacy;
        let videoPlayer = this.getId(elemId);
        let btnVp = this.getId(vpId);
        if (btnVp && videoPlayer) {
            btnVp.addEventListener('click', () => {
                this.sound('click');
                this.toggleVideoPrivacyMode();
            });

            if (startVideoInPrivacyMode) {
                btnVp.click();
            }
        }
    }

    toggleVideoPrivacyMode() {
        isVideoPrivacyActive = !isVideoPrivacyActive;
        this.setVideoPrivacyStatus(this.peer_id, isVideoPrivacyActive);
        this.emitCmd({
            type: 'privacy',
            peer_id: this.peer_id,
            active: isVideoPrivacyActive,
            broadcast: true,
        });
    }

    setVideoPrivacyStatus(elemName, privacy) {
        let videoPlayer = this.getName(elemName);
        if (!videoPlayer) return;
        if (privacy) {
            videoPlayer.classList.remove('videoDefault');
            videoPlayer.classList.add('videoCircle');
            videoPlayer.style.objectFit = 'cover';
        } else {
            videoPlayer.classList.remove('videoCircle');
            videoPlayer.classList.add('videoDefault');
            videoPlayer.style.objectFit = 'var(--videoObjFit)';
        }
    }

    // ####################################################
    // DRAGGABLE
    // ####################################################

    makeDraggable(elmnt, dragObj) {
        let pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        if (dragObj) {
            dragObj.onmousedown = dragMouseDown;
        } else {
            elmnt.onmousedown = dragMouseDown;
        }
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position with top boundary check (min 0px):
            let newTop = elmnt.offsetTop - pos2;
            if (newTop < 0) newTop = 0;
            elmnt.style.top = newTop + 'px';
            elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
        }
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    makeUnDraggable(elmnt, dragObj) {
        if (dragObj) {
            dragObj.onmousedown = null;
        } else {
            elmnt.onmousedown = null;
        }
        elmnt.style.top = '';
        elmnt.style.left = '';
    }

    // ####################################################
    // CHAT
    // ####################################################

    handleSM(uid, peer_name, peer_id) {
        let btnSm = this.getId(uid);
        if (btnSm) {
            btnSm.addEventListener('click', () => {
                this.sendMessageTo(peer_id, peer_name);
            });
        }
    }

    isPlistOpen() {
        const plist = this.getId('plist');
        return !plist.classList.contains('hidden');
    }

    /** Toggle the shared panel, resetting its inner view and applying the standard auto-pin preference on open. */
    async toggleChat(fromParticipants = false) {
        if (!fromParticipants && !BUTTONS.main.chatButton) return;
        const chatRoom = this.getId('chatRoom');
        chatRoom.classList.toggle('show');
        if (!this.isChatOpen) {
            resetChatPanelView(this);
            await getRoomParticipants();
            hide(chatMinButton);

            if (!isFullscreenChatDevice(this)) {
                BUTTONS.chat.chatMaxButton && show(chatMaxButton);
            }
            this.chatCenter();
            this.sound('open');
            this.showPeerAboutAndMessages(this.chatPeerId, this.chatPeerName, this.chatPeerAvatar);
        }
        isParticipantsListOpen = !isParticipantsListOpen;
        this.isChatOpen = !this.isChatOpen;

        if (!this.isChatOpen) {
            this.isParticipantsOpen = false;
            this.isChatOpenedByParticipantsBtn = false;
            resetChatPanelView(this);
        }
        this.syncChatToolbarButtons();
        this.updateUnreadCountBadge(this.chatPeerId || 'all');

        if (this.isChatPinned) this.chatUnpin();

        if (!isFullscreenChatDevice(this) && this.isChatOpen && isChatPinEnabled) {
            this.toggleChatPin();
        }

        resizeChatRoom();
    }

    updateChatFooterVisibility() {
        const chatFooter = document.querySelector('.chat-message');
        const peopleList = document.querySelector('#plist') || document.querySelector('.people-list');
        if (!chatFooter || !peopleList) return;
        const isFullWidth =
            this.isPlistOpen() &&
            (isFullscreenChatDevice(this) ||
                (window.innerWidth <= 600 && peopleList.offsetWidth >= window.innerWidth * 0.98));
        elemDisplay(chatFooter, !isFullWidth);
    }

    toggleShowParticipants(fromUser = false) {
        const plist = this.getId('plist');
        const chat = this.getId('chat');
        plist.classList.toggle('hidden');
        const isParticipantsListHidden = !this.isPlistOpen();

        // Chat was opened only to show participants: close everything instead of leaving the chat visible.
        if (fromUser && isParticipantsListHidden && this.isChatOpenedByParticipantsBtn) {
            this.isChatOpenedByParticipantsBtn = false;
            if (this.isChatOpen) this.toggleChat(true);
            return;
        }

        if (!BUTTONS.main.chatButton) {
            elemDisplay(chat.id, false);
            if (isParticipantsListHidden && fromUser) {
                // User clicked X button: close the entire chat panel
                if (this.isChatOpen) this.toggleChat(true);
            } else if (!isParticipantsListHidden) {
                // Opening participants: show plist full-width
                plist.style.width = '100%';
                plist.style.position = isFullscreenChatDevice(this) ? 'fixed' : 'absolute';
            }
            this.updateChatFooterVisibility();
            return;
        }

        const sideBySide = !this.isChatPinned && !isFullscreenChatDevice(this) && window.innerWidth > 600;
        chat.style.marginLeft = sideBySide && !isParticipantsListHidden ? '300px' : 0;
        chat.style.borderLeft = sideBySide && !isParticipantsListHidden ? '1px solid rgba(255,255,255,.08)' : 'none';
        elemDisplay(chat.id, isParticipantsListHidden || sideBySide, 'flex');
        this.toggleChatHistorySize(isParticipantsListHidden && (this.isChatPinned || this.isChatMaximized));
        plist.style.width = sideBySide ? '300px' : '100%';
        plist.style.position = isFullscreenChatDevice(this) ? 'fixed' : 'absolute';
        this.updateChatFooterVisibility();
    }

    async toggleParticipants() {
        this.isParticipantsOpen = !this.isParticipantsOpen;
        this.syncChatToolbarButtons();
        if (!this.isParticipantsOpen && this.isChatOpen) {
            this.isChatOpenedByParticipantsBtn = false;
            this.toggleChat(true);
            return;
        }
        if (!this.isChatOpen) {
            // Chat is being opened solely to display the participants list
            this.isChatOpenedByParticipantsBtn = true;
            await this.toggleChat(true);
            if (!BUTTONS.main.chatButton) {
                elemDisplay('chat', false);
            }
        }
        if ((isDesktopDevice && this.isChatPinned) || !isDesktopDevice) {
            this.toggleShowParticipants();
        }
    }

    syncChatToolbarButtons() {
        const participantsActive = !!this.isParticipantsOpen && !!this.isChatOpen;
        const chatActive = !!this.isChatOpen && !participantsActive;

        const chatBtn = document.getElementById('chatButton');
        if (chatBtn) {
            chatBtn.classList.toggle('is-active', chatActive);
            chatBtn.setAttribute('aria-pressed', chatActive ? 'true' : 'false');
        }
        const pBtn = document.getElementById('participantsButton');
        if (pBtn) {
            pBtn.classList.toggle('is-active', participantsActive);
            pBtn.setAttribute('aria-pressed', participantsActive ? 'true' : 'false');
        }
    }

    toggleChatHistorySize(max = true) {
        const chatHistory = this.getId('chatHistory');
        chatHistory.style.minHeight = max ? 'calc(100vh - 270px)' : '430px';
        chatHistory.style.maxHeight = 'none';
    }

    toggleChatPin() {
        this.isChatPinned ? this.chatUnpin() : this.chatPin();
        this.sound('click');
    }

    setChatControlState(button, isActive) {
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    }

    chatMaximize() {
        this.isChatMaximized = true;
        hide(chatMaxButton);
        BUTTONS.chat.chatMaxButton && show(chatMinButton);
        this.chatCenter();
        document.documentElement.style.setProperty('--msger-width', '100%');
        document.documentElement.style.setProperty('--msger-height', '100%');
        this.toggleChatHistorySize(true);
        chatRoom.classList.remove('chat-maximize-in');
        void chatRoom.offsetWidth;
        chatRoom.classList.add('chat-maximize-in');
    }

    chatMinimize() {
        this.isChatMaximized = false;
        hide(chatMinButton);
        BUTTONS.chat.chatMaxButton && show(chatMaxButton);
        if (this.isChatPinned) {
            this.chatPin();
            chatRoom.classList.remove('panel-slide-in', 'chat-dock-in');
            void chatRoom.offsetWidth; // force reflow so the animation always restarts
            chatRoom.classList.add('chat-dock-in');
        } else {
            this.chatCenter();
            document.documentElement.style.setProperty('--msger-width', '800px');
            document.documentElement.style.setProperty('--msger-height', '700px');
            this.toggleChatHistorySize(false);
            chatRoom.classList.remove('chat-minimize-in');
            void chatRoom.offsetWidth; // force reflow so the animation always restarts
            chatRoom.classList.add('chat-minimize-in');
        }
    }

    chatPin() {
        if (!this.isVideoPinned) {
            this.videoMediaContainerPin();
        }
        if (chatRoom.classList.contains('container')) chatRoom.classList.remove('container');
        this.chatPinned();
        this.isChatPinned = true;
        this.refreshVideoPinLayout();
        this.setChatControlState(chatTogglePin, true);
        this.resizeVideoMenuBar();
        resizeVideoMedia();
        chatRoom.style.resize = 'none';
        if (!this.isMobileDevice) this.makeUnDraggable(chatRoom, chatHeader);
        if (this.isPlistOpen()) this.toggleShowParticipants();
    }

    chatUnpin() {
        if (!this.isVideoPinned) {
            this.videoMediaContainerUnpin();
        }
        chatRoom.classList.remove('panel-slide-in');
        document.documentElement.style.setProperty('--msger-width', '800px');
        document.documentElement.style.setProperty('--msger-height', '700px');
        hide(chatMinButton);
        BUTTONS.chat.chatMaxButton && show(chatMaxButton);
        this.chatCenter();
        this.isChatPinned = false;
        this.refreshVideoPinLayout();
        this.setChatControlState(chatTogglePin, false);
        this.resizeVideoMenuBar();
        resizeVideoMedia();
        if (!this.isMobileDevice) this.makeDraggable(chatRoom, chatHeader);
        if (!this.isPlistOpen()) this.toggleShowParticipants();
        if (!chatRoom.classList.contains('container')) chatRoom.classList.add('container');
        resizeChatRoom();
    }

    chatCenter() {
        chatRoom.classList.remove('panel-slide-in', 'chat-maximize-in', 'chat-minimize-in', 'chat-dock-in');
        chatRoom.style.right = null;
        chatRoom.style.position = 'fixed';
        chatRoom.style.transform = 'translate(-50%, -50%)';
        chatRoom.style.top = '50%';
        chatRoom.style.left = '50%';
    }

    chatPinned() {
        chatRoom.style.position = 'absolute';
        chatRoom.style.top = 0;
        chatRoom.style.right = 0;
        chatRoom.style.left = null;
        chatRoom.style.transform = null;
        document.documentElement.style.setProperty('--msger-width', '25%');
        document.documentElement.style.setProperty('--msger-height', '100%');
        chatRoom.classList.remove('panel-slide-in', 'chat-dock-in');
        void chatRoom.offsetWidth; // force reflow so the animation always restarts
        chatRoom.classList.add('panel-slide-in');
    }

    toggleChatEmoji() {
        this.setChatEmojiOpen(!this.isChatEmojiOpen);
    }

    setChatEmojiOpen(isOpen) {
        this.isChatEmojiOpen = isOpen;
        this.getId('chatEmoji').classList.toggle('show', isOpen);
        const chatEmojiButton = this.getId('chatEmojiButton');
        chatEmojiButton.style.color = isOpen ? '#FFFF00' : '#FFFFFF';
        chatEmojiButton.setAttribute('aria-expanded', String(isOpen));
    }

    addEmojiToMsg(data) {
        msgerInput.value += data.native;
        toggleChatEmoji();
    }

    cleanMessage() {
        chatMessage.value = '';
        chatMessage.setAttribute('rows', '1');
        const charCount = this.getId('chatCharCount');
        if (charCount) charCount.textContent = '0 / 4000';
    }

    pasteMessage() {
        navigator.clipboard
            .readText()
            .then((text) => {
                chatMessage.value += text;
                isChatPasteTxt = true;
                this.checkLineBreaks();
            })
            .catch((err) => {
                console.error('Failed to read clipboard contents: ', err);
            });
    }

    sendMessage() {
        if (!this.thereAreParticipants() && !isChatGPTOn && !isDeepSeekOn) {
            this.cleanMessage();
            isChatPasteTxt = false;
            return this.userLog('info', 'No participants in the room', 'top-end');
        }

        // Prevent long messages
        if (this.chatMessageLengthCheck && chatMessage.value.length > this.chatMessageLength) {
            return this.userLog(
                'warning',
                `The message seems too long, with a maximum of ${this.chatMessageLength} characters allowed`,
                'top-end'
            );
        }

        // Spamming detected ban the user from the room
        if (this.chatMessageSpamCount == this.chatMessageSpamCountToBan) {
            return this.roomAction('isBanned', true);
        }

        // Prevent Spam messages
        const currentTime = Date.now();
        if (chatMessage.value && currentTime - this.chatMessageTimeLast <= this.chatMessageTimeBetween) {
            this.cleanMessage();
            chatMessage.readOnly = true;
            chatSendButton.disabled = true;
            setTimeout(function () {
                chatMessage.readOnly = false;
                chatSendButton.disabled = false;
            }, this.chatMessageNotifyDelay);
            this.chatMessageSpamCount++;
            return this.userLog(
                'warning',
                `Kindly refrain from spamming. Please wait ${this.chatMessageNotifyDelay / 1000} seconds before sending another message`,
                'top-end',
                this.chatMessageNotifyDelay
            );
        }
        this.chatMessageTimeLast = currentTime;

        chatMessage.value = filterXSS(chatMessage.value.trim());
        const peer_msg = window.BodrikChatImage?.parseMessage(chatMessage.value)
            ? chatMessage.value
            : this.formatMsg(chatMessage.value);
        if (!peer_msg) {
            return this.cleanMessage();
        }
        this.peer_name = filterXSS(this.peer_name);

        const msg_id = `${this.peer_id}_${Date.now()}`;
        const data = {
            room_id: this.room_id,
            peer_name: this.peer_name,
            peer_avatar: this.peer_avatar,
            peer_id: this.peer_id,
            to_peer_id: '',
            to_peer_name: '',
            peer_msg: peer_msg,
            msg_id: msg_id,
        };

        if (isChatGPTOn) {
            if (this._moderator.chat_cant_chatgpt) {
                this.cleanMessage();
                return this.userLog(
                    'warning',
                    'The moderator does not allow you to chat with ChatGPT',
                    'top-end',
                    6000
                );
            }

            data.to_peer_id = 'ChatGPT';
            data.to_peer_name = 'ChatGPT';
            console.log('Send message:', data);
            this.socket.emit('message', data);
            this.setMsgAvatar('left', this.peer_name, this.peer_avatar);
            this.appendMessage(
                'left',
                this.leftMsgAvatar,
                this.peer_name,
                this.peer_id,
                peer_msg,
                data.to_peer_id,
                data.to_peer_name
            );
            this.cleanMessage();

            this.showAITypingIndicator('ChatGPT');

            this.socket
                .request('getChatGPT', {
                    time: getDataTimeString(),
                    room: this.room_id,
                    name: this.peer_name,
                    prompt: peer_msg,
                    context: this.chatGPTContext,
                })
                .then((completion) => {
                    this.hideAITypingIndicator('ChatGPT');
                    if (!completion) return;
                    const { message, context } = completion;
                    this.chatGPTContext = context ? context : [];
                    console.log('Receive message:', message);
                    this.setMsgAvatar('right', 'ChatGPT');
                    this.appendMessage('right', image.chatgpt, 'ChatGPT', this.peer_id, message, 'ChatGPT', 'ChatGPT');
                    this.cleanMessage();

                    this.speechInMessages ? this.speechMessage(true, 'ChatGPT', message) : this.sound('message');
                })
                .catch((err) => {
                    this.hideAITypingIndicator('ChatGPT');
                    console.log('ChatGPT error:', err);
                });
        }

        if (isDeepSeekOn) {
            if (this._moderator.chat_cant_deep_seek) {
                this.cleanMessage();
                return this.userLog(
                    'warning',
                    'The moderator does not allow you to chat with DeepSeek',
                    'top-end',
                    6000
                );
            }
            data.to_peer_id = 'DeepSeek';
            data.to_peer_name = 'DeepSeek';
            console.log('Send message:', data);
            this.socket.emit('message', data);
            this.setMsgAvatar('left', this.peer_name, this.peer_avatar);
            this.appendMessage(
                'left',
                this.leftMsgAvatar,
                this.peer_name,
                this.peer_id,
                peer_msg,
                data.to_peer_id,
                data.to_peer_name
            );
            this.cleanMessage();

            this.showAITypingIndicator('DeepSeek');

            this.socket
                .request('getDeepSeek', {
                    time: getDataTimeString(),
                    room: this.room_id,
                    name: this.peer_name,
                    prompt: peer_msg,
                    context: this.deepSeekContext,
                })
                .then((completion) => {
                    this.hideAITypingIndicator('DeepSeek');
                    if (!completion) return;
                    const { message, context } = completion;
                    this.deepSeekContext = context ? context : [];
                    console.log('Receive message:', message);
                    this.setMsgAvatar('right', 'DeepSeek');
                    this.appendMessage(
                        'right',
                        image.deepSeek,
                        'DeepSeek',
                        this.peer_id,
                        message,
                        'DeepSeek',
                        'DeepSeek'
                    );
                    this.cleanMessage();

                    this.speechInMessages ? this.speechMessage(true, 'DeepSeek', message) : this.sound('message');
                })
                .catch((err) => {
                    this.hideAITypingIndicator('DeepSeek');
                    console.log('DeepSeek error:', err);
                });
        }

        if (!isChatGPTOn && !isDeepSeekOn) {
            const participantsList = this.getId('participantsList');
            const participantsListItems = participantsList.getElementsByTagName('li');
            for (let i = 0; i < participantsListItems.length; i++) {
                const li = participantsListItems[i];
                if (li.classList.contains('active')) {
                    data.to_peer_id = li.getAttribute('data-to-id');
                    data.to_peer_name = li.getAttribute('data-to-name');

                    const isPublicMessage = data.to_peer_id === 'all';

                    if (isPublicMessage && this._moderator.chat_cant_publicly) {
                        this.cleanMessage();
                        return this.userLog(
                            'warning',
                            'The moderator does not allow you to chat publicly',
                            'top-end',
                            6000
                        );
                    }

                    if (!isPublicMessage && this._moderator.chat_cant_privately) {
                        this.cleanMessage();
                        return this.userLog(
                            'warning',
                            'The moderator does not allow you to chat privately',
                            'top-end',
                            6000
                        );
                    }

                    console.log('Send message:', data);

                    // Try DataChannel for public messages, fallback to signaling
                    if (isPublicMessage && this.useDataChannel && this.isChatDataChannelOpen()) {
                        const dcMsg = {
                            type: 'chat',
                            room_id: data.room_id,
                            peer_name: data.peer_name,
                            peer_avatar: data.peer_avatar,
                            peer_id: data.peer_id,
                            to_peer_id: data.to_peer_id,
                            to_peer_name: data.to_peer_name,
                            peer_msg: data.peer_msg,
                            msg_id: data.msg_id,
                            timestamp: Date.now(),
                        };
                        const sent = this.sendChatDataChannelMessage(dcMsg);
                        if (!sent) {
                            console.warn('DataChannel send failed, falling back to signaling');
                            this.socket.emit('message', data);
                        } else {
                            console.log('Message sent via DataChannel');
                        }
                    } else {
                        // Private messages or DataChannel unavailable: use signaling
                        this.socket.emit('message', data);
                    }

                    this.setMsgAvatar('left', this.peer_name, this.peer_avatar);
                    this.appendMessage(
                        'left',
                        this.leftMsgAvatar,
                        this.peer_name,
                        this.peer_id,
                        peer_msg,
                        data.to_peer_id,
                        data.to_peer_name,
                        data.msg_id
                    );
                    this.cleanMessage();
                }
            }
        }
    }

    sendMessageTo(to_peer_id, to_peer_name) {
        if (!this.thereAreParticipants()) {
            isChatPasteTxt = false;
            this.cleanMessage();
            return this.userLog('info', 'No participants in the room except you', 'top-end');
        }
        // Open chat and switch to the private conversation with this peer
        this.chatPeerId = to_peer_id;
        this.chatPeerName = to_peer_name;
        this.chatPeerAvatar = '';
        !this.isChatOpen ? this.toggleChat() : this.showPeerAboutAndMessages(to_peer_id, to_peer_name);
    }

    async showMessage(data, toggleChat = true) {
        const isPublicMessage = data.to_peer_id === 'all';
        const messagePeerId = isPublicMessage ? 'all' : data.peer_id;

        if (toggleChat && !this.isChatOpen && this.showChatOnMessage) {
            // Auto-switch to the correct tab before opening the chat panel
            if (isPublicMessage) {
                this.chatPeerId = 'all';
                this.chatPeerName = 'all';
                this.chatPeerAvatar = '';
            } else {
                this.chatPeerId = data.peer_id;
                this.chatPeerName = data.peer_name;
                this.chatPeerAvatar = data.peer_avatar || '';
            }
            await this.toggleChat();
        }

        this.setMsgAvatar('right', data.peer_name, data.peer_avatar);
        this.appendMessage(
            'right',
            this.rightMsgAvatar,
            data.peer_name,
            data.peer_id,
            data.peer_msg,
            data.to_peer_id,
            data.to_peer_name,
            data.msg_id
        );

        if (!this.showChatOnMessage) {
            this.userLog('info', `💬 New message from: ${data.peer_name}`, 'top-end');
        }

        if (this.speechInMessages) {
            this.speechMessage(true, data.peer_name, data.peer_msg);
        } else {
            this.sound('message');
        }

        // Track unread count when message is not currently visible
        const isMessageVisible = this.isChatOpen && this.chatPeerId === messagePeerId;
        if (!isMessageVisible) {
            this.unreadMessageCounts[messagePeerId] = (this.unreadMessageCounts[messagePeerId] || 0) + 1;
            this.updateUnreadCountBadge(messagePeerId);
        }

        const participantsList = this.getId('participantsList');
        const participantsListItems = participantsList.getElementsByTagName('li');
        for (let i = 0; i < participantsListItems.length; i++) {
            const li = participantsListItems[i];
            // INCOMING PUBLIC MESSAGE
            if (isPublicMessage && li.id === 'all' && !isMessageVisible) {
                li.classList.add('pulsate');
            }
            // INCOMING PRIVATE MESSAGE
            if (li.id === data.peer_id && !isPublicMessage && !isMessageVisible) {
                li.classList.add('pulsate');
                if (!['all', 'ChatGPT', 'DeepSeek'].includes(data.to_peer_id)) {
                    // unread-count badge handled by updateUnreadCountBadge
                }
            }
        }
    }

    updateUnreadCountBadge(peerId) {
        const count = this.unreadMessageCounts[peerId] || 0;
        try {
            const badge = this.getId(`${peerId}-unread-count`);
            if (count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
            } else {
                badge.textContent = '';
                badge.classList.add('hidden');
            }
        } catch (e) {
            // Badge element may not exist yet if participants list hasn't rendered
        }
        try {
            const total = Object.values(this.unreadMessageCounts || {}).reduce(
                (sum, n) => sum + (typeof n === 'number' ? n : 0),
                0
            );
            const toolbarBadge = document.getElementById('chatUnreadBadge');
            if (toolbarBadge) {
                if (total > 0 && !this.isChatOpen) {
                    toolbarBadge.textContent = total > 99 ? '99+' : String(total);
                    toolbarBadge.classList.remove('hidden');
                } else {
                    toolbarBadge.textContent = '';
                    toolbarBadge.classList.add('hidden');
                }
            }
        } catch (e) {
            // ignore
        }
    }

    setMsgAvatar(avatar, peerName, peerAvatar = false) {
        const avatarImg =
            peerAvatar && this.isValidAvatarURL(peerAvatar)
                ? peerAvatar
                : this.isValidEmail(peerName)
                  ? this.genGravatar(peerName)
                  : this.genAvatarSvg(peerName, 32);
        avatar === 'left' ? (this.leftMsgAvatar = avatarImg) : (this.rightMsgAvatar = avatarImg);
    }

    appendMessage(side, img, fromName, fromId, msg, toId, toName, msgId = '') {
        const getSide = filterXSS(side);
        // img is always internally computed (isValidAvatarURL / genAvatarSvg / genGravatar) and is
        // set via setAttribute — no XSS risk. filterXSS must NOT be applied here because it encodes
        // '<', '>' and '&' which breaks SVG data URIs produced by genAvatarSvg.
        const getImg =
            this.isValidAvatarURL(img) ||
            (typeof img === 'string' && img.startsWith('data:image/')) ||
            (typeof img === 'string' && (img.startsWith('../') || img.startsWith('/')))
                ? img
                : '';
        const getFromName = filterXSS(fromName);
        const getFromId = filterXSS(fromId);
        const getMsg = filterXSS(msg);
        const getToId = filterXSS(toId);
        const getToName = filterXSS(toName);
        const getMsgId = filterXSS(msgId || '');
        const time = this.getTimeNow();

        // Caller side convention is: left = local user, right = remote/assistant.
        // UI convention is: local user on the right, remote on the left.
        const myMessage = getSide === 'left';
        const messageClass = myMessage ? 'my-message float-right' : 'other-message';
        const messageData = myMessage ? 'text-end' : 'text-start';
        const safeFromName = this.sanitizeHtml(getFromName);
        const timeAndName = myMessage
            ? `<span class="message-data-time">${time}, ${safeFromName} ( me ) </span>`
            : `<span class="message-data-time">${time}, ${safeFromName} </span>`;

        const speechButton = this.isSpeechSynthesisSupported
            ? `<button 
                    id="msg-speech-${chatMessagesId}" 
                    class="mr5" 
                    onclick="rc.speechElementText('message-${chatMessagesId}')">
                    ${icons.speech}
                </button>`
            : '';

        // getImg is a user-controlled URL; use a temporary id and setAttribute
        // after insertion to avoid double-decode XSS via insertAdjacentHTML.

        const msgAvatarTmpId = `msg-av-${chatMessagesId}`;
        const positionFirst = myMessage
            ? `${timeAndName}<img id="${msgAvatarTmpId}" alt="avatar" />`
            : `<img id="${msgAvatarTmpId}" alt="avatar" />${timeAndName}`;

        const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];
        const reactionButtons = reactionEmojis
            .map(
                (e) =>
                    `<span class="reaction-emoji-btn" onclick="rc.sendChatReaction('msg-${chatMessagesId}', '${e}')" role="button">${e}</span>`
            )
            .join('');

        const newMessageHTML = `
            <li id="msg-${chatMessagesId}"  
                data-from-id="${this.sanitizeHtml(getFromId)}" 
                data-from-name="${this.sanitizeHtml(getFromName)}"
                data-to-id="${this.sanitizeHtml(getToId)}" 
                data-to-name="${this.sanitizeHtml(getToName)}"
                data-msg-id="${this.sanitizeHtml(getMsgId)}"
                class="clearfix"
            >
                <div class="message-data ${messageData}">
                    ${positionFirst}
                </div>
                <div class="message ${messageClass}">
                    <span class="text-start" id="message-${chatMessagesId}"></span>
                    <div class="message-reactions"></div>
                    <hr/>
                    <div class="about-buttons mt5">
                        <button 
                            id="msg-copy-${chatMessagesId}" 
                            class="mr5" 
                            onclick="rc.copyToClipboard('message-${chatMessagesId}')">
                            ${icons.paste}
                        </button>
                        ${speechButton}
                        <button 
                            id="msg-react-${chatMessagesId}" 
                            class="mr5" 
                            onclick="rc.toggleReactionPicker('msg-${chatMessagesId}')">
                            ${icons.smile}
                        </button>
                        <button 
                            id="msg-delete-${chatMessagesId}"   
                            class="mr5" 
                            onclick="rc.deleteMessage('msg-${chatMessagesId}')">
                            ${icons.trash}
                        </button>
                    </div>
                    <div id="reaction-picker-${chatMessagesId}" class="reaction-picker" style="display:none">
                        ${reactionButtons}
                    </div>
                </div>
            </li>
        `;

        this.collectMessages(time, getFromName, getMsg, getToId, getToName);

        console.log('Append message to:', { to_id: getToId, to_name: getToName });

        switch (getToId) {
            case 'ChatGPT':
                chatGPTMessages.insertAdjacentHTML('beforeend', newMessageHTML);
                break;
            case 'DeepSeek':
                deepSeekMessages.insertAdjacentHTML('beforeend', newMessageHTML);
                break;
            case 'all':
                chatPublicMessages.insertAdjacentHTML('beforeend', newMessageHTML);
                break;
            default:
                chatPrivateMessages.insertAdjacentHTML('beforeend', newMessageHTML);
                break;
        }

        const msgAvatarEl = document.getElementById(msgAvatarTmpId);
        if (msgAvatarEl) {
            msgAvatarEl.setAttribute('src', getImg);
            msgAvatarEl.removeAttribute('id');
        }

        const message = getId(`message-${chatMessagesId}`);
        if (message) {
            if (['ChatGPT', 'DeepSeek'].includes(getFromName)) {
                // Stream the message for ChatGPT or DeepSeek
                this.streamMessage(message, getMsg, 100);
            } else {
                // Process the message for other senders
                const chatImage = window.BodrikChatImage?.parseMessage(msg);
                if (chatImage) {
                    const link = document.createElement('a');
                    link.href = chatImage.url;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    const img = document.createElement('img');
                    img.src = chatImage.url;
                    img.alt = 'Картинка из чата';
                    img.style.cssText = 'max-width:260px;max-height:240px;object-fit:contain;border-radius:8px';
                    link.appendChild(img);
                    message.replaceChildren(link);
                    if (chatImage.caption) {
                        const caption = document.createElement('span');
                        caption.className = 'bodrik-image-caption';
                        caption.textContent = chatImage.caption;
                        message.appendChild(caption);
                    }
                } else {
                    message.innerHTML = this.processMessage(getMsg);
                    hljs.highlightAll();
                }
            }
        }

        chatHistory.scrollTop += 500;

        if (!this.isMobileDevice) {
            this.setTippy('msg-delete-' + chatMessagesId, 'Delete', 'top');
            this.setTippy('msg-copy-' + chatMessagesId, 'Copy', 'top');
            this.setTippy('msg-speech-' + chatMessagesId, 'Speech', 'top');
            this.setTippy('msg-react-' + chatMessagesId, 'React', 'top');
        }

        chatMessagesId++;
        // Update empty chat notice after adding a message
        updateChatEmptyNotice();
    }

    toggleReactionPicker(msgListId) {
        const id = msgListId.replace('msg-', '');
        const picker = document.getElementById('reaction-picker-' + id);
        if (!picker) return;
        const isVisible = picker.style.display !== 'none';
        document.querySelectorAll('.reaction-picker').forEach((p) => (p.style.display = 'none'));
        if (!isVisible) picker.style.display = 'flex';
    }

    sendChatReaction(msgListId, emoji) {
        const msgEl = document.getElementById(msgListId);
        if (!msgEl) return;
        const msgId = msgEl.getAttribute('data-msg-id') || '';
        // Determine action: toggle remove if already reacted, otherwise add
        const reactionsEl = msgEl.querySelector('.message-reactions');
        const existing = reactionsEl?.querySelector(`[data-emoji="${emoji}"]`);
        const peers = existing ? JSON.parse(existing.getAttribute('data-peers') || '[]') : [];
        const action = peers.includes(this.peer_name) ? 'remove' : 'add';
        this.applyReactionToElement(msgEl, emoji, this.peer_name, action);
        if (msgId) {
            this.socket.emit('chatReaction', {
                msg_id: msgId,
                emoji: emoji,
                peer_name: this.peer_name,
                peer_id: this.peer_id,
                action: action,
            });
        }
        const id = msgListId.replace('msg-', '');
        const picker = document.getElementById('reaction-picker-' + id);
        if (picker) picker.style.display = 'none';
    }

    applyReactionToElement(msgEl, emoji, peerName, action = 'add') {
        const reactionsEl = msgEl.querySelector('.message-reactions');
        if (!reactionsEl) return;
        const existing = reactionsEl.querySelector(`[data-emoji="${emoji}"]`);
        if (action === 'add') {
            if (existing) {
                let peers = JSON.parse(existing.getAttribute('data-peers') || '[]');
                if (!peers.includes(peerName)) {
                    peers.push(peerName);
                    existing.setAttribute('data-peers', JSON.stringify(peers));
                    existing.querySelector('.reaction-count').textContent = peers.length;
                    existing.setAttribute('data-tooltip', peers.join(', '));
                }
                if (peerName === this.peer_name) existing.classList.add('my-reaction');
            } else {
                const badge = document.createElement('span');
                badge.className = 'reaction-badge';
                if (peerName === this.peer_name) badge.classList.add('my-reaction');
                badge.setAttribute('data-emoji', emoji);
                badge.setAttribute('data-peers', JSON.stringify([peerName]));
                badge.setAttribute('data-tooltip', peerName);
                badge.innerHTML = renderRoomTemplate('reactionBadgeTemplate', {
                    text: {
                        emoji,
                        countValue: '1',
                    },
                });
                badge.addEventListener('click', () => this.sendChatReaction(msgEl.id, emoji));
                reactionsEl.appendChild(badge);
            }
        } else if (action === 'remove') {
            if (existing) {
                let peers = JSON.parse(existing.getAttribute('data-peers') || '[]');
                peers = peers.filter((p) => p !== peerName);
                if (peers.length === 0) {
                    existing.remove();
                } else {
                    existing.setAttribute('data-peers', JSON.stringify(peers));
                    existing.querySelector('.reaction-count').textContent = peers.length;
                    existing.setAttribute('data-tooltip', peers.join(', '));
                    if (peerName === this.peer_name) existing.classList.remove('my-reaction');
                }
            }
        }
    }

    handleChatReaction = (dataObject) => {
        const msg_id = filterXSS(dataObject.msg_id || '');
        const emoji = filterXSS(dataObject.emoji || '');
        const peer_name = filterXSS(dataObject.peer_name || '');
        const action = dataObject.action === 'remove' ? 'remove' : 'add';
        if (!msg_id || !emoji) return;
        const msgEl = document.querySelector(`li[data-msg-id="${CSS.escape(msg_id)}"]`);
        if (!msgEl) return;
        this.applyReactionToElement(msgEl, emoji, peer_name, action);
    };

    showAITypingIndicator(aiName) {
        const containerId = aiName === 'ChatGPT' ? 'chatGPTMessages' : 'deepSeekMessages';
        const container = this.getId(containerId);
        if (!container) return;
        const existing = this.getId(`ai-typing-${aiName}`);
        if (existing) return;
        const typingHTML = `
            <li id="ai-typing-${aiName}" class="clearfix">
                <div class="ai-typing-indicator">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </li>
        `;
        container.insertAdjacentHTML('beforeend', typingHTML);
        const chatHistory = this.getId('chatHistory');
        if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    hideAITypingIndicator(aiName) {
        const indicator = this.getId(`ai-typing-${aiName}`);
        if (indicator) indicator.remove();
    }

    streamMessage(element, message, speed = 100) {
        // Cancel any in-progress stream on this element
        if (element._streamInterval) {
            clearInterval(element._streamInterval);
        }

        const safeMessage = this.sanitizeHtml(String(message ?? ''));
        const words = safeMessage.split(' ').filter((w) => w.length > 0);

        let textBuffer = '';
        let wordIndex = 0;

        element._streamInterval = setInterval(() => {
            if (wordIndex < words.length) {
                textBuffer += words[wordIndex] + ' ';
                // Preserve visual line breaks while streaming plain text.
                element.innerHTML = textBuffer.replace(/\n/g, '<br/>');
                wordIndex++;
            } else {
                clearInterval(element._streamInterval);
                element._streamInterval = null;
                element.innerHTML = this.processAIMessage(message);
                this.highlightCodeBlocks(element);
            }
        }, speed);
    }

    highlightCodeBlocks(element) {
        element.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    processAIMessage(message) {
        const raw = String(message ?? '');
        if (typeof marked !== 'undefined') {
            return filterXSS(marked.parse(raw));
        }
        // Fallback if markdown parser is unavailable.
        return filterXSS(raw).replace(/\n/g, '<br/>');
    }

    processMessage(message) {
        const codeBlockRegex = /```([a-zA-Z0-9]+)?\n([\s\S]*?)```/g;
        let parts = [];
        let lastIndex = 0;

        message.replace(codeBlockRegex, (match, lang, code, offset) => {
            if (offset > lastIndex) {
                parts.push({ type: 'text', value: message.slice(lastIndex, offset) });
            }
            parts.push({ type: 'code', lang, value: code });
            lastIndex = offset + match.length;
        });

        if (lastIndex < message.length) {
            parts.push({ type: 'text', value: message.slice(lastIndex) });
        }

        return parts
            .map((part) => {
                if (part.type === 'text') {
                    return part.value;
                } else if (part.type === 'code') {
                    return `<pre><code class="language-${part.lang || ''}">${part.value}</code></pre>`;
                }
            })
            .join('');
    }

    deleteMessage(id) {
        Swal.fire({
            background: swalBackground,
            position: 'top',
            title: 'Delete this Message?',
            imageUrl: image.delete,
            showDenyButton: true,
            confirmButtonText: `Yes`,
            denyButtonText: `No`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then((result) => {
            if (result.isConfirmed) {
                this.getId(id).remove();
                this.sound('delete');
                updateChatEmptyNotice();
            }
        });
    }

    copyToClipboard(id) {
        const text = this.getId(id).innerText;
        navigator.clipboard
            .writeText(text)
            .then(() => {
                this.userLog('success', 'Message copied!', 'top-end', 1000);
            })
            .catch((err) => {
                this.userLog('error', err, 'top-end', 6000);
            });
    }

    formatMsg(msg) {
        const message = filterXSS(msg);
        if (message.trim().length == 0) return;
        if (this.isHtml(message)) return this.sanitizeHtml(message);
        if (this.isValidHttpURL(message)) {
            if (this.isImageURL(message)) return this.getImage(message);
            return this.getLink(message);
        }
        if (isChatMarkdownOn) return marked.parse(message);
        if (isChatPasteTxt && this.getLineBreaks(message) > 1) {
            isChatPasteTxt = false;
            return this.getPre(message);
        }
        if (this.getLineBreaks(message) > 1) return this.getPre(message);
        console.log('FormatMsg', message);
        return message;
    }

    sanitizeHtml(input) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '/': '&#x2F;',
            '`': '&#96;',
            '=': '&#61;',
        };
        return input.replace(/[&<>"'/`=]/g, (m) => map[m]);
    }

    isHtml(str) {
        const a = document.createElement('div');
        a.innerHTML = str;
        for (var c = a.childNodes, i = c.length; i--;) {
            if (c[i].nodeType == 1) return true;
        }
        return false;
    }

    isValidHttpURL(input) {
        try {
            new URL(input);
            return true;
        } catch (_) {
            return false;
        }
    }

    isValidAvatarURL(url) {
        if (!url || typeof url !== 'string') return false;
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    }

    isSafeRedirectURL(url) {
        if (!url || typeof url !== 'string') return false;
        try {
            const parsed = new URL(url, window.location.href);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    }

    isImageURL(input) {
        if (!input || typeof input !== 'string') return false;
        try {
            const url = new URL(input);
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'].some((ext) =>
                url.pathname.toLowerCase().endsWith(ext)
            );
        } catch (e) {
            return false;
        }
    }

    getImage(input) {
        const url = filterXSS(input);
        const div = document.createElement('div');
        const img = document.createElement('img');
        img.setAttribute('src', url);
        img.setAttribute('width', '200px');
        img.setAttribute('height', 'auto');
        div.appendChild(img);
        console.log('GetImg', div.firstChild.outerHTML);
        return div.firstChild.outerHTML;
    }

    getLink(input) {
        const url = filterXSS(input);
        const a = document.createElement('a');
        const div = document.createElement('div');
        const linkText = document.createTextNode(url);
        a.setAttribute('href', url);
        a.setAttribute('target', '_blank');
        a.appendChild(linkText);
        div.appendChild(a);
        console.log('GetLink', div.firstChild.outerHTML);
        return div.firstChild.outerHTML;
    }

    getPre(input) {
        const text = filterXSS(input);
        const pre = document.createElement('pre');
        const div = document.createElement('div');
        pre.textContent = text;
        div.appendChild(pre);
        console.log('GetPre', div.firstChild.outerHTML);
        return div.firstChild.outerHTML;
    }

    getIframe(input) {
        const url = filterXSS(input);
        const iframe = document.createElement('iframe');
        const div = document.createElement('div');
        const is_youtube = this.getVideoType(url) == 'na' ? true : false;
        const video_audio_url = is_youtube ? this.getYoutubeEmbed(url) : url;
        iframe.setAttribute('title', 'Chat-IFrame');
        iframe.setAttribute('src', video_audio_url);
        iframe.setAttribute('width', 'auto');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute(
            'allow',
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        );
        iframe.setAttribute('allowfullscreen', 'allowfullscreen');
        div.appendChild(iframe);
        console.log('GetIFrame', div.firstChild.outerHTML);
        return div.firstChild.outerHTML;
    }

    getLineBreaks(message) {
        return (message.match(/\n/g) || []).length;
    }

    checkLineBreaks() {
        chatMessage.style.height = '';
        if (this.getLineBreaks(chatMessage.value) > 0 || chatMessage.value.length > 50) {
            chatMessage.setAttribute('rows', '2');
        }
    }

    collectMessages(time, from, msg, toId = 'all', toName = 'all') {
        this.chatMessages.push({
            time: time,
            from: from,
            msg: msg,
            toId: toId,
            toName: toName,
        });
    }

    speechMessage(newMsg = true, from, msg) {
        const speech = new SpeechSynthesisUtterance();
        speech.text = (newMsg ? 'New' : '') + ' message from:' + from + '. The message is:' + msg;
        speech.rate = 0.9;
        window.speechSynthesis.speak(speech);
    }

    speechElementText(elemId) {
        const element = this.getId(elemId);
        this.speechText(element.innerText);
    }

    speechText(msg) {
        {
            const speech = new SpeechSynthesisUtterance();
            speech.text = msg;
            speech.rate = 0.9;
            window.speechSynthesis.speak(speech);
        }
    }

    chatToggleBg() {
        this.isChatBgTransparent = !this.isChatBgTransparent;
        const chatContainer = document.querySelector('.chat-container');
        if (this.isChatBgTransparent) {
            document.documentElement.style.setProperty('--msger-bg', 'rgba(0, 0, 0, 0.200)');
            if (chatContainer) {
                chatContainer.style.backdropFilter = 'blur(12px)';
                chatContainer.style.webkitBackdropFilter = 'blur(12px)';
            }
        } else {
            setTheme();
            if (chatContainer) {
                chatContainer.style.backdropFilter = 'none';
                chatContainer.style.webkitBackdropFilter = 'none';
            }
        }
    }

    chatClean() {
        if (this.chatMessages.length === 0) {
            return userLog('info', 'No chat messages to clean', 'top-end');
        }
        Swal.fire({
            background: swalBackground,
            position: 'top',
            title: 'Clean up all chat Messages?',
            imageUrl: image.delete,
            showDenyButton: true,
            confirmButtonText: `Yes`,
            denyButtonText: `No`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then((result) => {
            if (result.isConfirmed) {
                function removeAllChildNodes(parentNode) {
                    while (parentNode.firstChild) {
                        parentNode.removeChild(parentNode.firstChild);
                    }
                }
                // Remove child nodes from different message containers
                removeAllChildNodes(chatGPTMessages);
                removeAllChildNodes(deepSeekMessages);
                removeAllChildNodes(chatPublicMessages);
                removeAllChildNodes(chatPrivateMessages);
                this.chatMessages = [];
                this.chatGPTContext = [];
                this.deepSeekContext = [];
                updateChatEmptyNotice();
                this.sound('delete');
            }
        });
    }

    chatSave() {
        if (this.chatMessages.length === 0) {
            return userLog('info', 'No chat messages to save', 'top-end');
        }
        const grouped = {
            room: this.room_id,
            public: [],
            chatGPT: [],
            deepSeek: [],
            private: {},
        };
        for (const msg of this.chatMessages) {
            const entry = { time: msg.time, from: msg.from, msg: msg.msg };
            switch (msg.toId) {
                case 'all':
                    grouped.public.push(entry);
                    break;
                case 'ChatGPT':
                    grouped.chatGPT.push(entry);
                    break;
                case 'DeepSeek':
                    grouped.deepSeek.push(entry);
                    break;
                default:
                    const name = msg.toName || msg.toId;
                    if (!grouped.private[name]) grouped.private[name] = [];
                    grouped.private[name].push(entry);
                    break;
            }
        }
        // Remove empty sections
        if (grouped.public.length === 0) delete grouped.public;
        if (grouped.chatGPT.length === 0) delete grouped.chatGPT;
        if (grouped.deepSeek.length === 0) delete grouped.deepSeek;
        if (Object.keys(grouped.private).length === 0) delete grouped.private;
        saveObjToJsonFile(grouped, 'CHAT');
    }

    // ##############################################
    // POOLS
    // ##############################################

    // ####################################################

    // ####################################################

    // ####################################################
    // RECORDING
    // ####################################################

    popupRecordingOnLeaveRoom() {
        Swal.fire({
            background: swalBackground,
            position: 'center',
            imageUrl: image.recording,
            title: 'Recording is ON',
            html: renderRoomTemplate('popupRecordingOnLeaveRoomTemplate'),
            confirmButtonText: 'OK',
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then((result) => {
            if (result.isConfirmed) {
                survey && survey.enabled ? leaveFeedback(true) : redirectOnLeave();
            }
        });
    }

    showRecServerSideAdvice() {
        Swal.fire({
            background: swalBackground,
            position: 'center',
            imageUrl: image.recording,
            title: 'Server Sync Recording Enabled',
            html: renderRoomTemplate('popupRecordingServerAdviceTemplate'),
            showDenyButton: true,
            confirmButtonText: 'OK',
            denyButtonText: 'Switch Off',
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then((result) => {
            if (result.isDenied) {
                switchServerRecording.checked = false;
            }
        });
    }

    toggleVideoAudioTabs(disabled = false) {
        tabAudioDevicesBtn.disabled = disabled;
        tabVideoDevicesBtn.disabled = disabled;
    }

    /** Report recording failures and dispose capture that never reached encoder startup. */
    handleRecordingError(error, popupLog = true) {
        if (!this._recordingStarted) {
            releaseRecordingCapture(this);
            this.mediaRecorder = null;
            this._isRecording = false;
            this._recordingStopping = false;
            this.disableRecordingOptions(false);
        }
        this.toggleVideoAudioTabs(false);
        console.error('Recording error', error);
        if (popupLog) this.userLog('error', error, 'top-end', 6000);
    }

    getSupportedMimeTypes() {
        const possibleTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/mp4'];
        console.log('POSSIBLE CODECS', possibleTypes);
        return possibleTypes.filter((mimeType) => {
            return MediaRecorder.isTypeSupported(mimeType);
        });
    }

    startRecording() {
        if (this.mediaRecorder) return;
        this._recordingStarted = false;
        this._recordingStopping = false;
        recordedBlobs = [];

        // Toggle Video/Audio tabs
        this.toggleVideoAudioTabs(true);

        // Get supported MIME types and set options
        const supportedMimeTypes = this.getSupportedMimeTypes();
        console.log('MediaRecorder supported options', supportedMimeTypes);
        const options = { mimeType: supportedMimeTypes[0] };

        recCodecs = supportedMimeTypes[0];

        try {
            this.audioRecorder = new BodrikRecordingAudio(this);
            const audioStreams = this.getAudioStreamFromAudioElements();
            console.log('Audio streams tracks --->', audioStreams.getTracks());

            const audioMixerStreams = this.audioRecorder.getMixedAudioStream(
                audioStreams
                    .getTracks()
                    .filter((track) => track.kind === 'audio')
                    .map((track) => new MediaStream([track]))
            );

            const audioMixerTracks = audioMixerStreams.getTracks();
            console.log('Audio mixer tracks --->', audioMixerTracks);

            const recordingType = this.isMobileDevice ? 'camera' : document.getElementById('recordingTypeSelect').value;
            recordingType === 'screen'
                ? this.startDesktopRecording(options, audioMixerTracks)
                : this.startMobileRecording(options, audioMixerTracks);
        } catch (err) {
            this.handleRecordingError('Exception while creating MediaRecorder: ' + err);
        }
    }

    startMobileRecording(options, audioMixerTracks) {
        try {
            // Combine audioMixerTracks and videoTracks into a single array
            const combinedTracks = [];

            if (Array.isArray(audioMixerTracks)) {
                combinedTracks.push(...audioMixerTracks);
            }

            if (this.localVideoStream !== null) {
                const videoTracks = this.localVideoStream.getVideoTracks();
                console.log('Cam video tracks --->', videoTracks);

                if (Array.isArray(videoTracks)) {
                    combinedTracks.push(...videoTracks);
                }
            }

            const recCamStream = new MediaStream(combinedTracks);
            console.log('New Cam Media Stream tracks  --->', recCamStream.getTracks());

            options = getRecordingOptions(recCamStream, options);
            recCodecs = options.mimeType;
            this.mediaRecorder = new MediaRecorder(recCamStream, options);
            console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options);

            this.getId('swapCameraButton').className = 'hidden';

            this.initRecording();
        } catch (err) {
            this.handleRecordingError('Unable to record the camera + audio: ' + err, false);
        }
    }

    startDesktopRecording(options, audioMixerTracks) {
        // On desktop devices, record camera or screen/window... + all audio tracks
        const constraints = { video: true, audio: true }; // audio: allow capturing system/tab audio when the user shares it
        navigator.mediaDevices
            .getDisplayMedia(constraints)
            .then((screenStream) => {
                const screenTracks = screenStream.getVideoTracks();
                console.log('Screen video tracks --->', screenTracks);

                // Get system/tab audio tracks the user chose to share (if any)
                const screenAudioTracks = screenStream.getAudioTracks();
                console.log('Screen audio tracks --->', screenAudioTracks);

                const combinedTracks = [];

                if (Array.isArray(screenTracks)) {
                    combinedTracks.push(...screenTracks);
                }

                // Determine the audio to record: participant mix, plus system/tab audio if shared
                let recordAudioTracks = [];
                if (Array.isArray(audioMixerTracks)) {
                    recordAudioTracks = [...audioMixerTracks];
                }
                if (screenAudioTracks.length > 0) {
                    // MediaRecorder encodes only one audio track, so mix participant + system/tab audio into one
                    this.screenAudioRecorder = new MixedAudioRecorder();
                    const streamsToMix = [
                        ...recordAudioTracks.map((track) => new MediaStream([track])),
                        ...screenAudioTracks.map((track) => new MediaStream([track])),
                    ];
                    recordAudioTracks = this.screenAudioRecorder.getMixedAudioStream(streamsToMix).getTracks();
                    this.recScreenAudioTracks = screenAudioTracks; // keep raw tracks to stop them on recording end
                }
                combinedTracks.push(...recordAudioTracks);

                const recScreenStream = new MediaStream(combinedTracks);
                console.log('New Screen/Window Media Stream tracks  --->', recScreenStream.getTracks());

                this.recScreenStream = recScreenStream;
                this.mediaRecorder = new MediaRecorder(recScreenStream, options);
                console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options);

                this.initRecording();
            })
            .catch((err) => {
                this.handleRecordingError('Unable to record the screen + audio: ' + err, false);
            });
    }

    /** Wait for a running recording graph before starting the encoder and exposing recording controls. */
    async initRecording() {
        const recorder = this.mediaRecorder;
        try {
            await this.audioRecorder.resume();
            if (this.mediaRecorder !== recorder) return;
            if (this.screenAudioRecorder?.audioContext?.state === 'suspended') {
                await this.screenAudioRecorder.audioContext.resume();
            }
            if (this.mediaRecorder !== recorder) return;
            this._isRecording = true;
            this.handleMediaRecorder();
            this._recordingStarted = true;
            this.event(_EVENTS.startRec);
            this.recordingAction(enums.recording.start);
            this.sound('recStart');
        } catch (error) {
            if (this.mediaRecorder !== recorder) return;
            releaseRecordingCapture(this);
            this.mediaRecorder = null;
            this.handleRecordingError('Unable to start recording: ' + error.message);
        }
    }

    hasAudioTrack(mediaStream) {
        if (!mediaStream) return false;
        const audioTracks = mediaStream.getAudioTracks();
        return audioTracks.length > 0;
    }

    hasVideoTrack(mediaStream) {
        if (!mediaStream) return false;
        const videoTracks = mediaStream.getVideoTracks();
        return videoTracks.length > 0;
    }

    getAudioTracksFromAudioElements() {
        const audioElements = document.querySelectorAll('audio');
        const audioTracks = [];
        audioElements.forEach((audio) => {
            // Exclude avatar Preview Audio and local producer audio (already captured via mic)
            if (audio.id !== 'avatarPreviewAudio' && audio.getAttribute('name') !== 'LOCAL-AUDIO') {
                const audioTrack = audio.srcObject?.getAudioTracks()[0];
                if (audioTrack) {
                    audioTracks.push(audioTrack);
                }
            }
        });
        return audioTracks;
    }

    getAudioStreamFromAudioElements() {
        const audioElements = document.querySelectorAll('audio');
        const audioStream = new MediaStream();
        audioElements.forEach((audio) => {
            // Exclude avatar Preview Audio
            if (audio.id === 'avatarPreviewAudio') return;
            const audioTrack = audio.srcObject?.getAudioTracks()[0];
            if (audioTrack) {
                audioStream.addTrack(audioTrack);
            }
        });
        // Also include the local microphone track so solo recordings have audio
        if (this.localAudioStream) {
            const micTrack = this.localAudioStream.getAudioTracks()[0];
            if (micTrack) {
                audioStream.addTrack(micTrack);
            }
        }
        return audioStream;
    }

    handleMediaRecorder() {
        if (this.mediaRecorder) {
            this.recServerFileName = this.getServerRecFileName();
            this.mediaRecorder.addEventListener('start', this.handleMediaRecorderStart);
            this.mediaRecorder.addEventListener('dataavailable', this.handleMediaRecorderData);
            this.mediaRecorder.addEventListener('stop', this.handleMediaRecorderStop);
            // Always pass a timeslice so the browser flushes encoded chunks periodically
            // instead of buffering the entire recording in renderer memory.
            // - Server sync: 4 s chunks → fewer HTTP POSTs to /recSync.
            // - Local blob: 1 s chunks → faster internal flush, lighter recorder buffer.
            rc.recording.recSyncServerRecording
                ? this.mediaRecorder.start(this.recSyncTime)
                : this.mediaRecorder.start(1000);
        }
    }

    generateUUIDv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
            (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
        );
    }

    getServerRecFileName() {
        const roomName = this.room_id.trim();
        const dateTime = getDataTimeStringFormat();
        // Prefer the server-side session ID so recordings correlate with join/exit webhook
        // events for the same conference instance; fall back to a client UUID if unavailable.
        const uuid = this.sessionId || this.generateUUIDv4();
        return `Rec_${roomName}_${dateTime}_${uuid}.webm`;
    }

    handleMediaRecorderStart(evt) {
        console.log('MediaRecorder started: ', evt);
        rc.cleanLastRecordingInfo();
        rc.disableRecordingOptions();
        rc._recStartTs = performance.now();
    }

    handleMediaRecorderData(evt) {
        // console.log('MediaRecorder data: ', evt);
        if (evt.data && evt.data.size > 0) {
            rc.recording.recSyncServerRecording ? rc.syncRecordingInCloud(evt.data) : recordedBlobs.push(evt.data);
        }
    }

    async syncRecordingInCloud(data) {
        const arrayBuffer = await data.arrayBuffer();
        const chunkSize = rc.recSyncChunkSize;
        const totalChunks = Math.ceil(arrayBuffer.byteLength / chunkSize);
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const chunk = arrayBuffer.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize);
            try {
                const response = await axios.post(
                    `${this.recording.recSyncServerEndpoint}/recSync?fileName=` + rc.recServerFileName,
                    chunk,
                    {
                        headers: {
                            'Content-Type': 'application/octet-stream',
                            Authorization: `Bearer ${rc.recUploadToken}`,
                        },
                    }
                );
                console.log('Chunk synced successfully:', response.data);
            } catch (error) {
                let errorMessage = 'Recording stopped! ';
                if (error.response) {
                    errorMessage += error.response.data.message;
                    console.error('Error syncing chunk', {
                        status_code: error.response.status,
                        response_data: error.response.data,
                        response_headers: error.response.headers,
                    });
                } else if (error.request) {
                    console.error('Error syncing chunk: No response received', { request_details: error.request });
                } else {
                    errorMessage += error.message;
                    console.error('Error syncing chunk:', error.message);
                }
                userLog('warning', errorMessage, 'top-end', 3000);
                rc.stopRecording();
                rc.saveLastRecordingInfo('<br/><span class="red">' + errorMessage + '.</span>');
            }
        }
    }

    /** Save final encoder output before releasing recording-only tracks and restoring controls. */
    async handleMediaRecorderStop(evt) {
        try {
            console.log('MediaRecorder stopped: ', evt);
            rc.recording.recSyncServerRecording ? rc.handleServerRecordingStop() : rc.handleLocalRecordingStop();
            rc.disableRecordingOptions(false);

            // If cloud sync is enabled, patch duration on the server
            if (rc.recording.recSyncServerRecording) {
                const durationMs = rc._recStartTs ? Math.round(performance.now() - rc._recStartTs) : undefined;

                // Option S3: pass duration to your existing finalize endpoint (preferred if it uploads to S3)
                if (rc.recording.recSyncServerToS3) {
                    try {
                        await axios.post(`${rc.recording.recSyncServerEndpoint}/recSyncFinalize`, null, {
                            params: { fileName: rc.recServerFileName, durationMs },
                            headers: { Authorization: `Bearer ${rc.recUploadToken}` },
                        });
                        console.log('Finalized (with duration fix) and uploaded to S3');
                        if (recShowInfo) userLog('success', 'Recording successfully uploaded to S3.', 'top-end', 3000);
                    } catch (error) {
                        let errorMessage = 'Finalization failed! ';
                        if (error.response) errorMessage += error.response.data?.message || 'Server error';
                        else if (error.request) errorMessage += 'No response from server';
                        else errorMessage += error.message;
                        if (recShowInfo) userLog('warning', errorMessage, 'top-end', 3000);
                    }
                } else {
                    // Option Disk: if you don’t use S3 finalize, call a dedicated “fix” endpoint
                    try {
                        await axios.post(`${rc.recording.recSyncServerEndpoint}/recSyncFixWebm`, null, {
                            params: { fileName: rc.recServerFileName, durationMs },
                            headers: { Authorization: `Bearer ${rc.recUploadToken}` },
                        });
                        console.log('Server-side WEBM duration fixed for', rc.recServerFileName);
                    } catch (error) {
                        console.warn('WEBM duration server-side fix failed:', error?.message || error);
                    }
                }

                rc._recStartTs = null;
            }
        } catch (err) {
            console.error('Recording save failed', err);
            rc.handleRecordingError('Recording save failed: ' + err.message);
        } finally {
            if (rc.mediaRecorder === evt.target) {
                releaseRecordingCapture(rc);
                rc.mediaRecorder = null;
                rc._isRecording = false;
                rc._recordingStarted = false;
                rc._recordingStopping = false;
                rc.disableRecordingOptions(false);
                rc.event(_EVENTS.stopRec);
                rc.recordingAction(enums.recording.stop);
                rc.sound('recStop');
            }
        }
    }

    async handleMediaRecorderStopOLD(evt) {
        try {
            console.log('MediaRecorder stopped: ', evt);
            rc.recording.recSyncServerRecording ? rc.handleServerRecordingStop() : rc.handleLocalRecordingStop();
            rc.disableRecordingOptions(false);

            // Only do this if cloud sync was enabled and upload to s3
            if (rc.recording.recSyncServerRecording && rc.recording.recSyncServerToS3) {
                try {
                    const response = await axios.post(
                        `${rc.recording.recSyncServerEndpoint}/recSyncFinalize?fileName=` + rc.recServerFileName
                    );
                    console.log('Finalized and uploaded to S3:', response.data);
                    userLog('success', 'Recording successfully uploaded to S3.', 'top-end', 3000);
                } catch (error) {
                    let errorMessage = 'Finalization failed! ';
                    if (error.response) {
                        errorMessage += error.response.data?.message || 'Server error';
                        console.error('Finalization error response:', error.response);
                    } else if (error.request) {
                        errorMessage += 'No response from server';
                        console.error('Finalization error: No response', error.request);
                    } else {
                        errorMessage += error.message;
                        console.error('Finalization error:', error.message);
                    }
                    userLog('warning', errorMessage, 'top-end', 3000);
                }
            }
        } catch (err) {
            console.error('Recording save failed', err);
        }
    }

    disableRecordingOptions(disabled = true) {
        recordingTypeSelect.disabled = disabled;
        switchServerRecording.disabled = disabled;
        switchHostOnlyRecording.disabled = disabled;
    }

    getWebmFixerFn() {
        const fn = window.FixWebmDuration;
        return typeof fn === 'function' ? fn : null;
    }

    /** Package completed local recording data with its actual MIME type and start the download. */
    handleLocalRecordingStop() {
        console.log('MediaRecorder Blobs: ', recordedBlobs);
        if (!recordedBlobs.length) {
            this.handleRecordingError('No recording data was produced. Please try recording again.');
            return;
        }

        const dateTime = getDataTimeString();
        const type = recordedBlobs[0].type.includes('mp4') ? 'mp4' : 'webm';
        const rawBlob = new Blob(recordedBlobs, { type: recordedBlobs[0].type.split(';')[0] });
        const recFileName = `Rec_${dateTime}.${type}`;
        const recordingStartedAt = this._recStartTs;
        const durationMs = recordingStartedAt ? performance.now() - recordingStartedAt : undefined;
        const blobFileSize = bytesToSize(rawBlob.size);
        const recTimeText = this._lastRecTimeText || '0s';
        const recType = 'Locally';
        const recordingInfo = `
        <br/><br/>
        <ul>
            <li><span>Stored:</span> <span>${recType}</span></li>
            <li><span>Time:</span> <span>${recTimeText}</span></li>
            <li><span>File:</span> <span class="notranslate">${recFileName}</span></li>
            <li><span>Codecs:</span> <span class="notranslate">${recCodecs}</span></li>
            <li><span>Size:</span> <span>${blobFileSize}</span></li>
        </ul>
        <br/>
        `;
        const recordingMsg = 'Processing the recording. It will download to your device when ready.';

        this.saveLastRecordingInfo(recordingInfo);
        this.showRecordingInfo(recType, recordingInfo, recordingMsg);

        // Fix WebM duration to make it seekable
        const fixWebmDuration = async (blob) => {
            if (type !== 'webm') return blob;
            try {
                const fix = this.getWebmFixerFn();
                const fixed = await fix(blob, durationMs);
                return fixed || blob;
            } catch (e) {
                console.warn('WEBM duration fix failed, saving original blob:', e);
                return blob;
            } finally {
                if (this._recStartTs === recordingStartedAt) this._recStartTs = null;
            }
        };

        (async () => {
            const finalBlob = await fixWebmDuration(rawBlob);
            this.saveRecordingInLocalDevice(finalBlob, recFileName);
        })();
    }

    handleServerRecordingStop() {
        console.log('MediaRecorder Stop');
        const recTimeText = this._lastRecTimeText || '0s';
        const recType = 'Server';
        const recordingInfo = `
        <br/><br/>
        <ul>
            <li><span>Stored:</span> <span>${recType}</span></li>
            <li><span>Time:</span> <span>${recTimeText}</span></li>
            <li><span>File:</span> <span class="notranslate">${this.recServerFileName}</span></li>
            <li><span>Codecs:</span> <span class="notranslate">${recCodecs}</span></li>
        </ul>
        <br/>
        `;
        this.saveLastRecordingInfo(recordingInfo);
        this.showRecordingInfo(recType, recordingInfo);
    }

    saveLastRecordingInfo(recordingInfo) {
        const lastRecordingInfo = document.getElementById('lastRecordingInfo');
        lastRecordingInfo.style.color = '#FFFFFF';
        lastRecordingInfo.innerHTML = renderRoomTemplate('lastRecordingInfoTemplate', {
            html: {
                recordingInfo,
            },
        });
        show(lastRecordingInfo);
    }

    cleanLastRecordingInfo() {
        const lastRecordingInfo = document.getElementById('lastRecordingInfo');
        lastRecordingInfo.innerHTML = '';
        hide(lastRecordingInfo);
    }

    showRecordingInfo(recType, recordingInfo, recordingMsg = '') {
        if (!recShowInfo) return;
        if (window.localStorage.isReconnected === 'false') {
            Swal.fire({
                background: swalBackground,
                position: 'top',
                title: 'Recording',
                html: renderRoomTemplate('popupRecordingInfoTemplate', {
                    text: {
                        indicator: '🔴',
                        recordingLocation: recType === 'Locally' ? 'Local recording' : 'Server recording',
                        recordingMsg: recordingMsg,
                    },
                    html: {
                        recordingInfo: recordingInfo,
                    },
                }),
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' },
            });
        }
    }

    saveRecordingInLocalDevice(blob, recFileName) {
        console.log('MediaRecorder Download Blobs');
        const url = window.URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.style.display = 'none';
        downloadLink.href = url;
        downloadLink.download = recFileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();

        setTimeout(() => {
            document.body.removeChild(downloadLink);
            window.URL.revokeObjectURL(url);
            console.log(`🔴 Recording FILE: ${recFileName} done 👍`);
            recordedBlobs = [];
        }, 100);
    }

    pauseRecording() {
        if (this.mediaRecorder) {
            this._isRecording = false;
            this.mediaRecorder.pause();
            this.event(_EVENTS.pauseRec);
            this.recordingAction('Pause recording');
        }
    }

    resumeRecording() {
        if (this.mediaRecorder) {
            this._isRecording = true;
            this.mediaRecorder.resume();
            this.event(_EVENTS.resumeRec);
            this.recordingAction('Resume recording');
        }
    }

    /** Request encoder shutdown without disposing its audio inputs before final data and stop callbacks. */
    stopRecording() {
        const recorder = this.mediaRecorder;
        if (!recorder || this._recordingStopping) return;
        this._recordingStopping = true;
        this.toggleVideoAudioTabs(false);
        const recTimeEl = document.getElementById('recordingStatus');
        this._lastRecTimeText = recTimeEl ? recTimeEl.innerText : '0s';
        this._isRecording = false;
        if (!this._recordingStarted && recorder.state === 'inactive') {
            releaseRecordingCapture(this);
            this.mediaRecorder = null;
            this._recordingStopping = false;
            this.disableRecordingOptions(false);
            return;
        }
        if (recorder.state !== 'inactive') recorder.stop();
        // The stop handler owns cleanup after the browser flushes the encoder.
    }

    recordingAction(action) {
        if (!this.thereAreParticipants()) return;
        this.socket.emit('recordingAction', {
            peer_name: this.peer_name,
            peer_id: this.peer_id,
            action: action,
        });
    }

    handleRecordingAction(data) {
        console.log('Handle recording action', data);

        const { peer_name, peer_avatar, peer_id, action } = data;

        const recAction = {
            side: 'left',
            img: this.leftMsgAvatar,
            peer_name: peer_name,
            peer_avatar: peer_avatar,
            peer_id: peer_id,
            peer_msg: `🔴 ${action}`,
            to_peer_id: 'all',
            to_peer_name: 'all',
        };
        this.showMessage(recAction, false);

        const recData = {
            type: 'recording',
            action: action,
            peer_name: peer_name,
        };

        this.msgHTML(
            recData,
            null,
            image.recording,
            null,
            `${icons.user} ${peer_name}
            <br /><br />
            <span>🔴 ${action}</span>
            <br />`
        );
    }

    saveRecording(reason) {
        if (this._isRecording || this.hasActiveRecorder()) {
            console.log(`Save recording: ${reason}`);
            this.stopRecording();
        }
    }

    // ####################################################
    // ACTIVE ROOMS
    // ####################################################

    showActiveRooms() {
        openURL('/activeRooms', true);
    }

    // ####################################################
    // FILE SHARING
    // ####################################################

    handleSF(uid, peer_name, peer_id) {
        let btnSf = this.getId(uid);
        if (btnSf) {
            btnSf.addEventListener('click', () => {
                this.selectFileToShare(peer_id, false, peer_name);
            });
        }
    }

    handleDD(uid, peer_id, itsMe = false) {
        let videoPlayer = this.getId(uid);
        if (videoPlayer) {
            videoPlayer.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.stopPropagation();
                e.target.parentElement.style.outline = `2px dashed var(--dd-color)`;
            });

            videoPlayer.addEventListener('dragleave', function (e) {
                e.preventDefault();
                e.stopPropagation();
                e.target.parentElement.style.outline = 'none';
            });

            videoPlayer.addEventListener('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
                e.target.parentElement.style.outline = 'none';
                if (itsMe) {
                    return userLog('warning', 'You cannot send files to yourself.', 'top-end');
                }
                if (this.sendInProgress) {
                    return userLog('warning', 'Please wait for the previous file to be sent.', 'top-end');
                }
                if (e.dataTransfer.items && e.dataTransfer.items.length > 1) {
                    return userLog('warning', 'Please drag and drop a single file.', 'top-end');
                }
                if (e.dataTransfer.items) {
                    let item = e.dataTransfer.items[0].webkitGetAsEntry();
                    console.log('Drag and drop', item);
                    if (item.isDirectory) {
                        return userLog('warning', 'Please drag and drop a single file not a folder.', 'top-end');
                    }
                    var file = e.dataTransfer.items[0].getAsFile();
                    const peerNameEl = rc.getId(peer_id + '__name');
                    const peerName = peerNameEl ? peerNameEl.innerText : 'all';
                    rc.sendFileInformations(file, peer_id, false, peerName);
                } else {
                    const peerNameEl = rc.getId(peer_id + '__name');
                    const peerName = peerNameEl ? peerNameEl.innerText : 'all';
                    rc.sendFileInformations(e.dataTransfer.files[0], peer_id, false, peerName);
                }
            });
        }
    }

    formatAcceptedFileTypes(accept = '*') {
        // Native (human) translation for dynamically-built strings; falls back to English when inactive.
        const t = (s) => (window.i18n && typeof window.i18n.t === 'function' ? window.i18n.t(s) : s);

        if (!accept || accept === '*') {
            return t('any file type');
        }

        return accept
            .split(',')
            .map((type) => type.trim())
            .filter(Boolean)
            .map((type) => {
                if (type === '*') return t('any file');
                if (type.endsWith('/*')) return `${type.slice(0, -2).toUpperCase()} ${t('files')}`;
                if (type.startsWith('.')) return `${type.slice(1).toUpperCase()} ${t('files')}`;
                if (type.includes('/')) return type.split('/')[1].toUpperCase();
                return type.toUpperCase();
            })
            .join(', ');
    }

    async openFilePickerModal({ title = 'Share file', accept = '*', confirmButtonText = 'Send', imageUrl } = {}) {
        // Native (human) translation for dynamically-set strings; falls back to English when inactive.
        const t = (s) => (window.i18n && typeof window.i18n.t === 'function' ? window.i18n.t(s) : s);

        const acceptedFileTypes = this.formatAcceptedFileTypes(accept);
        const helperText = `${t('Accepted:')} ${acceptedFileTypes}`;
        const emptyStateTitle = t('Drag and drop a file');
        const emptyStateSubtitle = t('or click to browse from your device');
        let selectedFile = null;

        const result = await Swal.fire({
            allowOutsideClick: false,
            background: swalBackground,
            position: 'center',
            title,
            input: 'file',
            html: renderRoomTemplate('popupMirotalkFilePickerTemplate', {
                text: {
                    emptyStateTitle,
                    emptyStateSubtitle,
                    helperText,
                },
            }),
            inputAttributes: {
                accept,
                'aria-label': title,
            },
            customClass: {
                htmlContainer: 'mirotalk-file-picker-html',
            },
            didOpen: () => {
                const input = Swal.getInput();
                const confirmButton = Swal.getConfirmButton();
                const dropzone = document.getElementById('mirotalkFileDropzone');
                const dropzoneTitle = document.getElementById('mirotalkFileDropzoneTitle');
                const dropzoneSubtitle = document.getElementById('mirotalkFileDropzoneSubtitle');
                const browseBtn = document.getElementById('mirotalkFileBrowseBtn');
                const preview = document.getElementById('mirotalkFilePreview');
                const fileName = document.getElementById('mirotalkFileName');
                const fileDetails = document.getElementById('mirotalkFileDetails');
                const removeBtn = document.getElementById('mirotalkFileRemoveBtn');

                if (!input || !dropzone || !confirmButton) return;

                input.classList.add('mirotalk-hidden-file-input');
                confirmButton.disabled = true;

                const resetSelection = () => {
                    selectedFile = null;
                    input.value = '';
                    preview.hidden = true;
                    dropzone.classList.remove('has-file', 'is-dragover');
                    dropzoneTitle.textContent = emptyStateTitle;
                    dropzoneSubtitle.textContent = emptyStateSubtitle;
                    browseBtn.textContent = t('Browse files');
                    fileName.textContent = t('No file selected');
                    fileDetails.textContent = '';
                    confirmButton.disabled = true;
                    Swal.resetValidationMessage();
                };

                const applySelection = (file) => {
                    if (!file) {
                        resetSelection();
                        return;
                    }

                    if (file.size <= 0) {
                        resetSelection();
                        return Swal.showValidationMessage(t('The selected file is empty.'));
                    }

                    selectedFile = file;
                    fileName.textContent = file.name;
                    fileDetails.textContent = `${this.bytesToSize(file.size)}${file.type ? ` • ${file.type}` : ''}`;
                    preview.hidden = false;
                    dropzone.classList.add('has-file');
                    dropzone.classList.remove('is-dragover');
                    dropzoneTitle.textContent = t('File ready');
                    dropzoneSubtitle.textContent = t('Drop another file here or browse to replace it');
                    browseBtn.textContent = t('Browse another file');
                    Swal.resetValidationMessage();
                    confirmButton.disabled = false;
                };

                const openSystemPicker = (event) => {
                    if (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    input.click();
                };

                const handleDragState = (event, isDragOver) => {
                    event.preventDefault();
                    event.stopPropagation();
                    dropzone.classList.toggle('is-dragover', isDragOver);
                    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
                };

                browseBtn.addEventListener('click', openSystemPicker);
                dropzone.addEventListener('click', openSystemPicker);
                removeBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    resetSelection();
                });

                input.addEventListener('change', () => {
                    applySelection(input.files && input.files.length ? input.files[0] : null);
                });

                dropzone.addEventListener('dragenter', (event) => handleDragState(event, true));
                dropzone.addEventListener('dragover', (event) => handleDragState(event, true));
                dropzone.addEventListener('dragleave', (event) => {
                    if (event.target === dropzone) {
                        handleDragState(event, false);
                    }
                });
                dropzone.addEventListener('drop', (event) => {
                    handleDragState(event, false);

                    const transfer = event.dataTransfer;
                    if (!transfer) return;

                    if (transfer.items && transfer.items.length > 1) {
                        resetSelection();
                        return Swal.showValidationMessage(t('Please choose a single file.'));
                    }

                    const item = transfer.items && transfer.items.length ? transfer.items[0] : null;
                    const entry = item && typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null;

                    if (entry && entry.isDirectory) {
                        resetSelection();
                        return Swal.showValidationMessage(t('Folders are not supported.'));
                    }

                    if (item && item.kind && item.kind !== 'file') {
                        resetSelection();
                        return Swal.showValidationMessage(t('Only files can be uploaded here.'));
                    }

                    const file = item && typeof item.getAsFile === 'function' ? item.getAsFile() : transfer.files[0];

                    if (!file) {
                        resetSelection();
                        return Swal.showValidationMessage(t('Could not read the selected file.'));
                    }

                    applySelection(file);
                });
            },
            showDenyButton: true,
            confirmButtonText,
            denyButtonText: 'Cancel',
            preConfirm: () => {
                if (!selectedFile) {
                    Swal.showValidationMessage(t('Choose a file before continuing.'));
                    return false;
                }
                return selectedFile;
            },
            ...(imageUrl
                ? {
                      imageAlt: 'mirotalksfu-file-sharing',
                      imageUrl,
                  }
                : {}),
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        });

        return result.isConfirmed ? result.value : null;
    }

    async selectFileToShare(peer_id, broadcast = false, peer_name = 'all') {
        this.sound('open');

        const file = await this.openFilePickerModal({
            title: 'Share file',
            accept: this.fileSharingInput,
            confirmButtonText: 'Send',
        });

        if (file) {
            this.sendFileInformations(file, peer_id, broadcast, peer_name);
        }
    }

    sendFileInformations(file, peer_id, broadcast = false, peer_name = 'all') {
        if (this.isFileReaderRunning()) {
            return this.userLog('warning', 'File transfer in progress. Please wait until it completes', 'top-end');
        }
        this.fileToSend = file;
        //
        if (this.fileToSend && this.fileToSend.size > 0) {
            if (!this.thereAreParticipants()) {
                return userLog('info', 'No participants detected', 'top-end');
            }
            // prevent XSS injection
            if (this.isHtml(this.fileToSend.name) || !this.isValidFileName(this.fileToSend.name))
                return userLog('warning', 'Invalid file name!', 'top-end', 5000);

            const isPrivate = !broadcast && peer_id !== 'all' && peer_id !== this.peer_id;
            const toId = isPrivate ? peer_id : 'all';
            const toName = isPrivate ? peer_name : 'all';

            const fileInfo = {
                peer_id: peer_id,
                sender_id: this.peer_id,
                broadcast: broadcast,
                peer_name: this.peer_name,
                peer_avatar: this.peer_avatar,
                fileName: this.fileToSend.name,
                fileSize: this.fileToSend.size,
                fileType: this.fileToSend.type,
            };
            this.setMsgAvatar('left', this.peer_name, this.peer_avatar);
            this.appendMessage(
                'left',
                this.leftMsgAvatar,
                this.peer_name,
                this.peer_id,
                `${icons.fileSend} File send:<br>Name: ${this.fileToSend.name}<br>Size: ${this.bytesToSize(this.fileToSend.size)}`,
                toId,
                toName
            );
            // send some metadata about our file to peers in the room
            this.socket.emit('fileInfo', fileInfo);
            setTimeout(() => {
                this.sendFileData(peer_id, broadcast);
            }, 1000);
        } else {
            userLog('error', 'File not selected or empty.', 'top-end');
        }
    }

    handleFileInfo(data) {
        this.incomingFileInfo = data;
        this.incomingFileData = [];
        this.receiveBuffer = [];
        this.receivedSize = 0;
        let fileToReceiveInfo =
            ' From: ' +
            this.incomingFileInfo.peer_name +
            html.newline +
            ' Incoming file: ' +
            this.incomingFileInfo.fileName +
            html.newline +
            ' File type: ' +
            this.incomingFileInfo.fileType +
            html.newline +
            ' File size: ' +
            this.bytesToSize(this.incomingFileInfo.fileSize);
        const isPrivateFile = !this.incomingFileInfo.broadcast;
        const fileSenderId = this.incomingFileInfo.sender_id || this.incomingFileInfo.peer_id;
        const fileToId = isPrivateFile ? fileSenderId : 'all';
        const fileToName = isPrivateFile ? this.incomingFileInfo.peer_name : 'all';

        this.setMsgAvatar('right', this.incomingFileInfo.peer_name, this.incomingFileInfo.peer_avatar);
        this.appendMessage(
            'right',
            this.rightMsgAvatar,
            this.incomingFileInfo.peer_name,
            fileSenderId,
            `${icons.fileReceive} File receive:<br>From: ${this.incomingFileInfo.peer_name}<br>Name: ${this.incomingFileInfo.fileName}<br>Size: ${this.bytesToSize(this.incomingFileInfo.fileSize)}`,
            fileToId,
            fileToName
        );
        receiveFileInfo.innerText = fileToReceiveInfo;
        receiveFileDiv.style.display = 'block';
        receiveProgress.max = this.incomingFileInfo.fileSize;
        this.userLog('info', fileToReceiveInfo, 'top-end');
        this.receiveInProgress = true;
    }

    sendFileData(peer_id, broadcast) {
        console.log('Send file ', {
            name: this.fileToSend.name,
            size: this.bytesToSize(this.fileToSend.size),
            type: this.fileToSend.type,
        });

        this.sendInProgress = true;

        sendFileInfo.innerText =
            'File name: ' +
            this.fileToSend.name +
            html.newline +
            'File type: ' +
            this.fileToSend.type +
            html.newline +
            'File size: ' +
            this.bytesToSize(this.fileToSend.size) +
            html.newline;

        sendFileDiv.style.display = 'block';
        sendProgress.max = this.fileToSend.size;

        this.fileReader = new FileReader();
        let offset = 0;

        this.fileReader.addEventListener('error', (err) => console.error('fileReader error', err));
        this.fileReader.addEventListener('abort', (e) => console.log('fileReader aborted', e));
        this.fileReader.addEventListener('load', (e) => {
            if (!this.sendInProgress) return;

            let data = {
                peer_id: peer_id,
                broadcast: broadcast,
                fileData: e.target.result,
            };
            this.sendFSData(data);
            offset += data.fileData.byteLength;

            sendProgress.value = offset;
            sendFilePercentage.innerText = 'Send progress: ' + ((offset / this.fileToSend.size) * 100).toFixed(2) + '%';

            // send file completed
            if (offset === this.fileToSend.size) {
                this.sendInProgress = false;
                sendFileDiv.style.display = 'none';
                userLog('success', 'The file ' + this.fileToSend.name + ' was sent successfully.', 'top-end');
            }

            if (offset < this.fileToSend.size) readSlice(offset);
        });
        const readSlice = (o) => {
            const slice = this.fileToSend.slice(offset, o + this.chunkSize);
            this.fileReader.readAsArrayBuffer(slice);
        };
        readSlice(0);
    }

    sendFSData(data) {
        if (data) this.socket.emit('file', data);
    }

    abortFileTransfer() {
        if (this.isFileReaderRunning()) {
            this.fileReader.abort();
            sendFileDiv.style.display = 'none';
            this.sendInProgress = false;
            this.socket.emit('fileAbort', {
                peer_name: this.peer_name,
            });
        }
    }

    abortReceiveFileTransfer() {
        const data = { peer_name: this.peer_name };
        this.socket.emit('receiveFileAbort', data);
        setTimeout(() => {
            this.handleFileAbort(data);
        }, 1000);
    }

    hideFileTransfer() {
        receiveFileDiv.style.display = 'none';
    }

    isFileReaderRunning() {
        return this.fileReader && this.fileReader.readyState === 1;
    }

    handleReceiveFileAbort(data) {
        if (this.isFileReaderRunning()) {
            this.userLog('info', data.peer_name + ' ⚠️ aborted file transfer', 'top-end');
            this.fileReader.abort();
            sendFileDiv.style.display = 'none';
            this.sendInProgress = false;
        } else {
            this.handleFileAbort(data);
        }
    }

    handleFileAbort(data) {
        this.receiveBuffer = [];
        this.incomingFileData = [];
        this.receivedSize = 0;
        this.receiveInProgress = false;
        receiveFileDiv.style.display = 'none';
        console.log(data.peer_name + ' aborted the file transfer');
        this.userLog('info', data.peer_name + ' ⚠️ aborted the file transfer', 'top-end');
    }

    handleFile(data) {
        if (!this.receiveInProgress) return;
        this.receiveBuffer.push(data.fileData);
        this.receivedSize += data.fileData.byteLength;
        receiveProgress.value = this.receivedSize;
        receiveFilePercentage.innerText =
            'Receive progress: ' + ((this.receivedSize / this.incomingFileInfo.fileSize) * 100).toFixed(2) + '%';
        if (this.receivedSize === this.incomingFileInfo.fileSize) {
            receiveFileDiv.style.display = 'none';
            this.incomingFileData = this.receiveBuffer;
            this.receiveBuffer = [];
            this.endFileDownload();
        }
    }

    endFileDownload() {
        this.sound('download');

        // save received file into Blob
        const blob = new Blob(this.incomingFileData);
        const file = this.incomingFileInfo.fileName;

        this.incomingFileData = [];

        // if file is image, show the preview
        if (isImageURL(this.incomingFileInfo.fileName)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                Swal.fire({
                    allowOutsideClick: false,
                    background: swalBackground,
                    position: 'center',
                    title: 'Received file',
                    text: this.incomingFileInfo.fileName + ' size ' + this.bytesToSize(this.incomingFileInfo.fileSize),
                    imageUrl: e.target.result,
                    imageAlt: 'mirotalksfu-file-img-download',
                    showDenyButton: true,
                    confirmButtonText: `Save`,
                    denyButtonText: `Cancel`,
                    showClass: { popup: 'animate__animated animate__fadeInDown' },
                    hideClass: { popup: 'animate__animated animate__fadeOutUp' },
                }).then((result) => {
                    if (result.isConfirmed) this.saveBlobToFile(blob, file);
                });
            };
            // blob where is stored downloaded file
            reader.readAsDataURL(blob);
        } else {
            // not img file
            Swal.fire({
                allowOutsideClick: false,
                background: swalBackground,
                position: 'center',
                title: 'Received file',
                text: this.incomingFileInfo.fileName + ' size ' + this.bytesToSize(this.incomingFileInfo.fileSize),
                showDenyButton: true,
                confirmButtonText: `Save`,
                denyButtonText: `Cancel`,
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' },
            }).then((result) => {
                if (result.isConfirmed) this.saveBlobToFile(blob, file);
            });
        }
    }

    saveBlobToFile(blob, file) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = file;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }

    bytesToSize(bytes) {
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    toHtmlJson(obj) {
        return '<pre>' + JSON.stringify(obj, null, 4) + '</pre>';
    }

    isValidFileName(fileName) {
        const invalidChars = /[\\\/\?\*\|:"<>]/;
        return !invalidChars.test(fileName);
    }

    // ####################################################
    // CHAT MEDIA URL HELPERS
    // ####################################################

    getVideoType(url) {
        if (url.endsWith('.mp4')) return 'video/mp4';
        if (url.endsWith('.mp3')) return 'video/mp3';
        if (url.endsWith('.webm')) return 'video/webm';
        if (url.endsWith('.ogg')) return 'video/ogg';
        return 'na';
    }

    getYoutubeEmbed(url) {
        let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        let match = url.match(regExp);
        return match && match[7].length == 11 ? 'https://www.youtube.com/embed/' + match[7] + '?autoplay=1' : false;
    }

    // ####################################################
    // ROOM ACTION
    // ####################################################

    roomAction(action, emit = true, popup = true) {
        const data = {
            room_id: this.room_id,
            peer_id: this.peer_id,
            peer_name: this.peer_name,
            peer_uuid: this.peer_uuid,
            action: action,
            password: null,
        };
        if (emit) {
            switch (action) {
                case 'lock':
                    if (room_password) {
                        this.socket
                            .request('getPeerCounts')
                            .then(async (res) => {
                                // Only the presenter can lock the room
                                if (isPresenter || res.peerCounts == 1) {
                                    isPresenter = true;
                                    this.peer_info.peer_presenter = isPresenter;
                                    this.getId('isUserPresenter').innerText = presenterLabel(isPresenter);
                                    data.password = room_password;
                                    this.socket.emit('roomAction', data);
                                    if (popup) this.roomStatus(action);
                                }
                            })
                            .catch((err) => {
                                console.log('Get peer counts:', err);
                            });
                    } else {
                        Swal.fire({
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showDenyButton: true,
                            background: swalBackground,
                            imageUrl: image.locked,
                            input: 'text',
                            inputPlaceholder: 'Set room password',
                            confirmButtonText: `OK`,
                            denyButtonText: `Cancel`,
                            showClass: { popup: 'animate__animated animate__fadeInDown' },
                            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
                            inputValidator: (pwd) => {
                                if (!pwd) return 'Please enter the Room password';
                                this.RoomPassword = pwd;
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                data.password = this.RoomPassword;
                                this.socket.emit('roomAction', data);
                                this.roomStatus(action);
                            }
                        });
                    }
                    break;
                case 'unlock':
                    this.socket.emit('roomAction', data);
                    if (popup) this.roomStatus(action);
                    break;
                case 'lobbyOn':
                    this.socket.emit('roomAction', data);
                    if (popup) this.roomStatus(action);
                    break;
                case 'lobbyOff':
                    this.socket.emit('roomAction', data);
                    if (popup) this.roomStatus(action);
                    break;
                case 'joinLockOn':
                    this.socket.emit('roomAction', data);
                    if (popup) this.roomStatus(action);
                    break;
                case 'joinLockOff':
                    this.socket.emit('roomAction', data);
                    if (popup) this.roomStatus(action);
                    break;
                case 'hostOnlyRecordingOn':
                    this.socket.emit('roomAction', data);
                    if (popup) this.roomStatus(action);
                    break;
                case 'hostOnlyRecordingOff':
                    this.socket.emit('roomAction', data);
                    if (popup) this.roomStatus(action);
                    break;
                case 'isBanned':
                    this.socket.emit('roomAction', data);
                    this.isBanned();
                    break;
                default:
                    break;
            }
        } else {
            this.roomStatus(action);
        }
    }

    roomStatus(action) {
        switch (action) {
            case 'lock':
                if (!isPresenter) return;
                this.sound('locked');
                this.event(_EVENTS.roomLock);
                this.userLog('info', `${icons.lock} Room password set`, 'top-end');
                break;
            case 'unlock':
                if (!isPresenter) return;
                this.userLog('info', `${icons.unlock} Room password removed`, 'top-end');
                this.event(_EVENTS.roomUnlock);
                break;
            case 'lobbyOn':
                this.event(_EVENTS.lobbyOn);
                this.userLog('info', `${icons.lobby} Lobby is enabled`, 'top-end');
                break;
            case 'lobbyOff':
                this.event(_EVENTS.lobbyOff);
                this.userLog('info', `${icons.lobby} Lobby is disabled`, 'top-end');
                break;
            case 'joinLockOn':
                this.event(_EVENTS.joinLockOn);
                this.userLog('info', `${icons.lock} The room is locked, no new participants can join`, 'top-end');
                break;
            case 'joinLockOff':
                this.event(_EVENTS.joinLockOff);
                this.userLog('info', `${icons.unlock} The room is unlocked, new participants can join`, 'top-end');
                break;
            case 'hostOnlyRecordingOn':
                this.event(_EVENTS.hostOnlyRecordingOn);
                this.userLog('info', `${icons.recording} Host only recording is enabled`, 'top-end');
                break;
            case 'hostOnlyRecordingOff':
                this.event(_EVENTS.hostOnlyRecordingOff);
                this.userLog('info', `${icons.recording} Host only recording is disabled`, 'top-end');
                break;
            default:
                break;
        }
    }

    roomMessage(action, active = false) {
        const status = active ? 'ON' : 'OFF';
        this.sound('switch');
        switch (action) {
            case 'toggleVideoMirror':
                this.userLog('info', `${icons.mirror} Video mirror ${status}`, 'top-end');
                break;
            case 'pitchBar':
                this.userLog('info', `${icons.pitchBar} Audio pitch bar ${status}`, 'top-end');
                break;
            case 'sounds':
                this.userLog('info', `${icons.sounds} Sounds notification ${status}`, 'top-end');
                break;
            case 'ptt':
                this.userLog('info', `${icons.ptt} Push to talk ${status}`, 'top-end');
                break;
            case 'notify':
                this.userLog('info', `${icons.share} Share room on join ${status}`, 'top-end');
                break;
            case 'hostOnlyRecording':
                this.userLog('info', `${icons.recording} Only host recording ${status}`, 'top-end');
                break;
            case 'showChat':
                active
                    ? this.userLog('info', `${icons.chat} Chat will be shown, when you receive a message`, 'top-end')
                    : this.userLog(
                          'info',
                          `${icons.chat} Chat not will be shown, when you receive a message`,
                          'top-end'
                      );
                break;
            case 'speechMessages':
                this.userLog('info', `${icons.speech} Speech incoming messages ${status}`, 'top-end');
                break;
            case 'video_start_privacy':
                this.userLog(
                    'info',
                    `${icons.moderator} Moderator: everyone starts in privacy mode ${status}`,
                    'top-end'
                );
                break;
            case 'audio_start_muted':
                this.userLog('info', `${icons.moderator} Moderator: everyone starts muted ${status}`, 'top-end');
                break;
            case 'video_start_hidden':
                this.userLog('info', `${icons.moderator} Moderator: everyone starts hidden ${status}`, 'top-end');
                break;
            case 'audio_cant_unmute':
                this.userLog(
                    'info',
                    `${icons.moderator} Moderator: everyone can't unmute themselves ${status}`,
                    'top-end'
                );
                break;
            case 'video_cant_unhide':
                this.userLog(
                    'info',
                    `${icons.moderator} Moderator: everyone can't unhide themselves ${status}`,
                    'top-end'
                );
                break;
            case 'screen_cant_share':
                this.userLog(
                    'info',
                    `${icons.moderator} Moderator: everyone can't share the screen ${status}`,
                    'top-end'
                );
                break;
            case 'chat_cant_privately':
                this.userLog(
                    'info',
                    `${icons.moderator} Moderator: everyone can't chat privately ${status}`,
                    'top-end'
                );
                break;
            case 'chat_cant_publicly':
                this.userLog('info', `${icons.moderator} Moderator: everyone can't chat publicly ${status}`, 'top-end');
                break;
            case 'chat_cant_chatgpt':
                this.userLog(
                    'info',
                    `${icons.moderator} Moderator: everyone can't chat with ChatGPT ${status}`,
                    'top-end'
                );
                break;
            case 'chat_cant_deep_seek':
                this.userLog(
                    'info',
                    `${icons.moderator} Moderator: everyone can't chat with DeepSeek ${status}`,
                    'top-end'
                );
                break;

            case 'disconnect_all_on_leave':
                this.userLog('info', `${icons.moderator} Moderator: disconnect all on leave room ${status}`, 'top-end');
                break;
            case 'everyone_follows_me':
                this.userLog('info', `${icons.moderator} Moderator: everyone follows me ${status}`, 'top-end');
                break;
            case 'recSyncServer':
                active
                    ? this.showRecServerSideAdvice()
                    : this.userLog('info', `${icons.recording} Server sync recording ${status}`, 'top-end');
                break;
            case 'customThemeKeep':
                this.userLog('info', `${icons.theme} Custom theme keep ${status}`, 'top-end');
                break;
            case 'save_room_notifications':
                this.userLog('success', 'Room notifications saved successfully', 'top-end');
                break;
            default:
                break;
        }
    }

    async roomPassword(data) {
        switch (data.password) {
            case 'OK':
                this.RoomPasswordValid = true;
                await this.joinAllowed(data.room);
                break;
            case 'KO':
                this.RoomPasswordValid = false;
                this.roomIsLocked();
                break;
            default:
                break;
        }
    }

    // ####################################################
    // ROOM LOBBY
    // ####################################################

    async roomLobby(data) {
        console.log('LOBBY--->', data);
        switch (data.lobby_status) {
            case 'waiting':
                if (!isRulesActive || isPresenter) {
                    const { peer_id, peer_name, peer_avatar } = data;
                    this.lobbyAddPear({ peer_id, peer_name, peer_avatar });
                    this.userLog('info', peer_name + ' wants to join the meeting', 'top-end');
                }
                break;
            case 'accept':
                if (this.lobbyRemovePearForPresenter(data)) {
                    return;
                }
                this.RoomLobbyAccepted = true;
                await this.joinAllowed(data.room);
                bottomButtons.style.display = 'flex';
                this.showLobbyDecision('accept');
                break;
            case 'reject':
                if (this.lobbyRemovePearForPresenter(data)) {
                    return;
                }
                this.RoomLobbyAccepted = false;
                this.showLobbyDecision('reject');
                break;
            default:
                break;
        }
    }

    lobbyRemovePearForPresenter(data) {
        const peers_id = data.peers_id?.length > 0 ? data.peers_id : [data.peer_id];

        // This current pear is in lobby accept request
        // It means that most probably we this pear is eaitin in lobby right now
        // so no need to update lobby list UI modal since there is no one
        if (peers_id.includes(this.peer_id)) {
            return false;
        }

        for (const peer_id of peers_id) {
            this.lobbyRemovePear(peer_id);
        }
        return true;
    }

    lobbyAction(button, lobby_status) {
        const peer_id = button.dataset.peerId;
        const lobbyPeer = this.lobbyPears[peer_id];
        if (!lobbyPeer) return;

        const data = {
            room_id: this.room_id,
            peer_id: peer_id,
            peer_name: lobbyPeer.peer_name,
            lobby_status: lobby_status,
            broadcast: true,
        };
        this.socket.emit('roomLobby', data);
        this.lobbyRemovePear(peer_id);
    }

    lobbyAcceptAll() {
        const lobbyPearsIds = this.lobbyGetPeerIds();
        console.log('lobbyAcceptAll', lobbyPearsIds, lobbyPearsIds.length);
        if (lobbyPearsIds.length > 0) {
            const data = this.lobbyGetData('accept', lobbyPearsIds);
            this.socket.emit('roomLobby', data);
            this.lobbyRemoveAll();
        } else {
            this.userLog('info', 'No participants in lobby detected', 'top-end');
        }
    }

    lobbyRejectAll() {
        const lobbyPearsIds = this.lobbyGetPeerIds();
        if (lobbyPearsIds.length > 0) {
            const data = this.lobbyGetData('reject', lobbyPearsIds);
            this.socket.emit('roomLobby', data);
            this.lobbyRemoveAll();
        } else {
            this.userLog('info', 'No participants in lobby detected', 'top-end');
        }
    }

    lobbyRemoveAll() {
        this.lobbyPears = {};
        this.lobbyRefreshUi();
    }

    lobbyRemoveMe(peer_id) {
        this.lobbyRemovePear(peer_id);
    }

    lobbyAddPear(data) {
        this.lobbyPears[data.peer_id] = data;
        this.lobbyRefreshUi();
    }

    lobbyRemovePear(peer_id) {
        delete this.lobbyPears[peer_id];
        this.lobbyRefreshUi();
    }

    lobbyRefreshUi() {
        let lobbyTr = this.getId('lobbyTbTemplate').innerHTML;
        const lobbyTb = this.getId('lobbyTb');

        for (const peer_id of Object.keys(this.lobbyPears)) {
            const { peer_name, peer_avatar } = this.lobbyPears[peer_id];
            // Security: escape for HTML attribute/text contexts (filterXSS does not encode quotes).
            const displayName = this.sanitizeHtml(peer_name);
            const safePeerId = this.sanitizeHtml(peer_id);

            const avatarImg =
                peer_avatar && this.isValidAvatarURL(peer_avatar)
                    ? peer_avatar
                    : this.isValidEmail(peer_name)
                      ? this.genGravatar(peer_name, 32)
                      : this.genAvatarSvg(peer_name, 32);

            const lobbyAcceptId = `${displayName}___${safePeerId}___lobbyAccept`;
            const lobbyRejectId = `${displayName}___${safePeerId}___lobbyReject`;

            lobbyTr += `
            <tr id='${safePeerId}' class='lobby-row'>
                <td class='lobby-cell lobby-cell--avatar'>
                    <img class='lobby-avatar-img' src="${avatarImg}" alt="${displayName}" />
                </td>
                <td class='lobby-cell lobby-cell--user'>
                    <div class='lobby-user-meta'>
                        <span class='lobby-user-name'>${displayName}</span>
                        <span class='lobby-user-status'>Waiting in lobby</span>
                    </div>
                </td>
                <td class='lobby-cell lobby-cell--action'>
                    <button
                        id='${lobbyAcceptId}'
                        data-peer-id='${safePeerId}'
                        class='lobby-action-btn lobby-action-btn--accept'
                        onclick="rc.lobbyAction(this, 'accept')"
                        aria-label='Accept ${displayName}'
                    >${_PEER.acceptPeer}</button>
                </td>
                <td class='lobby-cell lobby-cell--action'>
                    <button
                        id='${lobbyRejectId}'
                        data-peer-id='${safePeerId}'
                        class='lobby-action-btn lobby-action-btn--reject'
                        onclick="rc.lobbyAction(this, 'reject')"
                        aria-label='Reject ${displayName}'
                    >${icons.times}</button>
                </td>
            </tr>
            `;

            if (!this.isMobileDevice) {
                setTippy(lobbyAcceptId, 'Accept', 'top');
                setTippy(lobbyRejectId, 'Reject', 'top');
            }
        }
        lobbyTb.innerHTML = lobbyTr;
        lobbyHeaderTitle.innerText = 'Lobby users (' + this.lobbyParticipantsCount() + ')';
        this.lobbyToggle();
    }

    lobbyParticipantsCount() {
        return Object.keys(this.lobbyPears).length;
    }

    lobbyGetPeerIds() {
        return Object.keys(this.lobbyPears);
    }

    lobbyGetData(status, peers_id = []) {
        return {
            room_id: this.room_id,
            peer_id: this.peer_id,
            peer_name: this.peer_name,
            peers_id: peers_id,
            lobby_status: status,
            broadcast: true,
        };
    }

    lobbyToggle() {
        const isAllowed = !isRulesActive || isPresenter;
        if (this.lobbyParticipantsCount() > 0 && isAllowed) {
            lobby.style.display = 'block';
            lobby.style.top = '50%';
            lobby.style.left = '50%';
            if (this.isMobileDevice) {
                lobby.style.width = '100%';
                lobby.style.height = '100%';
            }
            this.sound('lobby');
        } else {
            lobby.style.display = 'none';
        }
    }

    // ####################################################
    // HANDLE ROOM ACTION
    // ####################################################

    roomInvalid() {
        this.sound('alert');
        Swal.fire({
            allowOutsideClick: false,
            allowEscapeKey: false,
            background: swalBackground,
            imageUrl: image.forbidden,
            title: 'Oops, Room not valid',
            text: 'Invalid Room name! Path traversal pattern detected!',
            confirmButtonText: `OK`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then(() => {
            openURL(`/`);
        });
    }

    userRoomNotAllowed() {
        this.sound('alert');
        Swal.fire({
            allowOutsideClick: false,
            allowEscapeKey: false,
            background: swalBackground,
            imageUrl: image.forbidden,
            title: 'Oops, Room not allowed',
            text: 'This room is not allowed for this user',
            confirmButtonText: `OK`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then(() => {
            openURL(`/`); // Select the new allowed room name for this user and login to join
        });
    }

    userUnauthorized() {
        this.sound('alert');
        Swal.fire({
            allowOutsideClick: false,
            allowEscapeKey: false,
            background: swalBackground,
            imageUrl: image.forbidden,
            title: 'Oops, Unauthorized',
            text: 'The host has user authentication enabled',
            confirmButtonText: `Login`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then(() => {
            // Login required to join room
            endRoomSession();
            openURL(`/login/?room=${this.room_id}`);
        });
    }

    unlockTheRoom() {
        if (room_password) {
            this.RoomPassword = room_password;
            let data = {
                action: 'checkPassword',
                password: this.RoomPassword,
            };
            this.socket.emit('roomAction', data);
        } else {
            Swal.fire({
                allowOutsideClick: false,
                allowEscapeKey: false,
                background: swalBackground,
                imageUrl: image.locked,
                title: 'Oops, Room is Locked',
                input: 'text',
                inputPlaceholder: 'Enter the Room password',
                confirmButtonText: `OK`,
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' },
                inputValidator: (pwd) => {
                    if (!pwd) return 'Please enter the Room password';
                    this.RoomPassword = pwd;
                },
            }).then(() => {
                let data = {
                    action: 'checkPassword',
                    password: this.RoomPassword,
                };
                this.socket.emit('roomAction', data);
            });
        }
    }

    roomJoinLocked() {
        this.sound('alert');
        Swal.fire({
            allowOutsideClick: false,
            allowEscapeKey: false,
            background: swalBackground,
            imageUrl: image.locked,
            title: 'Oops, Room is Locked',
            text: 'The host has locked the room, new participants are not allowed to join.',
            confirmButtonText: `OK`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then(() => {
            openURL('/');
        });
    }

    roomIsLocked() {
        this.sound('eject');
        this.event(_EVENTS.roomLock);
        console.log('Room is Locked, try with another one');
        Swal.fire({
            allowOutsideClick: false,
            background: swalBackground,
            position: 'center',
            imageUrl: image.locked,
            title: 'Oops, Wrong Room Password',
            text: 'The room is locked, try with another one.',
            showDenyButton: false,
            confirmButtonText: `Ok`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then((result) => {
            if (result.isConfirmed) this.exit();
        });
    }

    presenterNotInRoom() {
        this.sound('lobby');
        Swal.fire({
            allowOutsideClick: false,
            allowEscapeKey: false,
            showDenyButton: true,
            showConfirmButton: false,
            background: swalBackground,
            icon: 'warning',
            title: 'Lobby enabled and no presenter available',
            text: 'A presenter is required to start the meeting. Please try joining again later.',
            denyButtonText: `Leave room`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
            timer: 6000,
            timerProgressBar: true,
        }).then(() => {
            this.exit();
        });
    }

    waitJoinConfirm() {
        this.sound('lobby');
        Swal.fire({
            allowOutsideClick: false,
            allowEscapeKey: false,
            showDenyButton: true,
            showConfirmButton: false,
            background: swalBackground,
            title: 'Room has lobby enabled',
            html: renderRoomTemplate('popupLobbyWaitJoinTemplate'),
            confirmButtonText: `Ok`,
            denyButtonText: `Leave room`,
            customClass: {
                popup: 'lobby-join-popup',
                htmlContainer: 'lobby-join-popup-html',
                denyButton: 'lobby-join-popup-deny',
            },
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then((result) => {
            result.isConfirmed ? (bottomButtons.style.display = 'none') : this.exit();
        });
    }

    showLobbyDecision(status) {
        const isAccepted = status === 'accept';

        if (isAccepted) {
            Swal.fire({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 2800,
                timerProgressBar: true,
                background: swalBackground,
                html: renderRoomTemplate('popupLobbyAcceptTemplate'),
                customClass: {
                    popup: 'lobby-join-toast lobby-join-toast--accept',
                    htmlContainer: 'lobby-join-toast-html',
                },
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' },
            });
            return;
        }

        this.sound('eject');
        Swal.fire({
            allowOutsideClick: false,
            allowEscapeKey: true,
            showDenyButton: false,
            showConfirmButton: true,
            background: swalBackground,
            title: 'Request declined',
            html: renderRoomTemplate('popupLobbyRejectTemplate'),
            confirmButtonText: `Leave room`,
            customClass: {
                popup: 'lobby-join-popup lobby-join-popup--reject',
                htmlContainer: 'lobby-join-popup-html lobby-join-outcome-html',
                confirmButton: 'lobby-join-popup-confirm lobby-join-popup-confirm--reject',
            },
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then((result) => {
            if (result.isConfirmed) {
                this.exit();
            }
        });
    }

    isBanned() {
        this.sound('alert');
        Swal.fire({
            allowOutsideClick: false,
            allowEscapeKey: false,
            showDenyButton: false,
            showConfirmButton: true,
            background: swalBackground,
            imageUrl: image.forbidden,
            title: 'Banned',
            text: 'You are banned from this room!',
            confirmButtonText: `Ok`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then(() => {
            this.exit();
        });
    }

    // ####################################################
    // HANDLE AUDIO VOLUME
    // ####################################################

    getAudioVolumeColor(volume) {
        if (volume >= 80) return 'red';
        if (volume >= 50) return 'orange';
        return 'lime';
    }

    handleAudioVolume(data) {
        //console.log('Active speaker', data);

        const { peer_id, peer_name, audioVolume } = data;
        const audioVolumeTmp = audioVolume * 10; //10-100
        const audioColorTmp = this.getAudioVolumeColor(audioVolumeTmp);

        if (!isPitchBarEnabled) {
            const peerVideo = this.getName(peer_id);
            const peerAvatarImg = this.getId(peer_id + '__img');
            if (peerAvatarImg) {
                this.applyBoxShadowEffect(peerAvatarImg, audioColorTmp, 200);
            }
            if (peerVideo && peerVideo.classList.contains('videoCircle')) {
                this.applyBoxShadowEffect(peerVideo, audioColorTmp, 200);
            }
            return;
        }
        const producerAudioBtn = this.getId(peer_id + '_audio');
        const consumerAudioBtn = this.getId(peer_id + '__audio');
        const pbProducer = this.getId(peer_id + '_pitchBar');
        const pbConsumer = this.getId(peer_id + '__pitchBar');
        if (producerAudioBtn) producerAudioBtn.style.color = audioColorTmp;
        if (consumerAudioBtn) consumerAudioBtn.style.color = audioColorTmp;
        if (pbProducer) pbProducer.style.backgroundColor = audioColorTmp;
        if (pbConsumer) pbConsumer.style.backgroundColor = audioColorTmp;
        if (pbProducer) pbProducer.style.height = audioVolumeTmp + '%';
        if (pbConsumer) pbConsumer.style.height = audioVolumeTmp + '%';

        if (!this._audioVolumeTimers) this._audioVolumeTimers = new Map();
        if (this._audioVolumeTimers.has(peer_id)) {
            clearTimeout(this._audioVolumeTimers.get(peer_id));
        }
        this._audioVolumeTimers.set(
            peer_id,
            setTimeout(() => {
                if (producerAudioBtn) producerAudioBtn.style.color = 'white';
                if (consumerAudioBtn) consumerAudioBtn.style.color = 'white';
                if (pbProducer) pbProducer.style.height = '0%';
                if (pbConsumer) pbConsumer.style.height = '0%';
                this._audioVolumeTimers.delete(peer_id);
            }, 200)
        );
    }

    applyBoxShadowEffect(element, color, delay = 200) {
        if (element) {
            element.style.boxShadow = `0 0 20px ${color}`;
            setTimeout(() => {
                element.style.boxShadow = 'none';
            }, delay);
        }
    }

    // ####################################################
    // HANDLE PEERS AUDIO VOLUME
    // ####################################################

    handleCV(volumeInputId) {
        this.handleVolumeControl(volumeInputId);
    }

    setAV(audioElementId, volumeElementId, volumeValue) {
        const volumeInput = this.getId(volumeElementId);
        const audioPlayer = this.getId(audioElementId);
        if (volumeInput && audioPlayer) {
            const identity = volumeInput.dataset.volumeKey;
            const storageKey = identity ? `bodrik-peer-volume:${this.room_id}:${identity}` : null;
            audioPlayer.dataset.bodrikMusic = identity === 'bodrik-music' ? 'true' : 'false';
            if (storageKey) {
                const saved = localStorage.getItem(storageKey);
                const stored = saved === null ? NaN : Number(saved);
                if (Number.isFinite(stored) && stored >= 0 && stored <= 100) volumeValue = stored;
            }
            const volume = volumeValue / 100;
            console.log('Setting audio volume:', volumeValue);
            volumeInput.value = volumeValue;
            if (!audioPlayer.muted) {
                this.setAudioVolume(audioPlayer, volume);
            } else {
                console.log('Audio player is muted, volume not adjusted.');
            }
        }
    }

    handleVolumeControl(volumeInputId) {
        const audioPlayer = this.getId(this.audioConsumers.get(volumeInputId));
        const inputElement = this.getId(volumeInputId);

        if (inputElement && audioPlayer) {
            const savedVolume = localStorage.getItem(
                `bodrik-peer-volume:${this.room_id}:${inputElement.dataset.volumeKey}`
            );
            const parsedVolume = savedVolume === null ? NaN : Number(savedVolume);
            inputElement.value = Number.isFinite(parsedVolume) ? parsedVolume : 100;

            const updateVolume = () => {
                const volume = inputElement.value / 100;
                this.setAudioVolume(audioPlayer, volume);
                const identity = inputElement.dataset.volumeKey;
                if (identity) {
                    localStorage.setItem(`bodrik-peer-volume:${this.room_id}:${identity}`, inputElement.value);
                }
            };

            this.addVolumeEventListeners(inputElement, updateVolume);
        }
    }

    setAudioVolume(audioPlayer, volume) {
        if (audioPlayer) {
            // Never unmute local producer audio elements (prevents echo/feedback)
            const isLocalProducer = audioPlayer.getAttribute('name') === 'LOCAL-AUDIO';
            if (isLocalProducer) {
                audioPlayer.muted = true;
                audioPlayer.volume = 0;
                return;
            }
            audioPlayer.dataset.peerVolume = volume;
            this.applyOutputVolume(audioPlayer);
        }
    }

    // ####################################################
    // MASTER OUTPUT (SPEAKER) VOLUME
    // ####################################################

    getOutputAudioElements() {
        const elements = Array.from(this.remoteAudioEl?.querySelectorAll('audio') || []);

        return elements;
    }

    setMasterOutputVolume(volume) {
        const value = Number(volume);
        this.masterOutputVolume = Math.min(1, Math.max(0, isNaN(value) ? 1 : value));
        this.getOutputAudioElements().forEach((elem) => this.applyOutputVolume(elem));
    }

    applyOutputVolume(audioPlayer) {
        if (!audioPlayer) return;

        const volume = getEffectiveAudioOutputVolume(this, audioPlayer);
        this.audioRecorder?.updateElementVolume(audioPlayer, volume);

        const gainNode = this.getOutputGainNode(audioPlayer, volume);
        if (gainNode) {
            // A MediaStream source reads the track directly; mute the HTML element to avoid double playback.
            audioPlayer.muted = audioPlayer._outputStreamGain || volume === 0;
            audioPlayer.volume = 1;
            gainNode.gain.value = volume;
            return;
        }

        // HTMLMediaElement.volume works on most browsers; unsupported mobile browsers use Web Audio above.
        audioPlayer.muted = volume === 0;
        audioPlayer.volume = volume;
    }

    canSetElementVolume() {
        if (this._elementVolumeWritable === undefined) {
            const probe = document.createElement('audio');
            try {
                probe.volume = 0.5;
            } catch {
                // ignore, handled by the read back below
            }
            this._elementVolumeWritable = probe.volume === 0.5;
        }
        return this._elementVolumeWritable;
    }

    getOutputAudioContext() {
        if (!this._outputAudioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return null;
            this._outputAudioContext = new AudioContextClass();
        }
        if (this._outputAudioContext.state === 'suspended') {
            this._outputAudioContext.resume().catch((err) => console.warn('Output AudioContext resume', err));
        }
        return this._outputAudioContext;
    }

    getOutputGainNode(elem, volume) {
        if (elem._outputGainNode) return elem._outputGainNode;

        // Mobile browsers may report writable volume without applying it to remote media.
        // Route through Web Audio when attenuation is needed; keep full-volume playback untouched.
        if (volume >= 1 || elem._outputGainUnavailable || (!this.isMobileDevice && this.canSetElementVolume()))
            return null;

        const audioContext = this.getOutputAudioContext();
        if (!audioContext) {
            elem._outputGainUnavailable = true;
            return null;
        }

        try {
            // Remote tracks must not also play through the HTML element on mobile devices.
            const streamSource = this.isMobileDevice && elem.srcObject && audioContext.createMediaStreamSource;
            const source = streamSource
                ? audioContext.createMediaStreamSource(elem.srcObject)
                : audioContext.createMediaElementSource(elem);
            const gainNode = audioContext.createGain();
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            elem._outputStreamGain = Boolean(streamSource);
            elem._outputGainNode = gainNode;
            return gainNode;
        } catch (err) {
            console.error('Create output gain node error', err);
            elem._outputGainUnavailable = true;
            return null;
        }
    }

    addVolumeEventListeners(inputElement, updateVolumeCallback) {
        inputElement.addEventListener('input', updateVolumeCallback);
        inputElement.addEventListener('change', updateVolumeCallback);

        if (this.isMobileDevice) {
            inputElement.addEventListener('touchstart', updateVolumeCallback);
            inputElement.addEventListener('touchmove', updateVolumeCallback);
        }
    }

    // ####################################################
    // HANDLE DOMINANT SPEAKER
    // ###################################################

    handleDominantSpeakerHighlight(peer_id) {
        // Highlight the peer name
        const peerNameElement = this.getId(peer_id + '__name');
        if (peerNameElement) {
            peerNameElement.style.color = 'lime';
            setTimeout(function () {
                peerNameElement.style.color = '#FFFFFF';
            }, 5000);
        }
    }

    handleDominantSpeakerFocus(peerId, timeout = 10000) {
        const mediaElement = this.getParticipantMediaElementByPeerId(peerId);
        const videoContainer = mediaElement?.closest('.Camera');

        console.log('handleDominantSpeakerFocus', { peerId, mediaElementId: mediaElement?.id });

        if (!mediaElement || !videoContainer) return;

        // Track the currently focused video container
        if (!this._dominantSpeakerState) {
            this._dominantSpeakerState = { prevMediaElementId: null, timeout: null };
        }

        // Remove focus mode from previous dominant speaker if any
        if (
            this._dominantSpeakerState.prevMediaElementId &&
            this._dominantSpeakerState.prevMediaElementId !== mediaElement.id
        ) {
            const prevMediaElement = this.getId(this._dominantSpeakerState.prevMediaElementId);
            const prevVideoContainer = prevMediaElement?.closest('.Camera');
            const prevFocusBtn = this.getId(this._dominantSpeakerState.prevMediaElementId + '__hideALL');
            if (prevVideoContainer?.hasAttribute('focus-mode')) {
                this.toggleFocusMode(prevVideoContainer.id, prevFocusBtn);
            }
        }

        // Set focus mode for the new dominant speaker
        const focusBtn = this.getId(mediaElement.id + '__hideALL');
        if (!videoContainer.hasAttribute('focus-mode')) {
            this.toggleFocusMode(videoContainer.id, focusBtn);
        }

        // Update the state
        this._dominantSpeakerState.prevMediaElementId = mediaElement.id;

        // Clear any previous timeout
        if (this._dominantSpeakerState.timeout) {
            clearTimeout(this._dominantSpeakerState.timeout);
        }

        // Set a timeout to remove focus after 'timeout' seconds of inactivity
        this._dominantSpeakerState.timeout = setTimeout(() => {
            // Remove focus mode if still focused
            if (this._dominantSpeakerState.prevMediaElementId) {
                const prevMediaElement = this.getId(this._dominantSpeakerState.prevMediaElementId);
                const prevVideoContainer = prevMediaElement?.closest('.Camera');
                const prevFocusBtn = this.getId(this._dominantSpeakerState.prevMediaElementId + '__hideALL');
                if (prevVideoContainer?.hasAttribute('focus-mode')) {
                    this.toggleFocusMode(prevVideoContainer.id, prevFocusBtn);
                }
                this._dominantSpeakerState.prevMediaElementId = null;
            }
        }, timeout); // 10 seconds
    }

    handleDominantSpeakerPin(peerId) {
        const mediaElement = this.getParticipantMediaElementByPeerId(peerId);
        const pinButton = mediaElement ? this.getId(`${mediaElement.id}__pin`) : null;
        if (!pinButton || this.pinnedVideoPlayerId === mediaElement.id) return;

        this.isApplyingDominantSpeaker = true;
        this.isApplyingParticipantViewMode = true;
        try {
            this.clearVideoFocusMode();

            if (this.isVideoPinned && this.pinnedVideoPlayerId) {
                const pinnedButton = this.getId(`${this.pinnedVideoPlayerId}__pin`);
                if (pinnedButton) pinnedButton.click();
            }
            pinButton.click();
            this.toggleVideoPin(participantViewMode.value);
        } finally {
            this.isApplyingParticipantViewMode = false;
            this.isApplyingDominantSpeaker = false;
        }
    }

    handleDominantSpeaker(data) {
        console.log('Dominant Speaker', data);
        const { peer_id } = data;
        this.handleDominantSpeakerHighlight(peer_id);
        if (this.dominantSpeaker && switchDominantSpeakerFocus.checked) {
            const viewMode = participantViewMode.value;
            viewMode.startsWith('speaker-')
                ? this.handleDominantSpeakerPin(peer_id)
                : this.handleDominantSpeakerFocus(peer_id);
        }
    }

    // ####################################################
    // HANDLE BAN
    // ###################################################

    handleGL(uid, peer_id) {
        let btnGl = this.getId(uid);
        if (btnGl) {
            btnGl.addEventListener('click', () => {
                isPresenter
                    ? this.askPeerGeoLocation(peer_id)
                    : this.userLog('warning', 'Only the presenter can ask geolocation to the participants', 'top-end');
            });
        }
    }

    // ####################################################
    // HANDLE BAN
    // ###################################################

    handleBAN(uid, peer_id) {
        let btnBan = this.getId(uid);
        if (btnBan) {
            btnBan.addEventListener('click', () => {
                isPresenter
                    ? this.peerAction('me', peer_id, 'ban')
                    : this.userLog('warning', 'Only the presenter can ban the participants', 'top-end');
            });
        }
    }

    // ####################################################
    // HANDLE KICK-OUT
    // ###################################################

    handleKO(uid, peer_id) {
        let btnKo = this.getId(uid);
        if (btnKo) {
            btnKo.addEventListener('click', () => {
                isPresenter
                    ? this.peerAction('me', peer_id, 'eject')
                    : this.userLog('warning', 'Only the presenter can eject the participants', 'top-end');
            });
        }
    }

    // ####################################################
    // HANDLE PRESENTER ROLE
    // ###################################################

    handleRole(uid, peer_id, peerIsPresenter) {
        const btnRole = this.getId(uid);
        if (btnRole) {
            btnRole.dataset.peerPresenter = String(!!peerIsPresenter);
            btnRole.addEventListener('click', () => {
                const current = btnRole.dataset.peerPresenter === 'true';
                this.setPresenterRole(peer_id, !current);
            });
        }
    }

    // Keep the role button icon/label in sync across the video tiles after a role change
    updatePeerRoleButtons(peer_id, is_presenter) {
        const buttons = document.querySelectorAll(`[id$="___${peer_id}___role"]`);
        buttons.forEach((btn) => {
            btn.dataset.peerPresenter = String(is_presenter);
            btn.className = is_presenter ? html.presenterRoleRemove : html.presenterRole;
            btn.classList.toggle('presenter-role-active', is_presenter);
            const label = btn.nextElementSibling;
            if (label && label.tagName === 'SPAN') {
                label.textContent = is_presenter ? 'Remove presenter role' : 'Set as presenter';
            }
        });
    }

    setPresenterRole(peer_id, grant) {
        if (!isPresenter) {
            return this.userLog('warning', 'Only the presenter can change participant roles', 'top-end');
        }
        if (peer_id === this.peer_id) {
            return this.userLog('warning', 'You cannot change your own role', 'top-end');
        }
        const data = {
            room_id: this.room_id,
            from_peer_name: this.peer_name,
            from_peer_uuid: this.peer_uuid,
            peer_id: peer_id,
            action: grant ? 'grant' : 'revoke',
        };
        console.log('setPresenterRole', data);
        this.socket.emit('setPresenterRole', data);
    }

    handlePresenterRole(data) {
        const { peer_id, peer_name, is_presenter, from_peer_name } = data;

        // Keep the cached peer info in sync so list/video re-renders reflect the new role
        if (this.peers.has(peer_id)) {
            this.peers.get(peer_id).peer_info.peer_presenter = is_presenter;
        }

        // Update the presenter shield badge on the peer video tile name
        this.updatePeerPresenterBadge(peer_id, is_presenter);

        // Keep the per-video role buttons (icon/label) in sync
        this.updatePeerRoleButtons(peer_id, is_presenter);

        // My own role changed
        if (peer_id === this.peer_id) {
            isPresenter = is_presenter;
            this.peer_info.peer_presenter = is_presenter;
            const presenterEl = this.getId('isUserPresenter');
            if (presenterEl) presenterEl.innerText = presenterLabel(is_presenter);
            // Apply presenter/guest permissions without re-running the room auto-setup, so the
            // room state (lobby, recording, moderator) set by the original presenter
            // is preserved instead of being reset to this peer's local defaults.
            handleRules(is_presenter, false);
            // Existing remote tiles were built with the previous role's flags; add/remove the
            // presenter-only moderation items so their menus reflect the new role.
            this.refreshRemoteVideoMenus();
            this.userLog(
                'info',
                is_presenter
                    ? `${from_peer_name} promoted you to presenter`
                    : `${from_peer_name} removed your presenter role`,
                'top-end',
                6000
            );
        } else {
            this.userLog(
                'info',
                is_presenter ? `${peer_name} is now a presenter` : `${peer_name} is no longer a presenter`,
                'top-end',
                6000
            );
        }

        if (isParticipantsListOpen) getRoomParticipants();
    }

    createPresenterNameBadge() {
        const badge = document.createElement('i');
        badge.className = 'fa-solid fa-user-shield presenter-name-badge';
        return badge;
    }

    /** Translate the suffix identifying this browser's participant tile. */
    meSuffix() {
        return ' ' + (window.i18n?.t('(me)', 'labels') || '(me)');
    }

    setPeerNameWithPresenter(nameEl, is_presenter, displayName) {
        nameEl.textContent = '';
        if (is_presenter) nameEl.appendChild(this.createPresenterNameBadge());
        nameEl.appendChild(document.createTextNode(displayName));
    }

    updatePeerPresenterBadge(peer_id, is_presenter) {
        const nameEl = this.getId(peer_id + '__name');
        if (!nameEl) return;
        const existing = nameEl.querySelector('.presenter-name-badge');
        if (is_presenter && !existing) {
            nameEl.insertBefore(this.createPresenterNameBadge(), nameEl.firstChild);
        } else if (!is_presenter && existing) {
            existing.remove();
        }
    }

    // Add or remove a presenter-only moderation control on an already-rendered tile menu,
    // without re-consuming media. `container` is the dropdown (consumer) or menu bar (videoOff).
    reconcilePresenterMenuItem(container, btnId, shouldExist, createFn) {
        const existing = this.getId(btnId);
        if (shouldExist && !existing) {
            createFn();
        } else if (!shouldExist && existing) {
            const wrapper = existing.closest('.navbar-dropdown-item') || existing;
            wrapper.remove();
        }
    }

    // After a mid-session role change, reconcile the presenter-only moderation controls
    // (set/remove presenter, geo location, ban, kick out) on every existing remote tile so
    // the video-feed dropdowns and video-off tiles match the local user's new role.
    refreshRemoteVideoMenus() {
        const canModerate = isPresenter;

        // Remote camera/screen tiles: controls live in a navbar dropdown (eVc)
        this.videoMediaContainer.querySelectorAll('.Camera[id$="__video"]').forEach((tile) => {
            const remotePeerId = tile.dataset.peerId;
            if (!remotePeerId || remotePeerId === this.peer_id) return;

            const consumerId = tile.id.replace('__video', '');
            const vb = this.getId(consumerId + '__vb');
            const expandBtn = vb ? vb.querySelector('[id$="_expandBtn"]') : null;
            const eVc = expandBtn ? expandBtn._dropdownContent : null;
            if (!eVc) return;

            const peerPresenter = !!this.peers.get(remotePeerId)?.peer_info?.peer_presenter;
            const prefix = `${consumerId}___${remotePeerId}___`;

            this.reconcilePresenterMenuItem(
                eVc,
                `${prefix}role`,
                canModerate && BUTTONS.consumerVideo.presenterRoleButton,
                () => {
                    const role = this.createButton(
                        `${prefix}role`,
                        peerPresenter ? html.presenterRoleRemove : html.presenterRole
                    );
                    if (peerPresenter) role.classList.add('presenter-role-active');
                    const item = this.createDropdownItem(
                        role,
                        peerPresenter ? 'Remove presenter role' : 'Set as presenter',
                        eVc
                    );
                    eVc.insertBefore(item, eVc.firstChild);
                    this.handleRole(role.id, remotePeerId, peerPresenter);
                }
            );
            this.reconcilePresenterMenuItem(
                eVc,
                `${prefix}geoLocation`,
                canModerate && BUTTONS.consumerVideo.geolocationButton,
                () => {
                    const gl = this.createButton(`${prefix}geoLocation`, html.geolocation);
                    eVc.appendChild(this.createDropdownItem(gl, 'Geo Location', eVc));
                    this.handleGL(gl.id, remotePeerId);
                }
            );
            this.reconcilePresenterMenuItem(eVc, `${prefix}ban`, canModerate && BUTTONS.consumerVideo.banButton, () => {
                const ban = this.createButton(`${prefix}ban`, html.ban);
                eVc.appendChild(this.createDropdownItem(ban, 'Ban', eVc, 'red'));
                this.handleBAN(ban.id, remotePeerId);
            });
            this.reconcilePresenterMenuItem(
                eVc,
                `${prefix}kickOut`,
                canModerate && BUTTONS.consumerVideo.ejectButton,
                () => {
                    const ko = this.createButton(`${prefix}kickOut`, html.kickOut);
                    eVc.appendChild(this.createDropdownItem(ko, 'Kick Out', eVc, 'red'));
                    this.handleKO(ko.id, remotePeerId);
                }
            );
        });

        // Remote video-off tiles: moderation controls live in the dropdown
        this.videoMediaContainer.querySelectorAll('.Camera[id$="__videoOff"]').forEach((tile) => {
            const peerId = tile.dataset.peerId;
            if (!peerId || peerId === this.peer_id) return;

            const vb = this.getId(peerId + '__vb');
            if (!vb) return;
            const expandBtn = vb.querySelector('[id$="_expandBtn"]');
            const eVc = expandBtn ? expandBtn._dropdownContent : null;
            if (!eVc) return;

            const peerPresenter = !!this.peers.get(peerId)?.peer_info?.peer_presenter;
            const prefix = `remotePeer___${peerId}___`;

            this.reconcilePresenterMenuItem(
                eVc,
                `${prefix}kickOut`,
                canModerate && BUTTONS.videoOff.ejectButton,
                () => {
                    const ko = this.createButton(`${prefix}kickOut`, html.kickOut);
                    eVc.appendChild(this.createDropdownItem(ko, 'Kick Out', eVc, 'red'));
                    this.handleKO(ko.id, peerId);
                }
            );
            this.reconcilePresenterMenuItem(eVc, `${prefix}ban`, canModerate && BUTTONS.videoOff.banButton, () => {
                const ban = this.createButton(`${prefix}ban`, html.ban);
                eVc.appendChild(this.createDropdownItem(ban, 'Ban', eVc, 'red'));
                this.handleBAN(ban.id, peerId);
            });
            this.reconcilePresenterMenuItem(
                eVc,
                `${prefix}role`,
                canModerate && BUTTONS.videoOff.presenterRoleButton,
                () => {
                    const role = this.createButton(
                        `${prefix}role`,
                        peerPresenter ? html.presenterRoleRemove : html.presenterRole
                    );
                    if (peerPresenter) role.classList.add('presenter-role-active');
                    const item = this.createDropdownItem(
                        role,
                        peerPresenter ? 'Remove presenter role' : 'Set as presenter',
                        eVc
                    );
                    eVc.insertBefore(item, eVc.firstChild);
                    this.handleRole(role.id, peerId, peerPresenter);
                }
            );
            this.reconcilePresenterMenuItem(
                eVc,
                `${prefix}geoLocation`,
                canModerate && BUTTONS.videoOff.geolocationButton,
                () => {
                    const gl = this.createButton(`${prefix}geoLocation`, html.geolocation);
                    eVc.appendChild(this.createDropdownItem(gl, 'Geo Location', eVc));
                    this.handleGL(gl.id, peerId);
                }
            );
        });
    }

    // ####################################################
    // HANDLE VIDEO
    // ###################################################

    toggleFocusMode(videoContainerId, btnHa = null) {
        const videoContainer = this.getId(videoContainerId);
        isHideALLVideosActive = !isHideALLVideosActive;
        if (btnHa) btnHa.style.color = isHideALLVideosActive ? 'lime' : 'white';
        if (isHideALLVideosActive) {
            videoContainer.style.width = '100%';
            videoContainer.style.height = '100%';
            videoContainer.setAttribute('focus-mode', 'true');
        } else {
            videoContainer.removeAttribute('focus-mode');
        }
        const children = this.videoMediaContainer.children;
        for (let child of children) {
            if (child.id != videoContainerId) {
                child.style.display = isHideALLVideosActive ? 'none' : 'block';
            }
        }
        // Recompute the grid AFTER visibility changes so feeds lay out immediately
        // instead of only after a manual window resize.
        if (!isHideALLVideosActive) {
            typeof applyParticipantGridVisibility === 'function'
                ? applyParticipantGridVisibility()
                : resizeVideoMedia();
        }
        if (this.isFollowMeActive && isPresenter && !this.isApplyingDominantSpeaker) {
            const videoEl = videoContainer ? videoContainer.querySelector('video[name]') : null;
            const peerId = videoEl ? videoEl.getAttribute('name') : null;
            if (peerId) {
                this.emitFollowMe({ action: isHideALLVideosActive ? 'focus' : 'unfocus', peerId: peerId });
            }
        }
    }

    clearVideoFocusMode() {
        if (!isHideALLVideosActive) return;
        const focused = this.videoMediaContainer.querySelector('[focus-mode]');
        if (!focused) return;

        const focusButtonId = focused.id.replace(/__video$/, '__hideALL');
        this.toggleFocusMode(focused.id, this.getId(focusButtonId));

        if (this._dominantSpeakerState?.timeout) clearTimeout(this._dominantSpeakerState.timeout);
        if (this._dominantSpeakerState) {
            this._dominantSpeakerState.timeout = null;
            this._dominantSpeakerState.prevMediaElementId = null;
        }
    }

    handleHA(uid, videoContainerId) {
        let btnHa = this.getId(uid);
        if (btnHa) {
            btnHa.addEventListener('click', (e) => {
                this.toggleFocusMode(videoContainerId, btnHa);
            });
        }
    }

    handleHFG(uid, peerId) {
        const btnHfg = this.getId(uid);
        if (btnHfg) {
            btnHfg.addEventListener('click', () => {
                if (typeof toggleParticipantGridVisibility === 'function') toggleParticipantGridVisibility(peerId);
            });
        }
    }

    handleCM(uid, peer_id) {
        let btnCm = this.getId(uid);
        if (btnCm) {
            btnCm.addEventListener('click', (e) => {
                if (e.target.className === html.videoOn) {
                    isPresenter
                        ? this.peerAction('me', peer_id, 'hide')
                        : this.userLog('warning', 'Only the presenter can hide the participants', 'top-end');
                } else {
                    isPresenter
                        ? this.peerAction('me', peer_id, 'unhide')
                        : this.userLog('warning', 'Only the presenter can unhide the participants', 'top-end');
                }
            });
        }
    }

    // ####################################################
    // HANDLE AUDIO
    // ###################################################

    handleAU(uid, peer_id) {
        let btnAU = this.getId(uid);
        if (btnAU) {
            btnAU.addEventListener('click', (e) => {
                if (e.target.className === html.audioOn) {
                    isPresenter
                        ? this.peerAction('me', peer_id, 'mute')
                        : this.userLog('warning', 'Only the presenter can mute the participants', 'top-end');
                } else {
                    isPresenter
                        ? this.peerAction('me', peer_id, 'unmute')
                        : this.userLog('warning', 'Only the presenter can unmute the participants', 'top-end');
                }
            });
        }
    }

    // ####################################################
    // HANDLE COMMANDS
    // ####################################################

    emitCmd(cmd) {
        this.socket.emit('cmd', cmd);
    }

    handleCmd(cmd) {
        switch (cmd.type) {
            case 'privacy':
                this.setVideoPrivacyStatus(cmd.peer_id, cmd.active);
                break;

            case 'geoLocation':
            case 'geoLocationOK':
            case 'geoLocationKO':
                break;
            case 'ejectAll':
                this.handleEjectAllFromRoom(cmd);
                break;
            default:
                break;
            //...
        }
    }

    handleEjectAllFromRoom(cmd) {
        if (typeof preventExit !== 'undefined') preventExit = false;
        if (cmd.redirect && this.isSafeRedirectURL(cmd.redirect)) return openURL(cmd.redirect);
        // Detach disconnect / reconnect handlers BEFORE exiting.
        if (this.socket) {
            this.socket.off('disconnect');
            this.socket.off('connect_error');
            if (this.socket.io) {
                this.socket.io.off('reconnect_attempt');
                this.socket.io.off('reconnect');
                this.socket.io.off('reconnect_failed');
            }
        }
        if (typeof leaveRoom === 'function') {
            leaveRoom(false);
        } else {
            this.exit();
        }
    }

    // ####################################################
    // PEER ACTION
    // ####################################################

    async peerAction(from_peer_name, id, action, emit = true, broadcast = false, info = true, msg = '') {
        const peer_id = id;

        if (emit) {
            // send...
            const data = {
                from_peer_name: this.peer_name,
                from_peer_id: this.peer_id,
                from_peer_uuid: this.peer_uuid,
                to_peer_uuid: '',
                peer_id: peer_id,
                action: action,
                message: '',
                broadcast: broadcast,
            };
            console.log('peerAction', data);

            if (!this.thereAreParticipants()) {
                if (info) return this.userLog('info', 'No participants detected', 'top-end');
            }
            if (!broadcast) {
                switch (action) {
                    case 'mute':
                        const audioMessage =
                            'The participant has been muted, and only they have the ability to unmute themselves';
                        {
                            const peerAudioStatus = this.getId(data.peer_id + '__audio');
                            if (!peerAudioStatus || peerAudioStatus.className == html.audioOff) {
                                if (isRulesActive && isPresenter) {
                                    data.action = 'unmute';
                                    return this.confirmPeerAction(data.action, data);
                                }
                                return this.userLog('info', audioMessage, 'top-end');
                            }
                        }
                        break;
                    case 'hide':
                        const videoMessage =
                            'The participant is currently hidden, and only they have the option to unhide themselves';
                        {
                            const peerVideoOff = this.getId(data.peer_id + '__videoOff');
                            if (peerVideoOff) {
                                if (isRulesActive && isPresenter) {
                                    data.action = 'unhide';
                                    return this.confirmPeerAction(data.action, data);
                                }
                                return this.userLog('info', videoMessage, 'top-end');
                            }
                        }
                    case 'stop':
                        const screenMessage =
                            'The participant screen is not shared, only the participant can initiate sharing';
                        const peerScreenButton =
                            this.getId(peer_id + '___pScreenStop') || this.getId(peer_id + '___pScreen');
                        if (peerScreenButton) {
                            const peerScreenStatus = peerScreenButton.querySelector('i');
                            if (peerScreenStatus && peerScreenStatus.classList.contains('red')) {
                                if (isRulesActive && isPresenter) {
                                    data.action = 'start';
                                    return this.confirmPeerAction(data.action, data);
                                }
                                return this.userLog('info', screenMessage, 'top-end');
                            }
                        }
                        break;
                    case 'ban':
                        if (!isRulesActive || isPresenter) {
                            const peer_info = await getRemotePeerInfo(peer_id);
                            console.log('BAN PEER', peer_info);
                            if (peer_info) {
                                data.to_peer_uuid = peer_info.peer_uuid;
                                return this.confirmPeerAction(data.action, data);
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
            this.confirmPeerAction(data.action, data);
        } else {
            // receive...
            const peerActionAllowed = peer_id === this.peer_id || broadcast;
            switch (action) {
                case 'ban':
                    if (peerActionAllowed) {
                        const message = `Will ban you from the room${
                            msg
                                ? `<br><br><span class="red"><span>Reason:</span> <span class="notranslate">${msg}</span></span>`
                                : ''
                        }`;
                        this.exit(true);
                        this.sound(action);
                        this.peerActionProgress(from_peer_name, message, 5000, action);
                    }
                    break;
                case 'eject':
                    if (peerActionAllowed) {
                        const message = `Will eject you from the room${
                            msg
                                ? `<br><br><span class="red"><span>Reason:</span> <span class="notranslate">${msg}</span></span>`
                                : ''
                        }`;
                        this.exit(true);
                        this.sound(action);
                        this.peerActionProgress(from_peer_name, message, 5000, action);
                    }
                    break;
                case 'mute':
                    if (peerActionAllowed) {
                        if (this.producerExist(mediaType.audio)) {
                            await this.pauseProducer(mediaType.audio);
                            this.updatePeerInfo(this.peer_name, this.peer_id, 'audio', false);
                            this.userLog(
                                'warning',
                                from_peer_name + '  ' + _PEER.audioOff + ' has closed yours audio',
                                'top-end',
                                10000
                            );
                        }
                    }
                    break;
                case 'unmute':
                    if (peerActionAllowed) {
                        this.peerMediaStartConfirm(
                            mediaType.audio,
                            image.unmute,
                            'Enable Microphone',
                            'Allow the presenter to enable your microphone?'
                        );
                    }
                    break;
                case 'hide':
                    if (peerActionAllowed) {
                        this.closeProducer(mediaType.video, 'moderator');
                        this.userLog(
                            'warning',
                            from_peer_name + '  ' + _PEER.videoOff + ' has closed yours video',
                            'top-end',
                            10000
                        );
                    }
                    break;
                case 'unhide':
                    if (peerActionAllowed) {
                        this.peerMediaStartConfirm(
                            mediaType.video,
                            image.unhide,
                            'Enable Camera',
                            'Allow the presenter to enable your camera?'
                        );
                    }
                    break;
                case 'stop':
                    if (this.isScreenShareSupported) {
                        if (peerActionAllowed) {
                            this.closeProducer(mediaType.screen, 'moderator');
                            this.userLog(
                                'warning',
                                from_peer_name + '  ' + _PEER.screenOff + ' has closed yours screen share',
                                'top-end',
                                10000
                            );
                        }
                    }
                    break;
                case 'start':
                    if (peerActionAllowed) {
                        this.peerMediaStartConfirm(
                            mediaType.screen,
                            image.start,
                            'Start Screen share',
                            'Allow the presenter to start your screen share?'
                        );
                    }
                    break;
                default:
                    break;
                //...
            }
        }
    }

    peerMediaStartConfirm(type, imageUrl, title, text) {
        sound('notify');
        Swal.fire({
            background: swalBackground,
            position: 'center',
            imageUrl: imageUrl,
            title: title,
            text: text,
            showDenyButton: true,
            confirmButtonText: `Yes`,
            denyButtonText: `No`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then(async (result) => {
            if (result.isConfirmed) {
                switch (type) {
                    case mediaType.audio:
                        this.producerExist(mediaType.audio)
                            ? await this.resumeProducer(mediaType.audio)
                            : await this.produce(mediaType.audio, microphoneSelect.value);
                        this.updatePeerInfo(this.peer_name, this.peer_id, 'audio', true);
                        break;
                    case mediaType.video:
                        await this.produce(mediaType.video, videoSelect.value);
                        break;
                    case mediaType.screen:
                        await this.produce(mediaType.screen);
                        break;
                    default:
                        break;
                }
            }
        });
    }

    peerActionProgress(tt, msg, time, action = 'na') {
        Swal.fire({
            allowOutsideClick: false,
            background: swalBackground,
            icon: action == 'eject' ? 'warning' : 'success',
            title: tt,
            html: msg,
            timer: time,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            },
        }).then(() => {
            switch (action) {
                case 'refresh':
                    getRoomParticipants();
                    break;
                case 'ban':
                case 'eject':
                    this.exit();
                    break;
                default:
                    break;
            }
        });
    }

    /** Ask for confirmation before applying participant moderation, preserving recipient consent for media starts. */
    confirmPeerAction(action, data) {
        console.log('Confirm peer action', action);
        switch (action) {
            case 'ban':
                let banConfirmed = false;
                Swal.fire({
                    background: swalBackground,
                    position: 'center',
                    imageUrl: image.forbidden,
                    title: 'Ban current participant',
                    input: 'text',
                    inputPlaceholder: 'Ban reason',
                    showDenyButton: true,
                    confirmButtonText: `Yes`,
                    denyButtonText: `No`,
                    showClass: { popup: 'animate__animated animate__fadeInDown' },
                    hideClass: { popup: 'animate__animated animate__fadeOutUp' },
                })
                    .then((result) => {
                        if (result.isConfirmed) {
                            banConfirmed = true;
                            const message = result.value;
                            if (message) data.message = message;
                            this.socket.emit('peerAction', data);
                            let peer = this.getId(data.peer_id);
                            if (peer) {
                                peer.parentNode.removeChild(peer);
                                participantsCount--;
                                refreshParticipantsCount(participantsCount);
                            }
                        }
                    })
                    .then(() => {
                        if (banConfirmed) this.peerActionProgress(action, 'In progress, wait...', 6000, 'refresh');
                    });
                break;
            case 'eject':
                let ejectConfirmed = false;
                Swal.fire({
                    background: swalBackground,
                    position: 'center',
                    imageUrl: data.broadcast ? image.users : image.user,
                    title: data.broadcast ? 'Eject all other participants?' : 'Eject current participant?',
                    input: 'text',
                    inputPlaceholder: 'Eject reason',
                    showDenyButton: true,
                    confirmButtonText: `Yes`,
                    denyButtonText: `No`,
                    showClass: { popup: 'animate__animated animate__fadeInDown' },
                    hideClass: { popup: 'animate__animated animate__fadeOutUp' },
                })
                    .then((result) => {
                        if (result.isConfirmed) {
                            ejectConfirmed = true;
                            const message = result.value;
                            if (message) data.message = message;
                            if (!data.broadcast) {
                                this.socket.emit('peerAction', data);
                                let peer = this.getId(data.peer_id);
                                if (peer) {
                                    peer.parentNode.removeChild(peer);
                                    participantsCount--;
                                    refreshParticipantsCount(participantsCount);
                                }
                            } else {
                                this.socket.emit('peerAction', data);
                                let actionButton = this.getId(action + 'AllButton');
                                if (actionButton) actionButton.style.display = 'none';
                                participantsCount = 1;
                                refreshParticipantsCount(participantsCount);
                            }
                        }
                    })
                    .then(() => {
                        if (ejectConfirmed) this.peerActionProgress(action, 'In progress, wait...', 6000, 'refresh');
                    });
                break;
            case 'mute':
            case 'unmute':
            case 'hide':
            case 'unhide':
            case 'stop':
            case 'start':
                let muteHideStopConfirmed = false;
                let imageUrl, title, text;
                switch (action) {
                    case 'mute':
                        imageUrl = image.mute;
                        title = data.broadcast ? 'Mute all other participants?' : 'Mute current participant?';
                        text =
                            'Once muted, only the presenter will be able to unmute participants, but participants can unmute themselves at any time';
                        break;
                    case 'unmute':
                        imageUrl = image.unmute;
                        title = data.broadcast ? 'Unmute all other participants?' : 'Unmute current participant?';
                        text = 'A pop-up message will appear to prompt and allow this action.';
                        break;
                    case 'hide':
                        title = data.broadcast ? 'Hide all other participants?' : 'Hide current participant?';
                        imageUrl = image.hide;
                        text =
                            'Once hidden, only the presenter will be able to unhide participants, but participants can unhide themselves at any time';
                        break;
                    case 'unhide':
                        title = data.broadcast ? 'Unhide all other participants?' : 'Unhide current participant?';
                        imageUrl = image.unhide;
                        text = 'A pop-up message will appear to prompt and allow this action.';
                        break;
                    case 'stop':
                        imageUrl = image.stop;
                        title = data.broadcast
                            ? 'Stop screen sharing for all other participants?'
                            : 'Stop current participant screen sharing?';
                        text =
                            "Once stopped, only the presenter will be able to start the participants' screens, but participants can start their screens themselves at any time";
                        break;
                    case 'start':
                        imageUrl = image.start;
                        title = data.broadcast
                            ? 'Start screen sharing for all other participants?'
                            : 'Start current participant screen sharing?';
                        text = 'A pop-up message will appear to prompt and allow this action.';
                        break;
                    default:
                        break;
                }
                Swal.fire({
                    background: swalBackground,
                    position: 'center',
                    imageUrl: imageUrl,
                    title: title,
                    text: text,
                    showDenyButton: true,
                    confirmButtonText: `Yes`,
                    denyButtonText: `No`,
                    showClass: { popup: 'animate__animated animate__fadeInDown' },
                    hideClass: { popup: 'animate__animated animate__fadeOutUp' },
                })
                    .then((result) => {
                        if (result.isConfirmed) {
                            muteHideStopConfirmed = true;
                            if (!data.broadcast) {
                                switch (action) {
                                    case 'mute':
                                        let peerAudioButton = this.getId(data.peer_id + '___pAudio');
                                        if (peerAudioButton) peerAudioButton.innerHTML = _PEER.audioOff;
                                        break;
                                    case 'hide':
                                        let peerVideoButton = this.getId(data.peer_id + '___pVideo');
                                        if (peerVideoButton) peerVideoButton.innerHTML = _PEER.videoOff;
                                        break;
                                    case 'stop':
                                        let peerScreenButton = this.getId(data.peer_id + '___pScreen');
                                        if (peerScreenButton) peerScreenButton.innerHTML = _PEER.screenOff;
                                        break;
                                    default:
                                        break;
                                }
                                this.socket.emit('peerAction', data);
                            } else {
                                this.socket.emit('peerAction', data);
                                let actionButton = this.getId(action + 'AllButton');
                                if (actionButton) actionButton.style.display = 'none';
                            }
                        }
                    })
                    .then(() => {
                        if (muteHideStopConfirmed)
                            this.peerActionProgress(action, 'In progress, wait...', 2000, 'refresh');
                    });
                break;
            default:
                break;
            //...
        }
    }

    peerGuestNotAllowed(action) {
        console.log('peerGuestNotAllowed', action);
        switch (action) {
            case 'audio':
                this.userLog('warning', 'Only the presenter can mute/unmute participants', 'top-end');
                break;
            case 'video':
                this.userLog('warning', 'Only the presenter can hide/show participants', 'top-end');
                break;
            case 'screen':
                this.userLog('warning', 'Only the presenter can start/stop the screen of participants', 'top-end');
                break;
            default:
                break;
        }
    }

    // ####################################################
    // SEARCH PEER FILTER
    // ####################################################

    searchPeer() {
        const searchParticipantsFromList = this.getId('searchParticipantsFromList');
        const searchFilter = (searchParticipantsFromList?.value || '').toUpperCase();
        const participantsList = this.getId('participantsList');
        const participantsListItems = Array.from(participantsList?.children || []).filter(
            (item) => item.tagName === 'LI'
        );

        for (const li of participantsListItems) {
            const participantName = (
                li.getAttribute('data-to-name') ||
                li.querySelector('.name')?.textContent ||
                ''
            ).toUpperCase();
            const shouldDisplay = participantName.includes(searchFilter);
            li.style.display = shouldDisplay ? '' : 'none';
        }
    }

    // ####################################################
    // FILTER PEER WITH RAISE HAND
    // ####################################################

    toggleRaiseHands() {
        const participantsList = this.getId('participantsList');
        const participantsListItems = participantsList.getElementsByTagName('li');

        for (let i = 0; i < participantsListItems.length; i++) {
            const li = participantsListItems[i];
            const hasPulsateClass = li.querySelector('i.pulsate') !== null;
            const shouldDisplay = (hasPulsateClass && !this.isToggleRaiseHand) || this.isToggleRaiseHand;
            li.style.display = shouldDisplay ? '' : 'none';
        }
        this.isToggleRaiseHand = !this.isToggleRaiseHand;
        setColor(participantsRaiseHandBtn, this.isToggleRaiseHand ? '#FFD700' : 'white');
    }

    // ####################################################
    // FILTER PEER WITH UNREAD MESSAGES
    // ####################################################

    toggleUnreadMsg() {
        const participantsList = this.getId('participantsList');
        const participantsListItems = participantsList.getElementsByTagName('li');

        for (let i = 0; i < participantsListItems.length; i++) {
            const li = participantsListItems[i];
            const shouldDisplay =
                (li.classList.contains('pulsate') && !this.isToggleUnreadMsg) || this.isToggleUnreadMsg;
            li.style.display = shouldDisplay ? '' : 'none';
        }
        this.isToggleUnreadMsg = !this.isToggleUnreadMsg;
        setColor(participantsUnreadMessagesBtn, this.isToggleUnreadMsg ? 'lime' : 'white');
    }

    // ####################################################
    // SHOW PEER ABOUT AND MESSAGES
    // ####################################################

    showPeerAboutAndMessages(peer_id, peer_name, peer_avatar = false, event = null) {
        // Early moderator guards: refuse to switch (and to mutate any state) when the
        // requested chat is currently blocked by the moderator.
        if (peer_id === 'ChatGPT' && this._moderator.chat_cant_chatgpt) {
            return userLog('warning', 'The moderator does not allow you to chat with ChatGPT', 'top-end', 6000);
        }
        if (peer_id === 'DeepSeek' && this._moderator.chat_cant_deep_seek) {
            return userLog('warning', 'The moderator does not allow you to chat with DeepSeek', 'top-end', 6000);
        }
        if (peer_id === 'all' && this._moderator.chat_cant_publicly) {
            return userLog('warning', 'The moderator does not allow you to chat publicly', 'top-end', 6000);
        }
        if (!['all', 'ChatGPT', 'DeepSeek'].includes(peer_id) && this._moderator.chat_cant_privately) {
            return userLog('warning', 'The moderator does not allow you to chat privately', 'top-end', 6000);
        }

        this.hidePeerMessages();

        this.chatPeerId = peer_id;
        this.chatPeerName = peer_name;
        this.chatPeerAvatar = peer_avatar;

        const chatAbout = this.getId('chatAbout');
        const participant = this.getId(peer_id);
        const participantsList = this.getId('participantsList');
        const chatPrivateMessages = this.getId('chatPrivateMessages');
        const messagePrivateListItems = chatPrivateMessages.getElementsByTagName('li');
        const participantsListItems = participantsList.getElementsByTagName('li');
        const avatarImg = getParticipantAvatar(peer_name, peer_avatar);

        const generateChatAboutHTML = (imgSrc, title, status = 'online', participants = '', category = '') => {
            const isSensitiveChat = !['all', 'ChatGPT', 'DeepSeek'].includes(peer_id) && title.length > 15;
            const truncatedTitle = isSensitiveChat ? `${title.substring(0, 10)}*****` : title;
            const categoryHTML = category ? `<span class="chat-header-category">${category}</span>` : '';
            const statusText =
                category === 'AI ASSISTANT'
                    ? 'Assistant replies are visible only to you'
                    : peer_id === 'all'
                      ? (window.i18n?.t('Everyone in room {count}', 'labels') || 'Everyone in room {count}').replace(
                            '{count}',
                            participants
                        )
                      : `${status}`;
            return `
                <a data-toggle="modal" data-target="#view_info">
                    <img src="${imgSrc}" alt="avatar" />
                </a>
                <div class="chat-about">
                    ${categoryHTML}
                    <h6 class="mb-0">${truncatedTitle}</h6>
                    <span class="status">
                        ${icons.statusCircle(status)} ${statusText}
                    </span>
                </div>
            `;
        };

        // CURRENT SELECTED PEER
        for (let i = 0; i < participantsListItems.length; i++) {
            participantsListItems[i].classList.remove('active');
        }

        // Clear pulsate and unread indicators for selected peer
        const selectedLi = this.getId(peer_id);
        if (selectedLi) selectedLi.classList.remove('pulsate');

        if (!['all', 'ChatGPT', 'DeepSeek'].includes(peer_id)) {
            // unread-count badge cleared by updateUnreadCountBadge below
        }

        // Clear unread count badge for selected peer
        this.unreadMessageCounts[peer_id] = 0;
        this.updateUnreadCountBadge(peer_id);

        participant.classList.add('active');

        isChatGPTOn = false;
        isDeepSeekOn = false;

        console.log('Display messages', peer_id);

        switch (peer_id) {
            case 'ChatGPT':
                if (this._moderator.chat_cant_chatgpt) {
                    return userLog('warning', 'The moderator does not allow you to chat with ChatGPT', 'top-end', 6000);
                }
                isChatGPTOn = true;
                chatAbout.innerHTML = generateChatAboutHTML(image.chatgpt, 'ChatGPT', 'online', '', 'AI ASSISTANT');
                this.getId('chatGPTMessages').style.display = 'block';
                break;
            case 'DeepSeek':
                if (this._moderator.chat_cant_deep_seek) {
                    return userLog(
                        'warning',
                        'The moderator does not allow you to chat with DeepSeek',
                        'top-end',
                        6000
                    );
                }
                isDeepSeekOn = true;
                chatAbout.innerHTML = generateChatAboutHTML(image.deepSeek, 'DeepSeek', 'online', '', 'AI ASSISTANT');
                this.getId('deepSeekMessages').style.display = 'block';
                break;
            case 'all':
                if (this._moderator.chat_cant_publicly) {
                    return userLog('warning', 'The moderator does not allow you to chat publicly', 'top-end', 6000);
                }
                chatAbout.innerHTML = generateChatAboutHTML(image.all, 'Public chat', 'online', participantsCount);
                this.getId('chatPublicMessages').style.display = 'block';
                break;
            default:
                if (this._moderator.chat_cant_privately) {
                    return userLog('warning', 'The moderator does not allow you to chat privately', 'top-end', 6000);
                }
                chatAbout.innerHTML = generateChatAboutHTML(avatarImg, peer_name);
                chatPrivateMessages.style.display = 'block';
                for (let i = 0; i < messagePrivateListItems.length; i++) {
                    const li = messagePrivateListItems[i];
                    const itemFromId = li.getAttribute('data-from-id');
                    const itemToId = li.getAttribute('data-to-id');
                    const shouldDisplay =
                        (itemFromId && itemFromId.includes(peer_id)) || (itemToId && itemToId.includes(peer_id));
                    li.style.display = shouldDisplay ? '' : 'none';
                }
                break;
        }

        // Update placeholder, and empty notice
        const displayName = peer_id === 'all' ? 'Public chat' : peer_name;

        // Native (human) translation for dynamically-set strings; falls back to English when inactive.
        const t = (s) => (window.i18n && typeof window.i18n.t === 'function' ? window.i18n.t(s, 'labels') : s);

        const chatMsg = this.getId('chatMessage');
        if (chatMsg) {
            const isAI = ['ChatGPT', 'DeepSeek'].includes(peer_id);
            chatMsg.placeholder = isAI ? `Ask ${peer_name} anything...` : t('Type a message...');
        }

        const emptyTitle = document.querySelector('.empty-chat-title');
        if (emptyTitle) {
            emptyTitle.textContent =
                peer_id === 'all' ? t('Start with Public chat') : t('Start with {name}').replace('{name}', displayName);
        }

        const clickedElement = event ? event.target : null;
        if (!event || (clickedElement.tagName != 'BUTTON' && clickedElement.tagName != 'I')) {
            if ((this.isMobileDevice || this.isChatPinned) && (!plist || !plist.classList.contains('hidden'))) {
                this.toggleShowParticipants();
            }
        }
    }

    hidePeerMessages() {
        elemDisplay('chatGPTMessages', false);
        elemDisplay('deepSeekMessages', false);
        elemDisplay('chatPublicMessages', false);
        elemDisplay('chatPrivateMessages', false);
    }

    // ####################################################
    // UPDATE ROOM MODERATOR
    // ####################################################

    updateRoomModerator(data) {
        if (!isRulesActive || isPresenter) {
            const moderator = this.getModeratorData(data);
            this.socket.emit('updateRoomModerator', moderator);
        }
    }

    updateRoomModeratorALL(data) {
        if (!isRulesActive || isPresenter) {
            const moderator = this.getModeratorData(data);
            this.socket.emit('updateRoomModeratorALL', moderator);
        }
    }

    getModeratorData(data) {
        return {
            peer_name: this.peer_name,
            peer_uuid: this.peer_uuid,
            moderator: data,
        };
    }

    handleUpdateRoomModerator(data) {
        switch (data.type) {
            case 'video_start_privacy':
                // Policy flag only: never applies privacy to an already-joined peer
                this._moderator.video_start_privacy = data.status;
                if (isPresenter) rc.roomMessage('video_start_privacy', data.status);
                break;
            case 'audio_start_muted':
                this._moderator.audio_start_muted = data.status;
                if (isPresenter) rc.roomMessage('audio_start_muted', data.status);
                break;
            case 'video_start_hidden':
                this._moderator.video_start_hidden = data.status;
                if (isPresenter) rc.roomMessage('video_start_hidden', data.status);
                break;
            case 'audio_cant_unmute':
                this._moderator.audio_cant_unmute = data.status;
                this._moderator.audio_cant_unmute ? hide(tabAudioDevicesBtn) : show(tabAudioDevicesBtn);
                rc.roomMessage('audio_cant_unmute', data.status);
                break;
            case 'video_cant_unhide':
                this._moderator.video_cant_unhide = data.status;
                this._moderator.video_cant_unhide ? hide(tabVideoDevicesBtn) : show(tabVideoDevicesBtn);
                if (this._moderator.video_cant_unhide) hide(tabVirtualBackgroundBtn);
                rc.roomMessage('video_cant_unhide', data.status);
                break;
            case 'screen_cant_share':
                this._moderator.screen_cant_share = data.status;
                rc.roomMessage('screen_cant_share', data.status);
                break;
            case 'chat_cant_privately':
                this._moderator.chat_cant_privately = data.status;
                rc.roomMessage('chat_cant_privately', data.status);
                break;
            case 'chat_cant_publicly':
                this._moderator.chat_cant_publicly = data.status;
                rc.roomMessage('chat_cant_publicly', data.status);
                break;
            case 'chat_cant_chatgpt':
                this._moderator.chat_cant_chatgpt = data.status;
                rc.roomMessage('chat_cant_chatgpt', data.status);
                break;

            default:
                break;
        }
        // Keep this peer's moderator panel in sync when another presenter changes a rule
        if (typeof updateModeratorSwitchUI === 'function') updateModeratorSwitchUI(data.type, data.status);
    }

    handleUpdateRoomModeratorALL(data) {
        this._moderator = data;
        console.log('Update Room Moderator data all', this._moderator);
        // Reflect the full moderator state on the switches so every presenter stays aligned
        if (typeof loadModeratorDataFromRoom === 'function') loadModeratorDataFromRoom();
    }

    getModerator() {
        console.log('Get Moderator', this._moderator);
        return this._moderator;
    }

    // ####################################################
    // FOLLOW ME
    // ####################################################

    applyPendingFollowMe() {
        if (!this._pendingFollowMe) return;
        const { peerId, action } = this._pendingFollowMe;
        this._pendingFollowMe = null;

        this.userLog('info', `${icons.moderator} Moderator has Everyone Follows Me enabled`, 'top-end');

        if (peerId && action) {
            setTimeout(() => {
                if (action === 'pin') {
                    this.followMePin(peerId);
                } else if (action === 'focus') {
                    this.followMeFocus(peerId);
                }
            }, 1000);
        }
    }

    handleFollowMeData = (data) => {
        console.log('SocketOn Follow me', data);
        this.handleFollowMe(data);
    };

    toggleFollowMe(enabled) {
        this.isFollowMeActive = enabled;
        this.emitFollowMe({ action: 'toggle', status: enabled });
        if (enabled) {
            if (this.isVideoPinned && this.pinnedVideoPlayerId) {
                const videoEl = this.getId(this.pinnedVideoPlayerId);
                const peerId = videoEl ? videoEl.getAttribute('name') : null;
                if (peerId) {
                    this.emitFollowMe({ action: 'pin', peerId: peerId });
                }
            }
            if (isHideALLVideosActive) {
                const focused = this.videoMediaContainer.querySelector('[focus-mode]');
                if (focused) {
                    const focusedVideo = focused.querySelector('video[name]');
                    const peerId = focusedVideo ? focusedVideo.getAttribute('name') : null;
                    if (peerId) {
                        this.emitFollowMe({ action: 'focus', peerId: peerId });
                    }
                }
            }
        }
        if (!enabled) {
            this.emitFollowMe({ action: 'unpin' });
            this.emitFollowMe({ action: 'unfocus' });
        }
    }

    emitFollowMe(data) {
        if (!isPresenter) return;
        this.socket.emit('followMe', {
            peer_name: this.peer_name,
            peer_uuid: this.peer_uuid,
            ...data,
        });
    }

    handleFollowMe(data) {
        if (isPresenter) return;

        switch (data.action) {
            case 'toggle':
                data.status
                    ? this.userLog('info', `${icons.moderator} Moderator enabled: Everyone Follows Me`, 'top-end')
                    : this.userLog('info', `${icons.moderator} Moderator disabled: Everyone Follows Me`, 'top-end');
                break;
            case 'pin':
                this.followMePin(data.peerId);
                break;
            case 'unpin':
                this.followMeUnpin();
                break;
            case 'focus':
                this.followMeFocus(data.peerId);
                break;
            case 'unfocus':
                this.followMeUnfocus(data.peerId);
                break;
            default:
                break;
        }
    }

    followMePin(peerId) {
        if (this.isVideoPinned) {
            this.followMeUnpin();
        }
        const videoEl = this.getVideoElementByPeerId(peerId);
        if (videoEl) {
            const btnPn = this.getId(`${videoEl.id}__pin`);
            if (btnPn) {
                btnPn.click();
                return;
            }
        }
        console.warn('Follow me pin: no video found for peer', peerId);
    }

    followMeUnpin() {
        if (!this.isVideoPinned || !this.pinnedVideoPlayerId) return;
        const btnPn = this.getId(`${this.pinnedVideoPlayerId}__pin`);
        if (btnPn) {
            btnPn.click();
        }
    }

    followMeFocus(peerId) {
        if (isHideALLVideosActive) {
            this.followMeUnfocus();
        }
        const videoEl = this.getVideoElementByPeerId(peerId);
        if (videoEl) {
            const containerId = videoEl.id + '__video';
            const container = this.getId(containerId);
            if (container) {
                this.toggleFocusMode(containerId);
                return;
            }
        }
        console.warn('Follow me focus: no video found for peer', peerId);
    }

    followMeUnfocus(peerId) {
        if (!isHideALLVideosActive) return;
        const focused = this.videoMediaContainer.querySelector('[focus-mode]');
        if (focused) {
            this.toggleFocusMode(focused.id);
        }
    }

    getVideoElementByPeerId(peerId) {
        const videos = document.querySelectorAll('video[name]');
        for (const video of videos) {
            if (video.getAttribute('name') === peerId) return video;
        }
        return null;
    }

    getParticipantMediaElementByPeerId(peerId) {
        return this.getVideoElementByPeerId(peerId) || this.getId(peerId + '__img');
    }

    getAutoPinVideoElement() {
        if (this.isVideoPinned && this.pinnedVideoPlayerId) {
            return this.getId(this.pinnedVideoPlayerId);
        }

        const presenterIds = [];
        if (this.peer_info.peer_presenter) presenterIds.push(this.peer_id);
        for (const peer of this.peers.values()) {
            const peerInfo = peer?.peer_info;
            if (peerInfo?.peer_presenter) presenterIds.push(peerInfo.peer_id);
        }
        for (const presenterId of new Set(presenterIds)) {
            const presenterMediaElement = this.getParticipantMediaElementByPeerId(presenterId);
            if (presenterMediaElement) return presenterMediaElement;
        }

        const dominantMediaElementId = this._dominantSpeakerState?.prevMediaElementId;
        const dominantMediaElement = dominantMediaElementId ? this.getId(dominantMediaElementId) : null;
        if (dominantMediaElement) return dominantMediaElement;

        return Array.from(
            this.videoMediaContainer.querySelectorAll('video[name], [data-camera-off="true"] > img')
        ).find((mediaElement) => this.getId(`${mediaElement.id}__pin`));
    }

    autoPinVideoForLayout() {
        if (this.isVideoPinned) return true;
        const videoEl = this.getAutoPinVideoElement();
        const pinButton = videoEl ? this.getId(`${videoEl.id}__pin`) : null;
        if (!pinButton) return false;
        pinButton.click();
        return this.isVideoPinned;
    }

    // ####################################################
    // PIN PEER FROM PARTICIPANTS LIST
    // ####################################################

    togglePinPeer(peerId) {
        if (this.isMobileDevice) {
            return this.userLog('info', 'Pin video is not supported on mobile devices', 'top-end');
        }

        const videoEl = this.getVideoElementByPeerId(peerId);
        const btnPn = videoEl ? this.getId(`${videoEl.id}__pin`) : null;

        if (!btnPn) {
            return this.userLog('info', 'No video available to pin for this participant', 'top-end');
        }

        // Unpin the currently pinned video, otherwise pinning another one is rejected
        if (this.isVideoPinned && this.pinnedVideoPlayerId !== videoEl.id) {
            const pinnedBtn = this.getId(`${this.pinnedVideoPlayerId}__pin`);
            if (pinnedBtn) pinnedBtn.click();
        }

        btnPn.click();

        if (isParticipantsListOpen) getRoomParticipants();
    }

    // ####################################################
    // UPDATE PEER INFO
    // ####################################################

    updatePeerInfo(peer_name, peer_id, type, status, emit = true, presenter = false) {
        if (emit) {
            switch (type) {
                case 'name': {
                    this.peer_name = status;
                    this.peer_info.peer_name = status;
                    const name = this.getId(peer_id + '__name');
                    if (name)
                        this.setPeerNameWithPresenter(
                            name,
                            this.peer_info.peer_presenter,
                            `${status}${this.meSuffix()}`
                        );
                    break;
                }
                case 'audio':
                    this.setIsAudio(peer_id, status);
                    break;
                case 'video':
                    this.setIsVideo(status);
                    break;
                case 'screen':
                    this.setIsScreen(status);
                    break;
                case 'hand':
                    this.peer_info.peer_hand = status;
                    const peer_hand = this.getPeerHandBtn(peer_id);
                    if (status) {
                        if (peer_hand) peer_hand.style.display = 'inline-flex';
                        this.event(_EVENTS.raiseHand);
                        this.sound('raiseHand');
                    } else {
                        if (peer_hand) peer_hand.style.display = 'none';
                        this.event(_EVENTS.lowerHand);
                    }
                    break;
                case 'avatar':
                    this.peer_avatar = status;
                    this.peer_info.peer_avatar = status;
                    this.setVideoAvatarImgName(peer_id + '__img', peer_name, status);
                    break;
                default:
                    break;
            }
            const data = {
                room_id: this.room_id,
                peer_name: peer_name,
                peer_id: peer_id,
                type: type,
                status: status,
                peer_presenter: this.peer_info.peer_presenter,
                broadcast: true,
            };
            this.socket.emit('updatePeerInfo', data);
        } else {
            const canUpdateMediaStatus = true;
            switch (type) {
                case 'name': {
                    const name = this.getId(peer_id + '__name');
                    if (name) this.setPeerNameWithPresenter(name, presenter, status);
                    break;
                }
                case 'audio':
                    if (canUpdateMediaStatus) this.setPeerAudio(peer_id, status);
                    break;
                case 'video':
                    break;
                case 'screen':
                    break;
                case 'hand':
                    const peer_hand = this.getPeerHandBtn(peer_id);
                    if (status) {
                        if (peer_hand) peer_hand.style.display = 'inline-flex';
                        this.userLog(
                            'warning',
                            peer_name + '  ' + _PEER.raiseHand + ' has raised the hand',
                            'top-end',
                            10000
                        );
                        this.sound('raiseHand');
                    } else {
                        if (peer_hand) peer_hand.style.display = 'none';
                    }
                    break;
                case 'avatar':
                    this.setVideoAvatarImgName(peer_id + '__img', peer_name, status);
                    break;
                default:
                    break;
            }
        }
        if (isParticipantsListOpen) getRoomParticipants();
    }

    checkPeerInfoStatus(peer_info) {
        let peer_id = peer_info.peer_id;
        let peer_hand_status = peer_info.peer_hand;
        if (peer_hand_status) {
            let peer_hand = this.getPeerHandBtn(peer_id);
            if (peer_hand) peer_hand.style.display = 'flex';
        }
        //...
    }

    popupPeerInfo(id, peer_info) {
        if (this.showPeerInfo && !this.isMobileDevice) {
            // Format the peer info into a structured string
            const peerInfoFormatted = this.getPeerUiInfos();

            // Apply the improved Tippy.js tooltip
            this.setTippy(
                id,
                `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">${peerInfoFormatted}</div>`,
                'top-start',
                true
            );
        }
    }

    getPeerUiInfos() {
        // console.log('PEER_INFO', peer_info);
        const {
            join_data_time,
            peer_name,
            peer_presenter,
            is_desktop_device,
            is_mobile_device,
            is_tablet_device,
            is_ipad_pro_device,
            os_name,
            os_version,
            browser_name,
            browser_version,
        } = peer_info;

        const emojiPeerInfo = [
            { label: 'Join Time', value: join_data_time, emoji: '⏰' },
            { label: 'Name', value: peer_name, emoji: '👤' },
            { label: 'Presenter', value: peer_presenter ? 'Yes' : 'No', emoji: peer_presenter ? '⭐' : '🎤' },
            { label: 'Desktop Device', value: is_desktop_device ? 'Yes' : 'No', emoji: '💻' },
            { label: 'Mobile Device', value: is_mobile_device ? 'Yes' : 'No', emoji: '📱' },
            { label: 'Tablet Device', value: is_tablet_device ? 'Yes' : 'No', emoji: '📲' },
            { label: 'iPad Pro', value: is_ipad_pro_device ? 'Yes' : 'No', emoji: '📱' },
            { label: 'OS', value: `${os_name} ${os_version}`, emoji: '🖥️' },
            { label: 'Browser', value: `${browser_name} ${browser_version}`, emoji: '🌐' },
        ];

        // Format the peer info into a structured string
        return emojiPeerInfo.map((item) => `${item.emoji} <b>${item.label}:</b> ${item.value}`).join('<br/>');
    }

    // ####################################################
    // HANDLE PEER GEOLOCATION
    // ####################################################

    askPeerGeoLocation(peer_id) {
        const cmd = {
            type: 'geoLocation',
            from_peer_name: this.peer_name,
            from_peer_id: this.peer_id,
            peer_id: peer_id,
            broadcast: false,
        };
        this.emitCmd(cmd);
        this.peerActionProgress(
            'Geolocation',
            'Geolocation requested. Please wait for confirmation...',
            6000,
            'geolocation'
        );
    }

    sendPeerGeoLocation(peer_id, type, data) {
        const cmd = {
            type: type,
            from_peer_name: this.peer_name,
            from_peer_id: this.peer_id,
            peer_id: peer_id,
            data: data,
            broadcast: false,
        };
        this.emitCmd(cmd);
    }

    confirmPeerGeoLocation(cmd) {
        this.sound('notify');
        Swal.fire({
            allowOutsideClick: false,
            allowEscapeKey: false,
            background: swalBackground,
            imageUrl: image.geolocation,
            position: 'center',
            title: 'Geo Location',
            html: renderRoomTemplate('popupGeoLocationPromptTemplate', {
                text: {
                    message: `Would you like to share your location to ${cmd.from_peer_name}?`,
                },
            }),
            showDenyButton: true,
            confirmButtonText: `Yes`,
            denyButtonText: `No`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then((result) => {
            result.isConfirmed ? this.getPeerGeoLocation(cmd.from_peer_id) : this.denyPeerGeoLocation(cmd.from_peer_id);
        });
    }

    getPeerGeoLocation(peer_id, options = {}) {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const geoLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    console.log('GeoLocation --->', geoLocation);

                    rc.sendPeerGeoLocation(peer_id, 'geoLocationOK', geoLocation);
                    // openURL(`https://www.openstreetmap.org/?mlat=${geoLocation.latitude}&mlon=${geoLocation.longitude}`, true);
                    // openURL(`http://maps.apple.com/?ll=${geoLocation.latitude},${geoLocation.longitude}`, true);
                    // openURL(`https://www.google.com/maps/search/?api=1&query=${geoLocation.latitude},${geoLocation.longitude}`, true);
                },
                function (error) {
                    let geoError = error;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            geoError = 'User denied the request for Geolocation';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            geoError = 'Location information is unavailable';
                            break;
                        case error.TIMEOUT:
                            geoError = 'The request to get user location timed out';
                            break;
                        case error.UNKNOWN_ERROR:
                            geoError = 'An unknown error occurred';
                            break;
                        case 'NOT_SUPPORTED':
                            geoError = 'Geolocation is not supported by this browser';
                            break;
                        default:
                            geoError =
                                'Unable to retrieve your location. Please ensure location services are enabled in your device and browser settings, and try again';
                            break;
                    }
                    // Add suggestion for unknown errors
                    if (
                        error.code === error.UNKNOWN_ERROR ||
                        error.code === undefined ||
                        geoError.startsWith('Unable to retrieve')
                    ) {
                        geoError +=
                            ' If the problem persists, check your device and browser location permissions, and ensure you have a clear view of the sky (for GPS)';
                    }
                    rc.sendPeerGeoLocation(peer_id, 'geoLocationKO', `${rc.peer_name}: ${geoError}`);
                    rc.userLog('warning', geoError, 'top-end', 5000);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                    ...options,
                }
            );
        } else {
            rc.sendPeerGeoLocation(
                peer_id,
                'geoLocationKO',
                `${rc.peer_name}: Geolocation is not supported by this browser`
            );
            rc.userLog('warning', 'Geolocation is not supported by this browser', 'top-end', 5000);
        }
    }

    denyPeerGeoLocation(peer_id) {
        rc.sendPeerGeoLocation(peer_id, 'geoLocationKO', `${rc.peer_name}: Has declined permission for geolocation`);
    }

    handleGeoPeerLocation(cmd) {
        const geoLocation = cmd.data;
        this.sound('notify');
        Swal.fire({
            allowOutsideClick: false,
            allowEscapeKey: false,
            background: swalBackground,
            imageUrl: image.geolocation,
            position: 'center',
            title: 'Geo Location',
            html: renderRoomTemplate('popupGeoLocationPromptTemplate', {
                text: {
                    message: `Would you like to open ${cmd.from_peer_name} geolocation?`,
                },
            }),
            showDenyButton: true,
            confirmButtonText: `Yes`,
            denyButtonText: `No`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then((result) => {
            if (result.isConfirmed) {
                // openURL(`https://www.openstreetmap.org/?mlat=${geoLocation.latitude}&mlon=${geoLocation.longitude}`, true);
                // openURL(`http://maps.apple.com/?ll=${geoLocation.latitude},${geoLocation.longitude}`, true);
                openURL(
                    `https://www.google.com/maps/search/?api=1&query=${geoLocation.latitude},${geoLocation.longitude}`,
                    true
                );
            }
        });
    }

    // ##############################################

    // ##############################################

    // ##############################################

    // ##############################################

    // ##############################################

    // ##############################################

    // ##############################################

    // ##############################################

    // ##############################################

    // ##############################################

    // ####################################################
    // ROOM SNAPSHOT WINDOW/SCREEN/TAB
    // ####################################################

    // ####################################################
    // HELPERS
    // ####################################################

    toggleVideoMirror() {
        const peerVideo = this.getName(this.peer_id);
        if (peerVideo) {
            peerVideo.classList.toggle('mirror');
            sessionVideoMirror = peerVideo.classList.contains('mirror');
        }
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
