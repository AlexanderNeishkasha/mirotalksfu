(() => {
    'use strict';

    const modes = Object.freeze({ off: 'off', browser: 'browser', rnnoise: 'rnnoise' });
    const ownScript = document.currentScript?.src || '';
    const version = (() => {
        try {
            return new URL(ownScript, window.location.href).searchParams.get('v');
        } catch {
            return null;
        }
    })();
    let loading;

    /** Normalize persisted/untrusted values to the no-processing default. */
    function normalize(value) {
        return Object.values(modes).includes(value) ? value : modes.off;
    }

    /** Use browser processing only in browser mode; RNNoise must never double-process capture. */
    function browserConstraint(value) {
        return normalize(value) === modes.browser;
    }

    /** Add this source revision to lazily requested RNNoise scripts/worklets. */
    function url(path) {
        if (!version) return path;
        const parsed = new URL(path, window.location.origin);
        parsed.searchParams.set('v', version);
        return `${parsed.pathname}${parsed.search}`;
    }

    /** Load the RNNoise controller once on explicit selection; failed loads remain retryable. */
    function load() {
        if (typeof window.RNNoiseProcessor === 'function') return Promise.resolve(window.RNNoiseProcessor);
        if (loading) return loading;
        const script = document.createElement('script');
        script.src = url('/js/NodeProcessor.js');
        script.async = true;
        loading = new Promise((resolve, reject) => {
            let settled = false;
            const timer = setTimeout(() => finish(new Error('RNNoise loading timed out')), 15000);
            /** Settle one script request and remove failed artifacts. */
            function finish(error) {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                script.onload = script.onerror = null;
                if (error || typeof window.RNNoiseProcessor !== 'function') {
                    script.remove();
                    reject(error || new Error('RNNoise processor is unavailable'));
                } else resolve(window.RNNoiseProcessor);
            }
            script.onload = () => finish();
            script.onerror = () => finish(new Error('Could not load RNNoise'));
            document.head.appendChild(script);
        });
        loading.catch(() => {
            loading = null;
        });
        return loading;
    }

    window.BodrikNoiseSuppression = { modes, normalize, browserConstraint, url, load };
})();
