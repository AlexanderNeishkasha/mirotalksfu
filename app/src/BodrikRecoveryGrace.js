'use strict';

/** Keep one cleanup deadline per disconnected Socket.IO session. */
function createRecoveryGrace(io, roomList, log, delayMs = 120000, clock = { setTimeout, clearTimeout, now: Date.now }) {
    const pending = new Map();

    /** Cancel an obsolete deadline when the same session reconnects or exits. */
    function cancel(socketId) {
        const entry = pending.get(socketId);
        if (!entry) return;
        clock.clearTimeout(entry.timer);
        pending.delete(socketId);
    }

    /** Retain the disconnected peer until expiry unless its session recovers. */
    function defer(socket, cleanup) {
        cancel(socket.id);
        const roomId = socket.room_id;
        const peer = roomId && roomList.get(roomId)?.getPeer(socket.id);
        const disconnectedAt = clock.now();
        const entry = {};
        entry.timer = clock.setTimeout(() => {
            if (pending.get(socket.id) !== entry) return;
            pending.delete(socket.id);
            const active = io.sockets.sockets.get(socket.id);
            const currentPeer = roomId && roomList.get(roomId)?.getPeer(socket.id);
            log.info('[Recovery] grace expired', {
                socket_id: socket.id,
                room_id: roomId || null,
                elapsed_ms: clock.now() - disconnectedAt,
                recovered: Boolean(active?.connected && active.recovered),
                peer_present: Boolean(currentPeer),
            });
            if (active?.connected && active.recovered) {
                log.info('[Reconnect] - kept recovered peer', { socket_id: socket.id });
                return;
            }
            // A fresh admission can replace the peer even under the same socket ID.
            if (currentPeer !== peer) return;
            cleanup();
        }, delayMs);
        pending.set(socket.id, entry);
    }

    return { cancel, defer };
}

module.exports = { createRecoveryGrace };
