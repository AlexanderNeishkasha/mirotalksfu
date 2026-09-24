const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');
const { browserConsoleScript } = require('./BodrikBrowserConsole');

/** Execute a browser policy against isolated console methods for each environment. */
function runPolicy(environment) {
    const calls = [];
    const console = Object.fromEntries(
        ['log', 'info', 'debug', 'warn', 'error'].map((level) => [level, () => calls.push(level)])
    );
    vm.runInNewContext(browserConsoleScript(environment), { console });
    for (const method of ['log', 'info', 'debug', 'warn', 'error']) console[method]('test');
    return calls;
}

test('production suppresses routine browser logs but retains warnings and errors', () => {
    assert.deepEqual(runPolicy('production'), ['warn', 'error']);
});

test('local development keeps all browser logs', () => {
    assert.deepEqual(runPolicy('development'), ['log', 'info', 'debug', 'warn', 'error']);
});
