(() => {
    /** Create the cancellation marker shared by obsolete camera/background operations. */
    function cancelled() {
        return new DOMException('Camera operation cancelled', 'AbortError');
    }

    /** Show one localized activation failure while leaving ordinary camera capture available. */
    function reportFailure(error) {
        console.warn('Virtual background unavailable', error);
        const message = 'Could not load the virtual background. Your camera will work without effects. Try again.';
        userLog('warning', window.i18n?.t(message, 'toasts') || message, 'top-end', 6000);
    }

    /** Derive an effect stream from the selected settings, preserving the raw stream on load failure. */
    async function apply(effect, stream, settings) {
        const track = stream?.getVideoTracks()[0];
        if (!track || track.readyState === 'ended') throw cancelled();
        try {
            if (settings.blurLevel) return await effect.applyBlurToWebRTCStream(track, settings.blurLevel);
            if (settings.imageUrl) return await effect.applyVirtualBackgroundToWebRTCStream(track, settings.imageUrl);
            if (settings.transparent) return await effect.applyTransparentVirtualBackgroundToWebRTCStream(track);
            await effect.stopCurrentProcessor();
            return stream;
        } catch (error) {
            if (error.name === 'AbortError') throw error;
            reportFailure(error);
            return stream;
        }
    }

    /** Own the raw capture separately from derived tracks so closing a camera cannot leak capture. */
    async function prepare(owner, source, generation, effect, settings, onEnded) {
        if (owner.isLeaving || owner.cameraCaptureGeneration !== generation) {
            source.getTracks().forEach((track) => track.stop());
            throw cancelled();
        }
        const track = source.getVideoTracks()[0];
        if (!track) {
            source.getTracks().forEach((item) => item.stop());
            throw cancelled();
        }
        owner.cameraSourceStream = source;
        /** Notify only the owner of this acquisition, not a later camera selection. */
        const ended = () => {
            if (owner.cameraSourceStream === source && owner.cameraCaptureGeneration === generation) onEnded?.();
        };
        owner.cameraSourceEnded = ended;
        track.addEventListener('ended', ended, { once: true });
        try {
            const pending = apply(effect, source, settings);
            const effectGeneration = effect.generation;
            const derived = await pending;
            if (
                owner.isLeaving ||
                owner.cameraCaptureGeneration !== generation ||
                effect.generation !== effectGeneration ||
                track.readyState === 'ended'
            ) {
                derived.getTracks().forEach((item) => item.stop());
                throw cancelled();
            }
            return derived;
        } catch (error) {
            track.removeEventListener('ended', ended);
            source.getTracks().forEach((item) => item.stop());
            if (owner.cameraSourceStream === source) {
                owner.cameraSourceStream = null;
                owner.cameraSourceEnded = null;
            }
            throw error;
        }
    }

    /** Invalidate pending capture and synchronously stop only camera-owned source tracks. */
    function release(owner, effect) {
        owner.cameraCaptureGeneration = (owner.cameraCaptureGeneration || 0) + 1;
        const source = owner.cameraSourceStream;
        owner.cameraSourceStream = null;
        source?.getVideoTracks()[0]?.removeEventListener('ended', owner.cameraSourceEnded);
        owner.cameraSourceEnded = null;
        source?.getTracks().forEach((track) => track.stop());
        effect.stopCurrentProcessor().catch((error) => console.warn('Background shutdown failed', error));
    }

    /** Replace a prejoin preview only when its requested effect and camera are still current. */
    async function preview(effect, video, source, settings) {
        try {
            const pending = apply(effect, source, settings);
            const generation = effect.generation;
            const result = await pending;
            if (effect.generation !== generation || source.getVideoTracks()[0].readyState === 'ended') return false;
            video.srcObject = result;
            return result !== source || !(settings.blurLevel || settings.imageUrl || settings.transparent);
        } catch (error) {
            if (error.name !== 'AbortError') reportFailure(error);
            return false;
        }
    }

    window.BodrikBackgroundCapture = { apply, prepare, release, preview };
})();
