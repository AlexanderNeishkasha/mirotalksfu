(() => {
    /** Close visible settings via the existing button, leaving nested dialogs in control of Escape. */
    function closeSettingsOnEscape(event) {
        if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
        const settings = document.getElementById('mySettings');
        if (!settings || !settings.classList.contains('show') || window.Swal?.isVisible()) return;
        document.getElementById('mySettingsCloseBtn').click();
    }

    document.addEventListener('keydown', closeSettingsOnEscape);
    window.addEventListener('pagehide', () => document.removeEventListener('keydown', closeSettingsOnEscape), {
        once: true,
    });
})();
