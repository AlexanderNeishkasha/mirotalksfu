'use strict';

if (location.href.substr(0, 5) !== 'https') location.href = 'https' + location.href.substr(4, location.href.length - 4);

/**
 * MiroTalk SFU - Room component
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

// ####################################################
// STATIC SETTINGS
// ####################################################

console.log('Window Location', window.location);

const userAgent = navigator.userAgent;
const parser = new UAParser(userAgent);
const parserResult = parser.getResult();
const deviceType = parserResult.device.type || 'desktop';
const isMobileDevice = deviceType === 'mobile';
const isMobileSafari = isMobileDevice && parserResult.browser.name?.toLowerCase().includes('safari');
const isTabletDevice = deviceType === 'tablet';
const isIPadDevice = parserResult.device.model?.toLowerCase() === 'ipad';
const isDesktopDevice = deviceType === 'desktop';
const isFirefox = parserResult.browser.name?.toLowerCase() === 'firefox';
const thisInfo = getInfo();

/**
 * Initializes a Socket.IO client instance with custom connection and reconnection options.
 *
 * @property {string[]} transports - The transport mechanisms to use. Default: ['polling', 'websocket']. Here, only ['websocket'] is used.
 * @property {boolean} reconnection - Whether to automatically reconnect if connection is lost. Default: true.
 * @property {number} reconnectionAttempts - Maximum number of reconnection attempts before giving up. Default: Infinity. Here, set to 10.
 * @property {number} reconnectionDelay - Initial delay (ms): 1000; custom backoff below uses 1/2/3/6/12/15 seconds.
 * @property {number} reconnectionDelayMax - Maximum amount of time to wait between reconnections (in ms). Default: 5000. Here, set to 15000.
 * @property {number} timeout - Connection timeout before an error is emitted (in ms). Default: 20000.
 */
const socket = io({
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 15000,
    randomizationFactor: 0,
    timeout: 20000,
});
// Socket.IO 4.8.3's public options only support geometric 1/2/4/8 backoff.
// Keep its attempt counter intact so reconnectionAttempts and reset still work.
socket.io.backoff.duration = function () {
    const attempt = this.attempts++;
    return Math.min(attempt === 0 ? 1000 : attempt === 1 ? 2000 : 3000 * 2 ** (attempt - 2), 15000);
};

let redirect = {
    enabled: true,
    url: '/',
};

let recCodecs = null;

const _PEER = {
    presenter: '<i class="fa-solid fa-user-shield"></i>',
    presenterActive: '<i class="fa-solid fa-user-shield" style="color: #5ad17f;"></i>',
    guest: '<i class="fa-solid fa-signal"></i>',
    audioOn: '<i class="fas fa-microphone"></i>',
    audioOff: '<i class="fas fa-microphone-slash red"></i>',
    videoOn: '<i class="fas fa-video"></i>',
    videoOff: '<i class="fas fa-video-slash red"></i>',
    screenOn: '<i class="fas fa-desktop"></i>',
    screenOff: '<i class="fas fa-desktop red"></i>',
    raiseHand: '<i style="color: #FFD700;" class="fas fa-hand-paper pulsate"></i>',
    lowerHand: '',
    acceptPeer: '<i class="fas fa-check"></i>',
    banPeer: '<i class="fas fa-ban red"></i>',
    ejectPeer: '<i class="fas fa-right-from-bracket red"></i>',

    sendFile: '<i class="fas fa-upload"></i>',
    sendMsg: '<i class="fas fa-paper-plane"></i>',

    pinPeer: '<i class="fas fa-map-pin"></i>',
    gridShow: '<i class="fas fa-eye"></i>',
    gridHide: '<i class="fas fa-eye-slash"></i>',
};

const initUser = document.getElementById('initUser');
const initVideoContainerClass = document.querySelector('.init-video-container');
const bars = document.querySelectorAll('.volume-bar');

const swalImageUrl = '../images/pricing-illustration.svg';

// Media
const sinkId = 'sinkId' in HTMLMediaElement.prototype;

// ####################################################
// LOCAL STORAGE
// ####################################################

const lS = new LocalStorage();

const localStorageSettings = lS.getLocalStorageSettings() || lS.SFU_SETTINGS;

const locallyHiddenPeerIds = new Set();

let isHiddenParticipantsFilterActive = false;

const localStorageDevices = lS.getLocalStorageDevices() || lS.LOCAL_STORAGE_DEVICES;

const localStorageInitConfig = lS.getLocalStorageInitConfig() || lS.INIT_CONFIG;

console.log('LOCAL_STORAGE', {
    localStorageSettings: localStorageSettings,
    localStorageDevices: localStorageDevices,
    localStorageInitConfig: localStorageInitConfig,
});

// ####################################################
// ENUMERATE DEVICES SELECTS
// ####################################################

const participantsCountBadge = getId('participantsCountBadge');
const videoSelect = getId('videoSelect');
const videoQuality = getId('videoQuality');
const videoFps = getId('videoFps');
const screenQuality = getId('screenQuality');
const screenFps = getId('screenFps');
const screenOptimization = getId('screenOptimization');
const initVideoSelect = getId('initVideoSelect');
const microphoneSelect = getId('microphoneSelect');
const initMicrophoneSelect = getId('initMicrophoneSelect');
const speakerSelect = getId('speakerSelect');
const initSpeakerSelect = getId('initSpeakerSelect');
const speakerVolume = getId('speakerVolume');
const speakerVolumeValue = getId('speakerVolumeValue');

const startVideoBtn = getId('startVideoButton');
const startAudioBtn = getId('startAudioButton');
const stopVideoBtn = getId('stopVideoButton');
const stopAudioBtn = getId('stopAudioButton');
const videoDropdown = getId('startVideoDeviceDropdown');
const audioDropdown = getId('startAudioDeviceDropdown');
const videoToggle = getId('startVideoDeviceMenuButton');
const audioToggle = getId('startAudioDeviceMenuButton');
const videoMenu = getId('startVideoDeviceMenu');
const audioMenu = getId('startAudioDeviceMenu');

const settingsSplit = getId('settingsSplit');
const settingsExtraDropdown = getId('settingsExtraDropdown');
const settingsExtraToggle = getId('settingsExtraToggle');
const settingsExtraMenu = getId('settingsExtraMenu');
const noExtraButtons = getId('noExtraButtons');
const copyRoomUrlBtn = getId('copyRoomUrlBtn');

const exitDropdown = getId('exitDropdown');
const exitMenu = getId('exitMenu');
const exitLeaveBtn = getId('exitLeaveBtn');
const exitLeaveAllBtn = getId('exitLeaveAllBtn');

// ####################################################
// VIRTUAL BACKGROUND DEFAULT IMAGES AND INIT CLASS
// ####################################################

const virtualBackgrounds = Object.values(image.virtualBackground);

const virtualBackground = new VirtualBackground();

const isMediaStreamTrackAndTransformerSupported = virtualBackground.checkSupport();

// ####################################################
// DYNAMIC SETTINGS
// ####################################################

let preventExit = false;
let bypassBeforeUnloadOnce = false;

let virtualBackgroundBlurLevel;
let virtualBackgroundSelectedImage;
let virtualBackgroundTransparent;

let swalBackground = 'radial-gradient(#393939, #000000)'; //'rgba(0, 0, 0, 0.7)';

let rc = null;
let producer = null;
let participantsCount = 0;
let showCameraOffParticipants = localStorageSettings.show_camera_off_participants !== false;
let lobbyParticipantsCount = 0;
let chatMessagesId = 0;

let room_id = getRoomId();
let room_password = getRoomPassword();
let room_duration = getRoomDuration();
let peer_name = getPeerName();
let peer_avatar = getPeerAvatar();
let hasTemporaryAvatar = !!(
    peer_avatar &&
    localStorageSettings.peer_avatar &&
    peer_avatar === localStorageSettings.peer_avatar
);
let peer_uuid = getPeerUUID();
let peer_token = getPeerToken();
let isScreenAllowed = getScreen();

let notify = getNotify();
let chat = getChat();
isPresenter = isPeerPresenter();

let peer_info = null;

let isPushToTalkActive = false;
let isPushToTalkPressed = false;
let pushToTalkAudioContext = null;
let pushToTalkTransition = Promise.resolve();
let isPitchBarEnabled = true;
let isSoundEnabled = true;
let isKeepButtonsVisible = false;
let isShortcutsEnabled = false;

let isLobbyEnabled = false;
let hostOnlyRecording = false;
let isEnumerateAudioDevices = false;
let isEnumerateVideoDevices = false;
let isAudioAllowed = false;
let isVideoAllowed = false;
let isVideoPrivacyActive = false;
let isRecording = false;
let isAudioVideoAllowed = false;
let isParticipantsListOpen = false;

let isVideoControlsOn = false;
let isChatPasteTxt = false;
let isChatMarkdownOn = false;

let joinRoomWithScreen = false;

let audio = false;
let video = false;
let screen = false;
let hand = false;
let camera = 'user';
let sessionVideoMirror = true;

let recTimer = null;
let recElapsedTime = null;
let recShowInfo = true;

let coords = {};

let isButtonsVisible = false;
let isButtonsBarOver = false;

let isRoomLocked = false;
let isJoinLocked = false;

let initStream = null;
let isInitVideoLoaded = false;

let audioContext = null;
let workletNode = null;

// window.location.origin + '/join/' + roomId
// window.location.origin + '/join/?room=' + roomId + '&token=' + myToken

const requestedInvitation = new URLSearchParams(window.location.search).get('invite');
let RoomURL = window.location.origin + '/join/' + encodeURIComponent(room_id);
let publicRoomSlug = '';
try {
    const invitation = new URL(requestedInvitation);
    if (invitation.origin === window.location.origin && invitation.pathname.startsWith('/join/')) {
        RoomURL = invitation.toString();
        publicRoomSlug = decodeURIComponent(invitation.pathname.slice('/join/'.length).replace(/\/$/, ''));
        if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(publicRoomSlug)) {
            document.title = `Бодрик FM - встреча ${publicRoomSlug}`;
            window.history.replaceState(null, '', `/room/${encodeURIComponent(publicRoomSlug)}`);
        }
    }
} catch {}

let isExiting = false;

// ####################################################
// INIT ROOM
// ####################################################

document.addEventListener('DOMContentLoaded', function () {
    initCursorLightEffect();
    initDocumentListener();
    socket.once('connect', () => {
        initClient();
    });
});

// ####################################################
// MOUSE CURSOR LIGHT EFFECT
// ####################################################

function initCursorLightEffect() {
    if (!videoMediaContainer || !isDesktopDevice) return;
    videoMediaContainer.classList.add('mouse-light');
    videoMediaContainer.addEventListener('mousemove', function (e) {
        const rect = videoMediaContainer.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        videoMediaContainer.style.setProperty('--mouse-x', x + '%');
        videoMediaContainer.style.setProperty('--mouse-y', y + '%');
    });
}

function initDocumentListener() {
    // Close navbar dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar-dropdown')) {
            document.querySelectorAll('.navbar-dropdown-content.show').forEach((el) => el.classList.remove('show'));
        }
    });
}

/** Initialize room admission, device choices, and retained control hints. */
async function initClient() {
    window.BodrikTheme.connect(publicRoomSlug, applyTheme);

    if (!isMobileDevice) {
        refreshMainButtonsToolTipPlacement();
        setTippy('mySettingsCloseBtn', 'Close', 'bottom');
        setTippy(
            'switchDominantSpeakerFocus',
            'If Active, When a participant speaks, their video will be focused and enlarged',
            'right'
        );
        setMicProcessingHelpTippy();
        setTippy(
            'switchPushToTalk',
            'If Active, When SpaceBar keydown the microphone will be resumed, on keyup will be paused, like a walkie-talkie',
            'right'
        );
        setTippy('lobbyAcceptAllBtn', 'Accept', 'top');
        setTippy('lobbyRejectAllBtn', 'Reject', 'top');

        setTippy(
            'switchLobby',
            'Lobby mode lets you protect your meeting by only allowing people to enter after a formal approval by a moderator',
            'right'
        );
        setTippy('initVideoAudioRefreshButton', 'Refresh audio/video devices', 'top');
        setTippy(
            'screenOptimizationLabel',
            'Detail: For high fidelity (screen sharing with text/graphics)<br />Motion: For high frame rate (video playback, game streaming',
            'right',
            true
        );
        setTippy('switchPitchBar', 'Toggle audio pitch bar', 'right');
        setTippy('switchSounds', 'Toggle the sounds notifications', 'right');
        setTippy('switchShowCameraOffParticipants', 'Show participants with the camera off in the grid', 'right');
        setTippy('switchShare', "Show 'Share Room' popup on join", 'right');
        setTippy('switchKeepButtonsVisible', 'Keep buttons always visible', 'right');
        setTippy('switchKeepAwake', 'Prevent the device from sleeping (if supported)', 'right');
        setTippy('roomId', 'Room name', 'right');
        setTippy('copyRoomUrlBtn', 'Share room link', 'left');
        setTippy('sessionTime', 'Session time', 'right');
        setTippy(
            'switchHostOnlyRecording',
            'Only the host (presenter) has the capability to record the meeting',
            'right'
        );

        setTippy('chatCleanTextButton', 'Clean', 'top');
        setTippy('chatPasteButton', 'Paste', 'top');
        setTippy('chatSendButton', 'Send', 'top');
        setTippy('showChatOnMsg', 'Show chat on new message comes', 'bottom');

        setTippy('chatEmojiButton', 'Emoji', 'top');
        setTippy('chatShowParticipantsListBtn', 'Toggle participants list', 'bottom');
        setTippy('chatMarkdownButton', 'Markdown', 'top');
        setTippy('fileShareChatButton', 'Share the file', 'top');
        setTippy('bodrikChatImageButton', 'Attach image', 'top');
        setTippy('chatCloseButton', 'Close', 'bottom');
        setTippy('chatTogglePin', 'Toggle pin', 'bottom');
        setTippy('chatHideParticipantsList', 'Hide', 'bottom');
        setTippy('chatMaxButton', 'Maximize', 'bottom');
        setTippy('chatMinButton', 'Minimize', 'bottom');

        setTippy('participantsRaiseHandBtn', 'Toggle raise hands', 'bottom');
        setTippy('participantsUnreadMessagesBtn', 'Toggle unread messages', 'bottom');
        setTippy('participantsHiddenBtn', 'Hidden participants', 'bottom');
    }

    initEnumerateDevices();
    setupInitButtons();
}

// ####################################################
// HANDLE MAIN BUTTONS TOOLTIP
// ####################################################

function refreshMainButtonsToolTipPlacement() {
    if (!isMobileDevice) {
        //
        const position = BtnsBarPosition.options[BtnsBarPosition.selectedIndex].value;
        const bPlacement = position == 'vertical' ? 'top' : 'right';

        // Bottom buttons
        setTippy('startAudioButton', 'Start the audio', bPlacement);
        setTippy('stopAudioButton', 'Stop the audio', bPlacement);
        setTippy('startVideoButton', 'Start the video', bPlacement);
        setTippy('stopVideoButton', 'Stop the video', bPlacement);
        setTippy('swapCameraButton', 'Swap the camera', bPlacement);
        setTippy('startScreenButton', 'Start screen share', bPlacement);
        setTippy('stopScreenButton', 'Stop screen share', bPlacement);
        setTippy('raiseHandButton', 'Raise your hand', bPlacement);
        setTippy('lowerHandButton', 'Lower your hand', bPlacement);
        setTippy('chatButton', 'Toggle the chat', bPlacement);
        setTippy('participantsButton', 'Toggle participants list', bPlacement);
        setTippy('participantViewButton', 'Change participant view', bPlacement);
        setTippy('settingsButton', 'Toggle the settings', bPlacement);
        refreshExitButtonTooltip(bPlacement);
    }
}

/** Keep the disconnect tooltip aligned with the rest of the controls. */
function refreshExitButtonTooltip(placement) {
    if (!exitButton || isMobileDevice) return;
    const buttonPlacement =
        placement || (BtnsBarPosition.options[BtnsBarPosition.selectedIndex].value == 'vertical' ? 'top' : 'right');
    setTippy('exitButton', 'Disconnect', buttonPlacement);
}

// ####################################################
// HANDLE TOOLTIP
// ####################################################

/** Translate one maintained tooltip sentence without translating generated HTML markup. */
function micHelpText(text) {
    return window.i18n?.t(text, 'tooltips') || text;
}

/** Render short usage guidance for one microphone-processing control. */
function micHelpHtml(sections) {
    return `<div class="mic-setting-help">${sections
        .map(({ title, text }) => `<p><strong>${micHelpText(title)}</strong>${micHelpText(text)}</p>`)
        .join('')}</div>`;
}

/** Attach hover/focus/tap help to the three exclusive microphone processing controls. */
function setMicProcessingHelpTippy() {
    const definitions = [
        [
            'noiseSuppressionHelp',
            [
                {
                    title: 'Browser noise suppression — recommended',
                    text: 'Uses the browser or device audio processing with the lowest load. Start with this mode.',
                },
                {
                    title: 'RNNoise — enhanced',
                    text: 'Removes steady background noise more aggressively, but uses more CPU, memory, and battery. Choose browser mode if audio stutters or sounds distorted.',
                },
                {
                    title: 'Off',
                    text: 'Leaves microphone noise unfiltered. Useful in a quiet room or when preserving non-speech audio matters.',
                },
            ],
        ],
        [
            'echoCancellationHelp',
            [
                {
                    title: 'Echo cancellation',
                    text: 'Enable it when sound plays through speakers or a laptop: it helps prevent other participants from hearing their voices returned through your microphone. Headphones usually do not need it.',
                },
            ],
        ],
        [
            'autoGainControlHelp',
            [
                {
                    title: 'Automatic gain control',
                    text: 'Keeps quiet and loud speech at a more even level. Enable it for a distant microphone or changing speaking volume; disable it if volume pumps or you transmit music.',
                },
            ],
        ],
    ];
    for (const [id, sections] of definitions) {
        setTippy(id, micHelpHtml(sections), isMobileDevice ? 'bottom' : 'right', true);
        const instance = getId(id)?._tippy;
        instance?.setProps({
            trigger: 'mouseenter focus click',
            hideOnClick: true,
            maxWidth: Math.min(340, window.innerWidth - 32),
        });
    }
}

function setTippy(elem, content, placement, allowHTML = false) {
    const element = document.getElementById(elem);
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

// ####################################################
// HELPERS
// ####################################################

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return filterXSS(urlParams.get(param));
}

// ####################################################
// GET ROOM ID
// ####################################################

function getRoomId() {
    let queryRoomId = getQueryParam('room');
    let roomId = queryRoomId ? queryRoomId : location.pathname.substring(6);
    if (roomId == '' || roomId === 'random') {
        roomId = makeId(12);
    }
    console.log('Direct join', { room: roomId });
    window.localStorage.lastRoom = roomId;
    return roomId;
}

function makeId(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// ####################################################
// INIT ROOM
// ####################################################

/** Open prejoin even without capture devices so listeners can receive room audio. */
async function initRoom() {
    setButtonsInit();
    handleSelectsInit();
    handleUsernameEmojiPicker();
    await whoAreYou();
    await setSelectsInit();
}

// ####################################################
// ENUMERATE DEVICES
// ####################################################

async function initEnumerateDevices() {
    console.log('01 ----> init Enumerate Devices');
    await initEnumerateVideoDevices();
    await initEnumerateAudioDevices();
    await initRoom();
}

async function refreshMyAudioVideoDevices() {
    await refreshMyVideoDevices();
    await refreshMyAudioDevices();
}

async function refreshMyVideoDevices() {
    if (!isVideoAllowed) return;
    const initVideoSelectIndex = initVideoSelect ? initVideoSelect.selectedIndex : 0;
    const videoSelectIndex = videoSelect ? videoSelect.selectedIndex : 0;
    await initEnumerateVideoDevices();
    if (initVideoSelect) initVideoSelect.selectedIndex = initVideoSelectIndex;
    if (videoSelect) videoSelect.selectedIndex = videoSelectIndex;
}

async function refreshMyAudioDevices() {
    if (!isAudioAllowed) return;
    const initMicrophoneSelectIndex = initMicrophoneSelect ? initMicrophoneSelect.selectedIndex : 0;
    const initSpeakerSelectIndex = initSpeakerSelect ? initSpeakerSelect.selectedIndex : 0;
    const microphoneSelectIndex = microphoneSelect ? microphoneSelect.selectedIndex : 0;
    const speakerSelectIndex = speakerSelect ? speakerSelect.selectedIndex : 0;
    await initEnumerateAudioDevices();
    if (initMicrophoneSelect) initMicrophoneSelect.selectedIndex = initMicrophoneSelectIndex;
    if (initSpeakerSelect) initSpeakerSelect.selectedIndex = initSpeakerSelectIndex;
    if (microphoneSelect) microphoneSelect.selectedIndex = microphoneSelectIndex;
    if (speakerSelect) speakerSelect.selectedIndex = speakerSelectIndex;
}

async function initEnumerateAudioDevices() {
    // allow the audio
    await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(async (stream) => {
            await enumerateAudioDevices(stream);
            await getMicrophoneVolumeIndicator(stream);
            isAudioAllowed = true;
        })
        .catch(() => {
            isAudioAllowed = false;
        });
}

async function enumerateAudioDevices(stream) {
    console.log('03 ----> Get Audio Devices');

    if (microphoneSelect) microphoneSelect.innerHTML = '';
    if (initMicrophoneSelect) initMicrophoneSelect.innerHTML = '';

    if (speakerSelect) speakerSelect.innerHTML = '';
    if (initSpeakerSelect) initSpeakerSelect.innerHTML = '';

    await navigator.mediaDevices
        .enumerateDevices()
        .then((devices) =>
            devices.forEach(async (device) => {
                let el,
                    eli = null;
                if ('audioinput' === device.kind) {
                    if (microphoneSelect) el = microphoneSelect;
                    if (initMicrophoneSelect) eli = initMicrophoneSelect;
                    lS.DEVICES_COUNT.audio++;
                } else if ('audiooutput' === device.kind) {
                    if (speakerSelect) el = speakerSelect;
                    if (initSpeakerSelect) eli = initSpeakerSelect;
                    lS.DEVICES_COUNT.speaker++;
                }
                if (!el) return;
                await addChild(device, [el, eli]);
            })
        )
        .then(async () => {
            await stopTracks(stream);
            isEnumerateAudioDevices = true;
            speakerSelect.disabled = !sinkId;
            // Check if there is speakers
            if (!sinkId || initSpeakerSelect.options.length === 0) {
                hide(initSpeakerSelect);
                hide(speakerSelectDiv);
            }
        });
}

/** Release preview capture and invalidate any effect derived from its camera track. */
async function stopTracks(stream) {
    if (stream.getVideoTracks().includes(virtualBackground.active?.source)) {
        await virtualBackground.stopCurrentProcessor();
    }
    stream.getTracks().forEach((track) => {
        track.stop();
    });
}

async function addChild(device, els) {
    let kind = device.kind;
    els.forEach((el) => {
        let option = document.createElement('option');
        option.value = device.deviceId;
        switch (kind) {
            case 'videoinput':
                option.innerText = `📹 ` + device.label || `📹 camera ${el.length + 1}`;
                break;
            case 'audioinput':
                option.innerText = `🎤 ` + device.label || `🎤 microphone ${el.length + 1}`;
                break;
            case 'audiooutput':
                option.innerText = `🔈 ` + device.label || `🔈 speaker ${el.length + 1}`;
                break;
            default:
                break;
        }
        el.appendChild(option);
    });
}

// ####################################################
// INIT AUDIO/VIDEO/SCREEN BUTTONS
// ####################################################

function setupInitButtons() {
    initVideoAudioRefreshButton.onclick = () => {
        refreshMyAudioVideoDevices();
    };
    initVideoButton.onclick = () => {
        handleVideo();
    };
    initAudioButton.onclick = () => {
        handleAudio();
    };
    initAudioVideoButton.onclick = async (e) => {
        await handleAudioVideo(e);
    };
    initStartScreenButton.onclick = async () => {
        await toggleScreenSharing();
    };
    initStopScreenButton.onclick = async () => {
        await toggleScreenSharing();
    };
    initVideoMirrorButton.onclick = () => {
        initVideo.classList.toggle('mirror');
        sessionVideoMirror = initVideo.classList.contains('mirror');
    };
    initVirtualBackgroundButton.onclick = () => {
        const imageGrid = getId('imageGrid');
        const imageGridVisible = imageGrid && getComputedStyle(imageGrid).display !== 'none';
        imageGridVisible ? elemDisplay('imageGrid', false) : showImageSelector();
    };
    initUsernameEmojiButton.onclick = () => {
        getId('usernameInput').value = '';
        toggleUsernameEmoji();
    };
    initExitButton.onclick = () => {
        initLeaveMeeting();
    };
}

// ####################################################
// MICROPHONE VOLUME INDICATOR
// ####################################################

async function getMicrophoneVolumeIndicator(stream) {
    if (isAudioContextSupported() && hasAudioTrack(stream)) {
        try {
            stopMicrophoneProcessing();
            console.log('Start microphone volume indicator for audio track', stream.getAudioTracks()[0]);
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const microphone = audioContext.createMediaStreamSource(stream);
            await audioContext.audioWorklet.addModule('/js/VolumeProcessor.js');
            workletNode = new AudioWorkletNode(audioContext, 'volume-processor');

            // Handle data from VolumeProcessor.js
            workletNode.port.onmessage = (event) => {
                const data = event.data;
                switch (data.type) {
                    case 'volumeIndicator':
                        updateVolumeIndicator(data.volume);
                        break;
                    //...
                    default:
                        console.warn('Unknown message type from VolumeProcessor:', data.type);
                        break;
                }
            };

            microphone.connect(workletNode);
            workletNode.connect(audioContext.destination);
        } catch (error) {
            console.error('Error initializing microphone volume indicator:', error);
            stopMicrophoneProcessing();
        }
    } else {
        console.warn('Microphone volume indicator not supported for this browser');
    }
}

function stopMicrophoneProcessing() {
    console.log('Stop microphone volume indicator');
    if (workletNode) {
        try {
            workletNode.disconnect();
        } catch (error) {
            console.warn('Error disconnecting workletNode:', error);
        }
        workletNode = null;
    }
    if (audioContext) {
        try {
            if (audioContext.state !== 'closed') {
                audioContext.close();
            }
        } catch (error) {
            console.warn('Error closing audioContext:', error);
        }
        audioContext = null;
    }
}

function updateVolumeIndicator(volume) {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    const activeBars = Math.round(normalizedVolume * bars.length);
    bars.forEach((bar, index) => {
        bar.classList.toggle('active', index < activeBars);
    });
}

function isAudioContextSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
}

