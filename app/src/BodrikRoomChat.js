'use strict';
const checkXSS = require('./XSS');
const { isValidData } = require('./Validator');

/** Match the browser's displayed text budget and bound every server-relayed identifier. */
const CHAT_LIMITS = Object.freeze({ message: 4000, name: 64, id: 160, emoji: 16 });

/** Require a trimmed string within its event-specific relay budget. */
function bounded(value, limit) {
    return typeof value === 'string' && value.trim().length > 0 && value.length <= limit;
}

/** Determine room admission from server-owned peer state, not client-supplied message metadata. */
function admitted(peer) {
    return Boolean(peer && !peer.closed && peer.peer_lobby !== true);
}

/** Deliver only to admitted members of this room; lobby and cross-room sockets receive no chat. */
function relay(room, event, data, excludedId, targetId = null) {
    for (const [id, peer] of room.peers) {
        if (id !== excludedId && admitted(peer) && (!targetId || id === targetId)) room.send(id, event, data);
    }
}

/** Register the single Socket.IO delivery path for public/private text and message reactions. */
function registerRoomChat(socket, roomList, log) {
    let recentEvents = [];
    /** Admit a bounded signaling burst so one participant cannot monopolize the room socket. */
    function withinRateLimit() {
        const now = Date.now();
        recentEvents = recentEvents.filter((at) => at > now - 10_000);
        if (recentEvents.length >= 60) return false;
        recentEvents.push(now);
        return true;
    }

    /** Resolve the current room/peer every time, including after room changes and reconnects. */
    function membership() {
        const room = roomList.get(socket.room_id);
        const peer = room?.getPeer(socket.id);
        return room && admitted(peer) ? { room, peer } : null;
    }

    socket.on('message', (input) => {
        const member = membership();
        if (!member || !withinRateLimit()) return;
        const data = checkXSS(input);
        if (
            !isValidData(data) ||
            !bounded(data.peer_msg, CHAT_LIMITS.message) ||
            !bounded(data.to_peer_id, CHAT_LIMITS.id) ||
            !bounded(data.peer_name, CHAT_LIMITS.name) ||
            (data.msg_id !== undefined && !bounded(data.msg_id, CHAT_LIMITS.id))
        )
            return;
        const { room, peer } = member;
        if (data.peer_name !== peer.peer_name) {
            log.warn('Rejected chat sender identity', { room_id: room.id, socket_id: socket.id });
            return;
        }
        const publicMessage = data.to_peer_id === 'all';
        if (publicMessage ? room._moderator?.chat_cant_publicly : room._moderator?.chat_cant_privately) return;
        data.peer_id = socket.id;
        data.room_id = room.id;
        publicMessage ? relay(room, 'message', data, socket.id) : relay(room, 'message', data, null, data.to_peer_id);
    });

    socket.on('chatReaction', (input) => {
        const member = membership();
        if (!member || !withinRateLimit()) return;
        const data = checkXSS(input);
        if (
            !isValidData(data) ||
            !bounded(data.msg_id, CHAT_LIMITS.id) ||
            !bounded(data.emoji, CHAT_LIMITS.emoji) ||
            !['add', 'remove'].includes(data.action)
        )
            return;
        const { room, peer } = member;
        relay(
            room,
            'chatReaction',
            {
                msg_id: data.msg_id,
                emoji: data.emoji,
                action: data.action,
                peer_name: peer.peer_name,
                peer_id: socket.id,
            },
            socket.id
        );
    });
}

module.exports = { registerRoomChat };
