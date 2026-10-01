/** Resolve the listener's effective output level for playback and recording from the same authoritative values. */
function getEffectiveAudioOutputVolume(client, audioPlayer) {
    const peerVolume = audioPlayer.dataset.peerVolume !== undefined ? Number(audioPlayer.dataset.peerVolume) : 1;
    const musicVolume = audioPlayer.dataset.bodrikMusic === 'true' ? client.bodrikMusicVolume : 1;
    return Math.min(1, Math.max(0, (isNaN(peerVolume) ? 1 : peerVolume) * client.masterOutputVolume * musicVolume));
}
