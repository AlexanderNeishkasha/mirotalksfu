/** Match legacy name-based presenters only for peers without validated room-bound admission tokens. */
function isNamedPresenter(peer, names) {
    return Boolean(peer && !peer.bodrikTokenAuthenticated && names?.includes(peer.peer_info?.peer_name));
}

module.exports = { isNamedPresenter };
