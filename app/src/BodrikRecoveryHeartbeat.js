/** Keep Socket.IO's recovery offset fresh even while all media travels outside signaling. */
function startRecoveryHeartbeat(io, { intervalMs = 30000, schedule = setInterval, cancel = clearInterval } = {}) {
    const timer = schedule(() => {
        if (io.of('/').sockets.size > 0) io.emit('bodrikRecoveryTick');
    }, intervalMs);
    timer.unref?.();
    return () => cancel(timer);
}

module.exports = { startRecoveryHeartbeat };
