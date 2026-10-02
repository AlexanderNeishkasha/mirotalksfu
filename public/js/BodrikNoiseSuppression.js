(() => {
    'use strict';

    const modes = Object.freeze({ off: 'off', browser: 'browser', rnnoise: 'rnnoise' });
    const ownScript = document.currentScript?.src || '';
    const version = (() => {
        try {
            return new URL(ownScript, window.location.href).searchParams.get('v');
        } catch {
            return null;
        }
    })();
    let loading;

    /** Normalize persisted/untrusted values to the no-processing default. */
    function normalize(value) {
        return Object.values(modes).includes(value) ? value : modes.off;
    }

    /** Use browser processing only in browser mode; RNNoise must never double-process capture. */
    function browserConstraint(value) {
        return normalize(value) === modes.browser;
    }

    /** Add this source revision to lazily requested RNNoise scripts/worklets. */
    function url(path) {
        if (!version) return path;
        const parsed = new URL(path, window.location.origin);
        parsed.searchParams.set('v', version);
        return `${parsed.pathname}${parsed.search}`;
    }

    /** Load the RNNoise controller once on explicit selection; failed loads remain retryable. */
    function load() {
        if (typeof window.RNNoiseProcessor === 'function') return Promise.resolve(window.RNNoiseProcessor);
        if (loading) return loading;
        const script = document.createElement('script');
        script.src = url('/js/NodeProcessor.js');
        script.async = true;
        loading = new Promise((resolve, reject) => {
            let settled = false;
            const timer = setTimeout(() => finish(new Error('RNNoise loading timed out')), 15000);
            /** Settle one script request and remove failed artifacts. */
            function finish(error) {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                script.onload = script.onerror = null;
                if (error || typeof window.RNNoiseProcessor !== 'function') {
                    script.remove();
                    reject(error || new Error('RNNoise processor is unavailable'));
                } else resolve(window.RNNoiseProcessor);
            }
            script.onload = () => finish();
            script.onerror = () => finish(new Error('Could not load RNNoise'));
            document.head.appendChild(script);
        });
        loading.catch(() => {
            loading = null;
        });
        return loading;
    }

    const menuBindings = new WeakMap();
    const menuHelp = new WeakMap();

    /** Build a quick-menu select backed by the authoritative settings control. */
    function appendMenuSelect(menu, source) {
        menuBindings.get(source)?.();
        menuHelp.get(menu)?.forEach((instance) => instance.destroy());
        menuHelp.delete(menu);
        const row = document.createElement('div');
        row.className = 'device-menu-toggle-row';
        const label = document.createElement('label');
        label.className = 'title';
        label.htmlFor = 'deviceMenuNoiseSuppression';
        label.textContent = window.i18n?.t('Noise suppression', 'labels') || 'Noise suppression';
        const select = source.cloneNode(true);
        select.id = label.htmlFor;
        select.value = source.value;
        select.style.cssText = 'width:160px;max-width:100%;margin:0';
        select.addEventListener('click', (event) => event.stopPropagation());
        select.addEventListener('change', () => {
            source.value = select.value;
            source.dispatchEvent(new Event('change', { bubbles: true }));
            select.value = source.value;
        });
        /** Reflect changes from the settings panel without owning a second mode state. */
        const sync = () => {
            select.value = source.value;
        };
        source.addEventListener('change', sync);
        menuBindings.set(source, () => source.removeEventListener('change', sync));
        row.append(label, select);
        menu.appendChild(row);
    }

    /** Reuse authoritative help content on quick-menu controls; dispose instances on rebuild. */
    function appendMenuHelp(menu) {
        const instances = [];
        for (const [controlId, helpId] of [
            ['deviceMenuNoiseSuppression', 'noiseSuppressionHelp'],
            ['deviceMenuEchoCancellation', 'echoCancellationHelp'],
            ['deviceMenuAutoGainControl', 'autoGainControlHelp'],
        ]) {
            const label = menu.querySelector(`label[for="${controlId}"]`);
            const source = document.getElementById(helpId);
            if (!label || !source?._tippy) continue;
            const wrapper = document.createElement('span');
            wrapper.className = 'device-menu-help-label';
            label.replaceWith(wrapper);
            const button = source.cloneNode(true);
            button.id = `${controlId}Help`;
            button.classList.add('device-menu-help-button');
            wrapper.append(label, button);
            const instance = window.tippy(button, {
                content: source._tippy.props.content,
                allowHTML: true,
                trigger: source._tippy.props.trigger || 'mouseenter focus',
                placement: 'bottom',
                appendTo: () => document.body,
                maxWidth: Math.min(340, window.innerWidth - 32),
            });
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (instance.props.trigger === 'manual') {
                    instance.state.isVisible ? instance.hide() : instance.show();
                }
            });
            instances.push(instance);
        }
        menuHelp.set(menu, instances);
    }

    window.BodrikNoiseSuppression = {
        modes,
        normalize,
        browserConstraint,
        url,
        load,
        appendMenuSelect,
        appendMenuHelp,
    };
})();
