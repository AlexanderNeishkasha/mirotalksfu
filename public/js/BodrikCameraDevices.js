/** Request initial camera permission and enumerate devices without leaking probe tracks on failure. */
async function initEnumerateVideoDevices() {
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        await enumerateVideoDevices();
        isVideoAllowed = true;
        return true;
    } catch (error) {
        isVideoAllowed = false;
        console.warn('Camera initialization failed', error);
        return false;
    } finally {
        stream?.getTracks().forEach((track) => track.stop());
    }
}

/** Refresh authorized camera choices without opening a camera or taking ownership of capture tracks. */
async function enumerateVideoDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === 'videoinput' && device.deviceId && device.label);
    const selects = [videoSelect, initVideoSelect].filter(Boolean);
    for (const select of selects) select.innerHTML = '';
    lS.DEVICES_COUNT.video = cameras.length;
    for (const device of cameras) await addChild(device, selects);
    isEnumerateVideoDevices = cameras.length > 0;
    return isEnumerateVideoDevices;
}
