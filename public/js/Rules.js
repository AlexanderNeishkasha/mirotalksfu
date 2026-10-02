'use strict';

let isPresenter = false;

// ####################################################
// SHOW HIDE DESIRED BUTTONS BY RULES
// ####################################################

const isRulesActive = true;

/**
 * WARNING!
 * This will be replaced by the ui.buttons specified in the server configuration file located at app/src/config.js.
 * Ensure that any changes made here are also reflected in the configuration file to maintain synchronization.
 */
let BUTTONS = {
    popup: {
        shareRoomPopup: true,
    },
    main: {
        shareButton: true, // for quest, presenter default true

        fullScreenButton: true,
        startAudioButton: true,
        startVideoButton: true,
        startScreenButton: true,
        swapCameraButton: true,
        chatButton: true,
        participantsButton: true,

        // if presenter and if true

        raiseHandButton: true,

        settingsButton: true,
        aboutButton: true, // Please keep me always visible, thank you!
        exitButton: true,
        extraButton: true,
    },
    settings: {
        fileSharing: true,
        lockRoomButton: true, // presenter
        unlockRoomButton: true, // presenter
        // presenter
        lobbyButton: true, // presenter
        joinLockButton: true, // presenter
        micOptionsButton: true,
        // presenter
        tabModerator: true, // presenter
        // presenter
        tabRecording: true,
        host_only_recording: true, // presenter
        pushToTalk: true,
        keyboardShortcuts: true,
        virtualBackground: true,
        customNoiseSuppression: true, // use RNNoise else WebRTC built-in
    },
    producerVideo: {
        videoPictureInPicture: true,
        videoMirrorButton: true,
        pinVideoButton: true,
        fullScreenButton: true,

        focusVideoButton: true,
        muteAudioButton: true,
        videoPrivacyButton: true,
    },
    consumerVideo: {
        videoPictureInPicture: true,
        videoMirrorButton: true,
        pinVideoButton: true,
        fullScreenButton: true,

        focusVideoButton: true,
        hideFromGridButton: true,
        sendMessageButton: true,
        sendFileButton: true,

        muteVideoButton: true,
        muteAudioButton: true,

        // Presenter
        banButton: true, // presenter
        ejectButton: true, // presenter
        presenterRoleButton: true, // presenter
        // presenter
    },
    videoOff: {
        pinVideoButton: true,
        hideFromGridButton: true,
        sendMessageButton: true,
        sendFileButton: true,

        muteAudioButton: true,
        audioVolumeInput: true,
        // Presenter
        banButton: true, // presenter
        ejectButton: true, // presenter
        presenterRoleButton: true, // presenter
    },

    chat: {
        chatPinButton: true,
        chatMaxButton: true,
        chatSaveButton: true,
        chatEmojiButton: true,
        chatMarkdownButton: true,
    },

    participantsList: {
        sendFileAllButton: true, // presenter
        ejectAllButton: true, // presenter
        sendFileButton: true, // presenter & guests
        banButton: true, // presenter
        ejectButton: true, // presenter
        presenterRoleButton: true, // presenter
    },

    //...
};

// Baseline snapshot of the server-merged BUTTONS config, used to restore state on role changes
let buttonsBaseline = null;

/** Apply presenter permissions to retained room controls. */
function handleRules(isPresenter, roomSetup = true) {
    console.log('07.1 ----> IsPresenter: ' + isPresenter);
    if (!isRulesActive) return;

    // Capture the server-merged button config once, then restore it on every call so switching
    // a participant's role re-derives button visibility from the original config instead of the
    // previously mutated (guest/presenter) state.
    if (!buttonsBaseline) {
        buttonsBaseline = JSON.parse(JSON.stringify(BUTTONS));
    } else {
        BUTTONS = JSON.parse(JSON.stringify(buttonsBaseline));
    }

    if (!isPresenter) {
        // ##################################
        // GUEST
        // ##################################

        BUTTONS.settings.lockRoomButton = false;
        BUTTONS.settings.unlockRoomButton = false;

        BUTTONS.settings.lobbyButton = false;
        BUTTONS.settings.joinLockButton = false;

        BUTTONS.settings.tabModerator = false;
        BUTTONS.videoOff.muteAudioButton = false;

        BUTTONS.videoOff.banButton = false;
        BUTTONS.videoOff.ejectButton = false;
        BUTTONS.videoOff.presenterRoleButton = false;

        BUTTONS.consumerVideo.banButton = false;
        BUTTONS.consumerVideo.ejectButton = false;
        BUTTONS.consumerVideo.presenterRoleButton = false;
        BUTTONS.participantsList.presenterRoleButton = false;

        // Hide presenter-only elements (covers demotion from presenter to guest)

        // If a presenter-only settings tab was open, reset to the default Room tab so its
        // content isn't left visible after the tab button is hidden.
        const openPresenterTab = ['tabModerator'].some((id) => {
            const el = rc.getId(id);
            return el && el.style.display === 'block';
        });
        if (openPresenterTab) {
            const roomTabBtn = rc.getId('tabRoomBtn');
            if (roomTabBtn) roomTabBtn.click();
        }

        //...
    } else {
        // ##################################
        // PRESENTER
        // ##################################
        BUTTONS.main.shareButton = true;

        BUTTONS.settings.lockRoomButton = BUTTONS.settings.lockRoomButton && !isRoomLocked;
        BUTTONS.settings.unlockRoomButton = BUTTONS.settings.lockRoomButton && isRoomLocked;

        //...

        // ##################################
        // Auto detected rules for presenter
        // ##################################

        // Skipped when a participant is promoted mid-session, so the room state
        // (lobby, recording, moderator) set by the original presenter is preserved.
        if (roomSetup) {
            // Room lobby
            isLobbyEnabled = localStorageSettings.lobby;
            switchLobby.checked = isLobbyEnabled;
            rc.roomAction(isLobbyEnabled ? 'lobbyOn' : 'lobbyOff', true, false);
            // Room host-only-recording
            hostOnlyRecording = localStorageSettings.host_only_recording;
            switchHostOnlyRecording.checked = hostOnlyRecording;
            rc.roomAction(hostOnlyRecording ? 'hostOnlyRecordingOn' : 'hostOnlyRecordingOff', true, false);
            // Room moderator Sync moderator settings...
            syncModeratorData();
        } else {
            // Promoted mid-session: reflect the room's current state on the switches without
            // broadcasting, so the panel matches reality instead of showing this peer's defaults.

            switchLobby.checked = isLobbyEnabled;
            switchHostOnlyRecording.checked = hostOnlyRecording;
            loadModeratorDataFromRoom();
        }

        {
        }
    }
    // main. settings...
    BUTTONS.main.shareButton ? show(shareButton) : hide(shareButton);
    {
    }
    BUTTONS.settings.lockRoomButton ? show(lockRoomButton) : hide(lockRoomButton);
    BUTTONS.settings.unlockRoomButton ? show(unlockRoomButton) : hide(unlockRoomButton);

    BUTTONS.settings.lobbyButton ? show(lobbyButton) : hide(lobbyButton);
    updateJoinLockButtons();
    BUTTONS.settings.micOptionsButton ? show(micOptionsButton) : hide(micOptionsButton);
    BUTTONS.settings.tabModerator ? show(tabModeratorBtn) : hide(tabModeratorBtn);
    if (BUTTONS.settings.host_only_recording) {
        show(recordingActionButton);
        show(roomRecordingOptions);
        show(roomHostOnlyRecording);
    } else {
        show(recordingActionButton);
        show(roomRecordingOptions);
        hide(roomHostOnlyRecording);
    }

    refreshExitButtonTooltip();
    //...
}

