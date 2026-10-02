'use strict';

const brandDataKey = 'brandData-bodrik-2';
const brandData = window.sessionStorage.getItem(brandDataKey);

const title = document.getElementById('title');
const icon = document.getElementById('icon');
const appleTouchIcon = document.getElementById('appleTouchIcon');

const description = document.getElementById('description');
const keywords = document.getElementById('keywords');

//...

// app/src/config.js - ui.brand
let BRAND = {
    app: {
        language: 'en',
        name: 'MiroTalk SFU',
    },
    site: {
        title: 'MiroTalk SFU - Open Source WebRTC Video Conferencing',
        icon: '../images/logo.svg',
        appleTouchIcon: '../images/logo.svg',
    },
    meta: {
        description:
            'Build your own Zoom alternative with MiroTalk SFU, an open-source, self-hosted WebRTC platform powered by Mediasoup for scalable video meetings.',
        keywords:
            'webrtc, miro, mediasoup, mediasoup-client, self hosted, voip, sip, real-time communications, chat, messaging, meet, webrtc stun, webrtc turn, webrtc p2p, webrtc sfu, video meeting, video chat, video conference, multi video chat, multi video conference, peer to peer, p2p, sfu, rtc, alternative to, zoom, microsoft teams, google meet, jitsi, meeting',
    },

    about: {
        version: '2.4.71',
        sourceRevision: '',
    },

    //...
};

/** Resolve shared branding and notify retained meeting/legal-page consumers. */
async function initialize() {
    await getBrand();

    customizeSite();

    customizeMetaTags();

    // Notify listeners (e.g. I18n.js) that BRAND is fully resolved.
    document.dispatchEvent(new CustomEvent('brand:ready'));
}

async function getBrand() {
    if (brandData) {
        setBrand(JSON.parse(brandData));
    } else {
        try {
            const response = await fetch('/brand', { timeout: 5000 });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const serverBrand = data.message;
            if (serverBrand) {
                setBrand(serverBrand);
                console.log('FETCH BRAND SETTINGS', {
                    serverBrand: serverBrand,
                    clientBrand: BRAND,
                });
                window.sessionStorage.setItem(brandDataKey, JSON.stringify(serverBrand));
            } else {
                console.warn('FETCH BRAND SETTINGS - DISABLED');
            }
        } catch (error) {
            console.error('FETCH GET BRAND ERROR', error.message);
        }
    }
}

// BRAND configurations
function setBrand(data) {
    BRAND = mergeBrand(BRAND, data);
    console.log('Set Brand done');
}

function mergeBrand(current, updated) {
    for (const key of Object.keys(updated)) {
        if (!current.hasOwnProperty(key) || typeof updated[key] !== 'object') {
            current[key] = updated[key];
        } else {
            mergeBrand(current[key], updated[key]);
        }
    }
    return current;
}

// BRAND check

// ELEMENT display mode
function elementDisplay(element, display, mode = 'block') {
    if (!element) return;
    element.style.display = display ? mode : 'none';
}

// APP customize
/** Apply retained application branding without standalone room-creation controls. */

// SITE metadata
/** Apply document title and icons for the meeting and retained support pages. */
function customizeSite() {
    if (title && BRAND.site?.title) {
        title.textContent = BRAND.site?.title;
    }
    if (icon && BRAND.site?.icon) {
        icon.href = BRAND.site?.icon;
    }
    if (appleTouchIcon && BRAND.site?.appleTouchIcon) {
        appleTouchIcon.href = BRAND.site.appleTouchIcon;
    }
}

// SEO metadata
function customizeMetaTags() {
    if (description && BRAND.meta?.description) {
        description.content = BRAND.meta.description;
    }
    if (keywords && BRAND.meta?.keywords) {
        keywords.content = BRAND.meta.keywords;
    }
}

initialize();
