// MiroTalk is not a Next.js app. Keep legacy source checks conservative and
// apply stronger rules to the new, owned integration modules first.
export default [
    {
        ignores: ['node_modules/**', 'public/sfu/**', 'app/src/config.js', 'public/js/*.min.js'],
    },
    {
        files: ['app/src/**/*.js', 'public/js/**/*.js', 'scripts/**/*.mjs'],
        languageOptions: { ecmaVersion: 'latest' },
        rules: {
            'no-debugger': 'error',
            'no-unreachable': 'error',
            'no-constant-condition': ['error', { checkLoops: false }],
        },
    },
    {
        files: ['public/js/**/*.js'],
        languageOptions: { sourceType: 'script' },
    },
    {
        files: ['app/src/**/*.js'],
        languageOptions: { sourceType: 'commonjs' },
    },
    {
        files: [
            'app/src/BodrikJoinDiagnostics*.js',
            'public/js/BodrikJoinDiagnostics*.js',
            'public/js/BodrikMicProcessing*.js',
            'scripts/*.mjs',
        ],
        languageOptions: {
            globals: {
                Buffer: 'readonly',
                console: 'readonly',
                document: 'readonly',
                module: 'readonly',
                navigator: 'readonly',
                process: 'readonly',
                require: 'readonly',
                window: 'readonly',
            },
        },
        rules: { 'no-undef': 'error', 'no-unused-vars': 'error' },
    },
];
