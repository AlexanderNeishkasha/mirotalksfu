/** Explain the meeting platform and link its public source, pinned to the deployed revision when available. */
function showAbout() {
    sound('open');
    const revision = BRAND.about?.sourceRevision;
    const sourceRef = /^[a-f0-9]{40}$/.test(revision) ? revision : 'main';
    Swal.fire({
        background: swalBackground,
        position: 'center',
        title: 'About the system',
        confirmButtonText: 'Close',
        customClass: { popup: 'meeting-about-popup' },
        html: renderRoomTemplate('popupAboutTemplate', {
            text: {
                version: `MiroTalk SFU${BRAND.about?.version ? ` · v${BRAND.about.version}` : ''}`,
                platformDescription:
                    'This meeting service is based on MiroTalk SFU, an open-source video conferencing platform.',
                licenseDescription:
                    'Our modified version is distributed under AGPL-3.0. Its source code is publicly available at the link below.',
            },
            attrs: { sourceUrl: `https://github.com/AlexanderNeishkasha/mirotalksfu/tree/${sourceRef}` },
        }),
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' },
    });
}
