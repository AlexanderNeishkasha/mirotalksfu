'use strict';

/** Manages the browser-local pre-join profile and authenticated avatar upload. */
window.BodrikProfile = {
    init({ token, avatar, onAvatar }) {
        const preview = document.getElementById('bodrikProfileAvatar');
        const button = document.getElementById('bodrikProfileAvatarButton');
        const input = document.getElementById('bodrikProfileAvatarInput');
        if (!preview || !button || !input) return;

        if (avatar) preview.src = avatar;
        button.onclick = () => input.click();
        input.onchange = async () => {
            const file = input.files?.[0];
            input.value = '';
            if (!file || !file.type.startsWith('image/')) return;
            button.disabled = true;
            try {
                const avatarUrl = await this.uploadFile(file, token);
                preview.src = avatarUrl;
                onAvatar(avatarUrl);
            } catch (error) {
                console.error('Avatar upload failed', error);
                window.userLog?.('error', 'Не удалось загрузить аватар');
            } finally {
                button.disabled = false;
            }
        };
    },

    async uploadFile(file, token) {
        const image = await this.normalize(file);
        const response = await fetch('/api/bodrik/avatar', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': image.type },
            body: image,
        });
        if (!response.ok) throw new Error(`Upload failed (${response.status})`);
        const { url } = await response.json();
        return new URL(url, window.location.origin).href;
    },

    async normalize(file) {
        const bitmap = await createImageBitmap(file);
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        const sourceSize = Math.min(bitmap.width, bitmap.height);
        context.drawImage(
            bitmap,
            (bitmap.width - sourceSize) / 2,
            (bitmap.height - sourceSize) / 2,
            sourceSize,
            sourceSize,
            0,
            0,
            size,
            size
        );
        bitmap.close();
        return new Promise((resolve, reject) =>
            canvas.toBlob(
                (blob) => (blob ? resolve(blob) : reject(new Error('Image conversion failed'))),
                'image/webp',
                0.82
            )
        );
    },
};
