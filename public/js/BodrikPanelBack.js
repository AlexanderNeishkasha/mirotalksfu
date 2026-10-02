(() => {
    'use strict';

    const marker = 'bodrikPanelBack';
    let started = false;
    let enabled = false;
    let observer;
    let stack = [];
    let consuming = false;

    /** Derive visible panels from the same classes used by their existing close buttons. */
    function visiblePanels() {
        const shown = (id) => document.getElementById(id)?.classList.contains('show');
        const chat = shown('chatRoom');
        return [
            ...(chat ? ['chat'] : []),
            ...(chat && !document.getElementById('plist')?.classList.contains('hidden') ? ['participants'] : []),
            ...(shown('mySettings') ? ['settings'] : []),
        ];
    }

    /** Track opening order without storing a duplicate of each panel's UI state. */
    function refreshStack() {
        const visible = visiblePanels();
        stack = stack.filter((panel) => visible.includes(panel));
        for (const panel of visible) if (!stack.includes(panel)) stack.push(panel);
    }

    /** Add at most one disposable panel entry above the existing session-exit guard. */
    function arm() {
        if (!enabled || consuming || !stack.length || history.state?.[marker]) return;
        history.pushState({ ...history.state, [marker]: true }, '', location.href);
    }

    /** Consume the disposable entry after a normal close without invoking the exit confirmation. */
    function sync() {
        refreshStack();
        if (consuming) return;
        if (enabled && stack.length) arm();
        else if (history.state?.[marker]) {
            consuming = true;
            history.back();
        }
    }

    /** Install mobile/tablet observation once; reconnect must not add another session guard. */
    function start(mobile) {
        if (!started) {
            started = true;
            history.pushState({ sessionActive: true }, '', location.href);
        }
        enabled = mobile === true;
        if (!enabled || observer) return;
        observer = new MutationObserver(sync);
        for (const id of ['mySettings', 'chatRoom', 'plist']) {
            const panel = document.getElementById(id);
            if (panel) observer.observe(panel, { attributes: true, attributeFilter: ['class'] });
        }
        sync();
    }

    /** Close the top panel via its normal handler; return true when the session-exit guard must not run. */
    function handleBack() {
        if (consuming) {
            consuming = false;
            refreshStack();
            arm();
            return true;
        }
        if (!enabled) return false;
        refreshStack();
        const panel = stack.pop();
        if (!panel) return false;
        const button = document.getElementById(
            {
                settings: 'mySettingsCloseBtn',
                participants: 'chatHideParticipantsList',
                chat: 'chatCloseButton',
            }[panel]
        );
        if (!button) return false;
        button.click();
        refreshStack();
        arm();
        return true;
    }

    /** Stop observing on deliberate leave and dispose the panel entry, keeping pending traversal recognizable. */
    function stop() {
        enabled = false;
        observer?.disconnect();
        observer = null;
        stack = [];
        sync();
    }

    window.addEventListener(
        'pagehide',
        () => {
            observer?.disconnect();
            enabled = false;
        },
        { once: true }
    );
    window.BodrikPanelBack = { start, stop, handleBack };
})();
