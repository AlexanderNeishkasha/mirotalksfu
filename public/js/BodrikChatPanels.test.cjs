'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

/** Exercise actual panel transitions with mobile DOM visibility and desktop pinning captured. */
function panels(mobile, tablet = false) {
    const node = (id, initial = []) => {
        const classes = new Set(initial);
        return {
            id,
            style: {},
            classList: {
                contains: (key) => classes.has(key),
                add: (key) => classes.add(key),
                remove: (key) => classes.delete(key),
                toggle: (key, force) => {
                    if (force === true) return classes.add(key);
                    if (force === false) return classes.delete(key);
                    return classes.has(key) ? classes.delete(key) : classes.add(key);
                },
            },
        };
    };
    const nodes = { chatRoom: node('chatRoom'), plist: node('plist', ['hidden']), chat: node('chat') };
    const context = {
        window: { innerWidth: mobile ? 390 : 1262, innerHeight: 624 },
        isDesktopDevice: !mobile && !tablet,
        isParticipantsListOpen: false,
        BUTTONS: { main: { chatButton: true }, chat: { chatMaxButton: true } },
        chatMinButton: {},
        chatMaxButton: {},
        getRoomParticipants: async () => {},
        hide() {},
        show() {},
        resizeChatRoom() {},
        elemDisplay: (id, visible, display = 'block') => {
            nodes[id].style.display = visible ? display : 'none';
        },
    };
    for (const file of ['BodrikChatPanels.js', 'RoomClient.js'])
        vm.runInNewContext(readFileSync(join(__dirname, file), 'utf8'), context);
    vm.runInNewContext('globalThis.Client = RoomClient', context);
    const client = Object.create(context.Client.prototype);
    Object.assign(client, {
        isMobileDevice: mobile,
        peer_info: { is_tablet_device: tablet },
        isChatOpen: false,
        isParticipantsOpen: false,
        isChatPinned: false,
        getId: (id) => nodes[id],
        chatCenter() {},
        sound() {},
        showPeerAboutAndMessages() {},
        syncChatToolbarButtons() {},
        updateUnreadCountBadge() {},
        updateChatFooterVisibility() {},
        toggleChatHistorySize() {},
        chatPin() {
            this.isChatPinned = true;
            nodes.plist.classList.add('hidden');
        },
        chatUnpin() {
            this.isChatPinned = false;
        },
    });
    return { client, nodes, context };
}

test('Android sequence participants → close → chat → close → participants restores a visible list', async () => {
    const { client, nodes } = panels(true);
    await client.toggleParticipants();
    assert.equal(nodes.plist.classList.contains('hidden'), false);
    client.toggleShowParticipants(true);
    assert.equal(client.isChatOpen, false);
    await client.toggleChat();
    assert.equal(nodes.chat.style.display, 'flex');
    assert.equal(nodes.plist.classList.contains('hidden'), true);
    await client.toggleChat();
    await client.toggleParticipants();
    assert.equal(client.isChatOpen, true);
    assert.equal(nodes.chatRoom.classList.contains('show'), true);
    assert.equal(nodes.plist.classList.contains('hidden'), false);
    client.toggleShowParticipants(true);
    assert.equal(client.isChatOpen, false);
});

for (const [orientation, width, height] of [
    ['portrait', 800, 1280],
    ['landscape', 1280, 800],
]) {
    test(`tablet panels are fullscreen rather than pinned in ${orientation}`, async () => {
        const { client, nodes, context } = panels(false, true);
        context.window.innerWidth = width;
        context.window.innerHeight = height;
        await client.toggleChat();
        assert.equal(client.isChatPinned, false);
        assert.equal(nodes.chatRoom.classList.contains('chat-device-fullscreen'), true);
        await client.toggleChat();
        await client.toggleParticipants();
        assert.equal(nodes.plist.style.width, '100%');
        assert.equal(nodes.chat.style.display, 'none');
        assert.equal(nodes.plist.classList.contains('hidden'), false);
        client.toggleShowParticipants(true);
        assert.equal(client.isChatOpen, false);
    });
}

for (const participants of [false, true]) {
    test(`desktop opening uses the standard pinned state, including short viewports; participants=${participants}`, async () => {
        const { client, nodes } = panels(false);
        if (participants) await client.toggleParticipants();
        else await client.toggleChat();
        assert.equal(client.isChatPinned, true);
        assert.equal(nodes.plist.classList.contains('hidden'), !participants);
    });
}
