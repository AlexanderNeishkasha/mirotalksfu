// The public room-state stream is the only source of meeting colors; no MiroTalk theme preference is saved.
(() => {
    // Dark Studio palettes mirror frontend/app/themes/*.css: background, card, raised card, border, accent, text, input.
    // MiroTalk hardcodes white icons and labels across its controls; light Studio themes need dark
    // meeting surfaces with matching hues until its UI has a complete light-mode token set.
    const palettes = {
        aurora: ['#0b1b1f', '#11262c', '#16323a', '#22444b', '#7fd1b9', '#e9f5f2', '#0f2026'],
        crimson: ['#160808', '#201111', '#2a1515', '#3f1d1d', '#d7b46a', '#f5ead3', '#160c0c'],
        emberveil: ['#1b1714', '#241e1a', '#2a231f', '#362c26', '#ff9a3d', '#f0e6dd', '#14100e'],
        grove: ['#0f1a14', '#13231a', '#1a2d22', '#2b3f31', '#7ea96a', '#e6efe1', '#0f1d14'],
        ivory: ['#231c16', '#30261e', '#3b2e23', '#5c4833', '#d7b46a', '#f8f1e6', '#1b1612'],
        lucifer: ['#1e1518', '#2b1b20', '#3b242b', '#60383d', '#ff8585', '#fff1ef', '#1a1215'],
        midnight: ['#0b1020', '#141e32', '#18243b', '#243252', '#7fb5ff', '#e8f0ff', '#0e1525'],
        mono: ['#262626', '#343434', '#3b3b3b', '#525252', '#f0f0f0', '#f8f8f8', '#2f2f2f'],
        mythic: ['#0d0f1a', '#141a2a', '#1b2336', '#2a3350', '#c8a45a', '#efe9da', '#121625'],
        pirate: ['#070707', '#0c0c0c', '#121212', '#2a2a2a', '#f2f2f2', '#f5f5f5', '#0b0b0b'],
        prism: ['#0b0b14', '#121221', '#1a1a2e', '#2b2b4a', '#6cffb5', '#f6f1ff', '#141426'],
        saffron: ['#251b11', '#332415', '#402e1b', '#64472b', '#f3ac60', '#fff1d9', '#1b150f'],
        spectrum: ['#0b0f1e', '#131a31', '#182140', '#2a3560', '#ff9f1c', '#f4f6ff', '#10162a'],
    };

    /** Map a known Studio palette to MiroTalk's CSS variables without accepting CSS from the network. */
    function colorsFor(theme) {
        const [bg, card, raised, border, accent, text, input] = palettes[theme] || palettes.mono;
        return {
            '--body-bg': bg,
            '--trx-bg': bg,
            '--msger-bg': card,
            '--left-msg-bg': raised,
            '--right-msg-bg': input,
            '--select-bg': input,
            '--select-focus-color': accent,
            '--tab-btn-active': raised,
            '--settings-bg': card,
            '--wb-bg': bg,
            '--btns-bg-color': card,
            '--dd-color': text,
            '--room-switch-accent': accent,
            '--room-switch-ink': bg,
        };
    }

    let current = null;
    let apply = null;
    let socket = null;
    let retry = null;
    let stopped = false;

    /** Apply the latest room theme again when MiroTalk refreshes its own appearance. */
    function applyCurrent() {
        if (current && apply) apply(colorsFor(current));
        return Boolean(current);
    }

    /** Subscribe by public slug; the backend sends an initial snapshot and subsequent updates. */
    function connect(slug, applyTheme) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) return;
        apply = applyTheme;
        const url = new URL(`/ws/rooms/${encodeURIComponent(slug)}/state/public`, window.location.origin);
        url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        const open = () => {
            if (stopped) return;
            socket = new WebSocket(url);
            socket.onmessage = (event) => {
                try {
                    const { theme } = JSON.parse(event.data);
                    if (typeof theme === 'string' && Object.hasOwn(palettes, theme) && current !== theme) {
                        current = theme;
                        applyCurrent();
                    }
                } catch (error) {
                    console.warn('Invalid room theme update', error);
                }
            };
            socket.onclose = () => {
                socket = null;
                if (!stopped) retry = setTimeout(open, 1500);
            };
            socket.onerror = () => socket.close();
        };
        open();
    }

    /** Stop reconnecting after the browser leaves the meeting page. */
    function stop() {
        stopped = true;
        clearTimeout(retry);
        socket?.close();
    }

    window.BodrikTheme = { connect, applyCurrent, stop };
    window.addEventListener('pagehide', stop);
})();