function hasAudioTrack(mediaStream) {
    if (!mediaStream) return false;
    const audioTracks = mediaStream.getAudioTracks();
    return audioTracks.length > 0;
}

function hasVideoTrack(mediaStream) {
    if (!mediaStream) return false;
    const videoTracks = mediaStream.getVideoTracks();
    return videoTracks.length > 0;
}

// ####################################################
// QUERY PARAMS CHECK
// ####################################################

function getScreen() {
    let screen = getQueryParam('screen');
    if (screen) {
        screen = screen.toLowerCase();
        let queryScreen = screen === '1' || screen === 'true';
        if (queryScreen != null && (navigator.getDisplayMedia || navigator.mediaDevices.getDisplayMedia)) {
            console.log('Direct join', { screen: queryScreen });
            return queryScreen;
        }
    }
    console.log('Direct join', { screen: false });
    return false;
}

function getNotify() {
    let notify = getQueryParam('notify');
    if (notify) {
        notify = notify.toLowerCase();
        let queryNotify = notify === '1' || notify === 'true';
        if (queryNotify != null) {
            console.log('Direct join', { notify: queryNotify });
            return queryNotify;
        }
    }
    notify = localStorageSettings.share_on_join;
    console.log('Direct join', { notify: notify });
    return notify;
}

function getChat() {
    let chat = getQueryParam('chat');
    if (chat) {
        chat = chat.toLowerCase();
        let queryChat = chat === '1' || chat === 'true';
        if (queryChat != null) {
            console.log('Direct join', { chat: queryChat });
            return queryChat;
        }
    }
    console.log('Direct join', { chat: chat });
    return chat;
}

function isPeerPresenter() {
    let presenter = getQueryParam('isPresenter');
    if (presenter) {
        presenter = presenter.toLowerCase();
        let queryPresenter = presenter === '1' || presenter === 'true';
        if (queryPresenter != null) {
            console.log('Direct join Reconnect', { isPresenter: queryPresenter });
            return queryPresenter;
        }
    }
    console.log('Direct join Reconnect', { presenter: false });
    return false;
}

function getPeerName() {
    const name = getQueryParam('name');
    if (isHtml(name)) {
        console.log('Direct join', { name: 'Invalid name' });
        return 'Invalid name';
    }
    console.log('Direct join', { name: name });

    if (name === 'random') {
        const randomName = generateRandomName();
        console.log('Direct join', { name: randomName });
        return randomName;
    }

    return name;
}

function generateRandomName() {
    const adjectives = ['Quick', 'Lazy', 'Happy', 'Sad', 'Brave', 'Clever', 'Witty', 'Calm', 'Bright', 'Charming'];
    const nouns = ['Fox', 'Dog', 'Cat', 'Mouse', 'Lion', 'Tiger', 'Bear', 'Wolf', 'Eagle', 'Shark'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    return `${adjective}${noun}${number}`;
}

function getPeerAvatar() {
    const avatar = getQueryParam('avatar');
    const avatarDisabled = avatar === '0' || avatar === 'false';
    const isBase64Avatar = typeof avatar === 'string' && avatar.startsWith('data:');
    console.log('Direct join', { avatar: avatar });
    if (avatarDisabled || isBase64Avatar || !isValidAvatarURL(avatar)) {
        const saved = localStorageSettings.peer_avatar;
        if (saved && isValidAvatarURL(saved)) {
            console.log('Restored avatar from localStorage', { avatar: saved });
            return saved;
        }
        return false;
    }
    return avatar;
}

function getPeerUUID() {
    if (lS.getItemLocalStorage('peer_uuid')) {
        return lS.getItemLocalStorage('peer_uuid');
    }
    const peer_uuid = getUUID();
    lS.setItemLocalStorage('peer_uuid', peer_uuid);
    return peer_uuid;
}

function getPeerToken() {
    let token = getQueryParam('token');
    let queryToken = false;
    if (token) {
        queryToken = token;
        window.sessionStorage.peer_token = token;
        console.log('Direct join', { token: true });
        return queryToken;
    }
    if (window.sessionStorage.peer_token) return window.sessionStorage.peer_token;
    console.log('Direct join', { token: queryToken });
    return queryToken;
}

function getRoomPassword() {
    let roomPassword = getQueryParam('roomPassword');
    if (roomPassword) {
        let queryNoRoomPassword = roomPassword === '0' || roomPassword === 'false';
        if (queryNoRoomPassword) {
            roomPassword = false;
        }
        console.log('Direct join', { password: roomPassword });
        return roomPassword;
    }
    return false;
}

function getRoomDuration() {
    const roomDuration = getQueryParam('duration');

    if (isValidDuration(roomDuration)) {
        if (roomDuration === 'unlimited') {
            console.log('The room has no time limit');
            return roomDuration;
        }
        const timeLimit = timeToMilliseconds(roomDuration);
        setTimeout(() => {
            sound('eject');
            Swal.fire({
                background: swalBackground,
                position: 'center',
                title: 'Time Limit Reached',
                text: 'The room has reached its time limit and will close shortly',
                icon: 'warning',
                timer: 6000, // 6 seconds
                timerProgressBar: true,
                showConfirmButton: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                willClose: () => {
                    rc.exitRoom(true);
                },
            });
        }, timeLimit);

        console.log('Direct join', { duration: roomDuration, timeLimit: timeLimit });
        return roomDuration;
    }
    return 'unlimited';
}

function timeToMilliseconds(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

function isValidDuration(duration) {
    if (duration === 'unlimited') return true;

    // Check if the format is HH:MM:SS
    const regex = /^(\d{2}):(\d{2}):(\d{2})$/;
    const match = duration.match(regex);
    if (!match) return false;
    const [hours, minutes, seconds] = match.slice(1).map(Number);
    // Validate ranges: hours, minutes, and seconds
    if (hours < 0 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
        return false;
    }
    return true;
}

// ####################################################
// INIT CONFIG
// ####################################################

async function checkInitConfig() {
    const localStorageInitConfig = lS.getLocalStorageInitConfig();
    console.log('04.5 ----> Get init config', localStorageInitConfig);
    if (localStorageInitConfig) {
        if (isAudioVideoAllowed && !localStorageInitConfig.audioVideo) {
            await handleAudioVideo();
        } else {
            if (isAudioAllowed && !localStorageInitConfig.audio) handleAudio();
            if (isVideoAllowed && !localStorageInitConfig.video) handleVideo();
        }
    }
}

// ####################################################
// SOME PEER INFO
// ####################################################

function getPeerInfo() {
    peer_info = {
        join_data_time: getDataTimeString(),
        join_tz_offset: new Date().getTimezoneOffset(),
        peer_uuid: peer_uuid,
        peer_id: socket.id,
        peer_name: peer_name,
        peer_avatar: peer_avatar,
        peer_token: peer_token,
        peer_presenter: isPresenter,
        peer_audio: isAudioAllowed,
        peer_audio_volume: 100,
        peer_video: isVideoAllowed,
        peer_screen: isScreenAllowed,
        peer_recording: isRecording,
        peer_video_privacy: isVideoPrivacyActive,
        peer_hand: false,
        is_desktop_device: isDesktopDevice,
        is_mobile_device: isMobileDevice,
        is_tablet_device: isTabletDevice,
        is_ipad_pro_device: isIPadDevice,
        os_name: parserResult.os.name,
        os_version: parserResult.os.version,
        browser_name: parserResult.browser.name,
        browser_version: parserResult.browser.version,
        user_agent: userAgent,
    };
}

function getInfo() {
    try {
        console.log('Info', parserResult);

        const filterUnknown = (obj) => {
            const filtered = {};
            for (const [key, value] of Object.entries(obj)) {
                if (value && value !== 'Unknown') {
                    filtered[key] = value;
                }
            }
            return filtered;
        };

        const filteredResult = {
            //ua: parserResult.ua,
            browser: filterUnknown(parserResult.browser),
            cpu: filterUnknown(parserResult.cpu),
            device: filterUnknown(parserResult.device),
            engine: filterUnknown(parserResult.engine),
            os: filterUnknown(parserResult.os),
        };

        const sectionMeta = {
            browser: { iconMarkup: icons.infoBrowser, label: 'Browser' },
            cpu: { iconMarkup: icons.infoCpu, label: 'CPU info' },
            device: { iconMarkup: icons.infoDevice, label: 'Device' },
            engine: { iconMarkup: icons.infoEngine, label: 'Engine' },
            os: { iconMarkup: icons.infoOs, label: 'OS info' },
        };

        const rows = Object.entries(filteredResult)
            .filter(([, data]) => Object.keys(data).length > 0)
            .map(([section, data]) => {
                const { iconMarkup, label } = sectionMeta[section] || {
                    iconMarkup: icons.infoDefault,
                    label: section,
                };
                const badges = Object.entries(data)
                    .filter(([key]) => key !== 'major')
                    .map(([, val]) => renderRoomTemplate('extraInfoBadgeTemplate', { text: { value: String(val) } }))
                    .join('');
                return renderRoomTemplate('extraInfoRowTemplate', {
                    text: { label },
                    html: { iconMarkup, badges },
                    attrs: { rowClass: `extra-info-row extra-info-row--${section}` },
                });
            })
            .join('');

        extraInfo.innerHTML = renderRoomTemplate('extraInfoGridTemplate', { html: { rows } });

        return parserResult;
    } catch (error) {
        console.error('Error parsing user agent:', error);
    }
}

// ####################################################
// ENTER YOUR NAME | Enable/Disable AUDIO/VIDEO
// ####################################################

/** Fetch one same-origin JSON setting with a bounded browser-native request. */
async function fetchRoomJson(path) {
    const response = await fetch(path, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response.json();
}

async function whoAreYou() {
    console.log('04 ----> Who are you?');

    // Initialize video loading state
    isInitVideoLoaded = !isVideoAllowed;

    document.body.style.background = 'var(--body-bg)';

    try {
        const response = await fetchRoomJson('/config');
        const serverButtons = response.message;
        if (serverButtons) {
            // Merge serverButtons into BUTTONS, keeping the existing keys in BUTTONS if they are not present in serverButtons
            BUTTONS = mergeConfig(BUTTONS, serverButtons);

            console.log('04 ----> ROOM BUTTONS SETTINGS', {
                serverButtons: serverButtons,
                clientButtons: BUTTONS,
            });
        }
    } catch (error) {
        console.error('04 ----> GET CONFIG ERROR', error.message);
    }

    if (navigator.getDisplayMedia || navigator.mediaDevices.getDisplayMedia) {
        BUTTONS.main.startScreenButton && show(initStartScreenButton);
    }

    // Virtual Background if supported (Chrome/Edge/Opera/Vivaldi/...)
    // Note: the settings section (#videoVirtualBackground label + grid) visibility is owned by
    // rc.showVideoImageSelector(), so the label is only revealed once the image grid is populated.
    if (
        isMediaStreamTrackAndTransformerSupported &&
        (BUTTONS.settings.virtualBackground !== undefined ? BUTTONS.settings.virtualBackground : true)
    ) {
        show(initVirtualBackgroundButton);
    }

    if (peer_name) {
        hide(loadingDiv);
        checkMedia();
        if (!BUTTONS.main.startScreenButton) isScreenAllowed = false;
        getPeerInfo();
        joinRoom(peer_name, room_id);
        return;
    }

    let default_name = window.localStorage.peer_name ? window.localStorage.peer_name : '';
    if (getCookie(room_id + '_name')) {
        default_name = getCookie(room_id + '_name');
    }

    if (!BUTTONS.main.startVideoButton) {
        isVideoAllowed = false;
        isInitVideoLoaded = true;
        elemDisplay('initVideo', false);
        elemDisplay('initVideoLoader', false);
        elemDisplay('initVideoButton', false);
        elemDisplay('initAudioVideoButton', false);
        elemDisplay('initVideoAudioRefreshButton', false);
        elemDisplay('initVideoSelect', false);
        elemDisplay('tabVideoDevicesBtn', false);
        initVideoContainerShow(false);
    }
    if (!BUTTONS.main.startAudioButton) {
        isAudioAllowed = false;
        elemDisplay('initAudioButton', false);
        elemDisplay('initAudioVideoButton', false);
        elemDisplay('initVideoAudioRefreshButton', false);
        elemDisplay('initMicrophoneSelect', false);
        elemDisplay('initSpeakerSelect', false);
        elemDisplay('tabAudioDevicesBtn', false);
    }
    if (!BUTTONS.main.startScreenButton) {
        hide(initStartScreenButton);
    }

    window.BodrikProfile?.init({
        token: peer_token,
        avatar: peer_avatar,
        onAvatar: (avatarUrl) => {
            peer_avatar = avatarUrl;
            localStorageSettings.peer_avatar = avatarUrl;
            lS.setSettings(localStorageSettings);
        },
    });

    await window.i18n?.ready;
    Swal.fire({
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: swalBackground,
        title: meetingJoinTitle(),
        input: 'text',
        inputPlaceholder: 'Enter your name',
        inputAttributes: { maxlength: 32, id: 'usernameInput' },
        inputValue: default_name,
        html: initUser, // Inject HTML
        confirmButtonText: `Join meeting`,
        customClass: { popup: 'init-modal-size' },
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        willOpen: () => {
            hide(loadingDiv);
        },
        didOpen: () => {
            showMobileAudioGuidance();
            const nicknameInput = getId('usernameInput');
            const profile = getId('bodrikProfile');
            if (nicknameInput && profile) {
                nicknameInput.insertAdjacentElement('afterend', profile);
            }
        },
        inputValidator: (name) => {
            if (isVideoAllowed && !isInitVideoLoaded) {
                return 'Please wait for video to initialize...';
            }
            if (!name) return 'Please enter your name';
            if (name.length > 32) return 'Name must be max 32 char';
            name = filterXSS(name);
            if (isHtml(name)) return 'Invalid name!';
            if (!getCookie(room_id + '_name')) {
                window.localStorage.peer_name = name;
            }
            setCookie(room_id + '_name', name, 30);
            peer_name = name;
        },
    }).then(async () => {
        if (!usernameEmoji.classList.contains('hidden')) {
            usernameEmoji.classList.add('hidden');
        }
        if (initStream && !joinRoomWithScreen) {
            await stopTracks(initStream);
            elemDisplay('initVideo', false);
            initVideoContainerShow(false);
        }
        getPeerInfo();
        joinRoom(peer_name, room_id);
    });

    // Show the init user container injected in Swal
    initUser.classList.toggle('hidden');

    if (!isVideoAllowed) {
        elemDisplay('initVideo', false);
        initVideoContainerShow(false);
        hide(initVideoSelect);
    }
    if (!isAudioAllowed) {
        hide(initMicrophoneSelect);
        hide(initSpeakerSelect);
    }
}

function mergeConfig(current, updated) {
    for (const key of Object.keys(updated)) {
        if (!current.hasOwnProperty(key) || typeof updated[key] !== 'object') {
            current[key] = updated[key];
        } else {
            mergeConfig(current[key], updated[key]);
        }
    }
    return current;
}

function showMobileAudioGuidance() {
    if (!isMobileDevice) return;

    const guidance = isMobileSafari
        ? `
            <div class="mic-guidance ios">
                <p class="title">
                    <i class="fas fa-info-circle"></i>
                    iOS Audio Routing
                </p>
                <p class="text">
                    iOS automatically routes audio to connected Bluetooth or external devices.
                    Connect your preferred microphone <strong>before</strong> joining.
                </p>
            </div>
        `
        : `
            <div class="mic-guidance mobile">
                <p class="title">
                    <i class="fas fa-mobile-alt"></i>
                    External Microphones
                </p>
                <p class="text">
                    External microphones may require device reconnection to activate.
                </p>
            </div>
        `;

    const audioGuidanceDiv = document.createElement('div');
    audioGuidanceDiv.id = 'mobileAudioGuidance';
    audioGuidanceDiv.innerHTML = guidance;
    audioGuidanceDiv.style.transition = 'opacity 0.5s ease';

    const initUserContainer = document.getElementById('initUser');
    if (initUserContainer && initMicrophoneSelect) {
        initMicrophoneSelect.parentElement.insertBefore(audioGuidanceDiv, initMicrophoneSelect);
    }

    setTimeout(() => {
        audioGuidanceDiv.style.opacity = '0';
        setTimeout(() => {
            audioGuidanceDiv.remove();
        }, 500);
    }, 6000);
}

function handleAudio() {
    isAudioAllowed = isAudioAllowed ? false : true;
    initAudioButton.className = 'fas fa-microphone' + (isAudioAllowed ? '' : '-slash');
    setColor(initAudioButton, isAudioAllowed ? 'white' : 'red');
    setColor(startAudioButton, isAudioAllowed ? 'white' : 'red');
    checkInitAudio(isAudioAllowed);
    lS.setInitConfig(lS.MEDIA_TYPE.audio, isAudioAllowed);
}

function handleVideo() {
    isVideoAllowed = isVideoAllowed ? false : true;
    initVideoButton.className = 'fas fa-video' + (isVideoAllowed ? '' : '-slash');
    setColor(initVideoButton, isVideoAllowed ? 'white' : 'red');
    setColor(startVideoButton, isVideoAllowed ? 'white' : 'red');
    checkInitVideo(isVideoAllowed);
    lS.setInitConfig(lS.MEDIA_TYPE.video, isVideoAllowed);

    elemDisplay('imageGrid', false);

    isVideoAllowed &&
    isMediaStreamTrackAndTransformerSupported &&
    (BUTTONS.settings.virtualBackground !== undefined ? BUTTONS.settings.virtualBackground : true)
        ? show(initVirtualBackgroundButton)
        : hide(initVirtualBackgroundButton);
}

async function handleAudioVideo() {
    isAudioVideoAllowed = isAudioVideoAllowed ? false : true;
    isAudioAllowed = isAudioVideoAllowed;
    isVideoAllowed = isAudioVideoAllowed;
    lS.setInitConfig(lS.MEDIA_TYPE.audio, isAudioVideoAllowed);
    lS.setInitConfig(lS.MEDIA_TYPE.video, isAudioVideoAllowed);
    lS.setInitConfig(lS.MEDIA_TYPE.audioVideo, isAudioVideoAllowed);
    initAudioButton.className = 'fas fa-microphone' + (isAudioVideoAllowed ? '' : '-slash');
    initVideoButton.className = 'fas fa-video' + (isAudioVideoAllowed ? '' : '-slash');
    initAudioVideoButton.className = 'fas fa-eye' + (isAudioVideoAllowed ? '' : '-slash');
    if (!isAudioVideoAllowed) {
        hide(initAudioButton);
        hide(initVideoButton);
        hide(initVideoAudioRefreshButton);
    }
    if (isAudioAllowed && isVideoAllowed && !isMobileDevice) show(initVideoAudioRefreshButton);
    setColor(initAudioVideoButton, isAudioVideoAllowed ? 'white' : 'red');
    setColor(initAudioButton, isAudioAllowed ? 'white' : 'red');
    setColor(initVideoButton, isVideoAllowed ? 'white' : 'red');
    setColor(startAudioButton, isAudioAllowed ? 'white' : 'red');
    setColor(startVideoButton, isVideoAllowed ? 'white' : 'red');
    await checkInitVideo(isVideoAllowed);
    checkInitAudio(isAudioAllowed);

    elemDisplay('imageGrid', false);

    isVideoAllowed &&
    isMediaStreamTrackAndTransformerSupported &&
    (BUTTONS.settings.virtualBackground !== undefined ? BUTTONS.settings.virtualBackground : true)
        ? show(initVirtualBackgroundButton)
        : hide(initVirtualBackgroundButton);
}

async function checkInitVideo(isVideoAllowed) {
    if (isVideoAllowed && BUTTONS.main.startVideoButton) {
        if (initVideoSelect.value) {
            initVideoContainerShow();
            await changeCamera(initVideoSelect.value);
            isInitVideoLoaded = true;
        }
        sound('joined');
    } else {
        if (initStream) {
            stopTracks(initStream);
            elemDisplay('initVideo', false);
            elemDisplay('initVideoLoader', false);
            initVideoContainerShow(false);
            sound('left');
        }
        isInitVideoLoaded = !isVideoAllowed;
    }
    initVideoSelect.disabled = !isVideoAllowed;
}

function checkInitAudio(isAudioAllowed) {
    initMicrophoneSelect.disabled = !isAudioAllowed;
    initSpeakerSelect.disabled = !isAudioAllowed;
    isAudioAllowed ? sound('joined') : sound('left');
}

function initVideoContainerShow(show = true) {
    initVideoContainerClass.style.width = show ? '100%' : 'auto';
    initVideoContainerClass.style.padding = show ? '10px' : '0px';
}

function checkMedia() {
    let audio = getQueryParam('audio');
    let video = getQueryParam('video');
    if (audio) {
        audio = audio.toLowerCase();
        let queryPeerAudio = audio === '1' || audio === 'true';
        if (queryPeerAudio != null) isAudioAllowed = queryPeerAudio;
    }
    if (video) {
        video = video.toLowerCase();
        let queryPeerVideo = video === '1' || video === 'true';
        if (queryPeerVideo != null) isVideoAllowed = queryPeerVideo;
    }
    // elemDisplay('tabVideoDevicesBtn', isVideoAllowed);
    // elemDisplay('tabAudioDevicesBtn', isAudioAllowed);

    // Enforce BUTTONS config: URL params cannot override disabled buttons
    if (!BUTTONS.main.startAudioButton) isAudioAllowed = false;
    if (!BUTTONS.main.startVideoButton) isVideoAllowed = false;

    console.log('Direct join', {
        audio: isAudioAllowed,
        video: isVideoAllowed,
    });
}

// ####################################################
// SHARE ROOM
// ####################################################

async function shareRoom(useNavigator = false) {
    if (navigator.share && useNavigator) {
        try {
            await navigator.share({ url: RoomURL });
            userLog('info', 'Room Shared successfully', 'top-end');
        } catch (err) {
            share();
        }
    } else {
        share();
    }
    function share() {
        sound('open');

        Swal.fire({
            background: swalBackground,
            position: 'center',
            title: 'Share the room',
            html: renderRoomTemplate('popupShareRoomTemplate', {
                text: {
                    roomUrl: RoomURL,
                },
            }),
            showDenyButton: false,
            showCancelButton: true,
            cancelButtonColor: 'red',
            denyButtonColor: 'green',
            confirmButtonText: `Copy URL`,
            cancelButtonText: `Close`,
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        }).then((result) => {
            if (result.isConfirmed) {
                copyRoomURL();
            }
            // share screen on join
            if (isScreenAllowed) {
                rc.shareScreen();
            }
        });
    }
}

// ####################################################
// ROOM UTILITY
// ####################################################

function copyRoomURL() {
    let tmpInput = document.createElement('input');
    document.body.appendChild(tmpInput);
    tmpInput.value = RoomURL;
    tmpInput.select();
    tmpInput.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(tmpInput.value);
    document.body.removeChild(tmpInput);
    userLog('info', 'Meeting URL copied to clipboard 👍', 'top-end');
}

function copyToClipboard(txt, showTxt = true) {
    let tmpInput = document.createElement('input');
    document.body.appendChild(tmpInput);
    tmpInput.value = txt;
    tmpInput.select();
    tmpInput.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(tmpInput.value);
    document.body.removeChild(tmpInput);
    showTxt
        ? userLog('info', `${txt} copied to clipboard 👍`, 'top-end')
        : userLog('info', `Copied to clipboard 👍`, 'top-end');
}

// ####################################################
// JOIN ROOM
// ####################################################

function joinRoom(peer_name, room_id) {
    if (rc && rc.isConnected()) {
        console.log('Already connected to a room');
        getId('myProfileNameInput').value = peer_name;
    } else {
        console.log('05 ----> join Room ' + room_id);
        roomId.innerText = publicRoomSlug || room_id;
        userName.innerText = peer_name;
        isUserPresenter.innerText = presenterLabel(isPresenter);
        rc = new RoomClient(
            localAudio,
            remoteAudios,
            videoMediaContainer,
            videoPinMediaContainer,
            window.mediasoupClient,
            socket,
            room_id,
            peer_name,
            peer_uuid,
            peer_info,
            isAudioAllowed,
            isVideoAllowed,
            isScreenAllowed,
            joinRoomWithScreen,
            roomIsReady
        );
        handleRoomClientEvents();
    }
}

/** Bind retained room controls after successful admission. */
function roomIsReady() {
    startRoomSession();

    myProfileAvatar.setAttribute(
        'src',
        peer_avatar && isValidAvatarURL(peer_avatar) ? peer_avatar : rc.genAvatarSvg(peer_name, 64)
    );

    updateMyAvatarResetButtonVisibility();

    BUTTONS.main.exitButton && show(exitButton);
    BUTTONS.main.shareButton && show(shareButton);

    if (BUTTONS.settings.tabRecording) {
        show(startRecButton);
    } else {
        hide(startRecButton);
        hide(tabRecordingBtn);
    }
    BUTTONS.main.chatButton && show(chatButton);
    BUTTONS.main.participantsButton && show(participantsButton);

    BUTTONS.main.raiseHandButton && show(raiseHandButton);

    show(fileShareExtraButton);
    !BUTTONS.chat.chatSaveButton && hide(chatSaveButton);
    BUTTONS.chat.chatEmojiButton && show(chatEmojiButton);
    show(chatShowParticipantsListBtn);
    BUTTONS.chat.chatMarkdownButton && show(chatMarkdownButton);
    show(fileShareChatButton);

    show(chatCleanTextButton);
    show(chatPasteButton);
    show(chatSendButton);
    if (isMobileDevice) {
        hide(initVideoAudioRefreshButton);
        BUTTONS.main.swapCameraButton && show(swapCameraButton);
        rc.chatMaximize();
        hide(chatTogglePin);
        hide(chatMaxButton);
        hide(chatMinButton);
    } else {
        if (!isFullscreenChatDevice(rc)) rc.makeDraggable(chatRoom, chatHeader);

        rc.makeDraggable(mySettings, mySettingsHeader);

        rc.makeDraggable(sendFileDiv, sendFileDragHandle);
        rc.makeDraggable(receiveFileDiv, receiveFileDragHandle);
        rc.makeDraggable(lobby, lobbyHeader);

        if (navigator.getDisplayMedia || navigator.mediaDevices.getDisplayMedia) {
            if (BUTTONS.main.startScreenButton) {
                show(startScreenButton);
                show(ScreenQualityDiv);
                show(ScreenFpsDiv);
            }
        }
        BUTTONS.chat.chatPinButton && !isMobileDevice && show(chatTogglePin);
        BUTTONS.chat.chatMaxButton && show(chatMaxButton);

        if (BUTTONS.settings.pushToTalk) {
            show(audioFocusControlsDiv);
            show(pushToTalkDiv);
        }
    }
    if (BUTTONS.main.fullScreenButton && !parserResult.browser.name.toLowerCase().includes('safari')) {
        document.onfullscreenchange = () => {
            if (!document.fullscreenElement) rc.isDocumentOnFullScreen = false;
        };
        show(fullScreenButton);
    } else {
        hide(fullScreenButton);
    }

    BUTTONS.main.settingsButton && show(settingsButton);
    updateParticipantViewButtonVisibility();
    isAudioAllowed ? show(stopAudioButton) : BUTTONS.main.startAudioButton && show(startAudioButton);
    isVideoAllowed ? show(stopVideoButton) : BUTTONS.main.startVideoButton && show(startVideoButton);
    if (!BUTTONS.main.startAudioButton) {
        elemDisplay('tabAudioDevicesBtn', false);
        elemDisplay('tabAudioDevices', false);
    }
    if (!BUTTONS.main.startVideoButton) {
        elemDisplay('tabVideoDevicesBtn', false);
        elemDisplay('tabVideoDevices', false);
        elemDisplay('tabVirtualBackgroundBtn', false);
        elemDisplay('tabVirtualBackground', false);
    }
    BUTTONS.settings.fileSharing && show(fileShareButton);
    BUTTONS.settings.lockRoomButton && show(lockRoomButton);

    BUTTONS.settings.lobbyButton && show(lobbyButton);
    updateJoinLockButtons();

    BUTTONS.main.aboutButton && show(aboutButton);
    if (!isMobileDevice) show(pinUnpinGridDiv);

    if (
        isMediaStreamTrackAndTransformerSupported &&
        (BUTTONS.settings.virtualBackground !== undefined ? BUTTONS.settings.virtualBackground : true)
    ) {
        show(tabVirtualBackgroundBtn);
        rc.showVideoImageSelector();
    }
    handleButtons();
    handleSelects();
    handleInputs();
    handleChatEmojiPicker();

    loadSettingsFromLocalStorage();
    startSessionTimer();
    handleButtonsBar();
    handleDropdownHover();
    setupSettingsExtraDropdown();
    setupQuickDeviceSwitchDropdowns();
    checkButtonsBar();

    if (room_password) {
        lockRoomButton.click();
    }
    advisePersistedCameraOffSetting();
    //show(restartICEButton); // TEST
}

// ####################################################
// LOCK/UNLOCK ROOM FOR NEW PARTICIPANTS
// ####################################################

function updateJoinLockButtons() {
    const canLock = BUTTONS.settings.joinLockButton;
    canLock && !isJoinLocked ? show(joinLockButton) : hide(joinLockButton);
    canLock && isJoinLocked ? show(joinUnlockButton) : hide(joinUnlockButton);
}

function confirmJoinLock(lock) {
    Swal.fire({
        background: swalBackground,
        imageUrl: image.locked,
        title: lock ? 'Lock room?' : 'Unlock room?',
        text: lock
            ? 'Are you sure you want to lock the room? No new participants will be able to join from now on.'
            : 'Are you sure you want to unlock the room? New participants will be able to join again.',
        showDenyButton: true,
        confirmButtonText: lock ? 'Lock room' : 'Unlock room',
        denyButtonText: 'Cancel',
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' },
    }).then((result) => {
        if (result.isConfirmed) rc.roomAction(lock ? 'joinLockOn' : 'joinLockOff');
    });
}

// ####################################################
// PROFILE AVATAR URL
// ####################################################

async function updateMyPeerAvatarByUrl() {
    const result = await Swal.fire({
        background: swalBackground,
        title: 'Set avatar URL',
        input: 'url',
        inputLabel: 'Public image URL',
        inputPlaceholder: 'https://example.com/avatar.jpg',
        confirmButtonText: 'Apply',
        showCancelButton: true,
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        inputValidator: (value) => {
            if (!value) return 'Please enter an image URL';
            if (value.startsWith('data:')) return 'Base64 avatars are not supported';
            if (!isValidAvatarURL(value)) return 'Only http/https URLs are supported';
            return null;
        },
        preConfirm: (url) =>
            new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(url);
                img.onerror = () => {
                    Swal.showValidationMessage(
                        'Could not load the image, the URL may be invalid, restricted, or not an image'
                    );
                    resolve(false);
                };
                img.src = url;
            }),
        didOpen: () => {
            const input = document.querySelector('.swal2-input');
            if (!input) return;

            // Preview image
            const preview = document.createElement('img');
            preview.style.cssText =
                'display:none;width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid #4caf50;margin:8px auto 4px;';
            input.parentNode.insertBefore(preview, input);

            function updatePreview(url) {
                if (!url) {
                    preview.style.display = 'none';
                    return;
                }
                preview.src = url;
                preview.style.display = 'block';
            }

            input.addEventListener('input', () => updatePreview(input.value.trim()));

            function makeAvatarImg(url) {
                const img = document.createElement('img');
                img.src = url;
                img.title = 'Click to use this avatar';
                img.style.cssText =
                    'width:48px;height:48px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:border-color 0.2s;object-fit:cover;background:#222;flex-shrink:0;';
                img.addEventListener('mouseover', () => (img.style.borderColor = '#4caf50'));
                img.addEventListener('mouseout', () => (img.style.borderColor = 'transparent'));
                img.addEventListener('click', () => {
                    input.value = url;
                    input.dispatchEvent(new Event('input'));
                    updatePreview(url);
                });
                return img;
            }

            // Self-hosted avatars
            const localLabel = document.createElement('p');
            localLabel.textContent = 'Pick an avatar:';
            localLabel.style.cssText = 'color:#aaa;font-size:12px;margin:10px 0 6px;text-align:center;';

            const localGrid = document.createElement('div');
            localGrid.style.cssText =
                'display:flex;flex-wrap:wrap;justify-content:center;gap:8px;max-height:120px;overflow-y:scroll;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:4px 2px;margin-bottom:4px;';
            localGrid.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });

            for (let i = 1; i <= 25; i++) {
                const url = `${window.location.origin}/images/avatars/avatar_${String(i).padStart(2, '0')}.png`;
                localGrid.appendChild(makeAvatarImg(url));
            }

            let insertAfter = input;
            for (const el of [localLabel, localGrid]) {
                insertAfter.parentNode.insertBefore(el, insertAfter.nextSibling);
                insertAfter = el;
            }
        },
    });

    if (!result.isConfirmed || !result.value) return;

    applyPeerAvatar(result.value);
}

