'use strict';

const SECRET_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Keep a validated per-tab proof on a peer without including it in serialized room state. */
function bindRejoinSecret(peer, secret) {
    if (typeof secret !== 'string' || !SECRET_PATTERN.test(secret)) return false;
    Object.defineProperty(peer, 'bodrikRejoinSecret', { value: secret });
    return true;
}

/** Find disconnected peers with the same private room-bound tab proof. */
function findDisconnectedRejoinPeers(room, sockets, secret, currentId) {
    if (typeof secret !== 'string' || !SECRET_PATTERN.test(secret)) return [];
    return [...room.getPeers().values()].filter(
        (peer) => peer.id !== currentId && peer.bodrikRejoinSecret === secret && !sockets.has(peer.id)
    );
}

module.exports = { bindRejoinSecret, findDisconnectedRejoinPeers };
