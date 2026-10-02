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
COPY scripts/build-browser-vendor.mjs ./scripts/build-browser-vendor.mjs
COPY scripts/licenses ./scripts/licenses
# mediasoup uses the process CPU affinity as its Ninja -j value. Limit compilation
# to two jobs so a fresh build also fits the production host's 4 GiB RAM budget.
RUN --mount=type=cache,target=/root/.npm taskset -c 0-1 npm ci --include=dev \
    && mv .generated/browser-vendor /opt/mirotalk-browser-vendor \
    && npm prune --omit=dev
COPY --chown=node:node app ./app
COPY --chown=node:node public ./public
COPY --chmod=755 scripts/start-with-browser-vendor.sh /usr/local/bin/start-with-browser-vendor
RUN cp app/src/config.template.js app/src/config.js \
    && rm -f app/src/*.test.js public/js/*.test.cjs \
    && mkdir -p public/uploads/avatars public/uploads/chat logs/client-diagnostics \
    && chown -R node:node public/uploads logs
USER node
ENTRYPOINT ["/usr/local/bin/start-with-browser-vendor"]
CMD ["npm", "start"]