function applyPeerAvatar(avatarSrc) {
    try {
        peer_avatar = avatarSrc;
        hasTemporaryAvatar = true;

        localStorageSettings.peer_avatar = peer_avatar;
        lS.setSettings(localStorageSettings);

        myProfileAvatar.setAttribute('src', peer_avatar);
        rc.setVideoAvatarImgName(rc.peer_id + '__img', peer_name, peer_avatar);
        rc.setMsgAvatar('left', peer_name, peer_avatar);
        updateMyAvatarResetButtonVisibility();

        rc.peer_avatar = peer_avatar;
        rc.peer_info.peer_avatar = peer_avatar;
        rc.updatePeerInfo(peer_name, rc.peer_id, 'avatar', peer_avatar);

        userLog('info', 'Avatar applied and saved for future sessions');
    } catch (err) {
        console.error('Failed to set avatar URL', err);
        userLog('error', 'Unable to apply avatar URL');
    }
}

/** Validate, persist, and broadcast a changed meeting nickname. */
function updateMyPeerName() {
    const input = getId('myProfileNameInput');
    const name = filterXSS(input?.value.trim() || '');
    if (!name || name.length > 32 || isHtml(name)) {
        const message = 'Nickname must contain 1–32 plain-text characters';
        return userLog('warning', window.i18n?.t(message, 'toasts') || message);
    }
    peer_name = name;
    window.localStorage.peer_name = name;
    setCookie(room_id + '_name', name, 30);
    userName.innerText = name;
    rc.peer_name = name;
    rc.peer_info.peer_name = name;
    rc.updatePeerInfo(name, rc.peer_id, 'name', name);
    const message = 'Nickname updated';
    userLog('info', window.i18n?.t(message, 'toasts') || message);
}

/** Upload and apply an avatar selected from the in-meeting Profile tab. */
async function uploadMyPeerAvatar() {
    const input = getId('myProfileAvatarFileInput');
    const file = input?.files?.[0];
    if (input) input.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    const button = getId('myProfileAvatarUploadBtn');
    if (button) button.disabled = true;
    try {
        const avatarUrl = await window.BodrikProfile.uploadFile(file, peer_token);
        applyPeerAvatar(avatarUrl);
    } catch (error) {
        console.error('Avatar upload failed', error);
        userLog('error', 'Unable to upload avatar');
    } finally {
        if (button) button.disabled = false;
    }
}

function resetMyPeerAvatarInMemory() {
    peer_avatar = false;
    hasTemporaryAvatar = false;
    localStorageSettings.peer_avatar = '';
    lS.setSettings(localStorageSettings);

    myProfileAvatar.setAttribute('src', rc.genAvatarSvg(peer_name, 64));

    rc.setVideoAvatarImgName(rc.peer_id + '__img', peer_name, false);
    rc.setMsgAvatar('left', peer_name, false);
    updateMyAvatarResetButtonVisibility();

    rc.peer_avatar = false;
    rc.peer_info.peer_avatar = false;
    rc.updatePeerInfo(peer_name, rc.peer_id, 'avatar', false);

    userLog('info', 'Avatar reset to default');
}

function updateMyAvatarResetButtonVisibility() {
    if (!myProfileAvatarResetBtn) return;
    myProfileAvatarResetBtn.classList.toggle('hidden', !hasTemporaryAvatar);
    if (myProfileAvatarUploadBtn) show(myProfileAvatarUploadBtn);
}

// ####################################################
// UTILS
// ####################################################

// renderRoomTemplate is defined in RoomTemplate.js

/** Build the pre-join title from the public invitation slug, never the private provider room ID. */
function meetingJoinTitle() {
    const label = window.i18n?.t('Bodrik FM meeting', 'labels') || 'Bodrik FM meeting';
    return publicRoomSlug ? `${label} - ${publicRoomSlug}` : label;
}

/** Format the current presenter role for the profile, including live language changes. */
function presenterLabel(value) {
    const source = value ? 'Yes' : 'No';
    return window.i18n?.t(source, 'labels') || source;
}

/** Update the visible chat count in the current meeting language. */
function updateChatConversationsCount() {
    const el = getId('chatConversationsCount');
    if (!el) return;
    const list = getId('participantsList');
    const count = list
        ? Array.from(list.querySelectorAll(':scope > li')).filter((li) => li.style.display !== 'none').length
        : 0;
    const label = window.i18n?.t('Chats: {count}', 'labels') || 'Chats: {count}';
    el.textContent = count > 0 ? label.replace('{count}', count) : '';
}

/** Rebuild chat labels after the user switches the native meeting language. */
async function refreshChatLanguage() {
    if (!rc || !participantsList) return;
    const selected = participantsList.querySelector('li.active');
    const peerId = selected?.id;
    const peerName = rc.chatPeerName;
    const peerAvatar = rc.chatPeerAvatar;
    await getRoomParticipants();
    if (peerId && getId(peerId)) {
        rc.showPeerAboutAndMessages(peerId, peerName, peerAvatar, { target: { tagName: 'BUTTON' } });
    }
}

window.addEventListener('bodrik:languagechange', () => {
    if (Swal.getHtmlContainer()?.contains(initUser)) Swal.getTitle().textContent = meetingJoinTitle();
    if (getId('isUserPresenter')) getId('isUserPresenter').textContent = presenterLabel(isPresenter);
    const name = rc?.getId(rc.peer_id + '__name');
    for (const node of name?.childNodes || []) {
        if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = node.nodeValue.replace(/\((me|вы)\)/, rc.meSuffix().trim());
        }
    }
    refreshChatLanguage().catch((error) => console.warn('Cannot refresh chat language', error));
});

function updateChatCharCount() {
    const el = getId('chatCharCount');
    if (!el) return;
    const len = chatMessage ? chatMessage.value.length : 0;
    el.textContent = `${len} / 4000`;
}

/** Show the empty-chat notice when public and private message lists are empty. */
function updateChatEmptyNotice() {
    const chatLists = [getId('chatPublicMessages'), getId('chatPrivateMessages')].filter(Boolean);
    const emptyNotice = getId('chatEmptyNotice');
    if (!emptyNotice) return;
    const hasMessages = chatLists.some((ul) => ul.children.length > 0);
    hasMessages ? emptyNotice.classList.add('hidden') : emptyNotice.classList.remove('hidden');
}

function elemDisplay(elem, display, mode = 'block') {
    elem = typeof elem === 'string' ? getId(elem) : elem;
    if (!elem) {
        elementNotFound(elem);
        return;
    }
    elem.style.display = display ? mode : 'none';
}

function hide(elem) {
    elem = typeof elem === 'string' ? getId(elem) : elem;
    if (!elem || !elem.classList) {
        elementNotFound(elem);
        return;
    }
    if (!elem.classList.contains('hidden')) elem.classList.toggle('hidden');
}

function show(elem) {
    elem = typeof elem === 'string' ? getId(elem) : elem;
    if (!elem || !elem.classList) {
        elementNotFound(elem);
        return;
    }
    if (elem.classList.contains('hidden')) elem.classList.toggle('hidden');
}

function disable(elem, disabled) {
    elem = typeof elem === 'string' ? getId(elem) : elem;
    if (!elem) {
        elementNotFound(elem);
        return;
    }
    elem.disabled = disabled;
}

function setColor(elem, color) {
    elem = typeof elem === 'string' ? getId(elem) : elem;
    if (!elem) {
        elementNotFound(elem);
        return;
    }
    elem.style.color = color;
}

function getColor(elem) {
    elem = typeof elem === 'string' ? getId(elem) : elem;
    if (!elem) {
        elementNotFound(elem);
        return undefined;
    }
    return elem.style.color;
}

function elementNotFound(element) {
    console.error('Element Not Found', element);
    return false;
}

// ####################################################
// SESSION TIMER
// ####################################################

function startSessionTimer() {
    sessionTime.style.display = 'inline';
    let callStartTime = Date.now();
    let callElapsedSecondsTime = 0;
    setInterval(function printTime() {
        callElapsedSecondsTime++;
        let callElapsedTime = Date.now() - callStartTime;
        sessionTime.innerText = getTimeToString(callElapsedTime);
        const myCurrentSessionTime = document.querySelector('.current-session-time.notranslate');
        if (myCurrentSessionTime) myCurrentSessionTime.innerText = secondsToHms(callElapsedSecondsTime);
    }, 1000);
}

function getTimeToString(time) {
    let diffInHrs = time / 3600000;
    let hh = Math.floor(diffInHrs);
    let diffInMin = (diffInHrs - hh) * 60;
    let mm = Math.floor(diffInMin);
    let diffInSec = (diffInMin - mm) * 60;
    let ss = Math.floor(diffInSec);
    let formattedHH = hh.toString().padStart(2, '0');
    let formattedMM = mm.toString().padStart(2, '0');
    let formattedSS = ss.toString().padStart(2, '0');
    return `${formattedHH}:${formattedMM}:${formattedSS}`;
}

function secondsToHms(d) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);
    const hDisplay = h > 0 ? h + 'h' : '';
    const mDisplay = m > 0 ? m + 'm' : '';
    const sDisplay = s > 0 ? s + 's' : '';
    return hDisplay + ' ' + mDisplay + ' ' + sDisplay;
}

// ####################################################
// RECORDING TIMER
// ####################################################

function secondsToHms(d) {
    d = Number(d);
    let h = Math.floor(d / 3600);
    let m = Math.floor((d % 3600) / 60);
    let s = Math.floor((d % 3600) % 60);
    let hDisplay = h > 0 ? h + 'h' : '';
    let mDisplay = m > 0 ? m + 'm' : '';
    let sDisplay = s > 0 ? s + 's' : '';
    return hDisplay + ' ' + mDisplay + ' ' + sDisplay;
}

function startRecordingTimer() {
    recElapsedTime = 0;
    recTimer = setInterval(function printTime() {
        if (rc.isRecording()) {
            recElapsedTime++;
            recordingStatus.innerText = secondsToHms(recElapsedTime);
            rc._getRecIndicators().forEach((el) => {
                el.innerHTML = '🔴 ' + (recordingStatus.innerText !== '0s' ? recordingStatus.innerText : 'REC');
            });
        }
    }, 1000);
}
function stopRecordingTimer() {
    clearInterval(recTimer);
    recordingStatus.innerText = '0s';
}

// ####################################################
// HTML BUTTONS
// ####################################################

