/** Choose audio-only codecs when the recording stream has no video tracks. */
function getRecordingOptions(stream, options) {
    if (stream.getVideoTracks().length) return options;
    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) =>
        MediaRecorder.isTypeSupported(type)
    );
    if (!mimeType) throw new Error('This browser does not support audio-only recording.');
    return { ...options, mimeType };
}

/** Release recording-owned capture only after the recorder has emitted its final data and stop event. */
function releaseRecordingCapture(client) {
    client.recScreenStream?.getVideoTracks().forEach((track) => track.stop());
    client.recScreenStream = null;
    client.recScreenAudioTracks.forEach((track) => track.stop());
    client.recScreenAudioTracks = [];
    client.screenAudioRecorder?.stopMixedAudioStream();
    client.screenAudioRecorder = null;
    client.audioRecorder?.stopMixedAudioStream();
    client.audioRecorder = null;
    if (client.isMobileDevice) client.getId('swapCameraButton').className = '';
}
