'use strict';
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web');

/** Read browser-owned code without evaluating Room initialization or using external assets. */
function read(name) {
    return readFileSync(path.join(__dirname, '../../public/js', name), 'utf8');
}

/** Create a controllable asynchronous operation for cancellation/race cases. */
function deferred() {
    let resolve, reject;
    const promise = new Promise((yes, no) => {
        resolve = yes;
        reject = no;
    });
    return { promise, resolve, reject };
}

/** Drain promise/stream scheduling while keeping tests independent of wall-clock timing. */
async function tick() {
    await new Promise((resolve) => setImmediate(resolve));
}

/** Wait a bounded number of scheduler turns for observable pipeline progress. */
async function until(predicate) {
    for (let i = 0; i < 30 && !predicate(); i++) await tick();
    if (!predicate()) throw new Error('Background fixture did not reach the expected state');
}

/** Model camera-track ownership, distinguishing hardware end from explicit stop. */
class Track {
    /** Create a live test camera or generated track. */
    constructor() {
        this.readyState = 'live';
        this.stops = 0;
        this.listeners = new Set();
    }
    /** Release this track without firing the native hardware-ended event. */
    stop() {
        this.stops++;
        this.readyState = 'ended';
    }
    /** Register hardware-end subscriptions for inspection. */
    addEventListener(_event, callback) {
        this.listeners.add(callback);
    }
    /** Remove the exact owner's hardware-end subscription. */
    removeEventListener(_event, callback) {
        this.listeners.delete(callback);
    }
    /** Simulate hardware ending and notify the current subscribers. */
    end() {
        this.readyState = 'ended';
        for (const callback of [...this.listeners]) callback();
    }
}

/** Supply the MediaStream methods used by camera and effect lifecycle helpers. */
class Stream {
    /** Wrap independent tracks. */
    constructor(tracks) {
        this.tracks = tracks;
    }
    /** Return only the video tracks used by these fixtures. */
    getVideoTracks() {
        return this.tracks;
    }
    /** Return all fixture-owned tracks. */
    getTracks() {
        return this.tracks;
    }
}

/** Track native frame/bitmap closure and distinguish clones from inputs. */
class Frame {
    /** Create a closeable input or processed frame. */
    constructor(_source, options = {}) {
        this.displayWidth = 640;
        this.displayHeight = 480;
        this.timestamp = options.timestamp || 1;
        this.closes = 0;
    }
    /** Duplicate pixels with independent ownership. */
    clone() {
        if (this.closes) throw new Error('Frame is closed');
        return new Frame();
    }
    /** Release the fixture's native-frame handle. */
    close() {
        this.closes++;
    }
}

/** Build the real background code around controllable model, GIF, and Web Streams APIs. */
function fixture(options = {}) {
    const state = {
        models: [],
        processors: [],
        clones: [],
        outputs: [],
        frames: [],
        bitmaps: [],
        warnings: [],
        segmentationLoads: 0,
        gifLoads: 0,
        gifRequests: [],
        revokedUrls: [],
    };
    /** Record model initialization, results, sends, and closure. */
    class Model {
        /** Register a fresh model owned by one processing job. */
        constructor() {
            this.index = state.models.length;
            this.closes = 0;
            this.sends = 0;
            state.models.push(this);
        }
        /** Accept model options without downloading assets. */
        setOptions() {}
        /** Save the job-scoped result callback. */
        onResults(callback) {
            this.callback = callback;
        }
        /** Resolve or fail model preparation according to the named test scenario. */
        initialize() {
            return options.initialize?.(this.index) || Promise.resolve();
        }
        /** Deliver a mask while exercising the real transform/result callbacks. */
        async send() {
            this.sends++;
            this.callback({ segmentationMask: {} });
        }
        /** Release one model after its initialization and pipeline have settled. */
        async close() {
            this.closes++;
        }
    }
    /** Provide canvas compositing operations without native pixel/GPU work. */
    class Canvas {
        /** Store the requested output dimensions. */
        constructor(width, height) {
            this.width = width;
            this.height = height;
        }
        /** Return the minimal real-pipeline drawing contract. */
        getContext() {
            return { drawImage() {}, save() {}, restore() {}, clearRect() {} };
        }
    }
    /** Load test images asynchronously, including explicit failure paths. */
    class Image {
        /** Schedule one image result when its source is assigned. */
        set src(value) {
            if (!value) return;
            queueMicrotask(() => (value.includes('fail') ? this.onerror?.() : this.onload?.()));
        }
    }
    /** Expose frames from an owned camera clone through a real readable stream. */
    class Processor {
        /** Register a controllable readable stream for this job. */
        constructor({ track }) {
            this.track = track;
            this.readable = new ReadableStream({
                start: (controller) => {
                    this.controller = controller;
                },
            });
            state.processors.push(this);
        }
    }
    /** Accept generated frames through a real writable stream. */
    class Generator extends Track {
        /** Record output-track ownership and drain frames as a browser consumer would. */
        constructor() {
            super();
            state.outputs.push(this);
            this.writable = new WritableStream({
                write: (frame) => {
                    state.frames.push(frame);
                    frame.close();
                },
            });
        }
    }
    const context = {
        window: null,
        document: { head: { appendChild() {} }, createElement: () => new Canvas() },
        console: {
            log() {},
            warn: (...args) => state.warnings.push(args),
            error: (...args) => state.warnings.push(args),
        },
        MediaStreamTrackProcessor: Processor,
        MediaStreamTrackGenerator: Generator,
        TransformStream,
        OffscreenCanvas: Canvas,
        VideoFrame: Frame,
        MediaStream: Stream,
        Image,
        AbortController,
        DOMException,
        createImageBitmap: async () => {
            const bitmap = new Frame();
            state.bitmaps.push(bitmap);
            return bitmap;
        },
        fetch: (url, { signal }) => {
            state.gifRequests.push({ url, signal });
            return options.fetch ? options.fetch(url, signal) : Promise.resolve({ ok: true, blob: async () => ({}) });
        },
        URL: { createObjectURL: () => 'blob:background-test', revokeObjectURL: (url) => state.revokedUrls.push(url) },
        setTimeout,
        clearTimeout,
        queueMicrotask,
        userLog: (...args) => state.warnings.push(args),
    };
    context.window = context;
    vm.createContext(context);
    vm.runInContext(read('BodrikBackgroundAssets.js'), context);
    context.BodrikBackgroundAssets.segmentation = () => {
        state.segmentationLoads++;
        return options.segmentation?.() || Promise.resolve(Model);
    };
    context.BodrikBackgroundAssets.gifler = () => {
        state.gifLoads++;
        return Promise.resolve(() => ({
            get: (callback) => {
                const animation = {
                    _frames: options.gifFrames || [{ delay: 10 }, { delay: 10 }],
                    stops: 0,
                    starts: 0,
                    stop() {
                        this.stops++;
                    },
                    animateInCanvas() {
                        this.starts++;
                    },
                };
                state.animation = animation;
                if (options.gif) options.gif(callback, animation);
                else callback(animation);
            },
        }));
    };
    vm.runInContext(`${read('VirtualBackground.js')}; globalThis.Effect = VirtualBackground`, context);
    vm.runInContext(read('BodrikBackgroundCapture.js'), context);
    const effect = new context.Effect();
    const source = new Track();
    source.clone = () => {
        const clone = new Track();
        state.clones.push(clone);
        return clone;
    };
    return { state, context, effect, source, stream: new Stream([source]), Stream, Frame };
}

module.exports = { read, deferred, tick, until, fixture };
