/** Reset the shared panel to chat-only view so reopening never inherits a hidden chat and hidden participant list. */
function resetChatPanelView(client) {
    const chat = client.getId('chat');
    const plist = client.getId('plist');
    plist.classList.add('hidden');
    chat.style.marginLeft = 0;
    chat.style.borderLeft = 'none';
    elemDisplay(chat.id, true, 'flex');
    client.updateChatFooterVisibility();
}
