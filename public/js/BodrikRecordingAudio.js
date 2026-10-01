/** Mix recording tracks at the recorder's playback levels without adding another audible output. */
class BodrikRecordingAudio {
    /** Own the recording-only audio graph; the client retains ownership of source tracks. */
    constructor(client) {
        this.client = client;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
        if (!AudioContextClass) throw new Error('Web Audio API is not supported in this browser');
        this.context = new AudioContextClass();
        this.destination = this.context.createMediaStreamDestination();
        this.entries = new Map();
    }

    /** Start the audio graph before MediaRecorder waits for its first samples (including on Gecko). */
    async resume() {
        if (this.context?.state === 'suspended') await this.context.resume();
    }

    /** Deduplicate tracks and apply remote playback gain or local microphone mute before encoding. */
    getMixedAudioStream(streams) {
        const players = this.client.getOutputAudioElements();
        for (const stream of streams) {
            for (const track of stream.getAudioTracks()) {
                if (this.entries.has(track.id)) continue;
                const player = players.find((element) =>
                    element.srcObject?.getAudioTracks().some((t) => t.id === track.id)
                );
                const source = this.context.createMediaStreamSource(new MediaStream([track]));
                const gain = this.context.createGain();
                gain.gain.value = player
                    ? getEffectiveAudioOutputVolume(this.client, player)
                    : this.client.peer_info.peer_audio === false
                      ? 0
                      : 1;
                source.connect(gain);
                gain.connect(this.destination);
                this.entries.set(track.id, { source, gain, player });
            }
        }
        return this.destination.stream;
    }

    /** Keep an existing recording stem synchronized with live listener and Studio volume changes. */
    updateElementVolume(player, volume) {
        for (const entry of this.entries.values()) {
            if (entry.player === player) entry.gain.gain.value = volume;
        }
    }

    /** Keep local microphone capture silent when the recorder mutes their microphone. */
    updateMicrophoneVolume(enabled) {
        for (const entry of this.entries.values()) {
            if (!entry.player) entry.gain.gain.value = enabled ? 1 : 0;
        }
    }

    /** Disconnect the recording graph and stop only its output tracks, never the live call tracks. */
    stopMixedAudioStream() {
        if (!this.context) return;
        for (const { source, gain } of this.entries.values()) {
            source.disconnect();
            gain.disconnect();
        }
        this.entries.clear();
        this.destination.stream.getTracks().forEach((track) => track.stop());
        this.destination.disconnect();
        const context = this.context;
        this.context = null;
        context.close().catch((error) => console.warn('Recording audio graph cleanup failed', error));
    }
}
