const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname, 'BodrikJoinDiagnostics.js'), 'utf8');

test('browser hints stay separate from the shared peer profile', () => {
    const context = vm.createContext({ navigator: { hardwareConcurrency: 4, deviceMemory: 8 } });
    vm.runInContext(`${source}\nglobalThis.collect = collectBodrikJoinDiagnostics;`, context);
    const info = context.collect(
        {
            device: { model: 'Laptop', vendor: 'Example' },
            cpu: { architecture: 'x64' },
            engine: { name: 'Gecko', version: '156' },
        },
        'my-room',
        'desktop'
    );
    assert.equal(info.public_room_slug, 'my-room');
    assert.equal(info.device_model, 'Laptop');
    assert.equal(info.engine, undefined);
    assert.equal(info.ram_gb_hint, 8);
    assert.equal(info.logical_cores_hint, 4);
});
