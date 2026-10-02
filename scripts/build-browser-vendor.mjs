import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const modules = path.join(root, 'node_modules');
const vendor = path.resolve(root, process.env.BROWSER_VENDOR_OUTPUT || '.generated/browser-vendor');
const licenses = path.join(vendor, 'licenses');

/** Resolve a package-owned source path without accepting paths outside node_modules. */
function source(...segments) {
    return path.join(modules, ...segments);
}

/** Copy one package artifact into the generated public vendor directory. */
async function copy(from, to) {
    const destination = path.join(vendor, to);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(source(...from.split('/')), destination, { recursive: true });
}

/** Copy an available package license under a stable package-specific name. */
async function copyLicense(packagePath, sourceName, outputName) {
    await copy(`${packagePath}/${sourceName}`, `licenses/${outputName}`);
}

await rm(vendor, { recursive: true, force: true });
await mkdir(licenses, { recursive: true });

await Promise.all([
    copy('@fortawesome/fontawesome-free/css/all.min.css', 'fontawesome/css/all.min.css'),
    copy('@fortawesome/fontawesome-free/webfonts', 'fontawesome/webfonts'),
    copy('@fontsource/montserrat/500.css', 'montserrat/500.css'),
    copy('animate.css/animate.min.css', 'animate/animate.min.css'),
    copy('bootstrap/dist/css/bootstrap.min.css', 'bootstrap/bootstrap.min.css'),
    copy('bootstrap/dist/js/bootstrap.bundle.min.js', 'bootstrap/bootstrap.bundle.min.js'),
    copy('marked/lib/marked.umd.js', 'marked/marked.umd.js'),
    copy('sweetalert2/dist/sweetalert2.all.min.js', 'sweetalert2/sweetalert2.all.min.js'),
    copy('emoji-mart/dist/browser.js', 'emoji-mart/browser.js'),
    copy('@emoji-mart/data/sets/15/native.json', 'emoji-mart/data-native.json'),
    copy('@popperjs/core/dist/umd/popper.min.js', 'popper/popper.min.js'),
    copy('tippy.js/dist/tippy-bundle.umd.min.js', 'tippy/tippy-bundle.umd.min.js'),
    copy('highlight.js/styles/atom-one-dark.min.css', 'highlight/atom-one-dark.min.css'),
    copy('ua-parser-js/dist/ua-parser.min.js', 'ua-parser/ua-parser.min.js'),
    copy('xss/dist/xss.min.js', 'xss/xss.min.js'),
    copy('gifler/gifler.min.js', 'gifler/gifler.min.js'),
]);

const fontAwesomeCssPath = path.join(vendor, 'fontawesome/css/all.min.css');
const fontAwesomeCss = await readFile(fontAwesomeCssPath, 'utf8');
await writeFile(
    fontAwesomeCssPath,
    fontAwesomeCss.replace(/(\.\.\/webfonts\/[^)'\"]+)(['\"]?\))/g, '$1?package=6.7.2$2')
);
const montserratCssPath = path.join(vendor, 'montserrat/500.css');
const montserratCss = await readFile(montserratCssPath, 'utf8');
await writeFile(montserratCssPath, montserratCss.replace(/(\.\/files\/[^)'\"]+)(['\"]?\))/g, '$1?package=5.3.0$2'));

for (const subset of ['cyrillic-ext', 'cyrillic', 'vietnamese', 'latin-ext', 'latin']) {
    for (const extension of ['woff2', 'woff']) {
        const file = `montserrat-${subset}-500-normal.${extension}`;
        await copy(`@fontsource/montserrat/files/${file}`, `montserrat/files/${file}`);
    }
}

for (const file of [
    'selfie_segmentation.js',
    'selfie_segmentation.binarypb',
    'selfie_segmentation.tflite',
    'selfie_segmentation_landscape.tflite',
    'selfie_segmentation_solution_simd_wasm_bin.data',
    'selfie_segmentation_solution_simd_wasm_bin.js',
    'selfie_segmentation_solution_simd_wasm_bin.wasm',
    'selfie_segmentation_solution_wasm_bin.js',
    'selfie_segmentation_solution_wasm_bin.wasm',
]) {
    await copy(`@mediapipe/selfie_segmentation/${file}`, `mediapipe/selfie_segmentation/${file}`);
}

await build({
    stdin: {
        contents: "import hljs from 'highlight.js/lib/common'; window.hljs = hljs;",
        resolveDir: root,
        sourcefile: 'highlight-browser-entry.js',
    },
    bundle: true,
    minify: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    outfile: path.join(vendor, 'highlight/highlight.min.js'),
    legalComments: 'eof',
});

await Promise.all([
    copyLicense('@fortawesome/fontawesome-free', 'LICENSE.txt', 'fontawesome.txt'),
    copyLicense('@fontsource/montserrat', 'LICENSE', 'montserrat.txt'),
    copyLicense('animate.css', 'LICENSE', 'animate-css.txt'),
    copyLicense('bootstrap', 'LICENSE', 'bootstrap.txt'),
    copyLicense('marked', 'LICENSE', 'marked.txt'),
    copyLicense('sweetalert2', 'LICENSE', 'sweetalert2.txt'),
    copyLicense('emoji-mart', 'LICENSE', 'emoji-mart.txt'),
    copyLicense('@emoji-mart/data', 'LICENSE', 'emoji-mart-data.txt'),
    copyLicense('@popperjs/core', 'LICENSE.md', 'popper.txt'),
    copyLicense('tippy.js', 'LICENSE', 'tippy.txt'),
    copyLicense('highlight.js', 'LICENSE', 'highlight-js.txt'),
    copyLicense('ua-parser-js', 'LICENSE.md', 'ua-parser-js.md'),
    copyLicense('xss', 'LICENSE', 'xss.txt'),
]);

const apache = await readFile(path.join(root, 'scripts/licenses/Apache-2.0.txt'), 'utf8');
await writeFile(path.join(licenses, 'Apache-2.0.txt'), apache);

const packages = [
    '@fortawesome/fontawesome-free',
    '@fontsource/montserrat',
    'animate.css',
    'bootstrap',
    'marked',
    'sweetalert2',
    'emoji-mart',
    '@emoji-mart/data',
    '@popperjs/core',
    'tippy.js',
    'highlight.js',
    'ua-parser-js',
    'xss',
    '@mediapipe/selfie_segmentation',
    'gifler',
];
const notices = ['# Browser vendor notices', '', 'Generated from the locked npm packages below.', ''];
for (const name of packages) {
    const metadata = JSON.parse(await readFile(path.join(modules, name, 'package.json'), 'utf8'));
    notices.push(`- ${name}@${metadata.version} — ${metadata.license || 'see package metadata'}`);
}
notices.push('', 'MediaPipe Selfie Segmentation and gifler use Apache-2.0; see `Apache-2.0.txt`.', '');
await writeFile(path.join(licenses, 'THIRD_PARTY.md'), notices.join('\n'));
