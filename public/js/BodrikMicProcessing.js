'use strict';

/** Apply a browser microphone processing preference to the active raw track and persist it. */
async function setBodrikMicPreference({ key, constraint, enabled, input, settings, storage, roomClient }) {
    const track =
        roomClient?.RNNoiseProcessor?.mediaStream?.getAudioTracks()[0] ||
        roomClient?.localAudioStream?.getAudioTracks()[0];
    input.disabled = true;
    try {
        if (track && track.readyState === 'live') {
            await track.applyConstraints({ ...track.getConstraints(), [constraint]: enabled });
        }
        settings[key] = enabled;
        storage.setSettings(settings);
    } catch (error) {
        input.checked = settings[key] === true;
        throw error;
    } finally {
        input.disabled = false;
    }
}

/** Connect microphone switches to the raw capture track, restoring the UI on failure. */
function bindBodrikMicSettings({ echoInput, gainInput, settings, storage, getRoomClient, onError }) {
    for (const [input, key, constraint, menuId] of [
        [echoInput, 'mic_echo_cancellation', 'echoCancellation', 'deviceMenuEchoCancellation'],
        [gainInput, 'mic_auto_gain_control', 'autoGainControl', 'deviceMenuAutoGainControl'],
    ]) {
        input.onchange = async () => {
            try {
                await setBodrikMicPreference({
                    key,
                    constraint,
                    enabled: input.checked,
                    input,
                    settings,
                    storage,
                    roomClient: getRoomClient(),
                });
            } catch (error) {
                const menuSwitch = document.getElementById(menuId);
                if (menuSwitch) menuSwitch.checked = input.checked;
                onError(error);
            }
        };
    }
}

if (typeof window !== 'undefined') window.bindBodrikMicSettings = bindBodrikMicSettings;
if (typeof module !== 'undefined') module.exports = { setBodrikMicPreference, bindBodrikMicSettings };
