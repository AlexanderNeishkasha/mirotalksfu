'use strict';

const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

const config = require('./config');

const JWT_KEY = config.security?.jwt?.key || 'mirotalksfu_jwt_secret';
const JWT_EXP = config.security?.jwt?.exp || '1h';

module.exports = class ServerApi {
    constructor(host = null, authorization = null) {
        this._host = host;
        this._authorization = authorization;
        this._api_key_secret = config.api.keySecret;
    }

    isAuthorized() {
        if (!this._api_key_secret || typeof this._api_key_secret !== 'string') return false;
        if (!this._authorization || typeof this._authorization !== 'string') return false;
        if (this._authorization !== this._api_key_secret) return false;
        return true;
    }

    endMeeting(roomList, room, redirect = '') {
        if (!roomList.has(room)) {
            return { success: false, error: 'Room not found' };
        }

        const roomObj = roomList.get(room);

        // Notify all peers to exit (clients handle 'ejectAll' by redirecting)
        roomObj.sendToAll('cmd', {
            type: 'ejectAll',
            peer_name: 'API',
            broadcast: true,
            redirect: redirect || '',
        });

        // Remove all peers and close transports
        const peers = roomObj.getPeers();
        for (const [peerId] of peers) {
            roomObj.removePeer(peerId);
        }

        // Delete room from the active list
        roomList.delete(room);

        return { success: true, message: 'Meeting ended', room: room };
    }

    getJoinURL(data) {
        // Get data
        const { room, roomPassword, name, avatar, audio, video, screen, chat, hide, notify, duration, token } = data;

        if (typeof room !== 'string' || !room.trim()) return null;
        const roomValue = room;
        const roomPasswordValue = roomPassword || false;
        const nameValue = name || 'User-' + this.getRandomNumber();
        const avatarValue = avatar || false;
        const audioValue = audio || false;
        const videoValue = video || false;
        const screenValue = screen || false;
        const chatValue = chat || false;
        const hideValue = hide || false;
        const notifyValue = notify || false;
        const durationValue = duration || 'unlimited';
        const jwtToken = token ? '&token=' + this.getToken(token) : '';

        const joinURL =
            'https://' +
            this._host +
            '/join?' +
            `room=${roomValue}` +
            `&roomPassword=${roomPasswordValue}` +
            `&name=${encodeURIComponent(nameValue)}` +
            `&avatar=${encodeURIComponent(avatarValue)}` +
            `&audio=${audioValue}` +
            `&video=${videoValue}` +
            `&screen=${screenValue}` +
            `&chat=${chatValue}` +
            `&hide=${hideValue}` +
            `&notify=${notifyValue}` +
            `&duration=${durationValue}` +
            jwtToken;

        return joinURL;
    }

    getToken(token) {
        if (!token) return '';

        const { username = 'username', password = 'password', presenter = false, expire, room = '' } = token;

        const expireValue = expire || JWT_EXP;

        // Constructing payload
        const payload = {
            username: String(username),
            password: String(password),
            presenter: String(presenter),
            room: String(room),
        };

        // Encrypt payload using AES encryption
        const payloadString = JSON.stringify(payload);
        const encryptedPayload = CryptoJS.AES.encrypt(payloadString, JWT_KEY).toString();

        // Constructing JWT token
        const jwtToken = jwt.sign({ data: encryptedPayload }, JWT_KEY, { expiresIn: expireValue });

        return jwtToken;
    }

    getRandomNumber() {
        return Math.floor(Math.random() * 999999);
    }
};