function handleButtons() {
    // Lobby...
    document.getElementById('lobbyUsers').addEventListener('click', function (event) {
        switch (event.target.id) {
            case 'lobbyAcceptAllBtn':
                rc.lobbyAcceptAll();
                break;
            case 'lobbyRejectAllBtn':
                rc.lobbyRejectAll();
                break;
            default:
                break;
        }
    });
    bottomButtons.onmouseover = () => {
        isButtonsBarOver = true;
    };
    bottomButtons.onmouseout = () => {
        isButtonsBarOver = false;
    };
    exitButton.onclick = (e) => {
        if (e && e.shiftKey) return leaveRoom();
        toggleExitMenu();
    };
    if (exitLeaveBtn) exitLeaveBtn.onclick = handleExitLeave;
    if (exitLeaveAllBtn) exitLeaveAllBtn.onclick = handleExitLeaveForAll;
    document.addEventListener('click', handleExitMenuOutsideClick);
    setupExitMenuHover();

    shareButton.onclick = () => {
        shareRoom(true);
    };

    settingsButton.onclick = () => {
        rc.toggleMySettings();
    };
    participantViewMenu.onclick = (e) => {
        const viewButton = e.target.closest('[data-participant-view]');
        if (!viewButton) return;
        setParticipantViewMode(viewButton.dataset.participantView);
        setTimeout(() => bootstrap.Dropdown.getOrCreateInstance(participantViewButton).hide());
    };
    mySettingsCloseBtn.onclick = () => {
        rc.toggleMySettings();
    };
    myProfileAvatarUploadBtn.onclick = () => getId('myProfileAvatarFileInput').click();
    getId('myProfileAvatarFileInput').onchange = uploadMyPeerAvatar;
    getId('myProfileNameSaveBtn').onclick = updateMyPeerName;
    getId('myProfileNameInput').onkeydown = (event) => {
        if (event.key === 'Enter') updateMyPeerName();
    };
    myProfileAvatarResetBtn.onclick = () => {
        resetMyPeerAvatarInMemory();
    };
    tabVideoDevicesBtn.onclick = (e) => {
        rc.openTab(e, 'tabVideoDevices');
    };
    tabVirtualBackgroundBtn.onclick = (e) => {
        rc.openTab(e, 'tabVirtualBackground');
    };
    tabAudioDevicesBtn.onclick = (e) => {
        rc.openTab(e, 'tabAudioDevices');
    };
    tabRecordingBtn.onclick = (e) => {
        rc.openTab(e, 'tabRecording');
    };
    tabRoomBtn.onclick = (e) => {
        rc.openTab(e, 'tabRoom');
    };

    tabAspectBtn.onclick = (e) => {
        rc.openTab(e, 'tabAspect');
    };
    tabModeratorBtn.onclick = (e) => {
        rc.openTab(e, 'tabModerator');
    };
    tabProfileBtn.onclick = (e) => {
        rc.openTab(e, 'tabProfile');
    };
    tabShortcutsBtn.onclick = (e) => {
        rc.openTab(e, 'tabShortcuts');
    };
    tabLanguagesBtn.onclick = (e) => {
        rc.openTab(e, 'tabLanguages');
    };

    speakerTestBtn.onclick = () => {
        playSpeaker(speakerSelect?.value, 'speaker');
    };
    copyRoomUrlBtn.onclick = () => {
        navigator.share ? shareRoom(true) : copyRoomURL();
    };
    chatButton.onclick = () => {
        rc.toggleChat();
    };
    participantsButton.onclick = async () => {
        rc.toggleParticipants();
    };

    chatHideParticipantsList.onclick = (e) => {
        rc.toggleShowParticipants(true);
    };
    chatShowParticipantsListBtn.onclick = (e) => {
        rc.toggleShowParticipants(true);
    };
    chatShareRoomBtn.onclick = (e) => {
        shareRoom(true);
    };
    chatGhostButton.onclick = (e) => {
        rc.chatToggleBg();
    };
    chatCleanButton.onclick = () => {
        rc.chatClean();
    };
    chatSaveButton.onclick = () => {
        rc.chatSave();
    };
    chatCloseButton.onclick = () => {
        rc.toggleChat();
    };
    chatTogglePin.onclick = () => {
        rc.toggleChatPin();
    };
    chatMaxButton.onclick = () => {
        rc.chatMaximize();
    };
    chatMinButton.onclick = () => {
        rc.chatMinimize();
    };
    chatCleanTextButton.onclick = () => {
        rc.cleanMessage();
    };
    chatPasteButton.onclick = () => {
        rc.pasteMessage();
    };
    chatSendButton.onclick = async () => {
        const image = window.BodrikChatImage?.pending;
        if (!image) return rc.sendMessage();
        const caption = chatMessage.value.trim();
        if (caption.length > 1000) {
            return userLog('warning', 'Подпись к картинке не должна превышать 1000 символов.', 'top-end');
        }
        if (!rc.thereAreParticipants()) return userLog('warning', 'Нет участников для отправки картинки.', 'top-end');
        if (Date.now() - rc.chatMessageTimeLast <= rc.chatMessageTimeBetween) {
            return userLog('warning', 'Подождите перед отправкой следующего сообщения.', 'top-end');
        }
        chatSendButton.disabled = true;
        try {
            const imageUrl = await window.BodrikChatImage.upload(image, peer_token);
            const draft = caption;
            try {
                chatMessage.value = caption ? `${imageUrl}\n${caption}` : imageUrl;
                rc.sendMessage();
                window.BodrikChatImage.clear();
            } catch (error) {
                chatMessage.value = draft;
                throw error;
            }
        } catch (error) {
            console.error('Chat image upload failed', error);
            userLog('error', 'Не удалось загрузить картинку. Попробуйте ещё раз.', 'top-end');
        } finally {
            chatSendButton.disabled = false;
        }
    };
    chatEmojiButton.onclick = (event) => {
        if (!isMobileDevice && event.detail > 0) return;
        rc.toggleChatEmoji();
    };
    chatMarkdownButton.onclick = () => {
        isChatMarkdownOn = !isChatMarkdownOn;
        chatMarkdownButton.classList.toggle('is-active', isChatMarkdownOn);
        chatMarkdownButton.setAttribute('aria-pressed', String(isChatMarkdownOn));
    };
    fullScreenButton.onclick = () => {
        rc.toggleRoomFullScreen();
    };
    if (isMobileDevice) {
        recordingTypeSelect.value = 'camera';
        recordingScreenOption.disabled = true;
    }
    recordingActionButton.onclick = () => {
        isRecording ? stopRecButton.click() : startRecButton.click();
    };
    startRecButton.onclick = () => {
        rc.startRecording();
    };
    stopRecButton.onclick = () => {
        rc.stopRecording();
    };
    pauseRecButton.onclick = () => {
        rc.pauseRecording();
    };
    resumeRecButton.onclick = () => {
        rc.resumeRecording();
    };
    swapCameraButton.onclick = () => {
        rc.closeThenProduce(RoomClient.mediaType.video, null, true);
    };
    raiseHandButton.onclick = () => {
        rc.updatePeerInfo(peer_name, socket.id, 'hand', true);
        hideClassElements('videoMenuBar');
    };
    lowerHandButton.onclick = () => {
        rc.updatePeerInfo(peer_name, socket.id, 'hand', false);
    };
    startAudioButton.onclick = async () => {
        const moderator = rc.getModerator();
        if (moderator.audio_cant_unmute) {
            return userLog('warning', 'The moderator does not allow you to unmute', 'top-end', 6000);
        }
        if (isPushToTalkActive) return;
        setAudioButtonsDisabled(true);
        if (!isEnumerateAudioDevices) await initEnumerateAudioDevices();

        const producerExist = rc.producerExist(RoomClient.mediaType.audio);
        console.log('START AUDIO producerExist --->', producerExist);

        producerExist
            ? await rc.resumeProducer(RoomClient.mediaType.audio)
            : await rc.produce(RoomClient.mediaType.audio, microphoneSelect.value);

        rc.updatePeerInfo(peer_name, socket.id, 'audio', true);
    };
    stopAudioButton.onclick = async () => {
        if (isPushToTalkActive) return;
        setAudioButtonsDisabled(true);

        const producerExist = rc.producerExist(RoomClient.mediaType.audio);
        console.log('STOP AUDIO producerExist --->', producerExist);

        producerExist
            ? await rc.pauseProducer(RoomClient.mediaType.audio)
            : await rc.closeProducer(RoomClient.mediaType.audio);

        rc.updatePeerInfo(peer_name, socket.id, 'audio', false);
    };

    [startAudioButton, stopAudioButton].forEach((button) => {
        button.addEventListener('pointerdown', (e) => {
            if (!isPushToTalkActive) return;
            button.setPointerCapture(e.pointerId);
            setPushToTalkPressed(true);
        });
        button.addEventListener('pointerup', () => setPushToTalkPressed(false));
        button.addEventListener('pointercancel', () => setPushToTalkPressed(false));
    });

    startVideoButton.onclick = async () => {
        const moderator = rc.getModerator();
        if (moderator.video_cant_unhide) {
            return userLog('warning', 'The moderator does not allow you to unhide', 'top-end', 6000);
        }
        await window.BodrikCameraAccess.startCamera(rc);
    };
    stopVideoButton.onclick = () => {
        setVideoButtonsDisabled(true);
        rc.closeProducer(RoomClient.mediaType.video);
        // await rc.pauseProducer(RoomClient.mediaType.video);
    };
    startScreenButton.onclick = async () => {
        const moderator = rc.getModerator();
        if (moderator.screen_cant_share) {
            return userLog('warning', 'The moderator does not allow you to share the screen', 'top-end', 6000);
        }
        await rc.produce(RoomClient.mediaType.screen);
    };
    stopScreenButton.onclick = () => {
        rc.closeProducer(RoomClient.mediaType.screen);
    };

    fileShareButton.onclick = () => {
        rc.selectFileToShare(socket.id, true);
    };
    fileShareExtraButton.onclick = () => {
        fileShareButton.click();
    };
    fileShareChatButton.onclick = () => {
        rc.chatPeerId === 'all' ? fileShareButton.click() : rc.selectFileToShare(rc.chatPeerId, false, rc.chatPeerName);
    };

    sendAbortBtn.onclick = () => {
        rc.abortFileTransfer();
    };
    receiveAbortBtn.onclick = () => {
        rc.abortReceiveFileTransfer();
    };
    receiveHideBtn.onclick = () => {
        rc.hideFileTransfer();
    };

    document.querySelectorAll('[data-panel-action-target]').forEach((button) => {
        button.onclick = () => {
            document.getElementById(button.dataset.panelActionTarget)?.click();
        };
    });
    participantsUnreadMessagesBtn.onclick = () => {
        rc.toggleUnreadMsg();
    };
    participantsRaiseHandBtn.onclick = () => {
        rc.toggleRaiseHands();
    };
    participantsHiddenViewBtn.onclick = () => {
        toggleHiddenParticipantsFilter();
    };
    participantsHiddenShowAllBtn.onclick = () => {
        showAllHiddenParticipants();
    };
    searchParticipantsFromList.onkeyup = () => {
        rc.searchPeer();
    };
    lockRoomButton.onclick = () => {
        rc.roomAction('lock');
    };
    unlockRoomButton.onclick = () => {
        rc.roomAction('unlock');
    };
    joinLockButton.onclick = () => {
        confirmJoinLock(true);
    };
    joinUnlockButton.onclick = () => {
        confirmJoinLock(false);
    };
    aboutButton.onclick = () => {
        showAbout();
    };
    restartICEButton.onclick = async () => {
        await rc.restartIce();
    };
}

// ####################################################
// HANDLE INIT USER
// ####################################################

function setButtonsInit() {
    if (!isMobileDevice) {
        setTippy('initAudioButton', 'Toggle the audio', 'top');
        setTippy('initVideoButton', 'Toggle the video', 'top');
        setTippy('initAudioVideoButton', 'Toggle the audio & video', 'top');
        setTippy('initStartScreenButton', 'Toggle screen sharing', 'top');
        setTippy('initStopScreenButton', 'Toggle screen sharing', 'top');
        setTippy('initVideoMirrorButton', 'Toggle video mirror', 'top');
        setTippy('initVirtualBackgroundButton', 'Set Virtual Background or Blur', 'top');
        setTippy('initUsernameEmojiButton', 'Toggle username emoji', 'top');
        setTippy('initExitButton', 'Leave meeting', 'top');
    }
    if (!isAudioAllowed) hide(initAudioButton);
    if (!isVideoAllowed) hide(initVideoButton);
    if (!isAudioAllowed || !isVideoAllowed) hide(initAudioVideoButton);
    if ((!isAudioAllowed && !isVideoAllowed) || isMobileDevice) hide(initVideoAudioRefreshButton);
    isAudioVideoAllowed = isAudioAllowed && isVideoAllowed;
}

function handleSelectsInit() {
    // devices init options
    initVideoSelect.onchange = async () => {
        await changeCamera(initVideoSelect.value);
        videoSelect.selectedIndex = initVideoSelect.selectedIndex;
        refreshLsDevices();
    };
    initMicrophoneSelect.onchange = () => {
        microphoneSelect.selectedIndex = initMicrophoneSelect.selectedIndex;
        refreshLsDevices();
    };
    initSpeakerSelect.onchange = () => {
        speakerSelect.selectedIndex = initSpeakerSelect.selectedIndex;
        refreshLsDevices();
    };
}

async function setSelectsInit() {
    if (localStorageDevices) {
        console.log('04.0 ----> Get Local Storage Devices before', localStorageDevices);
        //
        const initMicrophoneExist = selectOptionByValueExist(initMicrophoneSelect, localStorageDevices.audio.select);
        const initSpeakerExist = selectOptionByValueExist(initSpeakerSelect, localStorageDevices.speaker.select);
        const initVideoExist = selectOptionByValueExist(initVideoSelect, localStorageDevices.video.select);
        //
        const microphoneExist = selectOptionByValueExist(microphoneSelect, localStorageDevices.audio.select);
        const speakerExist = selectOptionByValueExist(speakerSelect, localStorageDevices.speaker.select);
        const videoExist = selectOptionByValueExist(videoSelect, localStorageDevices.video.select);

        console.log('Check for audio changes', {
            previous: localStorageDevices.audio.select,
            current: microphoneSelect.value,
        });

        if (!initMicrophoneExist || !microphoneExist) {
            console.log('04.1 ----> Audio devices seems changed, use default index 0');
            initMicrophoneSelect.selectedIndex = 0;
            microphoneSelect.selectedIndex = 0;
            refreshLsDevices();
        }

        console.log('Check for speaker changes', {
            previous: localStorageDevices.speaker.select,
            current: speakerSelect.value,
        });

        if (!initSpeakerExist || !speakerExist) {
            console.log('04.2 ----> Speaker devices seems changed, use default index 0');
            initSpeakerSelect.selectedIndex = 0;
            speakerSelect.selectedIndex = 0;
            refreshLsDevices();
        }

        console.log('Check for video changes', {
            previous: localStorageDevices.video.select,
            current: videoSelect.value,
        });

        if (!initVideoExist || !videoExist) {
            console.log('04.3 ----> Video devices seems changed, use default index 0');
            initVideoSelect.selectedIndex = 0;
            videoSelect.selectedIndex = 0;
            refreshLsDevices();
        }

        //
        console.log('04.4 ----> Get Local Storage Devices after', lS.getLocalStorageDevices());
    }
    if (initVideoSelect.value) await changeCamera(initVideoSelect.value);
}

function selectOptionByValueExist(selectElement, value) {
    let foundValue = false;
    for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].value === value) {
            selectElement.selectedIndex = i;
            foundValue = true;
            break;
        }
    }
    return foundValue;
}

function refreshLsDevices() {
    lS.setLocalStorageDevices(lS.MEDIA_TYPE.video, videoSelect.selectedIndex, videoSelect.value);
    lS.setLocalStorageDevices(lS.MEDIA_TYPE.audio, microphoneSelect.selectedIndex, microphoneSelect.value);
    lS.setLocalStorageDevices(lS.MEDIA_TYPE.speaker, speakerSelect.selectedIndex, speakerSelect.value);
}

async function changeCamera(deviceId) {
    if (initStream) {
        await stopTracks(initStream);
        elemDisplay('initVideo', true);
        elemDisplay('initVideoLoader', true, 'flex');
        initVideoContainerShow();
    }
    const videoConstraints = {
        audio: false,
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            deviceId: { exact: deviceId },
            aspectRatio: 1.777,
        },
    };
    await navigator.mediaDevices
        .getUserMedia(videoConstraints)
        .then(async (camStream) => {
            initVideo.srcObject = camStream;
            initStream = camStream;
            console.log(
                '04.5 ----> Success attached init cam video stream',
                initStream.getVideoTracks()[0].getSettings()
            );
            checkInitConfig();
            camera = detectCameraFacingMode(camStream);
            handleCameraMirror(initVideo);
            elemDisplay('initVideoLoader', false);
            isInitVideoLoaded = true;
        })
        .catch((error) => {
            console.error('[Error] changeCamera', error);
            handleMediaError('video/audio', error, '/');
            isInitVideoLoaded = false;
            elemDisplay('initVideoLoader', false);
        });

    if (isVideoAllowed) {
        await loadVirtualBackgroundSettings();
    }
}

function detectCameraFacingMode(stream) {
    if (!stream || !stream.getVideoTracks().length) {
        console.warn("No video track found in the stream. Defaulting to 'user'.");
        return 'user';
    }
    const videoTrack = stream.getVideoTracks()[0];
    const settings = videoTrack.getSettings();
    const capabilities = videoTrack.getCapabilities?.() || {};
    const facingMode = settings.facingMode || capabilities.facingMode?.[0] || 'user';
    return facingMode === 'environment' ? 'environment' : 'user';
}

// ####################################################
// HANDLE MEDIA ERROR
// ####################################################

/** Report media failures; camera errors use an actionable localized dialog instead of a technical dump. */
function handleMediaError(mediaType, err, redirectURL = false) {
    if (mediaType === 'videoType') {
        window.BodrikCameraAccess.showError(err);
        return;
    }
    sound('alert');

    let errMessage = err;
    let getUserMediaError = true;

    switch (err.name) {
        case 'NotFoundError':
        case 'DevicesNotFoundError':
            errMessage = 'Required track is missing';
            break;
        case 'NotReadableError':
        case 'TrackStartError':
            errMessage = 'Already in use';
            break;
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
            errMessage = 'Constraints cannot be satisfied by available devices';
            if (videoQuality.selectedIndex != 0) {
                videoQuality.selectedIndex = rc.videoQualitySelectedIndex;
            }
            break;
        case 'NotAllowedError':
        case 'PermissionDeniedError':
            errMessage = 'Permission denied in browser';
            break;
        case 'TypeError':
            errMessage = 'Empty constraints object';
            break;
        default:
            getUserMediaError = false;
            break;
    }

    if (mediaType === 'screenType' && err.name === 'NotAllowedError') {
        console.warn('User cancelled the screen sharing prompt');
        return;
    }

    let html = `
    <ul style="text-align: left">
        <li>Media type: ${mediaType}</li>
        <li>Error name: ${err.name}</li>
        <li>
            <p>Error message:</p>
            <p style="color: red">${errMessage}</p>
        </li>`;

    if (getUserMediaError) {
        html += `
        <li>Common: <a href="https://blog.addpipe.com/common-getusermedia-errors" target="_blank">getUserMedia errors</a></li>`;
    }
    html += `
        </ul>
    `;

    popupHtmlMessage(null, image.forbidden, 'Access denied', html, 'center', redirectURL);

    const errorOutput = getUserMediaError
        ? `Access denied for ${mediaType} device [${err.name}]: ${errMessage} check the common getUserMedia errors: https://blog.addpipe.com/common-getusermedia-errors/`
        : `${err.message}`;

    throw new Error(errorOutput);
}

function popupHtmlMessage(icon, imageUrl, title, html, position, redirectURL = false, reloadPage = false) {
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
    }).then((result) => {
        if (result.isConfirmed) {
            if (redirectURL) {
                return openURL(redirectURL);
            }
            if (reloadPage) {
                location.href = location.href;
            }
        }
    });
}

async function toggleScreenSharing() {
    if (initStream) {
        await stopTracks(initStream);
        elemDisplay('initVideo', true);
        elemDisplay('initVideoLoader', true, 'flex');
        initVideoContainerShow();
    }
    joinRoomWithScreen = !joinRoomWithScreen;
    if (joinRoomWithScreen) {
        const defaultFrameRate = { ideal: 30 };
        const selectedValue = getId('videoFps').options[localStorageSettings.screen_fps].value;
        const customFrameRate = parseInt(selectedValue, 10);
        const frameRate = selectedValue == 'max' ? defaultFrameRate : customFrameRate;
        await navigator.mediaDevices
            .getDisplayMedia({ audio: true, video: { frameRate: frameRate } })
            .then((screenStream) => {
                if (initVideo.classList.contains('mirror')) {
                    initVideo.classList.toggle('mirror');
                }
                initVideo.srcObject = screenStream;
                initStream = screenStream;
                console.log('04.6 ----> Success attached init screen video stream', initStream);
                elemDisplay('initVideoLoader', false);
                show(initStopScreenButton);
                hide(initStartScreenButton);
                disable(initVideoSelect, true);
                disable(initVideoButton, true);
                disable(initAudioVideoButton, true);
                disable(initVideoAudioRefreshButton, true);
                disable(initVirtualBackgroundButton, true);
            })
            .catch((error) => {
                console.error('[Error] toggleScreenSharing', error);
                joinRoomWithScreen = false;
                return checkInitVideo(isVideoAllowed);
            });
    } else {
        checkInitVideo(isVideoAllowed);
        hide(initStopScreenButton);
        show(initStartScreenButton);
        disable(initVideoSelect, false);
        disable(initVideoButton, false);
        disable(initAudioVideoButton, false);
        disable(initVideoAudioRefreshButton, false);
        disable(initVirtualBackgroundButton, false);
    }
}

function handleCameraMirror(video) {
    // Keep rear camera unmirrored and apply current session preference to front camera only.
    if (camera === 'environment') {
        video.classList.remove('mirror');
        return;
    }

    video.classList.toggle('mirror', !!sessionVideoMirror);
}

function updateParticipantViewButtonVisibility() {
    !isMobileDevice ? show(participantViewDropdown) : hide(participantViewDropdown);
}

function setParticipantViewMode(requestedMode, persist = true, notify = true) {
    const supportedModes = new Set([
        'grid',
        'speaker-top',
        'speaker-bottom',
        'speaker-left',
        'speaker-right',
        'speaker-1:1',
    ]);
    const migratedMode = requestedMode === 'default' ? 'grid' : requestedMode;
    let mode = supportedModes.has(migratedMode) ? migratedMode : 'grid';

    participantViewMode.value = mode;
    document.querySelectorAll('#participantViewMenu [data-participant-view]').forEach((button) => {
        const active = button.dataset.participantView === mode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active);
    });

    const pinPosition = mode;
    const isSpeakerView = pinPosition.startsWith('speaker-');

    if (isSpeakerView) {
        rc.clearVideoFocusMode();
        pinVideoPosition.value = pinPosition;
        localStorageSettings.pin_grid = pinVideoPosition.selectedIndex;
        rc.autoPinVideoForLayout();
        rc.toggleVideoPin(pinPosition);
        if (notify && !rc.isVideoPinned) {
            rc.userLog('info', 'No participant video is available for this speaker view', 'top-end');
        }
    } else {
        pinVideoPosition.value = 'speaker-left';
        localStorageSettings.pin_grid = pinVideoPosition.selectedIndex;
        clearTimeout(rc.participantViewRestoreTimer);
        rc.participantViewRestoreTimer = null;
    }

    if (!isSpeakerView && rc.isVideoPinned && rc.pinnedVideoPlayerId) {
        const pinButton = getId(`${rc.pinnedVideoPlayerId}__pin`);
        if (pinButton) {
            rc.isApplyingParticipantViewMode = true;
            try {
                pinButton.click();
            } finally {
                rc.isApplyingParticipantViewMode = false;
            }
        }
    }

    if (persist) {
        localStorageSettings.participant_view = mode;
        lS.setSettings(localStorageSettings);
    }
    if (!isSpeakerView) resizeVideoMedia();
}

function playPushToTalkBlip(pressed) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
        if (!pushToTalkAudioContext || pushToTalkAudioContext.state === 'closed') {
            pushToTalkAudioContext = new AudioContextClass();
        }
        if (pushToTalkAudioContext.state === 'suspended') {
            pushToTalkAudioContext.resume().catch((err) => console.warn('Push-to-talk AudioContext resume', err));
        }

        const oscillator = pushToTalkAudioContext.createOscillator();
        const gain = pushToTalkAudioContext.createGain();
        const now = pushToTalkAudioContext.currentTime;
        const duration = 0.08;

        oscillator.connect(gain);
        gain.connect(pushToTalkAudioContext.destination);
        oscillator.frequency.setValueAtTime(pressed ? 880 : 800, now);
        oscillator.frequency.linearRampToValueAtTime(pressed ? 1200 : 500, now + duration);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        oscillator.start(now);
        oscillator.stop(now + duration);
    } catch (err) {
        console.warn('Unable to play push-to-talk blip', err);
    }
}

function updatePushToTalkUi(enabled, transmitting = false) {
    const audioSplit = getId('startAudioSplit');
    const status = getId('pushToTalkStatus');
    const startIcon = startAudioButton.querySelector('i');
    const stopIcon = stopAudioButton.querySelector('i');

    audioSplit.classList.toggle('ptt-enabled', enabled);
    audioSplit.classList.toggle('ptt-transmitting', enabled && transmitting);
    status.classList.toggle('hidden', !enabled || !transmitting);
    startIcon.className = enabled ? 'fas fa-microphone-lines' : 'fas fa-microphone-slash';
    stopIcon.className = enabled ? 'fas fa-microphone-lines' : 'fas fa-microphone';
}

function setPushToTalkPressed(pressed) {
    if (!isPushToTalkActive || pressed === isPushToTalkPressed) return;

    isPushToTalkPressed = pressed;
    updatePushToTalkUi(true, pressed);
    playPushToTalkBlip(pressed);

    pushToTalkTransition = pushToTalkTransition
        .catch(() => {})
        .then(async () => {
            if (pressed) {
                await rc.resumeProducer(RoomClient.mediaType.audio);
                rc.updatePeerInfo(peer_name, socket.id, 'audio', true);
                console.log('Push-to-talk: audio resumed');
            } else {
                await rc.pauseProducer(RoomClient.mediaType.audio);
                rc.updatePeerInfo(peer_name, socket.id, 'audio', false);
                console.log('Push-to-talk: audio paused');
            }
        })
        .catch((error) => console.error('Push-to-talk transition failed', error));
    return pushToTalkTransition;
}

