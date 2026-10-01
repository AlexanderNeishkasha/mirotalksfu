(() => {
    // Match only known application messages, not arbitrary chat text or server errors.
    const templates = [
        '{value} copied to clipboard 👍',
        'Failed to create device: {error}',
        'Failed to load device: {error}',
        'The message seems too long, with a maximum of {count} characters allowed',
        'Kindly refrain from spamming. Please wait {count} seconds before sending another message',
        '💬 New message from: {name}',
        'The file {name} was sent successfully.',
        '{name} ⚠️ aborted file transfer',
        '{name} ⚠️ aborted the file transfer',
        '{name} wants to join the meeting',
        '{name} promoted you to presenter',
        '{name} removed your presenter role',
        '{name} is now a presenter',
        '{name} is no longer a presenter',
        '{name} disconnected',
        '{name}  {icon} has closed yours audio',
        '{name}  {icon} has closed yours video',
        '{name}  {icon} has closed yours screen share',
        '{name}  {icon} has raised the hand',
        'Breakout rooms launched! {count} participant(s) assigned',
        'Breakout sessions ending in {count} seconds...',
        'Breakout session closing in {count} seconds',
        'Returning to main room in {count} seconds',
        'Breakout session ends in {count} seconds',
        '🔴 Failed to request Wake Lock: {error}',
    ];
    const settings = [
        'Noise suppression',
        'Buttons always visible',
        'Chat auto pin',
        'Keyboard shortcuts',
        'Video mirror',
        'Audio pitch bar',
        'Sounds notification',
        'Push to talk',
        'Share room on join',
        'Only host recording',
        'Speech incoming messages',
        'Server sync recording',
        'Custom theme keep',
        'Moderator: everyone starts in privacy mode',
        'Moderator: everyone starts muted',
        'Moderator: everyone starts hidden',
        "Moderator: everyone can't unmute themselves",
        "Moderator: everyone can't unhide themselves",
        "Moderator: everyone can't share the screen",
        "Moderator: everyone can't chat privately",
        "Moderator: everyone can't chat publicly",
        "Moderator: everyone can't chat with ChatGPT",
        "Moderator: everyone can't chat with DeepSeek",
        'Moderator: disconnect all on leave room',
        'Moderator: everyone follows me',
        'BROADCASTING',
    ];
    templates.push(...settings.map((label) => `${label} {status}`));

    /** Compile anchored message templates once, retaining dynamic values verbatim. */
    function compile(key) {
        const fields = [];
        const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = escaped.replace(/\\\{(\w+)\\\}/g, (_, field) => {
            fields.push(field);
            return field === 'status' ? '(enabled|disabled|ON|OFF|On|Off)' : '([\\s\\S]*?)';
        });
        return { key, fields, regex: new RegExp(`^${pattern}$`) };
    }
    const rules = templates.map(compile);

    /** Translate known toast text, preserving names, error details and existing icon markup. */
    function translate(message) {
        if (typeof message !== 'string' || !window.i18n?.isNative()) return message;
        const t = (key) => window.i18n.t(key, 'toasts');
        // Incoming chat content is not application copy, even if it ends like a known template.
        if (/^<b>[\s\S]*?<\/b>:\s/.test(message)) return message;
        const exact = t(message);
        if (exact !== message) return exact;
        const icon = message.match(/^(<i\b[^>]*>[\s\S]*?<\/i>)\s+([\s\S]+)$/);
        const prefix = icon ? `${icon[1]} ` : '';
        const body = icon ? icon[2] : message;
        const bodyTranslation = t(body);
        if (bodyTranslation !== body) return prefix + bodyTranslation;
        for (const { key, fields, regex } of rules) {
            const match = body.match(regex);
            if (!match) continue;
            const translated = t(key);
            if (translated === key) return message;
            const values = Object.fromEntries(
                fields.map((field, index) => [field, field === 'status' ? t(match[index + 1]) : match[index + 1]])
            );
            return prefix + translated.replace(/\{(\w+)\}/g, (_, field) => values[field]);
        }
        return message;
    }
    /** Render either text or HTML notifications with shared localization and caller-supplied options. */
    function show(icon, message, position, timer) {
        const Toast = Swal.mixin({
            background: swalBackground,
            toast: true,
            position,
            showConfirmButton: false,
            timer,
            timerProgressBar: true,
        });
        Toast.fire({
            icon,
            ...(icon === 'html' ? { html: translate(message) } : { title: translate(message) }),
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        });
    }
    window.BodrikToast = { translate, show };
})();

/** Show a localized notification with the caller's icon, position, and timeout. */
function userLog(icon, message, position = 'top-end', timer = 3000) {
    return window.BodrikToast.show(icon, message, position, timer);
}
