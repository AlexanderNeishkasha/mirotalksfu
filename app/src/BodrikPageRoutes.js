'use strict';
const { isValidRoomName } = require('./Validator');

/** Register Bodrik invitation entry points without standalone room creation or login pages. */
function registerPageRoutes(app, options) {
    const {
        inviteBaseUrl,
        byeUrl,
        renderRoom,
        isValidToken,
        decodeToken,
        isAuthPeer,
        isRoomAllowedForUser,
        hostCfg,
        authorizeHost,
    } = options;

    /** Public invitation slugs occupy exactly one path segment, unlike generic legacy room names. */
    function validSlug(slug) {
        return isValidRoomName(slug) && !/[\\/\\\\]/.test(slug);
    }

    /** Redirect a public slug to the backend-owned invitation exchange. */
    function invite(slug, res) {
        if (!inviteBaseUrl || !validSlug(slug)) return res.status(404).send('Not found');
        res.set('Cache-Control', 'no-store');
        return res.redirect(307, `${inviteBaseUrl.replace(/\/$/, '')}/${encodeURIComponent(slug)}`);
    }

    /** Recover only a same-host canonical invitation carried by an expired join URL. */
    function retryInvitation(req, res) {
        try {
            const url = new URL(req.query.invite);
            const slug = decodeURIComponent(url.pathname.slice('/join/'.length));
            if (
                url.protocol === 'https:' &&
                url.host === req.get('host') &&
                url.pathname.startsWith('/join/') &&
                validSlug(slug)
            ) {
                res.set('Cache-Control', 'no-store');
                res.redirect(307, `/join/${encodeURIComponent(slug)}`);
                return true;
            }
        } catch {
            // An absent/malformed invitation must not bypass token admission.
        }
        return false;
    }

    app.get('/join/', async (req, res) => {
        const { room, token } = req.query;
        res.set('Cache-Control', 'no-store');
        if (!isValidRoomName(room) || typeof token !== 'string' || !token) {
            return res.status(401).json({ message: 'Room-bound admission token required' });
        }
        try {
            if (!(await isValidToken(token))) {
                if (retryInvitation(req, res)) return;
                return res.status(401).json({ message: 'Invalid Token' });
            }
            const { username, password, presenter, room: tokenRoom } = decodeToken(token);
            if (tokenRoom !== room) return res.status(401).json({ message: 'Token room mismatch' });
            if (!(await isAuthPeer(username, password))) return res.status(403).json({ message: 'Unauthorized' });
            const isPresenter = presenter === '1' || presenter === 'true';
            if (
                isPresenter &&
                !hostCfg.users_from_db &&
                !(await isRoomAllowedForUser('Direct Join with token', username, room))
            ) {
                return res.status(403).json({ message: 'Room not allowed' });
            }
            if (hostCfg.protected && isPresenter && !hostCfg.authenticated) authorizeHost(req);
        } catch {
            // Never include admission tokens or credential payloads in errors/logs.
            return res.status(401).json({ message: 'Invalid Token' });
        }
        return renderRoom(res);
    });
    app.get('/join/:roomId', (req, res) => invite(req.params.roomId, res));
    app.get('/room/:slug', (req, res) => invite(req.params.slug, res));
    for (const route of [
        '/',
        '/newroom',
        '/activeRooms',
        '/customizeRoom',
        '/login',
        '/logged',
        '/logout',
        '/whoAreYou/:roomId',
        '/iframe',
        '/views/landing.html',
        '/views/newroom.html',
        '/views/activeRooms.html',
        '/views/customizeRoom.html',
        '/views/login.html',
        '/views/whoAreYou.html',
        '/views/iframe.html',
    ]) {
        app.get(route, (_req, res) => {
            if (byeUrl) return res.redirect(302, byeUrl);
            return res.status(410).send('Standalone meeting pages are retired');
        });
    }
}

module.exports = { registerPageRoutes };
