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
RUN cp app/src/config.template.js app/src/config.js \
    && rm -f app/src/*.test.js public/js/*.test.cjs \
    && mkdir -p public/uploads/avatars public/uploads/chat \
    && chown -R node:node public/uploads
USER node
CMD ["npm", "start"]
