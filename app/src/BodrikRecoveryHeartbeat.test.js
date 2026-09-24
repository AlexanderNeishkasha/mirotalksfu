const assert = require('node:assert/strict');
const test = require('node:test');
const { startRecoveryHeartbeat } = require('./BodrikRecoveryHeartbeat');

test('idle participants receive an offset-bearing event and the timer is cleaned up', () => {
    const events = [];
    const timer = {
        unref() {
            events.push('unref');
        },
    };
    let tick;
    const stop = startRecoveryHeartbeat(
        { of: () => ({ sockets: new Map([['peer', {}]]) }), emit: (event) => events.push(event) },
        {
            schedule: (fn, delay) => {
                tick = fn;
                assert.equal(delay, 30000);
                return timer;
            },
            cancel: (value) => {
                assert.equal(value, timer);
                events.push('cancel');
            },
        }
    );
    tick();
    stop();
    assert.deepEqual(events, ['unref', 'bodrikRecoveryTick', 'cancel']);
});

test('the heartbeat does not send packets to an empty namespace', () => {
    let tick;
    const stop = startRecoveryHeartbeat(
        { of: () => ({ sockets: new Map() }), emit: () => assert.fail('unexpected broadcast') },
        {
            schedule: (fn) => {
                tick = fn;
                return 1;
            },
            cancel: () => {},
        }
    );
    tick();
    stop();
});