/** Bind device, recording, and appearance preferences to their controls. */
function handleSelects() {
    // devices options
    videoSelect.onchange = (e) => {
        // Only reset the selected video quality on a genuine user-initiated device change.
        // A new camera may not support the previously chosen resolution, so fall back to default.
        // Programmatic calls (e.g. applyVirtualBackground) pass no event and must keep the quality.
        if (e && e.isTrusted) videoQuality.selectedIndex = 0;
        // If video is currently OFF, just update selection for the next start.
        if (video) rc.closeThenProduce(RoomClient.mediaType.video, videoSelect.value);
        refreshLsDevices();
    };
    videoQuality.onchange = () => {
        rc.closeThenProduce(RoomClient.mediaType.video, videoSelect.value);
    };
    screenQuality.onchange = () => {
        rc.closeThenProduce(RoomClient.mediaType.screen);
    };
    screenOptimization.onchange = () => {
        rc.closeThenProduce(RoomClient.mediaType.screen);
        localStorageSettings.screen_optimization = screenOptimization.selectedIndex;
        lS.setSettings(localStorageSettings);
    };
    videoFps.onchange = () => {
        rc.closeThenProduce(RoomClient.mediaType.video, videoSelect.value);
        localStorageSettings.video_fps = videoFps.selectedIndex;
        lS.setSettings(localStorageSettings);
    };
    screenFps.onchange = () => {
        rc.closeThenProduce(RoomClient.mediaType.screen);
        localStorageSettings.screen_fps = screenFps.selectedIndex;
        lS.setSettings(localStorageSettings);
    };
    microphoneSelect.onchange = () => {
        // If audio is currently OFF, just update selection for the next start.
        if (audio) rc.closeThenProduce(RoomClient.mediaType.audio, microphoneSelect.value);
        refreshLsDevices();
    };
    speakerSelect.onchange = () => {
        rc.changeAudioDestination();
        refreshLsDevices();
    };
    speakerVolume.oninput = () => {
        setSpeakerVolume(speakerVolume.value);
    };
    speakerVolume.onchange = () => {
        localStorageSettings.speaker_volume = Number(speakerVolume.value);
        lS.setSettings(localStorageSettings);
    };
    switchDominantSpeakerFocus.onchange = async (e) => {
        localStorageSettings.dominant_speaker_focus = e.currentTarget.checked;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };

    switchPushToTalk.onchange = async (e) => {
        const enablePushToTalk = e.currentTarget.checked;
        isPushToTalkActive = enablePushToTalk;
        isPushToTalkPressed = false;
        updatePushToTalkUi(isPushToTalkActive);

        if (isPushToTalkActive) {
            if (!rc.producerExist(RoomClient.mediaType.audio)) {
                console.log('Push-to-talk: start audio producer');
                setAudioButtonsDisabled(true);
                if (!isEnumerateAudioDevices) await initEnumerateAudioDevices();
                await rc.produce(RoomClient.mediaType.audio, microphoneSelect.value);
            }
            await rc.pauseProducer(RoomClient.mediaType.audio);
            rc.updatePeerInfo(peer_name, socket.id, 'audio', false);
        } else if (rc.producerExist(RoomClient.mediaType.audio)) {
            console.log('Push-to-talk: resume audio producer');
            await rc.resumeProducer(RoomClient.mediaType.audio);
            rc.updatePeerInfo(peer_name, socket.id, 'audio', true);
        }

        e.target.blur(); // Removes focus from the element
        rc.roomMessage('ptt', isPushToTalkActive);
        console.log(`Push-to-talk enabled: ${isPushToTalkActive}`);
    };
    document.addEventListener('keydown', (e) => {
        const typing = e.target.closest?.('input, textarea, select, [contenteditable="true"]');
        if (isPushToTalkActive && e.code === 'Space' && !typing) {
            e.preventDefault();
            setPushToTalkPressed(true);
        }
    });
    document.addEventListener('keyup', (e) => {
        if (isPushToTalkActive && e.code === 'Space') {
            e.preventDefault();
            setPushToTalkPressed(false);
        }
    });
    window.addEventListener('blur', () => setPushToTalkPressed(false));
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) setPushToTalkPressed(false);
    });
    // room

    switchLobby.onchange = (e) => {
        isLobbyEnabled = e.currentTarget.checked;
        rc.roomAction(isLobbyEnabled ? 'lobbyOn' : 'lobbyOff');
        rc.lobbyToggle();
        localStorageSettings.lobby = isLobbyEnabled;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };
    switchPitchBar.onchange = (e) => {
        isPitchBarEnabled = e.currentTarget.checked;
        rc.roomMessage('pitchBar', isPitchBarEnabled);
        localStorageSettings.pitch_bar = isPitchBarEnabled;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };
    switchSounds.onchange = (e) => {
        isSoundEnabled = e.currentTarget.checked;
        rc.roomMessage('sounds', isSoundEnabled);
        localStorageSettings.sounds = isSoundEnabled;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };
    switchShowCameraOffParticipants.onchange = (e) => {
        toggleCameraOffParticipantsVisibility(e.currentTarget.checked);
        localStorageSettings.show_camera_off_participants = showCameraOffParticipants;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };
    switchShare.onchange = (e) => {
        notify = e.currentTarget.checked;
        rc.roomMessage('notify', notify);
        localStorageSettings.share_on_join = notify;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };
    noiseSuppressionMode.onchange = (event) => {
        let mode = window.BodrikNoiseSuppression.normalize(event.currentTarget.value);
        if (mode === 'rnnoise' && !BUTTONS.settings.customNoiseSuppression) mode = 'browser';
        localStorageSettings.mic_noise_suppression_mode = mode;
        lS.setSettings(localStorageSettings);
        noiseSuppressionMode.value = mode;
        if (rc.producerExist(RoomClient.mediaType.audio)) {
            rc.closeThenProduce(RoomClient.mediaType.audio, microphoneSelect.value);
        }
        event.currentTarget.blur();
    };
    bindBodrikMicSettings({
        echoInput: switchEchoCancellation,
        gainInput: switchAutoGainControl,
        settings: localStorageSettings,
        storage: lS,
        getRoomClient: () => rc,
        onError: (error) => {
            console.error('Microphone processing setting failed', error);
            userLog('error', 'Could not update microphone processing', 'top-end');
        },
    });
    switchKeepButtonsVisible.onchange = (e) => {
        isButtonsBarOver = isKeepButtonsVisible = e.currentTarget.checked;
        localStorageSettings.keep_buttons_visible = isButtonsBarOver;
        lS.setSettings(localStorageSettings);
        const status = isButtonsBarOver ? 'enabled' : 'disabled';
        userLog('info', `Buttons always visible ${status}`, 'top-end');
        e.target.blur();
    };

    // Wake Lock for mobile/tablet
    if (!isDesktopDevice && isWakeLockSupported()) {
        switchKeepAwake.onchange = async (e) => {
            e.target.blur();
            applyKeepAwake(e.currentTarget.checked);
        };
    } else {
        hide(keepAwakeButton);
    }

    // recording
    switchHostOnlyRecording.onchange = (e) => {
        hostOnlyRecording = e.currentTarget.checked;
        rc.roomAction(hostOnlyRecording ? 'hostOnlyRecordingOn' : 'hostOnlyRecordingOff');
        localStorageSettings.host_only_recording = hostOnlyRecording;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };

    // styling

    BtnAspectRatio.onchange = () => {
        adaptAspectRatio(videoMediaContainer.childElementCount);
        localStorageSettings.aspect_ratio = BtnAspectRatio.selectedIndex;
        lS.setSettings(localStorageSettings);
    };
    participantViewMode.onchange = () => {
        setParticipantViewMode(participantViewMode.value);
    };
    BtnVideoObjectFit.onchange = () => {
        rc.handleVideoObjectFit(BtnVideoObjectFit.value);
        localStorageSettings.video_obj_fit = BtnVideoObjectFit.selectedIndex;
        lS.setSettings(localStorageSettings);
    }; // cover
    BtnVideoControls.onchange = () => {
        rc.handleVideoControls(BtnVideoControls.value);
        localStorageSettings.video_controls = BtnVideoControls.selectedIndex;
        lS.setSettings(localStorageSettings);
    };

    BtnsBarPosition.onchange = () => {
        rc.changeBtnsBarPosition(BtnsBarPosition.value);
        localStorageSettings.buttons_bar = BtnsBarPosition.selectedIndex;
        lS.setSettings(localStorageSettings);
        refreshMainButtonsToolTipPlacement();
    };
    pinVideoPosition.onchange = () => {
        setParticipantViewMode(pinVideoPosition.value);
    };
    // chat
    showChatOnMsg.onchange = (e) => {
        rc.showChatOnMessage = e.currentTarget.checked;
        rc.roomMessage('showChat', rc.showChatOnMessage);
        localStorageSettings.show_chat_on_msg = rc.showChatOnMessage;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };

    // room moderator rules
    switchEveryonePrivacy.onchange = (e) => {
        const videoStartPrivacy = e.currentTarget.checked;
        isVideoPrivacyActive = !videoStartPrivacy;
        rc.toggleVideoPrivacyMode();
        rc.updateRoomModerator({ type: 'video_start_privacy', status: videoStartPrivacy });
        rc.roomMessage('video_start_privacy', videoStartPrivacy);
        localStorageSettings.moderator_video_start_privacy = videoStartPrivacy;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };
    switchEveryoneMute.onchange = (e) => {
        const audioStartMuted = e.currentTarget.checked;
        rc.updateRoomModerator({ type: 'audio_start_muted', status: audioStartMuted });
        rc.roomMessage('audio_start_muted', audioStartMuted);
        localStorageSettings.moderator_audio_start_muted = audioStartMuted;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };
    switchEveryoneHidden.onchange = (e) => {
        const videoStartHidden = e.currentTarget.checked;
        rc.updateRoomModerator({ type: 'video_start_hidden', status: videoStartHidden });
        rc.roomMessage('video_start_hidden', videoStartHidden);
        localStorageSettings.moderator_video_start_hidden = videoStartHidden;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };
    switchEveryoneCantUnmute.onchange = (e) => {
        const audioCantUnmute = e.currentTarget.checked;
        rc.updateRoomModerator({ type: 'audio_cant_unmute', status: audioCantUnmute });
        rc.roomMessage('audio_cant_unmute', audioCantUnmute);
        localStorageSettings.moderator_audio_cant_unmute = audioCantUnmute;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };
    switchEveryoneCantUnhide.onchange = (e) => {
        const videoCantUnhide = e.currentTarget.checked;
        rc.updateRoomModerator({ type: 'video_cant_unhide', status: videoCantUnhide });
        rc.roomMessage('video_cant_unhide', videoCantUnhide);
        localStorageSettings.moderator_video_cant_unhide = videoCantUnhide;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };
    switchEveryoneCantShareScreen.onchange = (e) => {
        const screenCantShare = e.currentTarget.checked;
        rc.updateRoomModerator({ type: 'screen_cant_share', status: screenCantShare });
        rc.roomMessage('screen_cant_share', screenCantShare);
        localStorageSettings.moderator_screen_cant_share = screenCantShare;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };
    switchEveryoneCantChatPrivately.onchange = (e) => {
        const chatCantPrivately = e.currentTarget.checked;
        rc.updateRoomModerator({ type: 'chat_cant_privately', status: chatCantPrivately });
        rc.roomMessage('chat_cant_privately', chatCantPrivately);
        localStorageSettings.moderator_chat_cant_privately = chatCantPrivately;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };
    switchEveryoneCantChatPublicly.onchange = (e) => {
        const chatCantPublicly = e.currentTarget.checked;
        rc.updateRoomModerator({ type: 'chat_cant_publicly', status: chatCantPublicly });
        rc.roomMessage('chat_cant_publicly', chatCantPublicly);
        localStorageSettings.moderator_chat_cant_publicly = chatCantPublicly;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };

    switchDisconnectAllOnLeave.onchange = (e) => {
        const disconnectAll = e.currentTarget.checked;
        rc.roomMessage('disconnect_all_on_leave', disconnectAll);
        localStorageSettings.moderator_disconnect_all_on_leave = disconnectAll;
        lS.setSettings(localStorageSettings);
        e.target.blur();
    };
    switchEveryoneFollowMe.onchange = (e) => {
        const followMe = e.currentTarget.checked;
        rc.toggleFollowMe(followMe);
        rc.roomMessage('everyone_follows_me', followMe);
        e.target.blur();
    };

    // handle Shortcuts
    handleKeyboardShortcuts();
}

// ####################################################
// KEYBOARD SHORTCUTS
// ####################################################

function handleKeyboardShortcuts() {
    if (!isDesktopDevice || !BUTTONS.settings.keyboardShortcuts) {
        elemDisplay('tabShortcutsBtn', false);
        setKeyboardShortcuts(false);
    } else {
        switchShortcuts.onchange = (e) => {
            const status = setKeyboardShortcuts(e.currentTarget.checked);
            userLog('info', `Keyboard shortcuts ${status}`, 'top-end');
            e.target.blur();
        };

        document.addEventListener('keydown', (event) => {
            const action = window.BodrikKeyboardShortcuts.action(event, isShortcutsEnabled);
            if (!action) return;
            event.preventDefault();

            const { audio_cant_unmute, video_cant_unhide, screen_cant_share } = rc._moderator;
            const notPresenter = isRulesActive && !isPresenter;

            switch (action) {
                case 'audio':
                    if (notPresenter && !audio && (audio_cant_unmute || !BUTTONS.main.startAudioButton)) {
                        userLog('warning', 'The presenter has disabled your ability to enable audio', 'top-end');
                        break;
                    }
                    audio ? stopAudioButton.click() : startAudioButton.click();
                    break;
                case 'video':
                    if (notPresenter && !video && (video_cant_unhide || !BUTTONS.main.startVideoButton)) {
                        userLog('warning', 'The presenter has disabled your ability to enable video', 'top-end');
                        break;
                    }
                    video ? stopVideoButton.click() : startVideoButton.click();
                    break;
                case 'screen':
                    if (notPresenter && !screen && (screen_cant_share || !BUTTONS.main.startScreenButton)) {
                        userLog('warning', 'The presenter has disabled your ability to share the screen', 'top-end');
                        break;
                    }
                    screen ? stopScreenButton.click() : startScreenButton.click();
                    break;
                case 'hand':
                    if (notPresenter && !BUTTONS.main.raiseHandButton) {
                        userLog('warning', 'The presenter has disabled your ability to raise your hand', 'top-end');
                        break;
                    }
                    hand ? lowerHandButton.click() : raiseHandButton.click();
                    break;
                case 'chat':
                    if (notPresenter && !BUTTONS.main.chatButton) {
                        userLog('warning', 'The presenter has disabled your ability to open the chat', 'top-end');
                        break;
                    }
                    chatButton.click();
                    break;
                case 'settings':
                    if (notPresenter && !BUTTONS.main.settingsButton) {
                        userLog('warning', 'The presenter has disabled your ability to open the settings', 'top-end');
                        break;
                    }
                    settingsButton.click();
                    break;
                case 'recording':
                    if (notPresenter && (hostOnlyRecording || !BUTTONS.settings.tabRecording)) {
                        userLog('warning', 'The presenter has disabled your ability to start recording', 'top-end');
                        break;
                    }
                    isRecording ? stopRecButton.click() : startRecButton.click();
                    break;
                case 'file':
                    if (notPresenter && !BUTTONS.settings.fileSharing) {
                        userLog('warning', 'The presenter has disabled your ability to share files', 'top-end');
                        break;
                    }
                    fileShareButton.click();
                    break;
                //...
                default:
                    break;
            }
        });
    }
}

function setKeyboardShortcuts(enabled) {
    isShortcutsEnabled = enabled;
    localStorageSettings.keyboard_shortcuts = isShortcutsEnabled;
    lS.setSettings(localStorageSettings);
    return isShortcutsEnabled ? 'enabled' : 'disabled';
}

// ####################################################
// HTML INPUTS
// ####################################################

function handleInputs() {
    chatMessage.onkeydown = (e) => {
        if (e.key === 'Enter' && (isMobileDevice || !e.shiftKey)) {
            e.preventDefault();
            chatSendButton.click();
        }
    };
    chatMessage.oninput = function () {
        if (isChatPasteTxt) return;
        const chatInputEmoji = {
            '<3': '❤️',
            '</3': '💔',
            ':D': '😀',
            ':)': '😃',
            ';)': '😉',
            ':(': '😒',
            ':p': '😛',
            ';p': '😜',
            ":'(": '😢',
            ':+1:': '👍',
            ':*': '😘',
            ':O': '😲',
            ':|': '😐',
            ':*(': '😭',
            XD: '😆',
            ':B': '😎',
            ':P': '😜',
            '<(': '👎',
            '>:(': '😡',
            ':S': '😟',
            ':X': '🤐',
            ';(': '😥',
            ':T': '😖',
            ':@': '😠',
            ':$': '🤑',
            ':&': '🤗',
            ':#': '🤔',
            ':!': '😵',
            ':W': '😷',
            ':%': '🤒',
            ':*!': '🤩',
            ':G': '😬',
            ':R': '😋',
            ':M': '🤮',
            ':L': '🥴',
            ':C': '🥺',
            ':F': '🥳',
            ':Z': '🤢',
            ':^': '🤓',
            ':K': '🤫',
            ':D!': '🤯',
            ':H': '🧐',
            ':U': '🤥',
            ':V': '🤪',
            ':N': '🥶',
            ':J': '🥴',
        };
        // Create a regular expression pattern for all keys in chatInputEmoji
        const regexPattern = new RegExp(
            Object.keys(chatInputEmoji)
                .map((key) => key.replace(/([()[{*+.$^\\|?])/g, '\\$1'))
                .join('|'),
            'gim'
        );
        // Replace matching patterns with corresponding emojis
        this.value = this.value.replace(regexPattern, (match) => chatInputEmoji[match]);
        rc.checkLineBreaks();
        updateChatCharCount();
    };

    getId('chatRoom').addEventListener('paste', (event) => {
        if (window.BodrikChatImage?.paste(event)) return;
        if (event.target === chatMessage) {
            isChatPasteTxt = true;
            rc.checkLineBreaks();
        }
    });
}

// ####################################################
// EMOJI PIKER
// ####################################################

let emojiDataPromise;
/** Load the locked emoji dataset once from the same-origin nginx vendor release. */
function getEmojiData() {
    if (!emojiDataPromise) {
        emojiDataPromise = fetch('/vendor/emoji-mart/data-native.json?package=1.2.1').then((response) => {
            if (!response.ok) throw new Error(`Emoji data request failed (${response.status})`);
            return response.json();
        });
        emojiDataPromise.catch(() => {
            emojiDataPromise = null;
        });
    }
    return emojiDataPromise;
}

function toggleUsernameEmoji() {
    getId('usernameEmoji').classList.toggle('hidden');
}

function handleUsernameEmojiPicker() {
    const pickerOptions = {
        data: getEmojiData,
        theme: 'dark',
        onEmojiSelect: addEmojiToUsername,
    };
    const emojiUsernamePicker = new EmojiMart.Picker(pickerOptions);
    getId('usernameEmoji').appendChild(emojiUsernamePicker);

    function addEmojiToUsername(data) {
        getId('usernameInput').value += data.native;
        toggleUsernameEmoji();
    }

    const initUsernameEmojiButton = getId('initUsernameEmojiButton');
    const usernameEmoji = getId('usernameEmoji');
    handleClickOutside(emojiUsernamePicker, initUsernameEmojiButton, () => {
        if (usernameEmoji && !usernameEmoji.classList.contains('hidden')) {
            usernameEmoji.classList.add('hidden');
        }
    });
}

function handleChatEmojiPicker() {
    const pickerOptions = {
        data: getEmojiData,
        theme: 'dark',
        onEmojiSelect: addEmojiToMsg,
    };
    const emojiPicker = new EmojiMart.Picker(pickerOptions);
    rc.getId('chatEmoji').appendChild(emojiPicker);

    function addEmojiToMsg(data) {
        chatMessage.value += data.native;
        rc.setChatEmojiOpen(false);
    }

    const chatEmojiButton = getId('chatEmojiButton');
    const chatEmoji = getId('chatEmoji');

    if (!isMobileDevice) {
        let closeTimer;
        const cancelClose = () => clearTimeout(closeTimer);
        const openPicker = () => {
            cancelClose();
            rc.setChatEmojiOpen(true);
        };
        const scheduleClose = () => {
            cancelClose();
            closeTimer = setTimeout(() => rc.setChatEmojiOpen(false), 300);
        };

        chatEmojiButton.addEventListener('mouseenter', openPicker);
        chatEmojiButton.addEventListener('mouseleave', scheduleClose);
        chatEmoji.addEventListener('mouseenter', cancelClose);
        chatEmoji.addEventListener('mouseleave', scheduleClose);
    }

    handleClickOutside(emojiPicker, chatEmojiButton, () => {
        if (chatEmoji && chatEmoji.classList.contains('show')) {
            rc.setChatEmojiOpen(false);
        }
    });
}

// ####################################################

// ####################################################

// ####################################################
// LOAD SETTINGS FROM LOCAL STORAGE
// ####################################################

/** Restore supported local preferences without retired server-recording controls. */
function loadSettingsFromLocalStorage() {
    rc.showChatOnMessage = localStorageSettings.show_chat_on_msg;

    isPitchBarEnabled = localStorageSettings.pitch_bar;
    isSoundEnabled = localStorageSettings.sounds;
    isKeepButtonsVisible = localStorageSettings.keep_buttons_visible;
    isShortcutsEnabled = localStorageSettings.keyboard_shortcuts;

    showChatOnMsg.checked = rc.showChatOnMessage;

    switchPitchBar.checked = isPitchBarEnabled;
    switchSounds.checked = isSoundEnabled;
    switchShowCameraOffParticipants.checked = showCameraOffParticipants;
    switchShare.checked = notify;
    switchKeepButtonsVisible.checked = isKeepButtonsVisible;
    switchShortcuts.checked = isShortcutsEnabled;

    switchDominantSpeakerFocus.checked = localStorageSettings.dominant_speaker_focus;
    let noiseMode = window.BodrikNoiseSuppression.normalize(localStorageSettings.mic_noise_suppression_mode);
    if (!BUTTONS.settings.customNoiseSuppression) {
        noiseSuppressionMode.querySelector('option[value="rnnoise"]')?.remove();
        if (noiseMode === 'rnnoise') {
            noiseMode = 'browser';
            localStorageSettings.mic_noise_suppression_mode = noiseMode;
            lS.setSettings(localStorageSettings);
        }
    }
    noiseSuppressionMode.value = noiseMode;
    switchEchoCancellation.checked = localStorageSettings.mic_echo_cancellation === true;
    switchAutoGainControl.checked = localStorageSettings.mic_auto_gain_control === true;

    setSpeakerVolume(localStorageSettings.speaker_volume !== undefined ? localStorageSettings.speaker_volume : 100);

    screenOptimization.selectedIndex = localStorageSettings.screen_optimization;
    videoFps.selectedIndex = localStorageSettings.video_fps;
    screenFps.selectedIndex = localStorageSettings.screen_fps;
    BtnAspectRatio.selectedIndex = localStorageSettings.aspect_ratio;
    BtnVideoObjectFit.selectedIndex = localStorageSettings.video_obj_fit;
    BtnVideoControls.selectedIndex = localStorageSettings.video_controls;
    BtnsBarPosition.selectedIndex = localStorageSettings.buttons_bar;
    pinVideoPosition.selectedIndex = localStorageSettings.pin_grid;
    participantViewMode.value = localStorageSettings.participant_view || 'grid';
    rc.handleVideoObjectFit(BtnVideoObjectFit.value);
    rc.handleVideoControls(BtnVideoControls.value);
    rc.changeBtnsBarPosition(BtnsBarPosition.value);
    setParticipantViewMode(participantViewMode.value, false, false);
    refreshMainButtonsToolTipPlacement();
}

// ####################################################
// ROOM CLIENT EVENT LISTNERS
// ####################################################

/** Synchronize room controls with client media and moderation events. */
function handleRoomClientEvents() {
    rc.on(RoomClient.EVENTS.startRec, () => {
        console.log('Room event: Client start recoding');
        hide(startRecButton);
        show(stopRecButton);
        show(pauseRecButton);
        show(recordingTime);
        recordingActionButton.querySelector('p').textContent = 'Stop recording';
        recordingActionButton.classList.add('recording-active');
        startRecordingTimer();
        isRecording = true;
        rc.updatePeerInfo(peer_name, socket.id, 'recording', true);
        rc.showRecordingIndicator();
    });
    rc.on(RoomClient.EVENTS.pauseRec, () => {
        console.log('Room event: Client pause recoding');
        hide(pauseRecButton);
        show(resumeRecButton);
        rc.pauseRecordingIndicator();
    });
    rc.on(RoomClient.EVENTS.resumeRec, () => {
        console.log('Room event: Client resume recoding');
        hide(resumeRecButton);
        show(pauseRecButton);
        rc.resumeRecordingIndicator();
    });
    rc.on(RoomClient.EVENTS.stopRec, () => {
        console.log('Room event: Client stop recoding');
        hide(stopRecButton);
        hide(pauseRecButton);
        hide(resumeRecButton);
        hide(recordingTime);
        show(startRecButton);
        recordingActionButton.querySelector('p').textContent = 'Start recording';
        recordingActionButton.classList.remove('recording-active');
        stopRecordingTimer();
        isRecording = false;
        rc.updatePeerInfo(peer_name, socket.id, 'recording', false);
        rc.hideRecordingIndicator();
    });
    rc.on(RoomClient.EVENTS.raiseHand, () => {
        console.log('Room event: Client raise hand');
        hide(raiseHandButton);
        show(lowerHandButton);
        setColor(lowerHandIcon, '#FFD700');
        hand = true;
    });
    rc.on(RoomClient.EVENTS.lowerHand, () => {
        console.log('Room event: Client lower hand');
        hide(lowerHandButton);
        show(raiseHandButton);
        setColor(lowerHandIcon, 'white');
        hand = false;
    });
    rc.on(RoomClient.EVENTS.startAudio, () => {
        console.log('Room event: Client start audio');
        hide(startAudioButton);
        show(stopAudioButton);
        setColor(startAudioButton, 'red');
        setAudioButtonsDisabled(false);
        audio = true;
        applyKeepAwake(audio);
    });
    rc.on(RoomClient.EVENTS.pauseAudio, () => {
        console.log('Room event: Client pause audio');
        hide(stopAudioButton);
        BUTTONS.main.startAudioButton && show(startAudioButton);
        setColor(startAudioButton, 'red');
        setAudioButtonsDisabled(false);
        audio = false;
        applyKeepAwake(audio);
    });
    rc.on(RoomClient.EVENTS.resumeAudio, () => {
        console.log('Room event: Client resume audio');
        hide(startAudioButton);
        BUTTONS.main.startAudioButton && show(stopAudioButton);
        setAudioButtonsDisabled(false);
        audio = true;
        applyKeepAwake(audio);
    });
    rc.on(RoomClient.EVENTS.stopAudio, () => {
        console.log('Room event: Client stop audio');
        hide(stopAudioButton);
        show(startAudioButton);
        setAudioButtonsDisabled(false);
        stopMicrophoneProcessing();
        audio = false;
        applyKeepAwake(audio);
    });
    rc.on(RoomClient.EVENTS.startVideo, () => {
        console.log('Room event: Client start video');
        hide(startVideoButton);
        show(stopVideoButton);
        setColor(startVideoButton, 'red');
        setVideoButtonsDisabled(false);
        hideClassElements('videoMenuBar');
        // if (isParticipantsListOpen) getRoomParticipants();
        video = true;
        applyKeepAwake(audio);
    });
    rc.on(RoomClient.EVENTS.pauseVideo, () => {
        console.log('Room event: Client pause video');
        hide(stopVideoButton);
        BUTTONS.main.startVideoButton && show(startVideoButton);
        setColor(startVideoButton, 'red');
        setVideoButtonsDisabled(false);
        hideClassElements('videoMenuBar');
        video = false;
        applyKeepAwake(audio);
    });
    rc.on(RoomClient.EVENTS.resumeVideo, () => {
        console.log('Room event: Client resume video');
        hide(startVideoButton);
        BUTTONS.main.startVideoButton && show(stopVideoButton);
        setVideoButtonsDisabled(false);
        isVideoPrivacyActive = false;
        hideClassElements('videoMenuBar');
        video = true;
        applyKeepAwake(audio);
    });
    rc.on(RoomClient.EVENTS.stopVideo, () => {
        console.log('Room event: Client stop video');
        hide(stopVideoButton);
        show(startVideoButton);
        setVideoButtonsDisabled(false);
        isVideoPrivacyActive = false;
        hideClassElements('videoMenuBar');
        // if (isParticipantsListOpen) getRoomParticipants();
        video = false;
        applyKeepAwake(audio);
    });
    rc.on(RoomClient.EVENTS.startScreen, () => {
        console.log('Room event: Client start screen');
        hide(startScreenButton);
        show(stopScreenButton);
        hideClassElements('videoMenuBar');
        // if (isParticipantsListOpen) getRoomParticipants();
        screen = true;
    });
    rc.on(RoomClient.EVENTS.pauseScreen, () => {
        console.log('Room event: Client pause screen');
        hide(startScreenButton);
        show(stopScreenButton);
        hideClassElements('videoMenuBar');
        screen = false;
    });
    rc.on(RoomClient.EVENTS.resumeScreen, () => {
        console.log('Room event: Client resume screen');
        hide(stopScreenButton);
        show(startScreenButton);
        hideClassElements('videoMenuBar');
        screen = true;
    });
    rc.on(RoomClient.EVENTS.stopScreen, () => {
        console.log('Room event: Client stop screen');
        hide(stopScreenButton);
        show(startScreenButton);
        hideClassElements('videoMenuBar');
        // if (isParticipantsListOpen) getRoomParticipants();
        screen = false;
    });
    rc.on(RoomClient.EVENTS.roomLock, () => {
        console.log('Room event: Client lock room');
        hide(lockRoomButton);
        show(unlockRoomButton);
        isRoomLocked = true;
    });
    rc.on(RoomClient.EVENTS.roomUnlock, () => {
        console.log('Room event: Client unlock room');
        hide(unlockRoomButton);
        show(lockRoomButton);
        isRoomLocked = false;
    });
    rc.on(RoomClient.EVENTS.lobbyOn, () => {
        console.log('Room event: Client room lobby enabled');
        if (isRulesActive && !isPresenter) {
            hide(lobbyButton);
        }
        sound('lobby');
        isLobbyEnabled = true;
    });
    rc.on(RoomClient.EVENTS.lobbyOff, () => {
        console.log('Room event: Client room lobby disabled');
        isLobbyEnabled = false;
    });
    rc.on(RoomClient.EVENTS.joinLockOn, () => {
        console.log('Room event: Client room locked for new participants');
        isJoinLocked = true;
        updateJoinLockButtons();
    });
    rc.on(RoomClient.EVENTS.joinLockOff, () => {
        console.log('Room event: Client room unlocked for new participants');
        isJoinLocked = false;
        updateJoinLockButtons();
    });
    rc.on(RoomClient.EVENTS.hostOnlyRecordingOn, () => {
        if (isRulesActive && !isPresenter) {
            console.log('Room event: host only recording enabled');
            // Stop recording ...
            if (rc.isRecording() || rc.hasActiveRecorder()) {
                rc.saveRecording('Room event: host only recording enabled, going to stop recording');
            }
            hide(startRecButton);
            hide(recordingActionButton);
            hide(recordingTypeField);
            hide(roomHostOnlyRecording);
            hide(roomRecordingOptions);

            show(recordingMessage);
            hostOnlyRecording = true;
        }
    });
    rc.on(RoomClient.EVENTS.hostOnlyRecordingOff, () => {
        if (isRulesActive && !isPresenter) {
            console.log('Room event: host only recording disabled');
            show(startRecButton);
            show(recordingActionButton);
            show(recordingTypeField);
            hide(roomHostOnlyRecording);
            hide(recordingMessage);
            hostOnlyRecording = false;
        }
    });

    rc.on(RoomClient.EVENTS.exitRoom, () => {
        if (isExiting) return;
        isExiting = true;

        console.log('Room event: Client leave room');

        endRoomSession();

        if (rc.isRecording() || rc.hasActiveRecorder()) {
            rc.saveRecording('Room event: Client save recording before to exit');
        }

        leaveRoom(false); // Don't touch :)
    });
}

// ####################################################
// UTILITY
// ####################################################

function initLeaveMeeting() {
    openURL('/');
}

/** Save active recording before leaving; eject-all remains an explicit presenter action. */
async function leaveRoom(disconnectAll = false) {
    if (rc.isRecording() || rc.hasActiveRecorder()) {
        recShowInfo = false;
        rc.saveRecording('User is leaving the room, saving recording before exit');
        rc.popupRecordingOnLeaveRoom();
        return;
    }
    // Broadcast the eject-all command up-front, BEFORE any Swal or navigation.
    if (isPresenter && disconnectAll) {
        rc.ejectAllOnLeave();
        disconnectAll = false; // already handled, prevent double-eject below
    }
    redirectOnLeave(disconnectAll);
}

function redirectOnLeave(disconnectAll = false) {
    isExiting = true;
    endRoomSession();
    rc.exitRoom(disconnectAll);
    redirect && redirect.enabled ? openURL(redirect.url) : openURL('/');
}

function saveDataToFile(dataURL, fileName) {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = dataURL;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(dataURL);
    }, 100);
}

