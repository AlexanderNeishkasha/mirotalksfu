'use strict';

/** Own one cancellable background-processing session, never the caller's original camera track. */
class VirtualBackground {
    static instance = null;

    /** Create the shared processor without downloading scripts or initializing a model. */
    constructor() {
        if (VirtualBackground.instance) return VirtualBackground.instance;
        VirtualBackground.instance = this;
        this.isSupported = this.checkSupport();
        this.generation = 0;
        this.active = null;
        this.cleanup = Promise.resolve();
        this.isProcessing = false;
    }

    /** Require all APIs used by the main-thread frame pipeline. */
    checkSupport() {
        return Boolean(
            window.MediaStreamTrackProcessor &&
            window.TransformStream &&
            (window.MediaStreamTrackGenerator || window.VideoTrackGenerator) &&
            window.OffscreenCanvas &&
            window.VideoFrame &&
            window.createImageBitmap
        );
    }

    /** Create the generated video track across legacy and newer Chromium APIs. */
    createVideoTrackGenerator() {
        if (window.MediaStreamTrackGenerator) {
            const generator = new MediaStreamTrackGenerator({ kind: 'video' });
            return { generator, track: generator };
        }
        const generator = new VideoTrackGenerator();
        return { generator, track: generator.track };
    }

    /** Determine whether a prepared effect still belongs to the selected live source. */
    isCurrent(job) {
        return (
            this.active === job &&
            job.generation === this.generation &&
            !job.abort.signal.aborted &&
            job.source.readyState !== 'ended'
        );
    }

    /** Reject obsolete work before it can allocate a pipeline or publish a generated track. */
    assertCurrent(job) {
        if (!this.isCurrent(job)) throw new DOMException('Background operation cancelled', 'AbortError');
    }

    /** Stop owned tracks immediately; close the model only after initialization and sends settle. */
    dispose(job) {
        if (!job || job.disposed) return;
        job.disposed = true;
        job.abort.abort();
        job.source.removeEventListener('ended', job.onEnded);
        job.input?.stop();
        job.output?.stop();
        job.animation?.stop();
        this.releaseGifUrl(job);
        this.cleanup = Promise.allSettled([this.cleanup, job.initializing, job.pipeline]).then(async () => {
            this.closeFrames(job.pending?.frame, job.pending?.bitmap);
            job.pending = null;
            job.mask = null;
            if (job.model) {
                try {
                    await job.model.close();
                } catch (error) {
                    console.warn('Virtual background model cleanup failed', error);
                }
                job.model = null;
            }
        });
    }

    /** Invalidate pending loads and release owned streams/animation without stopping the raw camera. */
    async stopCurrentProcessor() {
        this.generation++;
        const job = this.active;
        this.active = null;
        this.isProcessing = false;
        this.dispose(job);
    }

