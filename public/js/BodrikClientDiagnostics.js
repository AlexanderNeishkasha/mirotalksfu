(() => {
    const ALLOWED_DETAILS = new Set([
        'transport',
        'state',
        'reason',
        'message',
        'name',
        'code',
        'attempt',
        'elapsed_ms',
        'recovered',
        'online',
        'visibility',
        'phase',
        'retry',
    ]);
    const MAX_QUEUE = 100;
    const queue = [];
    let socket = null;
    let sequence = 0;
    let flushTimer = null;
    let pageEnding = false;
    let serverReady = false;
    let enabled = false;
    let inFlight = null;

    /** Bound and redact client strings before they enter the offline queue or signaling layer. */
    function clean(value, max = 240) {
        if (typeof value !== 'string') return undefined;
        return value
            .replace(/[\x00-\x1f\x7f]/g, ' ')
            .replace(/https?:\/\/[^\s"']+/gi, '[url]')
            .replace(/(token|authorization|credential|password|candidate|sdp)\s*[:=]\s*[^\s,;}]+/gi, '$1=[redacted]')
            .slice(0, max);
    }

    /** Convert browser Errors and arbitrary rejection values into bounded diagnostic details. */
    function errorDetails(error) {
        if (error instanceof Error || error instanceof DOMException) {
            return {
                name: clean(error.name, 80),
                message: clean(error.message),
                code: clean(String(error.code || ''), 40),
            };
        }
        return { message: clean(typeof error === 'string' ? error : String(error)) };
    }

    /** Send queued events in small batches only while signaling is connected; retain failed batches for reconnect. */
    function flush() {
        clearTimeout(flushTimer);
        flushTimer = null;
        if (!socket?.connected || !serverReady || !queue.length || pageEnding || inFlight) return;
        const batch = queue.splice(0, 20);
        const retry = () => {
            if (inFlight !== batch) return;
            inFlight = null;
            queue.unshift(...batch);
            if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
            flushTimer = setTimeout(flush, 500);
        };
        inFlight = batch;
        const timeout = setTimeout(retry, 5000);
        try {
            socket.emit('bodrikDiagnostics', batch, () => {
                if (inFlight !== batch) return;
                clearTimeout(timeout);
                inFlight = null;
                if (queue.length) flushTimer = setTimeout(flush, 50);
            });
        } catch (error) {
            clearTimeout(timeout);
            console.warn('Client diagnostics send failed', error);
            retry();
        }
    }

    /** Queue one explicitly named operational event; unknown detail keys and complex values are discarded. */
    function report(type, details = {}) {
        if (pageEnding || !enabled) return;
        const safe = {};
        for (const [key, value] of Object.entries(details || {})) {
            if (!ALLOWED_DETAILS.has(key)) continue;
            if (typeof value === 'string') safe[key] = clean(value);
            else if (typeof value === 'boolean') safe[key] = value;
            else if (typeof value === 'number' && Number.isFinite(value)) safe[key] = value;
        }
        queue.push({ type, details: safe, at: Date.now(), seq: sequence++ });
        if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
        if (!flushTimer) flushTimer = setTimeout(flush, 50);
    }

    /** Enable collection only when the joined server explicitly advertises this temporary diagnostic channel. */
    function setEnabled(value) {
        enabled = value === true;
        if (!enabled) {
            queue.length = 0;
            inFlight = null;
        } else flush();
    }

    /** Bind diagnostics to the room Socket.IO instance while preserving queued events across reconnects. */
    function attach(nextSocket) {
        if (socket === nextSocket) return;
        socket = nextSocket;
        socket.on('connect', () => {
            serverReady = Boolean(socket.recovered);
            flush();
        });
        socket.on('disconnect', () => {
            serverReady = false;
        });
        socket.on('bodrikDiagnosticsReady', () => {
            serverReady = true;
            flush();
        });
        serverReady = Boolean(socket.connected && socket.recovered);
        flush();
    }

    window.addEventListener('error', (event) => {
        report('browser_error', { ...errorDetails(event.error || event.message), phase: 'window' });
    });
    window.addEventListener('unhandledrejection', (event) => {
        report('unhandled_rejection', { ...errorDetails(event.reason), phase: 'promise' });
    });
    window.addEventListener('online', () => report('signaling_connect', { phase: 'browser_online', online: true }));
    window.addEventListener('offline', () =>
        report('signaling_disconnect', { phase: 'browser_offline', online: false })
    );
    window.addEventListener(
        'pagehide',
        () => {
            pageEnding = true;
            clearTimeout(flushTimer);
            queue.length = 0;
            inFlight = null;
        },
        { once: true }
    );

    window.BodrikClientDiagnostics = { attach, setEnabled, report, errorDetails };
})();
