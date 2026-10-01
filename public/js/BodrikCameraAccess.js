(() => {
    const select = document.getElementById('videoSelect');
    const notice = document.getElementById('cameraAccessNotice');
    const button = document.getElementById('cameraAccessRetry');
    const status = document.getElementById('cameraAccessStatus');
    if (!select || !notice || !button || !status) return;
    let requesting = false;
    let disposed = false;

    /** Derive availability from the enumerated device options, retaining actionable error information. */
    function refresh() {
        if (disposed) return;
        const available = Array.from(select.options).some((option) => option.value && !option.disabled);
        select.hidden = !available;
        select.disabled = !available;
        notice.hidden = available && !status.textContent;
        button.disabled = requesting;
    }

    /** Map camera failures to user-facing instructions rather than technical exception dumps. */
    function errorMessage(error) {
        switch (error.name) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
            case 'SecurityError':
                return 'Camera access is blocked. Allow camera access in your browser site settings, then try again.';
            case 'NotFoundError':
            case 'DevicesNotFoundError':
                return 'No cameras found';
            case 'NotReadableError':
            case 'TrackStartError':
                return 'The camera is busy or unavailable. Close other apps using it, or select another camera in video settings.';
            case 'OverconstrainedError':
            case 'ConstraintNotSatisfiedError':
                return 'The camera does not support the selected settings. Choose another camera or lower video quality.';
            default:
                return 'Could not request camera access. Check device availability and browser settings.';
        }
    }

    /** Navigate to the existing video settings without changing room or capture state. */
    function openSettings() {
        if (disposed) return;
        if (!document.getElementById('mySettings').classList.contains('show'))
            document.getElementById('settingsButton').click();
        document.getElementById('tabVideoDevicesBtn').click();
    }

    /** Present a localized camera error and a route to camera choices; never throw a second error. */
    function showError(error) {
        if (disposed) return;
        console.warn('Camera access failed', error);
        const message = errorMessage(error);
        status.textContent = message;
        refresh();
        Swal.fire({
            background: swalBackground,
            icon: 'warning',
            title: 'Camera unavailable',
            text: message,
            confirmButtonText: 'Camera settings',
            showCancelButton: true,
            cancelButtonText: 'Close',
        }).then((result) => {
            if (result.isConfirmed) openSettings();
        });
    }

    /** Refresh already-authorized devices first; only open a probe when browser permission is still needed. */
    async function requestAccess() {
        if (requesting || disposed) return;
        if (!navigator.mediaDevices?.getUserMedia) {
            status.textContent = 'Camera access requires a supported browser and a secure connection.';
            return;
        }
        requesting = true;
        button.disabled = true;
        status.textContent = 'Requesting camera access...';
        let stream;
        try {
            if (await enumerateVideoDevices()) {
                status.textContent = '';
                return;
            }
            if (disposed) return;
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (disposed) return;
            const available = await enumerateVideoDevices();
            if (!disposed) status.textContent = available ? '' : 'No cameras found';
        } catch (error) {
            if (!disposed) {
                status.textContent = errorMessage(error);
                try {
                    await enumerateVideoDevices();
                } catch (enumerationError) {
                    console.warn('Camera device list refresh after permission failure failed', enumerationError);
                }
            }
        } finally {
            stream?.getTracks().forEach((track) => track.stop());
            requesting = false;
            refresh();
        }
    }

    /** Start capture directly from the camera button: one permission request, with controls restored on failure. */
    async function startCamera(client) {
        if (requesting || disposed) return;
        requesting = true;
        setVideoButtonsDisabled(true);
        refresh();
        try {
            const producer = await client.produce(RoomClient.mediaType.video, select.value || undefined);
            if (disposed) return;
            if (producer) status.textContent = '';
            try {
                await enumerateVideoDevices();
            } catch (error) {
                console.warn('Camera device list refresh failed', error);
                if (producer) status.textContent = 'Camera is active, but the device list could not be refreshed.';
            }
        } catch (error) {
            if (!disposed) showError(error);
        } finally {
            requesting = false;
            if (!disposed) setVideoButtonsDisabled(false);
            refresh();
        }
    }

    const observer = new MutationObserver(refresh);
    observer.observe(select, { childList: true, subtree: true });
    button.addEventListener('click', requestAccess);
    window.BodrikCameraAccess = { startCamera, showError };
    refresh();
    window.addEventListener(
        'pagehide',
        () => {
            disposed = true;
            observer.disconnect();
            button.removeEventListener('click', requestAccess);
        },
        { once: true }
    );
})();
