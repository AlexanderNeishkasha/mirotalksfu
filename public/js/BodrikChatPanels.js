/** Use the touch-device panel layout for phones and tablets, independent of screen orientation. */
function isFullscreenChatDevice(client) {
    return Boolean(client.isMobileDevice || client.peer_info?.is_tablet_device || client.peer_info?.is_ipad_pro_device);
}

/** Reset the shared panel to chat-only view so reopening never inherits a hidden chat and hidden participant list. */
function resetChatPanelView(client) {
    client.getId('chatRoom').classList.toggle('chat-device-fullscreen', isFullscreenChatDevice(client));
    const chat = client.getId('chat');
    const plist = client.getId('plist');
    plist.classList.add('hidden');
    chat.style.marginLeft = 0;
    chat.style.borderLeft = 'none';
    elemDisplay(chat.id, true, 'flex');
    client.updateChatFooterVisibility();
}
