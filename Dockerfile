# syntax=docker/dockerfile:1.7

# Build the checked-out Bodrik fork directly; the private deployment pins its Git commit.
FROM node:24.15.0-slim
WORKDIR /src
ENV NODE_ENV=production \
    MEDIASOUP_SKIP_WORKER_PREBUILT_DOWNLOAD=true
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential ffmpeg python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
# mediasoup uses the process CPU affinity as its Ninja -j value. Limit compilation
# to two jobs so a fresh build also fits the production host's 4 GiB RAM budget.
RUN --mount=type=cache,target=/root/.npm taskset -c 0-1 npm ci && npm prune --omit=dev
COPY --chown=node:node app ./app
COPY --chown=node:node public ./public
RUN node --check app/src/Room.js \
    && node --check app/src/Server.js \
    && node --check app/src/ServerApi.js \
    && node --check app/src/BodrikMusic.js \
    && node --check app/src/BodrikPlayback.js \
    && node --check app/src/BodrikAvatarUpload.js \
    && node --check app/src/BodrikBrowserConsole.js \
    && node --check app/src/BodrikPresenterIdentity.js \
    && node --check app/src/BodrikRecoveryHeartbeat.js \
    && node --check public/js/BodrikNetworkRecovery.js \
    && node --check public/js/BodrikProfile.js \
    && node --check public/js/BodrikTheme.js \
    && node --check public/js/I18n.js \
    && node -e "const fs=require('node:fs'); for(const lang of ['en','ru']) JSON.parse(fs.readFileSync('public/lang/'+lang+'.json')); if(fs.readdirSync('public/lang').filter(name=>name.endsWith('.json')).length!==2) process.exit(1)" \
    && node --check public/js/RoomClient.js \
    && node --check public/js/Room.js \
    && node --check app/src/BodrikRejoin.js \
    && node --check app/src/BodrikChatImageUpload.js \
    && node --check public/js/BodrikChatImage.js \
    && grep -Fq "let RoomURL = window.location.origin" public/js/Room.js \
    && grep -Fq "RoomURL = invitation.toString()" public/js/Room.js \
    && cp app/src/config.template.js app/src/config.js \
    && node --test app/src/BodrikMusic.test.js app/src/BodrikAvatarUpload.test.js app/src/BodrikRejoin.test.js app/src/BodrikChatImageUpload.test.js app/src/BodrikBrowserConsole.test.js app/src/BodrikPresenterIdentity.test.js app/src/BodrikRecoveryHeartbeat.test.js public/js/BodrikNetworkRecovery.test.cjs \
    && rm app/src/BodrikMusic.test.js app/src/BodrikAvatarUpload.test.js app/src/BodrikRejoin.test.js app/src/BodrikChatImageUpload.test.js app/src/BodrikBrowserConsole.test.js app/src/BodrikPresenterIdentity.test.js app/src/BodrikRecoveryHeartbeat.test.js public/js/BodrikNetworkRecovery.test.cjs \
    && mkdir -p public/uploads/avatars public/uploads/chat \
    && chown -R node:node public/uploads
USER node
CMD ["npm", "start"]
