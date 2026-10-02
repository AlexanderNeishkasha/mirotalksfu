'use strict';
const should = require('should');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const proxyquire = require('proxyquire').noCallThru();

const host = 'meet.example.test';
const secret = 'test-api-secret';
const config = {
    api: { keySecret: secret },
    security: { jwt: { key: 'test-jwt-secret-with-enough-entropy', exp: '1h' } },
};
const ServerApi = proxyquire('../app/src/ServerApi', { './config': config });

/** Decode retained room-bound token fields for contract assertions. */
function decodeJoinToken(url) {
    const token = new URL(url).searchParams.get('token');
    const envelope = jwt.verify(token, config.security.jwt.key);
    return JSON.parse(CryptoJS.AES.decrypt(envelope.data, config.security.jwt.key).toString(CryptoJS.enc.Utf8));
}

describe('ServerApi retained Bodrik endpoints', () => {
    it('authorizes only an exact configured API secret', () => {
        new ServerApi(host, secret).isAuthorized().should.equal(true);
        new ServerApi(host, 'wrong').isAuthorized().should.equal(false);
        new ServerApi(host).isAuthorized().should.equal(false);
    });

    it('creates a room-bound join URL with encoded participant fields', () => {
        const api = new ServerApi(host, secret);
        const join = api.getJoinURL({
            room: 'private-room',
            name: 'Игрок & GM',
            avatar: '/avatar.png',
            audio: true,
            video: false,
            token: { username: 'host', password: 'password', presenter: true, room: 'private-room' },
        });
        const url = new URL(join);
        url.origin.should.equal(`https://${host}`);
        url.pathname.should.equal('/join');
        url.searchParams.get('room').should.equal('private-room');
        url.searchParams.get('name').should.equal('Игрок & GM');
        decodeJoinToken(join).should.containDeep({
            username: 'host',
            password: 'password',
            presenter: 'true',
            room: 'private-room',
        });
    });

    it('does not invent a provider room when the authoritative room is missing', () => {
        const join = new ServerApi(host, secret).getJoinURL({ name: 'Guest' });
        should(join).equal(null);
    });

    it('terminates a retained room and closes every peer', () => {
        const removed = [];
        const sent = [];
        const room = {
            sendToAll: (event, data) => sent.push({ event, data }),
            getPeers: () =>
                new Map([
                    ['one', {}],
                    ['two', {}],
                ]),
            removePeer: (id) => removed.push(id),
        };
        const rooms = new Map([['private-room', room]]);
        const result = new ServerApi(host, secret).endMeeting(rooms, 'private-room', 'https://bodrik.fm/bye');
        result.should.containDeep({ success: true, room: 'private-room' });
        removed.should.deepEqual(['one', 'two']);
        rooms.has('private-room').should.equal(false);
        sent[0].should.containDeep({ event: 'cmd', data: { type: 'ejectAll', redirect: 'https://bodrik.fm/bye' } });
    });

    it('reports idempotent termination of an absent room', () => {
        new ServerApi(host, secret).endMeeting(new Map(), 'missing').should.containDeep({
            success: false,
            error: 'Room not found',
        });
    });
});