function saveObjToJsonFile(dataObj, name) {
    console.log('Save data', { dataObj: dataObj, name: name });
    const dataTime = getDataTimeString();
    let a = document.createElement('a');
    a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataObj, null, 1));
    a.download = `${dataTime}-${name}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
    }, 100);
    sound('download');
}

function getDataTimeString() {
    const d = new Date();
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().split(' ')[0];
    return `${date}-${time}`;
}

function getDataTimeStringFormat() {
    const d = new Date();
    const date = d.toISOString().split('T')[0].replace(/-/g, '_');
    const time = d.toTimeString().split(' ')[0].replace(/:/g, '_');
    return `${date}_${time}`;
}

function getUUID() {
    const uuid4 = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
    if (window.localStorage.uuid) {
        return window.localStorage.uuid;
    }
    window.localStorage.uuid = uuid4;
    return uuid4;
}

function handleButtonsBar() {
    const showButtonsHandler = () => showButtons();
    isDesktopDevice
        ? document.body.addEventListener('mousemove', showButtonsHandler)
        : document.body.addEventListener('touchstart', showButtonsHandler);
}

function handleDropdownHover(dropdownElement = null) {
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!supportsHover) return;

    const dropdowns = dropdownElement ? dropdownElement : document.querySelectorAll('.dropdown');
    console.log(`Dropdown found: ${dropdowns.length}`);

    dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (!toggle || !menu) return;

        let timeoutId;

        const hideDropdown = () => {
            timeoutId = setTimeout(() => {
                const bsDropdown = bootstrap.Dropdown.getInstance(toggle);
                if (bsDropdown) {
                    bsDropdown.hide();
                }
            }, 200);
        };

        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
            const bsDropdown = bootstrap.Dropdown.getInstance(toggle) || new bootstrap.Dropdown(toggle);
            bsDropdown.show();
        });

        dropdown.addEventListener('mouseleave', hideDropdown);

        menu.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
        });

        menu.addEventListener('mouseleave', hideDropdown);

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}

function showButtons() {
    bottomButtons.style.display = 'flex';
    toggleClassElements('username', 'flex');
    isButtonsVisible = true;
}

function checkButtonsBar() {
    if (localStorageSettings.keep_buttons_visible) {
        bottomButtons.style.display = 'flex';
        toggleClassElements('username', 'flex');
        isButtonsVisible = true;
    } else {
        if (!isButtonsBarOver) {
            bottomButtons.style.display = 'none';
            toggleClassElements('username', 'none');
            isButtonsVisible = false;
        }
    }
    setTimeout(() => {
        checkButtonsBar();
    }, 10000);
}

function toggleClassElements(className, displayState) {
    const elements = rc.getEcN(className);
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = displayState;
    }
}

function hideClassElements(className) {
    const elements = rc.getEcN(className);
    for (let i = 0; i < elements.length; i++) {
        hide(elements[i]);
    }
    setCamerasBorderNone();
}

function setCamerasBorderNone() {
    const cameras = rc.getEcN('Camera');
    for (let i = 0; i < cameras.length; i++) {
        cameras[i].style.setProperty('border', 'none', 'important');
    }
}

function hideVideoMenuBar(videoBarId) {
    const videoMenuBar = rc.getEcN('videoMenuBar');
    for (let i = 0; i < videoMenuBar.length; i++) {
        const menuBar = videoMenuBar[i];
        if (menuBar.id != videoBarId) {
            hide(menuBar);
        }
    }
}

// https://animate.style

function animateCSS(element, animation, prefix = 'animate__') {
    return new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        element.classList.add(`${prefix}animated`, animationName);
        function handleAnimationEnd(event) {
            event.stopPropagation();
            element.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
        }
        element.addEventListener('animationend', handleAnimationEnd, { once: true });
    });
}

function setAudioButtonsDisabled(disabled) {
    startAudioButton.disabled = disabled;
    stopAudioButton.disabled = disabled;
}

function setVideoButtonsDisabled(disabled) {
    startVideoButton.disabled = disabled;
    stopVideoButton.disabled = disabled;
}

function setSpeakerVolume(value) {
    const volume = Math.min(100, Math.max(0, Number(value) || 0));

    if (speakerVolume) speakerVolume.value = volume;
    if (speakerVolumeValue) speakerVolumeValue.textContent = `${volume}%`;

    const menuSlider = getId('deviceMenuSpeakerVolume');
    if (menuSlider) menuSlider.value = volume;
    const menuValue = getId('deviceMenuSpeakerVolumeValue');
    if (menuValue) menuValue.textContent = `${volume}%`;

    if (rc) rc.setMasterOutputVolume(volume / 100);
}

async function playSpeaker(deviceId = null, name, path = '../sounds/') {
    const selectedDeviceId = deviceId || audioOutputSelect?.value;
    if (selectedDeviceId) {
        const sound = path + name + '.wav';
        const audioToPlay = new Audio(sound);
        try {
            if (typeof audioToPlay.setSinkId === 'function') {
                await audioToPlay.setSinkId(selectedDeviceId);
            }
            audioToPlay.volume = 0.5 * (rc ? rc.masterOutputVolume : 1);
            await audioToPlay.play();
        } catch (err) {
            console.error('Cannot play test sound:', err);
        }
    } else {
        sound(name, true);
    }
}

async function sound(name, force = false) {
    if (!isSoundEnabled && !force) return;
    let sound = '../sounds/' + name + '.wav';
    let audio = new Audio(sound);
    try {
        audio.volume = 0.5;
        await audio.play();
    } catch (err) {
        return false;
    }
}

function isValidAvatarURL(url) {
    if (!url || typeof url !== 'string') return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

async function isImageURL(url) {
    if (!url) return false;
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        return contentType && contentType.startsWith('image/');
    } catch {
        return false;
    }
}

function isMobile(userAgent) {
    return !!/Android|webOS|iPhone|iPad|iPod|BB10|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(userAgent || '');
}

function isTablet(userAgent) {
    return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
        userAgent
    );
}

function isIpad(userAgent) {
    return /macintosh/.test(userAgent) && 'ontouchend' in document;
}

function isDesktop() {
    return !isMobileDevice && !isTabletDevice && !isIPadDevice;
}

function openURL(url, blank = false) {
    blank ? window.open(url, '_blank') : (window.location.href = url);
}

function bytesToSize(bytes) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function setCookie(name, value, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + expDays * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + '; ' + expires + '; path=/';
}

function getCookie(cName) {
    const name = cName + '=';
    const cDecoded = decodeURIComponent(document.cookie);
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach((val) => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    });
    return res;
}

function isHtml(str) {
    var a = document.createElement('div');
    a.innerHTML = str;
    for (var c = a.childNodes, i = c.length; i--;) {
        if (c[i].nodeType == 1) return true;
    }
    return false;
}

function handleClickOutside(targetElement, triggerElement, callback, minWidth = 0) {
    document.addEventListener('click', (e) => {
        if (minWidth && window.innerWidth > minWidth) return;
        let el = e.target;
        let shouldExclude = false;
        while (el) {
            if (el instanceof HTMLElement && (el === targetElement || el === triggerElement)) {
                shouldExclude = true;
                break;
            }
            el = el.parentElement;
        }
        if (!shouldExclude) callback();
    });
}

function getId(id) {
    return document.getElementById(id);
}

// ####################################################
// SETTINGS EXTRA (buttons dropdown)
// ####################################################

function setupSettingsExtraDropdown() {
    if (!settingsSplit || !settingsExtraDropdown || !settingsExtraToggle || !settingsExtraMenu) return;

    // TODO improve me.....
    if (BUTTONS.main.extraButton) {
        show(settingsExtraDropdown);
        show(settingsExtraMenu);
    } else {
        hide(settingsExtraDropdown);
        hide(settingsExtraMenu);
        elemDisplay(noExtraButtons, true);
        settingsButton.style.borderRadius = '10px';
    }

    let showTimeout;
    let hideTimeout;

    function showMenu() {
        clearTimeout(hideTimeout);
        show(settingsExtraMenu);
    }
    function hideMenu() {
        clearTimeout(showTimeout);
        hide(settingsExtraMenu);
    }

    settingsExtraToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        !settingsExtraMenu.classList.contains('hidden') ? hideMenu() : showMenu();
    });

    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (supportsHover) {
        let closeTimeout;
        const cancelClose = () => {
            if (!closeTimeout) return;
            clearTimeout(closeTimeout);
            closeTimeout = null;
        };
        const scheduleClose = () => {
            cancelClose();
            closeTimeout = setTimeout(() => hideMenu(), 180);
        };
        settingsExtraToggle.addEventListener('mouseenter', () => {
            cancelClose();
            showMenu();
        });
        settingsExtraToggle.addEventListener('mouseleave', scheduleClose);
        settingsExtraMenu.addEventListener('mouseenter', cancelClose);
        settingsExtraMenu.addEventListener('mouseleave', scheduleClose);
    }

    // Prevent closing when clicking inside the menu
    settingsExtraMenu.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    document.addEventListener('click', function (e) {
        if (!settingsExtraToggle.contains(e.target) && !settingsExtraMenu.contains(e.target)) {
            hideMenu();
        }
    });

    // Auto-hide group headers/dividers when all their buttons are hidden
    updateSettingsExtraGroups();
    const observer = new MutationObserver(updateSettingsExtraGroups);
    settingsExtraMenu.querySelectorAll('button').forEach((btn) => {
        observer.observe(btn, { attributes: true, attributeFilter: ['class', 'style'] });
    });
}

function updateSettingsExtraGroups() {
    settingsExtraMenu.querySelectorAll('.extra-menu-group').forEach((header) => {
        const ids = (header.dataset.buttons || '').split(',');
        const anyVisible = ids.some((id) => {
            const btn = document.getElementById(id.trim());
            return btn && !btn.classList.contains('hidden') && btn.style.display !== 'none';
        });
        header.style.display = anyVisible ? '' : 'none';
    });
    settingsExtraMenu.querySelectorAll('.extra-menu-divider').forEach((div) => {
        let prev = div.previousElementSibling;
        while (prev && !prev.classList.contains('extra-menu-group')) {
            prev = prev.previousElementSibling;
        }
        let next = div.nextElementSibling;
        while (next && !next.classList.contains('extra-menu-group')) {
            next = next.nextElementSibling;
        }
        const prevVisible = prev && prev.style.display !== 'none';
        const nextVisible = next && next.style.display !== 'none';
        div.style.display = prevVisible && nextVisible ? '' : 'none';
    });
}

// ####################################################
// QUICK DEVICE SWITCH (Start Audio/Video dropdowns)
// ####################################################

function restoreSplitButtonsBorderRadius() {
    document.querySelectorAll('#bottomButtons .split-btn').forEach((group) => {
        group.querySelectorAll('button').forEach((button) => {
            if (button.id != 'settingsExtraToggle' && button.id != 'settingsButton') {
                button.style.setProperty('border-radius', '10px', 'important');
            }
        });
        const toggle = group.querySelector('.device-dropdown-toggle');
        if (toggle) toggle.style.setProperty('border-left', 'none', 'important');
    });
}

function setupQuickDeviceSwitchDropdowns() {
    // For now keep this feature only for desktop devices
    if (!isDesktopDevice) {
        restoreSplitButtonsBorderRadius();
        return;
    }

    if (
        !startVideoBtn ||
        !startAudioBtn ||
        !stopVideoBtn ||
        !stopAudioBtn ||
        !videoDropdown ||
        !audioDropdown ||
        !videoToggle ||
        !audioToggle
    ) {
        return;
    }

    function syncVisibility() {
        // Keep dropdown visible while either Start or Stop button is visible
        const showVideo = !startVideoBtn.classList.contains('hidden') || !stopVideoBtn.classList.contains('hidden');
        const showAudio = !startAudioBtn.classList.contains('hidden') || !stopAudioBtn.classList.contains('hidden');
        videoDropdown.classList.toggle('hidden', !showVideo);
        audioDropdown.classList.toggle('hidden', !showAudio);
    }

    function createDeviceAudioMeter() {
        const meter = document.createElement('span');
        meter.className = 'device-menu-audio-meter';
        const barEls = [];
        for (let i = 0; i < 8; i++) {
            const bar = document.createElement('span');
            bar.className = 'device-meter-bar';
            meter.appendChild(bar);
            barEls.push(bar);
        }
        return { meter, barEls };
    }

    // Live audio input level meters shown next to each microphone in the audio device menu.
    // Uses a single AudioContext and one analyser per device; runs only while the menu is open.
    const audioMeterManager = {
        active: false,
        rafId: null,
        audioContext: null,
        meters: new Map(), // deviceId -> { stream, source, analyser, dataArray }
        barTargets: new Map(), // deviceId -> [barEl, ...]

        async ensureContext() {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            if (!this.audioContext || this.audioContext.state === 'closed') {
                this.audioContext = new AC();
            }
            if (this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                } catch (err) {
                    /* ignore */
                }
            }
            return this.audioContext;
        },

        setBarTargets(entries) {
            this.barTargets.clear();
            entries.forEach(({ deviceId, barEls }) => {
                if (deviceId) this.barTargets.set(deviceId, barEls);
            });
        },

        async start(entries) {
            if (!isAudioContextSupported()) return;
            this.active = true;
            this.setBarTargets(entries);
            for (const { deviceId } of entries) {
                if (deviceId && !this.meters.has(deviceId)) {
                    await this.createMeter(deviceId);
                }
            }
            if (this.active && !this.rafId) {
                this.rafId = requestAnimationFrame(() => this.tick());
            }
        },

        async createMeter(deviceId) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        deviceId: { exact: deviceId },
                        echoCancellation: false,
                        noiseSuppression: false,
                        autoGainControl: false,
                    },
                });
                if (!this.active) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                const ctx = await this.ensureContext();
                if (!ctx) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                const source = ctx.createMediaStreamSource(stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 256;
                analyser.smoothingTimeConstant = 0.6;
                source.connect(analyser);
                const dataArray = new Uint8Array(analyser.fftSize);
                this.meters.set(deviceId, { stream, source, analyser, dataArray });
            } catch (err) {
                console.warn('Audio meter init failed for device', deviceId, err);
            }
        },

        tick() {
            if (!this.active) return;
            this.meters.forEach((meter, deviceId) => {
                const barEls = this.barTargets.get(deviceId);
                if (!barEls || !barEls.length) return;
                meter.analyser.getByteTimeDomainData(meter.dataArray);
                let sum = 0;
                for (let i = 0; i < meter.dataArray.length; i++) {
                    const v = (meter.dataArray[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / meter.dataArray.length);
                const level = Math.min(1, rms * 3.5);
                const activeBars = Math.round(level * barEls.length);
                barEls.forEach((bar, i) => bar.classList.toggle('active', i < activeBars));
            });
            this.rafId = requestAnimationFrame(() => this.tick());
        },

        stop() {
            this.active = false;
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
            this.meters.forEach((meter) => {
                try {
                    meter.source.disconnect();
                } catch (err) {
                    /* ignore */
                }
                try {
                    meter.stream.getTracks().forEach((t) => t.stop());
                } catch (err) {
                    /* ignore */
                }
            });
            this.meters.clear();
            this.barTargets.clear();
            if (this.audioContext && this.audioContext.state !== 'closed') {
                try {
                    this.audioContext.close();
                } catch (err) {
                    /* ignore */
                }
            }
            this.audioContext = null;
        },
    };

    function appendMenuHeader(menuEl, iconClass, title) {
        const header = document.createElement('div');
        header.className = 'device-menu-header';

        const icon = document.createElement('i');
        icon.className = iconClass;

        const text = document.createElement('span');
        text.textContent = title;

        header.appendChild(icon);
        header.appendChild(text);
        menuEl.appendChild(header);
    }

    function appendMenuDivider(menuEl) {
        const divider = document.createElement('div');
        divider.className = 'device-menu-divider';
        menuEl.appendChild(divider);
    }

    function appendMenuToggle(menuEl, id, labelText, settingsSwitch) {
        const toggleRow = document.createElement('div');
        toggleRow.className = 'device-menu-toggle-row';

        const label = document.createElement('label');
        label.className = 'title';
        label.htmlFor = id;
        label.textContent = labelText;

        const switchDiv = document.createElement('div');
        switchDiv.className = 'form-check form-switch form-switch-md title';

        const checkbox = document.createElement('input');
        checkbox.id = id;
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input';
        checkbox.checked = settingsSwitch.checked;
        checkbox.addEventListener('change', () => {
            settingsSwitch.checked = checkbox.checked;
            settingsSwitch.dispatchEvent(new Event('change'));
        });

        switchDiv.appendChild(checkbox);
        toggleRow.appendChild(label);
        toggleRow.appendChild(switchDiv);
        menuEl.appendChild(toggleRow);
    }

    function appendSelectOptions(menuEl, selectEl, emptyLabel, rebuildFn, meterCollector) {
        if (!selectEl) return;

        const options = Array.from(selectEl.options || []).filter((o) => o && o.value);
        if (options.length === 0) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.disabled = true;
            btn.textContent = emptyLabel;
            menuEl.appendChild(btn);
            return;
        }

        options.forEach((opt) => {
            const btn = document.createElement('button');
            btn.type = 'button';

            const isSelected = opt.value === selectEl.value;
            const label = opt.textContent || opt.label || opt.value;

            btn.replaceChildren();
            if (isSelected) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-check';
                btn.appendChild(icon);
            } else {
                const spacer = document.createElement('span');
                spacer.style.display = 'inline-block';
                spacer.style.width = '1.25em';
                btn.appendChild(spacer);
            }

            const labelSpan = document.createElement('span');
            labelSpan.className = 'device-menu-label';
            labelSpan.textContent = isSelected ? ` ${label}` : label;
            btn.appendChild(labelSpan);

            // Live audio input level meter (microphones only)
            if (meterCollector) {
                const { meter, barEls } = createDeviceAudioMeter();
                btn.appendChild(meter);
                meterCollector.push({ deviceId: opt.value, barEls });
            }

            btn.addEventListener('click', () => {
                if (selectEl.value === opt.value) return;
                selectEl.value = opt.value;
                selectEl.dispatchEvent(new Event('change'));
            });

            menuEl.appendChild(btn);
        });
    }

    function buildVideoMenu() {
        if (!videoMenu || !videoSelect) return;
        videoMenu.innerHTML = '';

        appendMenuHeader(videoMenu, 'fas fa-video', 'Cameras');
        appendSelectOptions(videoMenu, videoSelect, 'No cameras found', buildVideoMenu);

        // Add settings button
        appendMenuDivider(videoMenu);
        const settingsBtn = document.createElement('button');
        settingsBtn.type = 'button';
        settingsBtn.className = 'device-menu-action-btn';
        const settingsIcon = document.createElement('i');
        settingsIcon.className = 'fas fa-cog';
        settingsBtn.appendChild(settingsIcon);
        settingsBtn.appendChild(document.createTextNode(' Open Video Settings'));
        settingsBtn.addEventListener('click', () => {
            rc.toggleMySettings();
            // Simulate tab click to open video devices tab
            setTimeout(() => {
                tabVideoDevicesBtn.click();
            }, 100);
        });
        videoMenu.appendChild(settingsBtn);

        // Virtual background button (only when the virtual background feature is enabled)
        if (
            isMediaStreamTrackAndTransformerSupported &&
            (BUTTONS.settings.virtualBackground !== undefined ? BUTTONS.settings.virtualBackground : true)
        ) {
            const virtualBgBtn = document.createElement('button');
            virtualBgBtn.type = 'button';
            virtualBgBtn.className = 'device-menu-action-btn';
            const virtualBgIcon = document.createElement('i');
            virtualBgIcon.className = 'fas fa-image';
            virtualBgBtn.appendChild(virtualBgIcon);
            virtualBgBtn.appendChild(document.createTextNode(' Open Virtual Background'));
            virtualBgBtn.addEventListener('click', () => {
                rc.toggleMySettings();
                // Simulate tab click to open virtual background tab
                setTimeout(() => {
                    tabVirtualBackgroundBtn.click();
                }, 100);
            });
            videoMenu.appendChild(virtualBgBtn);
        }
    }

    function buildAudioMenu() {
        if (!audioMenu) return;

        audioMenu.innerHTML = '';

        appendMenuHeader(audioMenu, 'fas fa-microphone', 'Microphones');
        const audioMeterEntries = [];
        appendSelectOptions(audioMenu, microphoneSelect, 'No microphones found', buildAudioMenu, audioMeterEntries);
        if (audioMeterManager.active) audioMeterManager.start(audioMeterEntries);

        const showPushToTalk = BUTTONS.settings.pushToTalk;
        const showDominantSpeakerFocus = rc.dominantSpeaker;

        appendMenuDivider(audioMenu);
        appendMenuHeader(audioMenu, 'fas fa-ear-listen', 'Microphone Controls');

        appendMenuToggle(audioMenu, 'deviceMenuEchoCancellation', 'Echo cancellation', switchEchoCancellation);
        appendMenuToggle(audioMenu, 'deviceMenuAutoGainControl', 'Automatic gain control', switchAutoGainControl);
        if (showPushToTalk) {
            appendMenuToggle(audioMenu, 'deviceMenuPushToTalk', 'Push to talk', switchPushToTalk);
        }
        if (showDominantSpeakerFocus) {
            appendMenuToggle(audioMenu, 'deviceMenuDominantSpeakerFocus', 'Speaker Focus', switchDominantSpeakerFocus);
        }

        appendMenuDivider(audioMenu);

        appendMenuHeader(audioMenu, 'fas fa-volume-high', 'Speakers');
        if (!speakerSelect || speakerSelect.disabled) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.disabled = true;
            btn.textContent = 'Speaker selection not supported';
            audioMenu.appendChild(btn);
        } else {
            appendSelectOptions(audioMenu, speakerSelect, 'No speakers found', buildAudioMenu);
        }

        // Master output volume
        const volumeRow = document.createElement('div');
        volumeRow.className = 'device-menu-volume-row';

        const volumeIcon = document.createElement('i');
        volumeIcon.className = 'fas fa-volume-high';
        volumeRow.appendChild(volumeIcon);

        const volumeSlider = document.createElement('input');
        volumeSlider.id = 'deviceMenuSpeakerVolume';
        volumeSlider.className = 'output-volume-slider';
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '100';
        volumeSlider.step = '1';
        volumeSlider.value = speakerVolume ? speakerVolume.value : 100;
        volumeRow.appendChild(volumeSlider);

        const volumeValue = document.createElement('span');
        volumeValue.id = 'deviceMenuSpeakerVolumeValue';
        volumeValue.className = 'output-volume-value';
        volumeValue.textContent = `${volumeSlider.value}%`;
        volumeRow.appendChild(volumeValue);

        volumeSlider.addEventListener('input', () => {
            setSpeakerVolume(volumeSlider.value);
        });
        volumeSlider.addEventListener('change', () => {
            localStorageSettings.speaker_volume = Number(volumeSlider.value);
            lS.setSettings(localStorageSettings);
        });

        audioMenu.appendChild(volumeRow);

        // Add action buttons
        appendMenuDivider(audioMenu);

        // Test speaker button
        const testBtn = document.createElement('button');
        testBtn.type = 'button';
        testBtn.className = 'device-menu-action-btn';
        const testIcon = document.createElement('i');
        testIcon.className = 'fa-solid fa-circle-play';
        testBtn.appendChild(testIcon);
        testBtn.appendChild(document.createTextNode(' Test Speaker'));
        testBtn.addEventListener('click', () => {
            playSpeaker(speakerSelect?.value, 'speaker');
        });
        audioMenu.appendChild(testBtn);

        // Settings button
        const settingsBtn = document.createElement('button');
        settingsBtn.type = 'button';
        settingsBtn.className = 'device-menu-action-btn';
        const settingsIcon = document.createElement('i');
        settingsIcon.className = 'fas fa-cog';
        settingsBtn.appendChild(settingsIcon);
        settingsBtn.appendChild(document.createTextNode(' Open Audio Settings'));
        settingsBtn.addEventListener('click', () => {
            rc.toggleMySettings();
            // Simulate tab click to open audio devices tab
            setTimeout(() => {
                tabAudioDevicesBtn.click();
            }, 100);
        });
        audioMenu.appendChild(settingsBtn);
    }

    function rebuildVideoMenu() {
        // Debounce rebuilds to prevent interference with selection
        clearTimeout(rebuildVideoMenu.timeoutId);
        rebuildVideoMenu.timeoutId = setTimeout(() => {
            buildVideoMenu();
        }, 10);
    }

    function rebuildAudioMenu() {
        // Debounce rebuilds to prevent interference with selection
        clearTimeout(rebuildAudioMenu.timeoutId);
        rebuildAudioMenu.timeoutId = setTimeout(() => {
            buildAudioMenu();
        }, 10);
    }

    // Build menus when opening (click or hover)
    videoDropdown.addEventListener('click', rebuildVideoMenu);
    audioDropdown.addEventListener('click', rebuildAudioMenu);
    videoToggle.addEventListener('mouseenter', rebuildVideoMenu);
    audioToggle.addEventListener('mouseenter', rebuildAudioMenu);

    // Live audio input level meters: run only while the audio menu is open
    audioDropdown.addEventListener('shown.bs.dropdown', () => {
        audioMeterManager.active = true;
        buildAudioMenu();
    });
    audioDropdown.addEventListener('hidden.bs.dropdown', () => {
        audioMeterManager.stop();
    });

    // Keep UI synced when settings panel changes device
    if (videoSelect) videoSelect.addEventListener('change', rebuildVideoMenu);
    if (microphoneSelect) microphoneSelect.addEventListener('change', rebuildAudioMenu);
    if (speakerSelect) speakerSelect.addEventListener('change', rebuildAudioMenu);
    [
        [switchEchoCancellation, 'deviceMenuEchoCancellation'],
        [switchAutoGainControl, 'deviceMenuAutoGainControl'],
        [switchPushToTalk, 'deviceMenuPushToTalk'],
        [switchDominantSpeakerFocus, 'deviceMenuDominantSpeakerFocus'],
    ].forEach(([settingsSwitch, menuSwitchId]) => {
        settingsSwitch.addEventListener('change', () => {
            const menuSwitch = getId(menuSwitchId);
            if (menuSwitch) menuSwitch.checked = settingsSwitch.checked;
        });
    });

    // Keep arrow buttons visible only when Start buttons are visible
    syncVisibility();
    const observer = new MutationObserver(syncVisibility);
    observer.observe(startVideoBtn, { attributes: true, attributeFilter: ['class'] });
    observer.observe(startAudioBtn, { attributes: true, attributeFilter: ['class'] });
    observer.observe(stopVideoBtn, { attributes: true, attributeFilter: ['class'] });
    observer.observe(stopAudioBtn, { attributes: true, attributeFilter: ['class'] });

    // Re-enumerate & refresh lists on hardware changes
    if (navigator.mediaDevices) {
        let deviceChangeFrame;
        let lastChangeTime = 0;

        navigator.mediaDevices.addEventListener('devicechange', async () => {
            const now = Date.now();

            // Debounce: ignore rapid-fire changes
            if (now - lastChangeTime < 1000) return;
            lastChangeTime = now;

            if (deviceChangeFrame) cancelAnimationFrame(deviceChangeFrame);

            deviceChangeFrame = requestAnimationFrame(async () => {
                console.log('🔄 Audio devices changed - refreshing...');
                // Give OS time to finish routing (especially important on mobile)
                await new Promise((resolve) => setTimeout(resolve, isMobileDevice ? 1500 : 500));
                try {
                    await refreshMyAudioVideoDevices();
                } catch (err) {
                    console.warn('Device refresh failed:', err);
                }
                setTimeout(() => {
                    rebuildVideoMenu();
                    rebuildAudioMenu();
                }, 50);
            });
        });
    }
}

// ####################################################
// HANDLE PARTICIPANTS
// ####################################################

async function getRemotePeerInfo(peer_id) {
    const peers = await getRoomPeers();
    for (let peer of Array.from(peers.keys()).filter((id) => id === peer_id)) {
        return peers.get(peer).peer_info;
    }
    return false;
}

async function getRoomPeers() {
    let room_info = await rc.getRoomInfo();
    return new Map(JSON.parse(room_info.peers));
}

async function getRoomParticipants() {
    const peers = await getRoomPeers();
    prunePeersLeftFromHiddenIds(peers);
    const lists = getParticipantsList(peers);
    participantsCount = peers.size;
    dropParticipantMenuPortals();
    participantsList.innerHTML = lists;
    const dropdowns = participantsList.querySelectorAll('.dropdown');
    handleParticipantDropdownPortal(dropdowns);
    handleDropdownHover(dropdowns);
    refreshParticipantsCount(participantsCount, false);
    setParticipantsTippy(peers);
    updateChatConversationsCount();
    refreshHiddenParticipantsButton();
    if (isHiddenParticipantsFilterActive) applyHiddenParticipantsFilter();

    console.log('*** Refresh Chat participant lists ***');
}

function dropParticipantMenuPortals() {
    document.querySelectorAll('body > .participant-list-dropdown-menu').forEach((menu) => menu.remove());
}

/**
 * The participants list scrolls (overflow) and the chat panel is transformed when centered,
 * which clips the absolutely positioned menu. Move it to <body> while open so it can overflow.
 * @param {NodeList} dropdowns
 */
function handleParticipantDropdownPortal(dropdowns) {
    dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (!toggle || !menu) return;

        let placeholder = null;

        toggle.addEventListener('show.bs.dropdown', () => {
            if (placeholder) return;
            placeholder = document.createComment('participant-menu');
            menu.replaceWith(placeholder);
            document.body.appendChild(menu);
        });

        toggle.addEventListener('hidden.bs.dropdown', () => {
            if (!placeholder) return;
            placeholder.replaceWith(menu);
            placeholder = null;
        });
    });
}

/** Render human participants and public chat with authorized participant actions. */
function getParticipantsList(peers) {
    let li = '';

    function renderParticipantStatus(statusText) {
        return renderRoomTemplate('participantListStatusTemplate', {
            text: { statusText },
        });
    }

    function renderParticipantActionButton({ buttonClass = 'ml5', buttonId, onClick, iconHtml, label = '' }) {
        return renderRoomTemplate('participantListActionButtonTemplate', {
            text: { label },
            html: { iconHtml },
            attrs: {
                buttonClass,
                buttonId,
                onClick,
            },
        });
    }

    function renderParticipantMenuItem(buttonHtml) {
        return renderRoomTemplate('participantListMenuItemTemplate', {
            html: { buttonHtml },
        });
    }

    function renderParticipantMenuHeader(title, avatarSrc) {
        return renderRoomTemplate('participantListMenuHeaderTemplate', {
            text: { title },
            attrs: { avatarSrc },
        });
    }

    function renderParticipantMenuGroup(label) {
        return renderRoomTemplate('participantListMenuGroupTemplate', {
            text: { label },
        });
    }

    function renderParticipantDropdown(menuId, menuItems, ariaLabel = 'Participant actions') {
        return renderRoomTemplate('participantListDropdownTemplate', {
            html: { menuItems },
            attrs: { menuId, ariaLabel },
        });
    }

    function renderParticipantButtons(buttons) {
        return renderRoomTemplate('participantListActionButtonsTemplate', {
            html: { buttons },
        });
    }

    function renderParticipantItem({
        itemId,
        toId,
        toName,
        itemClass,
        onClick,
        avatarSrc,
        name,
        nameSuffix = '',
        statusHtml,
        dropdownHtml = '',
        buttonsHtml = '',
    }) {
        return renderRoomTemplate('participantListItemTemplate', {
            text: { name },
            html: { nameSuffix, statusHtml, dropdownHtml, buttonsHtml },
            attrs: {
                itemId,
                toId,
                toName,
                itemClass,
                onClick,
                avatarSrc,
            },
        });
    }

    const public_chat_active = rc.chatPeerName === 'all' ? ' active' : '';

    // ALL
    let publicDropdownHtml = '';
    let publicButtonsHtml = '';
    let publicMenuItems = '';

    // ONLY PRESENTER CAN EXECUTE THIS CMD
    if (!isRulesActive || isPresenter) {
        publicMenuItems += renderParticipantMenuGroup('Moderation');

        publicMenuItems += renderParticipantMenuItem(
            renderParticipantActionButton({
                buttonId: 'muteAllParticipantsButton',
                onClick: `rc.peerAction('me','${socket.id}','mute',true,true)`,
                iconHtml: _PEER.audioOff,
                label: 'Mute all participants',
            })
        );
        publicMenuItems += renderParticipantMenuItem(
            renderParticipantActionButton({
                buttonId: 'hideAllParticipantsButton',
                onClick: `rc.peerAction('me','${socket.id}','hide',true,true)`,
                iconHtml: _PEER.videoOff,
                label: 'Hide all participants',
            })
        );
        publicMenuItems += renderParticipantMenuItem(
            renderParticipantActionButton({
                buttonId: 'stopAllParticipantsButton',
                onClick: `rc.peerAction('me','${socket.id}','stop',true,true)`,
                iconHtml: _PEER.screenOff,
                label: 'Stop all screens sharing',
            })
        );

        publicMenuItems += renderParticipantMenuGroup('Share');

        if (BUTTONS.participantsList.sendFileAllButton) {
            publicMenuItems += renderParticipantMenuItem(
                renderParticipantActionButton({
                    buttonClass: 'btn-sm ml5',
                    buttonId: 'sendAllButton',
                    onClick: `rc.selectFileToShare('${socket.id}', true)`,
                    iconHtml: _PEER.sendFile,
                    label: 'Share file to all',
                })
            );
        }

        if (BUTTONS.participantsList.ejectAllButton) {
            publicMenuItems += renderParticipantMenuGroup('Danger zone');
            publicMenuItems += renderParticipantMenuItem(
                renderParticipantActionButton({
                    buttonClass: 'btn-sm ml5 participant-action-danger',
                    buttonId: 'ejectAllButton',
                    onClick: `rc.peerAction('me','${socket.id}','eject',true,true)`,
                    iconHtml: _PEER.ejectPeer,
                    label: 'Eject all participants',
                })
            );
        }

        publicButtonsHtml = renderParticipantButtons(
            renderParticipantActionButton({
                buttonId: 'muteAllButton',
                onClick: `rc.peerAction('me','${socket.id}','mute',true,true)`,
                iconHtml: _PEER.audioOff,
            }) +
                renderParticipantActionButton({
                    buttonId: 'hideAllButton',
                    onClick: `rc.peerAction('me','${socket.id}','hide',true,true)`,
                    iconHtml: _PEER.videoOff,
                }) +
                renderParticipantActionButton({
                    buttonId: 'stopAllButton',
                    onClick: `rc.peerAction('me','${socket.id}','stop',true,true)`,
                    iconHtml: _PEER.screenOff,
                })
        );
    }

    if (publicMenuItems) {
        publicDropdownHtml = renderParticipantDropdown(
            `${socket.id}-chatDropDownMenu`,
            renderParticipantMenuHeader('Public chat', image.all) + publicMenuItems,
            'Actions for all participants'
        );
    }

    li += renderParticipantItem({
        itemId: 'all',
        toId: 'all',
        toName: 'all',
        itemClass: `clearfix${public_chat_active}`,
        onClick: "rc.showPeerAboutAndMessages(this.id, 'all', '', event)",
        avatarSrc: image.all,
        name: 'Public chat',
        nameSuffix: ' <span id="all-unread-count" class="unread-count hidden"></span>',
        statusHtml: renderParticipantStatus(
            (window.i18n?.t('Everyone in room {count}', 'labels') || 'Everyone in room {count}').replace(
                '{count}',
                participantsCount
            )
        ),
        dropdownHtml: publicDropdownHtml,
        buttonsHtml: publicButtonsHtml,
    });

    // Peer currently pinned in the video grid (if any)
    const pinnedPeerId =
        rc.isVideoPinned && rc.pinnedVideoPlayerId
            ? rc.getId(rc.pinnedVideoPlayerId)?.getAttribute('name') || null
            : null;

    // PEERS IN THE CURRENT ROOM
    for (const peer of Array.from(peers.keys())) {
        const peer_info = peers.get(peer).peer_info;
        console.log('PEER-INFO------->', peer_info);
        const peer_name = peer_info.peer_name;
        const peer_avatar = peer_info.peer_avatar;
        const peer_name_limited = peer_name.length > 15 ? peer_name.substring(0, 10) + '*****' : peer_name;
        //const peer_presenter = peer_info.peer_presenter ? _PEER.presenter : _PEER.guest;
        const peer_audio = peer_info.peer_audio ? _PEER.audioOn : _PEER.audioOff;
        const peer_video = peer_info.peer_video ? _PEER.videoOn : _PEER.videoOff;
        const peer_screen = peer_info.peer_screen ? _PEER.screenOn : _PEER.screenOff;
        const peer_hand = peer_info.peer_hand ? _PEER.raiseHand : _PEER.lowerHand;
        const peer_ban = _PEER.banPeer;
        const peer_eject = _PEER.ejectPeer;

        const peer_sendFile = _PEER.sendFile;
        const peer_id = peer_info.peer_id;
        const avatarImg = getParticipantAvatar(peer_name, peer_avatar);

        const peer_chat_active = rc.chatPeerId === peer_id ? ' active' : '';

        const peer_pinned = pinnedPeerId === peer_id;
        const peer_is_presenter = !!peer_info.peer_presenter;
        const peer_hidden = locallyHiddenPeerIds.has(peer_id);
        const peer_hidden_badge = peer_hidden
            ? ` <span id="${peer_id}___pHiddenBadge" class="hidden-peer-badge" role="button" tabindex="0" onclick="event.stopPropagation(); toggleParticipantGridVisibility('${peer_id}')"><i class="fas fa-eye-slash"></i></span>`
            : '';
        // Presenter status badge; clickable to remove the role when the viewer is a presenter
        const peer_presenter_badge = peer_is_presenter
            ? ` <span id="${peer_id}___pPresenterBadge" class="presenter-peer-badge"${
                  isPresenter
                      ? ` role="button" tabindex="0" onclick="event.stopPropagation(); rc.setPresenterRole('${peer_id}', false)"`
                      : ''
              }>${_PEER.presenter}</span>`
            : '';

        const pinMenuItem = renderParticipantMenuItem(
            renderParticipantActionButton({
                buttonClass: 'btn-sm ml5',
                buttonId: `${peer_id}___pPin`,
                onClick: `rc.togglePinPeer('${peer_id}')`,
                iconHtml: _PEER.pinPeer,
                label: peer_pinned ? 'Unpin video' : 'Pin video',
            })
        );
        const hideFromGridMenuItem = renderParticipantMenuItem(
            renderParticipantActionButton({
                buttonClass: 'btn-sm ml5',
                buttonId: `${peer_id}___pGridVisibility`,
                onClick: `toggleParticipantGridVisibility('${peer_id}')`,
                iconHtml: peer_hidden ? _PEER.gridShow : _PEER.gridHide,
                label: peer_hidden ? 'Show in grid' : 'Hide from grid',
            })
        );
        const roleMenuItem = BUTTONS.participantsList.presenterRoleButton
            ? renderParticipantMenuItem(
                  renderParticipantActionButton({
                      buttonClass: 'btn-sm ml5',
                      buttonId: `${peer_id}___pRole`,
                      onClick: `rc.setPresenterRole('${peer_id}', ${!peer_is_presenter})`,
                      iconHtml: peer_is_presenter ? _PEER.presenterActive : _PEER.presenter,
                      label: peer_is_presenter ? 'Remove presenter role' : 'Set as presenter',
                  })
              )
            : '';

        // NOT ME
        if (socket.id !== peer_id) {
            // PRESENTER HAS MORE OPTIONS
            if (isRulesActive && isPresenter) {
                let menuItems = renderParticipantMenuHeader(peer_name_limited, avatarImg);

                if (roleMenuItem) {
                    menuItems += renderParticipantMenuGroup('Role');
                    menuItems += roleMenuItem;
                }

                menuItems += renderParticipantMenuGroup('View');
                menuItems += pinMenuItem;
                menuItems += hideFromGridMenuItem;

                menuItems += renderParticipantMenuGroup('Moderation');

                menuItems += renderParticipantMenuItem(
                    renderParticipantActionButton({
                        buttonId: `${peer_id}___pAudioMute`,
                        onClick: `rc.peerAction('me','${peer_id}','mute')`,
                        iconHtml: _PEER.audioOn,
                        label: 'Toggle audio',
                    })
                );
                menuItems += renderParticipantMenuItem(
                    renderParticipantActionButton({
                        buttonId: `${peer_id}___pVideoHide`,
                        onClick: `rc.peerAction('me','${peer_id}','hide')`,
                        iconHtml: _PEER.videoOn,
                        label: 'Toggle video',
                    })
                );
                menuItems += renderParticipantMenuItem(
                    renderParticipantActionButton({
                        buttonId: `${peer_id}___pScreenStop`,
                        onClick: `rc.peerAction('me','${peer_id}','stop')`,
                        iconHtml: _PEER.screenOn,
                        label: 'Toggle screen',
                    })
                );

                menuItems += renderParticipantMenuGroup('Share');

                if (BUTTONS.participantsList.sendFileButton) {
                    menuItems += renderParticipantMenuItem(
                        renderParticipantActionButton({
                            buttonClass: 'btn-sm ml5',
                            buttonId: `${peer_id}___shareFile`,
                            onClick: `rc.selectFileToShare('${peer_id}', false, ${JSON.stringify(peer_name)})`,
                            iconHtml: peer_sendFile,
                            label: 'Share file',
                        })
                    );
                }

                if (BUTTONS.participantsList.banButton || BUTTONS.participantsList.ejectButton) {
                    menuItems += renderParticipantMenuGroup('Danger zone');
                }
                if (BUTTONS.participantsList.banButton) {
                    menuItems += renderParticipantMenuItem(
                        renderParticipantActionButton({
                            buttonClass: 'btn-sm ml5 participant-action-danger',
                            buttonId: `${peer_id}___pBan`,
                            onClick: `rc.peerAction('me','${peer_id}','ban')`,
                            iconHtml: peer_ban,
                            label: 'Ban participant',
                        })
                    );
                }
                if (BUTTONS.participantsList.ejectButton) {
                    menuItems += renderParticipantMenuItem(
                        renderParticipantActionButton({
                            buttonClass: 'btn-sm ml5 participant-action-danger',
                            buttonId: `${peer_id}___pEject`,
                            onClick: `rc.peerAction('me','${peer_id}','eject')`,
                            iconHtml: peer_eject,
                            label: 'Eject participant',
                        })
                    );
                }
                const dropdownHtml = renderParticipantDropdown(
                    `${peer_id}-chatDropDownMenu`,
                    menuItems,
                    `Actions for ${peer_name_limited}`
                );

                let buttons =
                    renderParticipantActionButton({
                        buttonId: `${peer_id}___pAudio`,
                        onClick: `rc.peerAction('me','${peer_id}','mute')`,
                        iconHtml: peer_audio,
                    }) +
                    renderParticipantActionButton({
                        buttonId: `${peer_id}___pVideo`,
                        onClick: `rc.peerAction('me','${peer_id}','hide')`,
                        iconHtml: peer_video,
                    }) +
                    renderParticipantActionButton({
                        buttonId: `${peer_id}___pScreen`,
                        onClick: `rc.peerAction('me','${peer_id}','stop')`,
                        iconHtml: peer_screen,
                    });

                if (peer_info.peer_hand) {
                    buttons += renderParticipantActionButton({ iconHtml: peer_hand });
                }

                buttons += peer_hidden_badge;
                buttons += peer_presenter_badge;

                li += renderParticipantItem({
                    itemId: peer_id,
                    toId: peer_id,
                    toName: peer_name,
                    itemClass: `clearfix${peer_chat_active}`,
                    onClick: `rc.showPeerAboutAndMessages(this.id, ${JSON.stringify(peer_name)}, ${JSON.stringify(peer_avatar || '')}, event)`,
                    avatarSrc: avatarImg,
                    name: peer_name_limited,
                    nameSuffix: ` <span id="${peer_id}-unread-count" class="unread-count hidden"></span>`,
                    statusHtml: renderParticipantStatus('Private messages'),
                    dropdownHtml,
                    buttonsHtml: renderParticipantButtons(buttons),
                });
            } else {
                // GUEST USER
                let menuItems = renderParticipantMenuHeader(peer_name_limited, avatarImg);

                menuItems += renderParticipantMenuGroup('View');
                menuItems += pinMenuItem;
                menuItems += hideFromGridMenuItem;

                {
                    menuItems += renderParticipantMenuGroup('Share');

                    if (BUTTONS.participantsList.sendFileButton) {
                        menuItems += renderParticipantMenuItem(
                            renderParticipantActionButton({
                                buttonClass: 'btn-sm ml5',
                                buttonId: `${peer_id}___shareFile`,
                                onClick: `rc.selectFileToShare('${peer_id}', false, ${JSON.stringify(peer_name)})`,
                                iconHtml: peer_sendFile,
                                label: 'Share file',
                            })
                        );
                    }
                }

                const dropdownHtml = renderParticipantDropdown(
                    `${peer_id}-chatDropDownMenu`,
                    menuItems,
                    `Actions for ${peer_name_limited}`
                );

                let buttons =
                    renderParticipantActionButton({
                        buttonId: `${peer_id}___pAudio`,
                        onClick: `rc.peerGuestNotAllowed('audio')`,
                        iconHtml: peer_audio,
                    }) +
                    renderParticipantActionButton({
                        buttonId: `${peer_id}___pVideo`,
                        onClick: `rc.peerGuestNotAllowed('video')`,
                        iconHtml: peer_video,
                    }) +
                    renderParticipantActionButton({
                        buttonId: `${peer_id}___pScreen`,
                        onClick: `rc.peerGuestNotAllowed('screen')`,
                        iconHtml: peer_screen,
                    });

                if (peer_info.peer_hand) {
                    buttons += renderParticipantActionButton({ iconHtml: peer_hand });
                }

                buttons += peer_hidden_badge;
                buttons += peer_presenter_badge;

                li += renderParticipantItem({
                    itemId: peer_id,
                    toId: peer_id,
                    toName: peer_name,
                    itemClass: `clearfix${peer_chat_active}`,
                    onClick: `rc.showPeerAboutAndMessages(this.id, ${JSON.stringify(peer_name)}, ${JSON.stringify(peer_avatar || '')}, event)`,
                    avatarSrc: avatarImg,
                    name: peer_name_limited,
                    nameSuffix: ` <span id="${peer_id}-unread-count" class="unread-count hidden"></span>`,
                    statusHtml: renderParticipantStatus('Private messages'),
                    dropdownHtml,
                    buttonsHtml: renderParticipantButtons(buttons),
                });
            }
        }
    }
    return li;
}

function setParticipantsTippy(peers) {
    //
    if (!isMobileDevice) {
        setTippy('muteAllButton', 'Mute all participants', 'top');
        setTippy('hideAllButton', 'Hide all participants', 'top');
        setTippy('stopAllButton', 'Stop screen share to all participants', 'top');
        //
        for (let peer of Array.from(peers.keys())) {
            const peer_info = peers.get(peer).peer_info;
            const peer_id = peer_info.peer_id;

            const peerAudioBtn = rc.getId(peer_id + '___pAudio');
            const peerVideoBtn = rc.getId(peer_id + '___pVideo');
            const peerScreenBtn = rc.getId(peer_id + '___pScreen');

            if (peerAudioBtn) setTippy(peerAudioBtn.id, 'Mute', 'top');
            if (peerVideoBtn) setTippy(peerVideoBtn.id, 'Hide', 'top');
            if (peerScreenBtn) setTippy(peerScreenBtn.id, 'Stop', 'top');

            const peerHiddenBadge = rc.getId(peer_id + '___pHiddenBadge');
            if (peerHiddenBadge) setTippy(peerHiddenBadge.id, 'Show in grid', 'top');

            const peerPresenterBadge = rc.getId(peer_id + '___pPresenterBadge');
            if (peerPresenterBadge) {
                setTippy(peerPresenterBadge.id, isPresenter ? 'Remove presenter role' : 'Presenter', 'top');
            }
        }
    }
}

function refreshParticipantsCount(count, adapt = true) {
    if (adapt) adaptAspectRatio(count);
    refreshExitButtonTooltip();
}

function toggleParticipantGridVisibility(peerId) {
    const shouldHide = !locallyHiddenPeerIds.has(peerId);

    if (shouldHide) {
        const focusedTile = Array.from(videoMediaContainer.querySelectorAll('.Camera[focus-mode]')).find(
            (camera) => camera.dataset.peerId === peerId
        );
        if (focusedTile) rc.toggleFocusMode(focusedTile.id);

        const pinnedVideo = rc.isVideoPinned && rc.pinnedVideoPlayerId ? rc.getId(rc.pinnedVideoPlayerId) : null;
        if (pinnedVideo?.getAttribute('name') === peerId) {
            rc.getId(`${pinnedVideo.id}__pin`)?.click();
        }

        locallyHiddenPeerIds.add(peerId);
    } else {
        locallyHiddenPeerIds.delete(peerId);
    }

    applyParticipantGridVisibility();
    getRoomParticipants();
}

function toggleHiddenParticipantsFilter() {
    if (!isHiddenParticipantsFilterActive && locallyHiddenPeerIds.size === 0) {
        return userLog('info', 'No hidden participants', 'top-end');
    }

    setHiddenParticipantsFilter(!isHiddenParticipantsFilterActive);
}

// Peers that left keep their id in the set, which would leave the filter showing an empty list.
function prunePeersLeftFromHiddenIds(peers) {
    for (const peerId of locallyHiddenPeerIds) {
        if (!peers.has(peerId)) locallyHiddenPeerIds.delete(peerId);
    }
    if (isHiddenParticipantsFilterActive && locallyHiddenPeerIds.size === 0) {
        setHiddenParticipantsFilter(false);
    }
}

function setHiddenParticipantsFilter(active) {
    isHiddenParticipantsFilterActive = active;
    applyHiddenParticipantsFilter();
    refreshHiddenParticipantsButton();
}

// White like the other header buttons; turns yellow (badge color) only while filtering.
function refreshHiddenParticipantsButton() {
    participantsHiddenBtn.classList.toggle('is-filtering', isHiddenParticipantsFilterActive);
}

function applyHiddenParticipantsFilter() {
    for (const li of participantsList.children) {
        if (li.tagName !== 'LI') continue;
        const showItem = !isHiddenParticipantsFilterActive || locallyHiddenPeerIds.has(li.id);
        li.style.display = showItem ? '' : 'none';
    }
    updateChatConversationsCount();
}

function showAllHiddenParticipants() {
    if (locallyHiddenPeerIds.size === 0) {
        return userLog('info', 'No hidden participants', 'top-end');
    }

    locallyHiddenPeerIds.clear();
    applyParticipantGridVisibility();
    setHiddenParticipantsFilter(false);
    getRoomParticipants();
}

function toggleCameraOffParticipantsVisibility(showCameraOff) {
    showCameraOffParticipants = showCameraOff;
    applyParticipantGridVisibility();
}

// Saved across rooms; on join, remind the user their grid hides camera-off participants.
function advisePersistedCameraOffSetting() {
    if (showCameraOffParticipants) return;
    Swal.fire({
        background: swalBackground,
        position: 'center',
        imageUrl: image.hide,
        title: 'Hide camera-off participants?',
        html: 'Your saved preference keeps participants with their camera off hidden from the grid in every room. Keep it here?',
        showDenyButton: true,
        confirmButtonText: 'Keep hidden',
        denyButtonText: 'Show them',
        denyButtonColor: 'green',
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' },
    }).then((result) => {
        if (result.isDenied) {
            switchShowCameraOffParticipants.checked = true;
            toggleCameraOffParticipantsVisibility(true);
            localStorageSettings.show_camera_off_participants = true;
            lS.setSettings(localStorageSettings);
        }
    });
}

function applyParticipantGridVisibility() {
    const focusModeTile = isHideALLVideosActive ? videoMediaContainer.querySelector('[focus-mode]') : null;

    videoMediaContainer.querySelectorAll('.Camera').forEach((camera) => {
        const peerId = camera.dataset.peerId;
        const isCameraOff = camera.dataset.cameraOff === 'true';
        const hiddenByPreference = locallyHiddenPeerIds.has(peerId) || (!showCameraOffParticipants && isCameraOff);
        const hiddenByFocusMode = focusModeTile && camera !== focusModeTile;
        camera.style.display = hiddenByPreference || hiddenByFocusMode ? 'none' : 'block';
    });

    handleAspectRatio();
}

function getParticipantAvatar(peerName, peerAvatar = false) {
    if (peerAvatar && isValidAvatarURL(peerAvatar)) {
        return peerAvatar;
    }
    return rc.genAvatarSvg(peerName, 32);
}

// ####################################################
// SET THEME
// ####################################################

/**
 * Get Themes config from server side and merge with built-in defaults
 */

/**
 * Dynamically add theme cards & dropdown options for server-defined themes
 * that are not part of the built-in defaults.
 */

function applyTheme(props) {
    const root = document.documentElement.style;
    for (const [key, value] of Object.entries(props)) {
        root.setProperty(key, value);
    }
    root.setProperty('--room-switch-accent', props['--room-switch-accent'] || props['--dd-color']);
    root.setProperty('--room-switch-ink', props['--room-switch-ink'] || '#101314');
    swalBackground = props['--body-bg'];
    document.body.style.background = props['--body-bg'];
}

// ####################################################
// HANDLE ASPECT RATIO
// ####################################################

function handleAspectRatio() {
    const visibleTileCount = getVisibleCameraElements().length;
    if (visibleTileCount > 1) {
        adaptAspectRatio(visibleTileCount);
    } else {
        resizeVideoMedia();
    }
}

function adaptAspectRatio(participantsCount) {
    if (BtnAspectRatio.selectedIndex !== 0) {
        // User preferred aspect ratio
        setAspectRatio(BtnAspectRatio.selectedIndex);
        return;
    }

    // Update the participants count badge
    if (participantsCountBadge) {
        participantsCountBadge.textContent = participantsCount;
        participantsCount > 1
            ? elemDisplay('participantsCountBadge', true, 'flex')
            : elemDisplay('participantsCountBadge', false);
    }

    /*
        ['0:0', '4:3', '16:9', '1:1', '1:2'];
    */
    let desktop,
        mobile = 1;
    // desktop aspect ratio
    switch (participantsCount) {
        case 1:
        //case 2:
        case 3:
        case 4:
        case 7:
        case 9:
            desktop = 2; // (16:9)
            break;
        case 5:
        case 6:
        case 10:
        case 11:
            desktop = 1; // (4:3)
            break;
        case 2:
        case 8:
            desktop = 3; // (1:1)
            break;
        default:
            desktop = 0; // (0:0)
    }
    // mobile aspect ratio
    switch (participantsCount) {
        case 3:
        case 9:
        case 10:
            mobile = 2; // (16:9)
            break;
        case 2:
        case 7:
        case 8:
        case 11:
            mobile = 1; // (4:3)
            break;
        case 1:
        case 4:
        case 5:
        case 6:
            mobile = 3; // (1:1)
            break;
        default:
            mobile = 3; // (1:1)
    }
    if (participantsCount > 11) {
        desktop = 1; // (4:3)
        mobile = 3; // (1:1)
    }

    const aspectRatio = isMobileDevice ? mobile : desktop;
    setAspectRatio(aspectRatio);
}

// ####################################################
// HANDLE INIT VIRTUAL BACKGROUND AND BLUR
// ####################################################

function showImageSelector() {
    elemDisplay('imageGrid', true, 'grid');
    if (imageGrid.innerHTML !== '') return;

    imageGrid.innerHTML = ''; // Clear previous images

    function createImage(id, src, tooltip, index, clickHandler) {
        const img = document.createElement('img');
        img.id = id;
        img.src = src;
        img.dataset.index = index;
        img.addEventListener('click', clickHandler);
        imageGrid.appendChild(img);
        if (tooltip) {
            setTippy(img.id, tooltip, 'top');
        }
    }

    // Common function to handle virtual background changes
    async function handleVirtualBackground(blurLevel = null, imgSrc = null, bgTransparent = null) {
        if (!blurLevel && !imgSrc && !bgTransparent) {
            virtualBackgroundBlurLevel = null;
            virtualBackgroundSelectedImage = null;
            virtualBackgroundTransparent = null;
            elemDisplay('imageGrid', false);
        }
        await applyVirtualBackground(initVideo, initStream, blurLevel, imgSrc, bgTransparent);
    }

    // Create clean virtual bg Image
    createImage('initCleanVbImg', image.user, 'Remove virtual background', 'cleanVb', () =>
        handleVirtualBackground(null, null)
    );

    // Create High Blur Image
    createImage('initHighBlurImg', image.blurHigh, 'High Blur', 'high', () => handleVirtualBackground(20));

    // Create Low Blur Image
    createImage('initLowBlurImg', image.blurLow, 'Low Blur', 'low', () => handleVirtualBackground(10));

    // Create transparent virtual bg Image
    createImage('initTransparentBg', image.transparentBg, 'Transparent Virtual background', 'transparentVb', () =>
        handleVirtualBackground(null, null, true)
    );

    // Handle file upload (common logic for file selection)
    function setupFileUploadButton(buttonId, sourceImg, tooltip, handler) {
        const imgButton = document.createElement('img');
        imgButton.id = buttonId;
        imgButton.src = sourceImg;
        imgButton.addEventListener('click', handler);
        imageGrid.appendChild(imgButton);
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

        setupFileUploadButton('initUploadImg', image.upload, 'Upload your custom image', () => fileInput.click());

        return fileInput;
    }

    // Function to add an image to UI
    function addImageToUI(imgData) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-wrapper';

        const customImg = document.createElement('img');
        customImg.src = imgData;
        customImg.addEventListener('click', () => handleVirtualBackground(null, imgData));

        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-icon fas fa-times';
        deleteBtn.addEventListener('click', async (event) => {
            event.stopPropagation();
            await indexedDBHelper.removeImage(imgData);
            imageContainer.remove();
        });

        imageContainer.appendChild(customImg);
        imageContainer.appendChild(deleteBtn);
        imageGrid.appendChild(imageContainer);
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
                ? showError(initErrorMessage, 'Error: Unable to fetch image. CORS policy may be blocking the request.')
                : showError(initErrorMessage, `Error fetching image: ${error.message}`);
        }
    }

    // Paste image from URL
    function askForImageURL() {
        elemDisplay(initImageUrlModal.id, true);
        navigator.clipboard
            .readText()
            .then((clipboardText) => {
                if (isValidImageURL(filterXSS(clipboardText))) {
                    initImageUrlInput.value = clipboardText;
                }
            })
            .catch(() => {});
    }

    initSaveImageUrlBtn.addEventListener('click', async () => {
        elemDisplay(initImageUrlModal.id, false);
        if (isValidImageURL(initImageUrlInput.value)) {
            await fetchAndStoreImage(initImageUrlInput.value);
            initImageUrlInput.value = '';
        }
    });

    initCancelImageUrlBtn.addEventListener('click', () => {
        elemDisplay(initImageUrlModal.id, false);
        initImageUrlInput.value = '';
    });

    // Upload from file button
    createUploadImageButton();

    // Upload from URL button
    setupFileUploadButton('initLinkImage', image.link, 'Upload Image from URL', askForImageURL);

    // Load default virtual backgrounds
    virtualBackgrounds.forEach((imageUrl, index) => {
        createImage(`initVirtualBg${index}`, imageUrl, null, index + 1, () => handleVirtualBackground(null, imageUrl));
    });

    // Load stored images and add to image grid UI
    indexedDBHelper.getAllImages().then((images) => images.forEach(addImageToUI));

    // Upload image with drag and drop
    imageGrid.addEventListener('dragover', (event) => {
        event.preventDefault();
        imageGrid.classList.add('drag-over');
    });

    imageGrid.addEventListener('dragleave', () => {
        imageGrid.classList.remove('drag-over');
    });

    imageGrid.addEventListener('drop', (event) => {
        event.preventDefault();
        imageGrid.classList.remove('drag-over');
        if (event.dataTransfer.files.length > 0) {
            handleFileUpload(event.dataTransfer.files[0]);
        }
    });
}

// ####################################################
// VIRTUAL BACKGROUND HELPER
// ####################################################

/** Apply the latest prejoin effect and persist settings only after successful preparation. */
async function applyVirtualBackground(videoElement, stream, blurLevel, backgroundImage, backgroundTransparent) {
    const applied = await window.BodrikBackgroundCapture.preview(virtualBackground, videoElement, stream, {
        blurLevel,
        imageUrl: backgroundImage,
        transparent: backgroundTransparent,
    });
    if (!applied) return;

    if (blurLevel) {
        virtualBackgroundBlurLevel = blurLevel;
        virtualBackgroundSelectedImage = null;
        virtualBackgroundTransparent = null;
    } else if (backgroundImage) {
        virtualBackgroundSelectedImage = backgroundImage;
        virtualBackgroundBlurLevel = null;
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

    saveVirtualBackgroundSettings(blurLevel, backgroundImage, backgroundTransparent);
}

function isValidImageURL(url) {
    return (
        url.match(/\.(jpeg|jpg|png|gif|webp|bmp|svg|apng|avif|heif|heic|tiff?|ico|cur|jfif|pjpeg|pjp|raw)$/i) !== null
    );
}

// ####################################################
// VIRTUAL BACKGROUND INDEXDB HELPER
// ####################################################

const indexedDBHelper = {
    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('customImageDB', 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    async saveImage(imgData) {
        const db = await this.openDB();
        const transaction = db.transaction('images', 'readwrite');
        transaction.objectStore('images').add({ imgData });
    },
    async getAllImages() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('images', 'readonly');
            const store = transaction.objectStore('images');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result.map((item) => item.imgData));
            request.onerror = () => reject(request.error);
        });
    },
    async removeImage(imgData) {
        const db = await this.openDB();
        const transaction = db.transaction('images', 'readwrite');
        const store = transaction.objectStore('images');

        const request = store.getAll();
        request.onsuccess = () => {
            const item = request.result.find((item) => item.imgData === imgData);
            if (item) store.delete(item.id);
        };
    },
};

// ####################################################
// VIRTUAL BACKGROUND LOCAL STORAGE SETTINGS
// ####################################################

function saveVirtualBackgroundSettings(blurLevel, imageUrl, transparent) {
    const settings = {
        blurLevel: blurLevel || null,
        imageUrl: imageUrl || null,
        transparent: transparent || null,
    };
    localStorage.setItem('virtualBackgroundSettings', JSON.stringify(settings));
}

async function loadVirtualBackgroundSettings() {
    if (!isMediaStreamTrackAndTransformerSupported) return;

    const savedSettings = localStorage.getItem('virtualBackgroundSettings');

    if (!savedSettings) return;

    const { blurLevel, imageUrl, transparent } = JSON.parse(savedSettings);

    if (blurLevel) {
        await applyVirtualBackground(initVideo, initStream, blurLevel);
    } else if (imageUrl) {
        await applyVirtualBackground(initVideo, initStream, null, imageUrl);
    } else if (transparent) {
        await applyVirtualBackground(initVideo, initStream, null, null, true);
    }

    if (virtualBackgroundBlurLevel || virtualBackgroundSelectedImage || virtualBackgroundTransparent) {
        initVirtualBackgroundButton.click();
    }
}

// ####################################################
// HANDLE ERRORS
// ####################################################

function showError(errorElement, message, delay = 5000) {
    errorElement.innerText = message;

    elemDisplay(errorElement.id, true);

    setTimeout(() => {
        errorElement.classList.add('fade-in');
        errorElement.classList.remove('fade-out');
    }, 100);

    setTimeout(() => {
        errorElement.classList.remove('fade-in');
        errorElement.classList.add('fade-out');
    }, delay);

    setTimeout(() => {
        if (errorElement.classList.contains('fade-out')) {
            elemDisplay(errorElement.id, false);
        }
    }, delay + 500);
}

// ####################################################
// HANDLE SESSION EXIT
// ####################################################

// Call this when the session starts (e.g., after joining a room)
function startRoomSession() {
    preventExit = true;
    // Push a new state so the back button can be intercepted
    history.pushState({ sessionActive: true }, '', location.href);
}

// Call this when the session ends (e.g., after leaving a room)
function endRoomSession() {
    preventExit = false;
}

// Intercept browser BACK button
window.addEventListener('popstate', (event) => {
    if (!preventExit) return;
    // Show a custom confirmation dialog
    Swal.fire({
        background: swalBackground,
        position: 'top',
        title: 'Leave session?',
        text: 'Are you sure you want to exit this session?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' },
    }).then((result) => {
        if (result.isConfirmed) {
            // Save recording if in progress
            if (rc.isRecording() || rc.hasActiveRecorder()) {
                recShowInfo = false;
                rc.saveRecording('User popstate changes');
            }
            preventExit = false;
            // Actually go back in history
            history.back();
        } else {
            // Stay in session: push state again to prevent exit
            history.pushState({ sessionActive: true }, '', location.href);
        }
    });
});

// Intercept tab close, refresh, or direct URL navigation
// A page reload is an intentional leave, not a recoverable network outage.
// Notify the server while the websocket is still open so the next page can
// join without waiting for the disconnected peer's recovery grace period.
window.addEventListener('pagehide', () => {
    virtualBackground.stopCurrentProcessor().catch((error) => console.warn('Background shutdown failed', error));
    if (socket.connected) socket.disconnect();
});

window.addEventListener('beforeunload', (e) => {
    // Save recording if in progress
    if (rc.isRecording() || rc.hasActiveRecorder()) {
        recShowInfo = false;
        rc.saveRecording('User is closing the tab, refreshing, or navigating away');
    }

    if (bypassBeforeUnloadOnce || !preventExit || window.localStorage.isReconnected === 'true') return;
    // Modern browsers ignore custom messages, but this triggers the prompt
    e.preventDefault();
    e.returnValue = '';
});

// ####################################################
// ABOUT
// ####################################################

// ####################################################

// ####################################################

// ####################################################
// EXIT MENU
// ####################################################

function toggleExitMenu() {
    if (!exitMenu) return leaveRoom();
    // Only presenters with other participants need the end-for-all choice.
    if (!isPresenter || participantsCount <= 1) {
        setExitMenuOpen(false);
        return leaveRoom();
    }
    if (exitLeaveAllBtn) show(exitLeaveAllBtn);
    setExitMenuOpen(exitMenu.classList.contains('hidden'));
}

function setExitMenuOpen(isOpen) {
    if (!exitMenu) return;
    isOpen ? show(exitMenu) : hide(exitMenu);
    exitButton?.setAttribute('aria-expanded', String(isOpen));
}

function handleExitLeave() {
    setExitMenuOpen(false);
    leaveRoom();
}

function handleExitLeaveForAll() {
    setExitMenuOpen(false);
    leaveRoom(true);
}

function handleExitMenuOutsideClick(e) {
    if (!exitDropdown || !exitMenu) return;
    if (exitMenu.classList.contains('hidden')) return;
    if (!exitDropdown.contains(e.target)) setExitMenuOpen(false);
}

function setupExitMenuHover() {
    if (!exitDropdown || !exitMenu) return;
    exitDropdown.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || exitMenu.classList.contains('hidden')) return;
        setExitMenuOpen(false);
        exitButton.focus();
    });
    if (!isDesktopDevice) return;
    let closeTimeout;
    const cancelClose = () => {
        if (!closeTimeout) return;
        clearTimeout(closeTimeout);
        closeTimeout = null;
    };
    const scheduleClose = () => {
        cancelClose();
        closeTimeout = setTimeout(() => setExitMenuOpen(false), 400);
    };
    exitDropdown.addEventListener('mouseenter', () => {
        if (!isPresenter || participantsCount <= 1) return;
        cancelClose();
        if (exitLeaveAllBtn) show(exitLeaveAllBtn);
        setExitMenuOpen(true);
    });
    exitDropdown.addEventListener('mouseleave', scheduleClose);
}
