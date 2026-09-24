import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const [mode, ...requested] = process.argv.slice(2);
if (!['check', 'write'].includes(mode)) throw new Error('Usage: node scripts/format.mjs check|write [paths...]');
const files = requested.length
    ? requested.filter((file) => existsSync(file))
    : [
          'app/src/**/*.js',
          'public/js/**/*.js',
          'scripts/**/*.mjs',
          'public/views/Room.html',
          'public/lang/*.json',
          'eslint.config.mjs',
      ];
if (files.length) {
    const require = createRequire(import.meta.url);
    const cli = join(dirname(require.resolve('prettier/package.json')), 'bin/prettier.cjs');
    execFileSync(process.execPath, [cli, `--${mode}`, ...files], { stdio: 'inherit' });
}
