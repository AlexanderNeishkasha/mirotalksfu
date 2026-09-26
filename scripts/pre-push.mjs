import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

// Run first-party checks for source included in the pushed commits; fail closed on errors.
/** Read Git's changed refs without hiding an unavailable revision. */
function git(args) {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

if (process.env.BODRIK_SKIP_CHECKS === '1') {
    console.warn('WARNING: bypassing local MiroTalk checks (BODRIK_SKIP_CHECKS=1)');
    process.exit(0);
}
if (git(['status', '--porcelain'])) throw new Error('Commit or stash fork changes before pushing');
const refs = readFileSync(0, 'utf8').trim().split('\n').filter(Boolean);
const changed = new Set();
for (const ref of refs) {
    const [, localSha, , remoteSha] = ref.trim().split(/\s+/);
    if (!localSha || /^0+$/.test(localSha)) continue;
    const range = /^0+$/.test(remoteSha) ? null : [remoteSha, localSha];
    const names = range ? git(['diff', '--name-only', ...range]) : git(['ls-tree', '-r', '--name-only', localSha]);
    for (const name of names.split('\n').filter(Boolean)) changed.add(name);
    if (range) git(['diff', '--check', ...range]);
}
if (!changed.size) process.exit(0);
const files = [...changed].filter((name) =>
    /^(app\/src|public\/js|scripts)\/.*\.[cm]?js$|^public\/lang\/.*\.json$/.test(name)
);
const formatFiles = [...changed].filter((name) =>
    /^(app\/src|public\/js|scripts)\/.*\.[cm]?js$|^public\/views\/.*\.html$|^public\/lang\/.*\.json$|^eslint\.config\.mjs$/.test(
        name
    )
);
if ([...files, ...formatFiles].some((name) => !/^[\w./-]+$/.test(name))) throw new Error('Unsafe source path in push');
// Deleted source still triggers the suite, but cannot be passed to ESLint.
const lintFiles = files.filter((name) => existsSync(name));
const npmOptions = { stdio: 'inherit', shell: process.platform === 'win32' };
if (changed.has('eslint.config.mjs') || changed.has('package.json')) {
    execFileSync('npm', ['run', 'lint'], npmOptions);
} else if (lintFiles.length) {
    execFileSync('npm', ['run', 'lint', '--', ...lintFiles], npmOptions);
}
if (formatFiles.length) execFileSync('npm', ['run', 'format:check', '--', ...formatFiles], npmOptions);
if (
    [...changed].some((name) =>
        /^(app\/src|public\/js|public\/views|public\/lang|scripts)\/|^package(?:-lock)?\.json$/.test(name)
    )
) {
    execFileSync('npm', ['run', 'test:bodrik'], npmOptions);
}
