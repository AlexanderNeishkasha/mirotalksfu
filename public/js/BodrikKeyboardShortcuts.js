(() => {
    /** Keep displayed English shortcuts bound to physical key positions across keyboard layouts. */
    const actions = Object.freeze({
        KeyA: 'audio',
        KeyV: 'video',
        KeyS: 'screen',
        KeyH: 'hand',
        KeyC: 'chat',
        KeyO: 'settings',
        KeyR: 'recording',
        KeyF: 'file',
    });

    /** Ignore text entry, rich editors and events retargeted through editable descendants. */
    function isEditable(event) {
        const path = typeof event.composedPath === 'function' ? event.composedPath() : [event.target];
        return path.some((element) => {
            if (!element || element.nodeType !== 1) return false;
            if (element.isContentEditable) return true;
            const tag = element.tagName?.toLowerCase();
            return (
                ['input', 'textarea', 'select'].includes(tag) ||
                element.matches?.('[contenteditable]:not([contenteditable="false"]), [role="textbox"], .CodeMirror')
            );
        });
    }

    /** Resolve an enabled, unmodified, nonrepeated physical key event to a room action. */
    function action(event, enabled) {
        if (
            !enabled ||
            event.defaultPrevented ||
            event.repeat ||
            event.ctrlKey ||
            event.altKey ||
            event.metaKey ||
            event.isComposing ||
            isEditable(event)
        )
            return null;
        return actions[event.code] || null;
    }

    window.BodrikKeyboardShortcuts = { actions, isEditable, action };
})();
