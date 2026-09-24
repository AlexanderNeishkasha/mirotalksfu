import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, readdirSync, rmSync } from 'node:fs';

/** Run fast maintained tests, or the separate Linux-only RTP integration test. */
const integration = process.argv[2] === '--music-integration';
if (process.argv.length > 2 && !integration) throw new Error('Unknown test option');
const files = integration
    ? ['app/src/MusicIntegration.test.js']
    : [
          ...readdirSync('app/src')
              .filter((name) => /^Bodrik.*\.test\.js$/.test(name))
              .map((name) => `app/src/${name}`),
          ...readdirSync('public/js')
              .filter((name) => /^Bodrik.*\.test\.cjs$/.test(name))
              .map((name) => `public/js/${name}`),
      ];
const config = 'app/src/config.js';
const temporaryConfig = !existsSync(config);
if (temporaryConfig) copyFileSync('app/src/config.template.js', config);
try {
    execFileSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
} finally {
    if (temporaryConfig) rmSync(config);
}
