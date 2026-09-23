(function (root) {
    'use strict';

    /** Rejoin an unrecoverable signaling session without navigating or reopening the pre-join form. */
    async function rejoin(client) {
        const socket = client.socket;
        const socketId = socket.id;
        if (!socket.connected || !socketId) throw new Error('Signaling is disconnected');

        const audioId = client.producerLabel.get('audioType');
        const audioProducer = client.producers.get(audioId);
        const wasMuted = !client.peer_info.peer_audio || Boolean(audioProducer?.paused);
        const hadVideo = client.producerLabel.has('videoType') || Boolean(client.isVideoAllowed && client.peer_info.peer_video);
        client.rejoiningMuted = wasMuted;

        client.stopConsumerReconcile();
        client.consumerTransport?.close();
        client.producerTransport?.close();
        client.consumerTransport = null;
        client.producerTransport = null;
        client.device = null;
        client.producers.clear();
        client.producerLabel.clear();
        client.consumers.clear();
        client.consumersProducer.clear();
        client.consumingProducers.clear();
        client.resumedConsumers.clear();
        client.chatDataConsumers.clear();
        client.chatDataProducer = null;
        client.audioConsumers.clear();
        client.videoMediaContainer.replaceChildren();
        client.videoPinMediaContainer.replaceChildren();
        client.localAudioEl.replaceChildren();
        client.remoteAudioEl.replaceChildren();

        client.peer_id = socketId;
        client.peer_info.peer_id = socketId;
        client.peer_info.peer_audio = !wasMuted;
        client.isVideoAllowed = hadVideo;
        client.peer_info.peer_video = hadVideo;
        // Browsers cannot silently renew getDisplayMedia permission after a transport loss.
        client.joinRoomWithScreen = false;
        client.peer_info.peer_screen = false;

        try {
            await socket.request('createRoom', { room_id: client.room_id });
        } catch (error) {
            if (error !== 'already exists') throw error;
        }
        if (!socket.connected || socket.id !== socketId) throw new Error('Signaling changed during rejoin');
        const room = await socket.request('join', {
            room_id: client.room_id,
            peer_info: client.peer_info,
            rejoin_secret: client.getRejoinSecret(),
        });
        if (!socket.connected || socket.id !== socketId) throw new Error('Signaling changed during rejoin');
        if (!room || typeof room !== 'object' || typeof room.peers !== 'string') {
            throw new Error('Meeting re-admission was rejected');
        }

        client.rejoining = true;
        try {
            await client.joinAllowed(room);
            if (typeof getRoomParticipants === 'function' && isParticipantsListOpen) await getRoomParticipants();
        } finally {
            client.rejoining = false;
            client.rejoiningMuted = false;
        }
    }

    root.BodrikNetworkRecovery = { rejoin };
})(window);
