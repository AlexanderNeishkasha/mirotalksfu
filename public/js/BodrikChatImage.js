/* global window, document, URL, fetch */
'use strict';

/** Stage one clipboard image for preview, then upload it only when the user sends. */
window.BodrikChatImage = (() => {
    let pending = null;
    let previewUrl = null;
    const allowed = new Set(['image/png', 'image/jpeg', 'image/webp']);
    const messageInput = document.getElementById('chatMessage');
    const defaultPlaceholder = messageInput.placeholder;

    /** Discard the staged image and release its preview URL. */
    function clear() {
        pending = null;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = null;
        document.getElementById('bodrikChatImagePreview').replaceChildren();
        document.getElementById('chat').classList.remove('bodrik-image-pending');
        messageInput.placeholder = defaultPlaceholder;
    }

    /** Preview a supported clipboard image without uploading until Send is pressed. */
    function attach(file) {
        if (!allowed.has(file.type) || file.size < 12 || file.size > 5 * 1024 * 1024) {
            window.userLog?.('warning', 'Поддерживаются PNG, JPEG и WebP до 5 МБ.', 'top-end');
            return;
        }
        clear();
        pending = file;
        previewUrl = URL.createObjectURL(file);
        const container = document.getElementById('bodrikChatImagePreview');
        const image = document.createElement('img');
        image.src = previewUrl;
        image.alt = 'Картинка для отправки';
        image.style.cssText = 'max-width:128px;max-height:96px;object-fit:contain;border-radius:8px';
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = '✕';
        remove.setAttribute('aria-label', 'Убрать картинку');
        remove.onclick = clear;
        container.replaceChildren(image, remove);
        document.getElementById('chat').classList.add('bodrik-image-pending');
        messageInput.placeholder = 'Подпись к картинке…';
    }

    /** Extract an image from a clipboard paste inside the chat, including Firefox file lists. */
    function paste(event) {
        const clipboard = event.clipboardData;
        const item = [...(clipboard?.items || [])].find(
            (entry) => entry.kind === 'file' && entry.type.startsWith('image/')
        );
        const image = item?.getAsFile() || [...(clipboard?.files || [])].find((file) => file.type.startsWith('image/'));
        if (!image) return false;
        event.preventDefault();
        attach(image);
        return true;
    }

    /** Recognize only uploaded meeting images; keep the optional caption as plain text. */
    function parseMessage(message) {
        if (typeof message !== 'string') return null;
        const [url, ...caption] = message.split('\n');
        const prefix = `${window.location.origin}/uploads/chat/`;
        if (!url.startsWith(prefix) || !/^[0-9a-f-]+\.(png|jpg|webp)$/.test(url.slice(prefix.length))) return null;
        return { url, caption: caption.join('\n') };
    }

    /** Upload a staged image using the participant's current meeting admission. */
    async function upload(file, token) {
        if (!token) throw new Error('Meeting token unavailable');
        const response = await fetch('/api/bodrik/chat-image', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': file.type },
            body: file,
        });
        if (!response.ok) throw new Error(`Image upload rejected (${response.status})`);
        const { url } = await response.json();
        if (!/^\/uploads\/chat\/[0-9a-f-]+\.(png|jpg|webp)$/.test(url)) throw new Error('Invalid upload URL');
        return new URL(url, window.location.origin).href;
    }

    /** Wire the inline image picker beside the existing file-transfer button. */
    function init() {
        const picker = document.getElementById('bodrikChatImageInput');
        document.getElementById('bodrikChatImageButton').onclick = () => picker.click();
        picker.onchange = () => {
            if (picker.files?.[0]) attach(picker.files[0]);
            picker.value = '';
        };
    }

    init();
    return {
        attach,
        clear,
        paste,
        parseMessage,
        upload,
        get pending() {
            return pending;
        },
    };
})();
