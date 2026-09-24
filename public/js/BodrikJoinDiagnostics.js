'use strict';

/** Collect device hints for join logging without adding them to the shared peer profile. */
function collectBodrikJoinDiagnostics(parser, slug, deviceType) {
    return {
        public_room_slug: slug,
        device_type: parser.device.type || deviceType,
        device_vendor: parser.device.vendor,
        device_model: parser.device.model,
        cpu_architecture: parser.cpu.architecture,
        engine_name: parser.engine.name,
        engine_version: parser.engine.version,
        logical_cores_hint: navigator.hardwareConcurrency,
        ram_gb_hint: navigator.deviceMemory,
    };
}

if (typeof window !== 'undefined') window.collectBodrikJoinDiagnostics = collectBodrikJoinDiagnostics;
if (typeof module !== 'undefined') module.exports = { collectBodrikJoinDiagnostics };