    /** Initialize one job's model lazily, serializing against cleanup of the preceding model. */
    async initializeSegmentation(job) {
        const assets = window.BodrikBackgroundAssets;
        await assets.wait(this.cleanup, job.abort.signal);
        const Segmentation = await assets.wait(assets.segmentation(), job.abort.signal);
        this.assertCurrent(job);
        job.model = new Segmentation({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/${file}`,
        });
        job.model.setOptions({ modelSelection: 1, runningMode: 'video', smoothSegmentation: true });
        job.model.onResults((results) => this.handleSegmentationResults(job, results));
        job.initializing = Promise.resolve().then(() => job.model.initialize());
        await assets.wait(job.initializing, job.abort.signal);
        this.assertCurrent(job);
    }

    /** Consume only this job's pending frame; late callbacks cannot reach a newer session. */
    handleSegmentationResults(job, results) {
        const pending = job.pending;
        job.pending = null;
        if (!pending) return;
        if (!this.isCurrent(job)) {
            this.closeFrames(pending.frame, pending.bitmap);
            return;
        }
        job.mask = results?.segmentationMask || null;
        this.processFrame(job, pending.frame, pending.controller, pending.bitmap);
    }

    /** Composite one frame, falling back to its original pixels if a mask/render operation fails. */
    processFrame(job, frame, controller, bitmap) {
        try {
            if (!this.isCurrent(job)) return;
            if (!job.mask) {
                controller.enqueue(frame.clone());
                return;
            }
            const canvas = new OffscreenCanvas(frame.displayWidth, frame.displayHeight);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            job.maskHandler(ctx, canvas, job.mask, bitmap);
            const output = new VideoFrame(canvas, { timestamp: frame.timestamp, alpha: 'keep' });
            try {
                controller.enqueue(output);
            } catch (error) {
                output.close();
                throw error;
            }
        } catch (error) {
            if (this.isCurrent(job)) {
                console.warn('Virtual background frame rendering failed', error);
                this.enqueueOriginal(frame, controller);
            }
        } finally {
            this.closeFrames(frame, bitmap);
        }
    }

    /** Transfer an original-frame clone only if the pipeline still accepts frames. */
    enqueueOriginal(frame, controller) {
        let clone;
        try {
            clone = frame.clone();
            controller.enqueue(clone);
        } catch {
            clone?.close();
        }
    }

    /** Release native frame/bitmap resources; close is idempotent for these APIs. */
    closeFrames(frame, bitmap) {
        frame?.close();
        bitmap?.close();
    }

    /** Serialize segmentation sends and retain no more than one in-flight frame per session. */
    async transformFrame(job, frame, controller) {
        let bitmap;
        try {
            this.assertCurrent(job);
            bitmap = await createImageBitmap(frame);
            this.assertCurrent(job);
            if (job.frameCounter++ % 3 === 0) {
                job.pending = { frame, bitmap, controller };
                await job.model.send({ image: bitmap });
                if (job.pending) this.handleSegmentationResults(job, null);
            } else {
                this.processFrame(job, frame, controller, bitmap);
            }
        } catch (error) {
            job.pending = null;
            if (this.isCurrent(job)) {
                console.warn('Virtual background segmentation failed', error);
                this.enqueueOriginal(frame, controller);
            }
            this.closeFrames(frame, bitmap);
        }
    }

    /** Prepare an effect and transform an owned camera clone; obsolete preparation always rejects. */
    async processStreamWithSegmentation(source, createMaskHandler) {
        const stopping = this.stopCurrentProcessor();
        const generation = this.generation;
        await stopping;
        if (generation !== this.generation) throw new DOMException('Background operation cancelled', 'AbortError');
        if (!this.isSupported) throw new Error('Virtual background is not supported');
        if (!source || source.readyState === 'ended') throw new DOMException('Camera closed', 'AbortError');
        const job = { generation, source, abort: new AbortController(), frameCounter: 0 };
        job.onEnded = () => {
            if (this.active === job) this.stopCurrentProcessor();
        };
        this.active = job;
        source.addEventListener('ended', job.onEnded, { once: true });
        try {
            await this.initializeSegmentation(job);
            job.maskHandler = await createMaskHandler(job);
            this.assertCurrent(job);
            job.input = source.clone();
            const processor = new MediaStreamTrackProcessor({ track: job.input });
            const { generator, track } = this.createVideoTrackGenerator();
            job.output = track;
            const transformer = new TransformStream({
                transform: (frame, controller) => this.transformFrame(job, frame, controller),
            });
            job.pipeline = processor.readable
                .pipeThrough(transformer, { signal: job.abort.signal })
                .pipeTo(generator.writable, { signal: job.abort.signal });
            job.pipeline.catch((error) => {
                if (this.active === job) {
                    console.warn('Virtual background pipeline stopped', error);
                    this.stopCurrentProcessor();
                }
            });
            this.isProcessing = true;
            return new MediaStream([track]);
        } catch (error) {
            const current = this.active === job && generation === this.generation;
            if (current) {
                this.active = null;
                this.isProcessing = false;
            }
            this.dispose(job);
            if (!current) throw new DOMException('Background operation cancelled', 'AbortError');
            throw error;
        }
    }

    /** Blur only the background while retaining the segmented person. */
    applyBlurToWebRTCStream(track, blurLevel = 10) {
        return this.processStreamWithSegmentation(track, async () => (ctx, canvas, mask, bitmap) => {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
            ctx.restore();
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.filter = `blur(${blurLevel}px)`;
            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            ctx.restore();
        });
    }

    /** Load static images without gifler, and GIF animation only when that format is selected. */
    applyVirtualBackgroundToWebRTCStream(track, url) {
        return this.processStreamWithSegmentation(track, async (job) => {
            const isGif = /^data:image\/gif/i.test(url) || /\.gif(?:$|[?#])/i.test(url);
            const image = isGif ? await this.loadGifImage(url, job) : await this.loadImage(url, job);
            return (ctx, canvas, mask) => {
                const softMask = new OffscreenCanvas(canvas.width, canvas.height);
                const maskCtx = softMask.getContext('2d');
                maskCtx.filter = 'blur(5px)';
                maskCtx.drawImage(mask, 0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'destination-in';
                ctx.drawImage(softMask, 0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'destination-over';
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            };
        });
    }

    /** Retain just the segmented person with a transparent background. */
    applyTransparentVirtualBackgroundToWebRTCStream(track) {
        return this.processStreamWithSegmentation(track, async () => (ctx, canvas, mask) => {
            const softMask = new OffscreenCanvas(canvas.width, canvas.height);
            const maskCtx = softMask.getContext('2d');
            maskCtx.filter = 'blur(5px)';
            maskCtx.drawImage(mask, 0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(softMask, 0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
        });
    }

    /** Load one image with bounded waiting and remove obsolete network/event work. */
    async loadImage(src, job) {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        let loaded = false;
        const pending = new Promise((resolve, reject) => {
            image.onload = () => {
                loaded = true;
                resolve(image);
            };
            image.onerror = () => reject(new Error('Could not load background image'));
            image.src = src;
        });
        try {
            return await window.BodrikBackgroundAssets.wait(pending, job.abort.signal);
        } finally {
            image.onload = image.onerror = null;
            if (!loaded) image.src = '';
        }
    }

    /** Revoke a session's temporary GIF URL exactly once, including cancellation. */
    releaseGifUrl(job) {
        if (job.gifUrl) {
            URL.revokeObjectURL(job.gifUrl);
            job.gifUrl = null;
        }
    }

    /** Keep gifler 0.1.0's catch-up loop progressing even for zero-delay GIF frames. */
    normalizeGifFrameDelays(animation) {
        if (!Array.isArray(animation._frames) || !animation._frames.length) {
            throw new Error('Unsupported GIF decoder frames');
        }
        for (const frame of animation._frames) {
            if (!Number.isFinite(frame.delay) || frame.delay <= 0) frame.delay = 10;
            else if (frame.delay < 2) frame.delay = 2;
        }
    }

    /** Fetch GIF bytes cancellably and stop late decode callbacks from obsolete selections. */
    async loadGifImage(src, job) {
        const assets = window.BodrikBackgroundAssets;
        const animate = await assets.wait(assets.gifler(), job.abort.signal);
        this.assertCurrent(job);
        const response = await assets.wait(fetch(src, { signal: job.abort.signal }), job.abort.signal);
        if (!response.ok) throw new Error('Could not load background GIF');
        const blob = await assets.wait(response.blob(), job.abort.signal);
        this.assertCurrent(job);
        job.gifUrl = URL.createObjectURL(blob);
        const canvas = document.createElement('canvas');
        const decoded = new Promise((resolve, reject) => {
            try {
                animate(job.gifUrl).get((animation) => {
                    if (!this.isCurrent(job)) {
                        animation.stop();
                        reject(new DOMException('Background operation cancelled', 'AbortError'));
                        return;
                    }
                    try {
                        this.normalizeGifFrameDelays(animation);
                        job.animation = animation;
                        animation.animateInCanvas(canvas);
                        resolve(canvas);
                    } catch (error) {
                        animation.stop();
                        reject(error);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
        try {
            return await assets.wait(decoded, job.abort.signal);
        } finally {
            this.releaseGifUrl(job);
        }
    }
}
