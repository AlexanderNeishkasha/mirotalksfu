const QUIET_SCRIPT = `(() => {
    const mute = () => {};
    console.log = mute;
    console.info = mute;
    console.debug = mute;
})();
`;

/** Return the room's browser-console policy; warnings and errors always remain visible. */
function browserConsoleScript(environment) {
    return environment === 'production' ? QUIET_SCRIPT : '// Browser diagnostics enabled.\n';
}

module.exports = { browserConsoleScript };
