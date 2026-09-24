'use strict';

/** Return a bounded, single-line browser-provided value suitable for operational logs. */
function text(value, maxLength = 160) {
    return typeof value === 'string' ? value.replace(/[\x00-\x1f\x7f]/g, ' ').slice(0, maxLength) : undefined;
}

/** Keep optional hardware hints within plausible bounds; they are not measured RAM or CPU capacity. */
function hardwareHint(value, max) {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= max ? value : undefined;
}

/** Summarize an admitted peer without logging admission tokens, IPs, or browser profile secrets. */
function admittedPeer(roomId, peer, device, userAgent) {
    const info = peer || {};
    const hints = device || {};
    return {
        room_id: text(roomId, 128),
        room_slug_reported: text(hints.public_room_slug, 100),
        nickname: text(info.peer_name, 100),
        os: text(info.os_name, 60),
        os_version: text(info.os_version, 40),
        browser: text(info.browser_name, 60),
        browser_version: text(info.browser_version, 40),
        engine: text(hints.engine_name, 60),
        engine_version: text(hints.engine_version, 40),
        device_type: text(hints.device_type, 40),
        device_vendor: text(hints.device_vendor, 60),
        device_model: text(hints.device_model, 80),
        cpu_architecture: text(hints.cpu_architecture, 40),
        logical_cores_hint: hardwareHint(hints.logical_cores_hint, 256),
        ram_gb_hint: hardwareHint(hints.ram_gb_hint, 1024),
        user_agent: text(userAgent, 256),
    };
}

module.exports = { admittedPeer };