function syncModeratorData() {
    loadModeratorData();
    const syncModeratorData = getModeratorData();
    console.log('Sync moderator data ---->', syncModeratorData);
    rc.updateRoomModeratorALL(syncModeratorData);
}

function loadModeratorData() {
    switchEveryonePrivacy.checked = localStorageSettings.moderator_video_start_privacy;
    switchEveryoneMute.checked = localStorageSettings.moderator_audio_start_muted;
    switchEveryoneHidden.checked = localStorageSettings.moderator_video_start_hidden;
    switchEveryoneCantUnmute.checked = localStorageSettings.moderator_audio_cant_unmute;
    switchEveryoneCantUnhide.checked = localStorageSettings.moderator_video_cant_unhide;
    switchEveryoneCantShareScreen.checked = localStorageSettings.moderator_screen_cant_share;
    switchEveryoneCantChatPrivately.checked = localStorageSettings.moderator_chat_cant_privately;
    switchEveryoneCantChatPublicly.checked = localStorageSettings.moderator_chat_cant_publicly;

    switchDisconnectAllOnLeave.checked = localStorageSettings.moderator_disconnect_all_on_leave;
}

// Map the room's authoritative moderator state (rc._moderator) onto the switch UI.
// Used when a peer is promoted mid-session so the panel matches the live room rules
// (kept in sync across all peers via updateRoomModerator broadcasts) rather than this
// peer's own localStorage defaults, and without broadcasting/overwriting the room state.
function loadModeratorDataFromRoom() {
    if (!rc || typeof rc.getModerator !== 'function') return;
    const moderator = rc.getModerator();
    if (!moderator) return;
    switchEveryonePrivacy.checked = !!moderator.video_start_privacy;
    switchEveryoneMute.checked = !!moderator.audio_start_muted;
    switchEveryoneHidden.checked = !!moderator.video_start_hidden;
    switchEveryoneCantUnmute.checked = !!moderator.audio_cant_unmute;
    switchEveryoneCantUnhide.checked = !!moderator.video_cant_unhide;
    switchEveryoneCantShareScreen.checked = !!moderator.screen_cant_share;
    switchEveryoneCantChatPrivately.checked = !!moderator.chat_cant_privately;
    switchEveryoneCantChatPublicly.checked = !!moderator.chat_cant_publicly;
}

// Reflect a single moderator rule change on its switch, keeping every presenter's panel
// in sync when another presenter toggles a rule. Programmatic .checked does not fire
// onchange, so this never re-broadcasts.
function updateModeratorSwitchUI(type, status) {
    const switchByType = {
        video_start_privacy: switchEveryonePrivacy,
        audio_start_muted: switchEveryoneMute,
        video_start_hidden: switchEveryoneHidden,
        audio_cant_unmute: switchEveryoneCantUnmute,
        video_cant_unhide: switchEveryoneCantUnhide,
        screen_cant_share: switchEveryoneCantShareScreen,
        chat_cant_privately: switchEveryoneCantChatPrivately,
        chat_cant_publicly: switchEveryoneCantChatPublicly,
    };
    const switchEl = switchByType[type];
    if (switchEl) switchEl.checked = !!status;
}

/** Collect supported microphone, camera, screen, and human-chat restrictions. */
function getModeratorData() {
    return {
        video_start_privacy: switchEveryonePrivacy.checked,
        audio_start_muted: switchEveryoneMute.checked,
        video_start_hidden: switchEveryoneHidden.checked,
        audio_cant_unmute: switchEveryoneCantUnmute.checked,
        video_cant_unhide: switchEveryoneCantUnhide.checked,
        screen_cant_share: switchEveryoneCantShareScreen.checked,
        chat_cant_privately: switchEveryoneCantChatPrivately.checked,
        chat_cant_publicly: switchEveryoneCantChatPublicly.checked,
    };
}
