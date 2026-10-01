'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

/** Exercise actual panel transitions with mobile DOM visibility and desktop pinning captured. */
function panels(mobile) {
    const node = (id, initial = []) => {
        const classes = new Set(initial);
        return {
            id,
            style: {},
            classList: {
                contains: (key) => classes.has(key),
                add: (key) => classes.add(key),
                remove: (key) => classes.delete(key),
                toggle: (key) => (classes.has(key) ? classes.delete(key) : classes.add(key)),
            },
        };
    };
    const nodes = { chatRoom: node('chatRoom'), plist: node('plist', ['hidden']), chat: node('chat') };
    const context = {
        window: { innerWidth: mobile ? 390 : 1262, innerHeight: 624 },
        isDesktopDevice: !mobile,
        isParticipantsListOpen: false,
        isChatPinEnabled: true,
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
    return { client, nodes };
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

for (const participants of [false, true]) {
    test(`desktop opening uses the standard pinned state, including short viewports; participants=${participants}`, async () => {
        const { client, nodes } = panels(false);
        if (participants) await client.toggleParticipants();
        else await client.toggleChat();
        assert.equal(client.isChatPinned, true);
        assert.equal(nodes.plist.classList.contains('hidden'), !participants);
    });
}
