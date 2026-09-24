import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const files = process.argv.slice(2);
execFileSync(process.execPath, ['scripts/check-source.mjs', ...files], { stdio: 'inherit' });
const jsFiles = files.filter((file) => /^(app\/src|public\/js|scripts)\/.*\.[cm]?js$/.test(file));
if (!files.length) jsFiles.push('app/src', 'public/js', 'scripts');
if (jsFiles.length) {
    const require = createRequire(import.meta.url);
    const cli = join(dirname(require.resolve('eslint/package.json')), 'bin/eslint.js');
    execFileSync(process.execPath, [cli, ...jsFiles], { stdio: 'inherit' });
}
