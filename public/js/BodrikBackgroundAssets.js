(() => {
    /** Bound external script/model waits without cancelling another caller's shared load. */
    function wait(promise, signal, timeoutMs = 15000) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const abort = () => finish(reject, new DOMException('Background operation cancelled', 'AbortError'));
            const timer = setTimeout(
                () => finish(reject, new Error('Virtual background loading timed out')),
                timeoutMs
            );
            /** Complete one wait and remove its timer and cancellation subscription. */
            function finish(callback, value) {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                signal?.removeEventListener('abort', abort);
                callback(value);
            }
            signal?.addEventListener('abort', abort, { once: true });
            Promise.resolve(promise).then(
                (value) => finish(resolve, value),
                (error) => finish(reject, error)
            );
            if (signal?.aborted) abort();
        });
    }

    const pending = new Map();
    /** Load each dependency once; remove failed scripts so a subsequent activation can retry. */
    function load(name, url) {
        if (window[name]) return Promise.resolve(window[name]);
        if (pending.has(name)) return pending.get(name);
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        const promise = new Promise((resolve, reject) => {
            const timer = setTimeout(() => finish(new Error(`Could not load ${name}`)), 15000);
            /** Settle script loading exactly once and make failure retryable. */
            function finish(error) {
                clearTimeout(timer);
                script.onload = script.onerror = null;
                if (error || !window[name]) {
                    script.remove();
                    reject(error || new Error(`Missing background dependency: ${name}`));
                } else resolve(window[name]);
            }
            script.onload = () => finish();
            script.onerror = () => finish(new Error(`Could not load ${name}`));
            document.head.appendChild(script);
        });
        pending.set(name, promise);
        promise.catch(() => {
            if (pending.get(name) === promise) pending.delete(name);
        });
        return promise;
    }

    window.BodrikBackgroundAssets = {
        wait,
        /** Load the segmentation library on first effect activation. */
        segmentation: () => load('SelfieSegmentation', 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation'),
        /** Load the GIF decoder only when an animated background is requested. */
        gifler: () => load('gifler', 'https://cdn.jsdelivr.net/npm/gifler@0.1.0/gifler.min.js'),
    };
})();
