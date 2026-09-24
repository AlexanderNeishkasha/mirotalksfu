import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

/** Check changed first-party JavaScript and language dictionaries without rewriting source files. */
const files = process.argv.slice(2);
if (!files.length) {
    files.push(
        ...execFileSync('git', ['ls-files', 'app/src/*.js', 'public/js/*.js', 'public/lang/*.json'], {
            encoding: 'utf8',
        })
            .trim()
            .split('\n')
    );
}
for (const file of files) {
    if (!existsSync(file)) continue;
    if (/^(app\/src|public\/js)\/.*\.[cm]?js$/.test(file)) {
        execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
    } else if (/^public\/lang\/.*\.json$/.test(file)) {
        JSON.parse(readFileSync(file, 'utf8'));
    }
}
console.log(`Checked ${files.length} source paths`);
