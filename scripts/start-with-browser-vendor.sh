#!/bin/sh
set -eu

revision=${MIROTALK_SOURCE_REVISION:-development}
artifact=${BROWSER_VENDOR_ARTIFACT_DIR:-/opt/mirotalk-browser-vendor}
output=${BROWSER_VENDOR_OUTPUT_DIR:-/vendor-output}
releases=$output/releases

if [ "$revision" != "development" ]; then
    case "$revision" in
        ''|*[!0-9a-f]*) echo "MIROTALK_SOURCE_REVISION must be a lowercase commit SHA." >&2; exit 1 ;;
    esac
    [ "${#revision}" -eq 40 ] || { echo "MIROTALK_SOURCE_REVISION must contain 40 hex characters." >&2; exit 1; }
fi
[ -f "$artifact/licenses/THIRD_PARTY.md" ] || { echo "Browser vendor artifact is missing." >&2; exit 1; }

release=$releases/$revision
staging=$releases/.staging-$revision-$$
link=$output/.current-next-$$
mkdir -p "$releases"

if [ "$revision" = "development" ]; then rm -rf "$release"; fi
if [ ! -d "$release" ]; then
    trap 'rm -rf "$staging" "$link"' EXIT
    mkdir "$staging"
    cp -R "$artifact"/. "$staging"/
    test -s "$staging/mediapipe/selfie_segmentation/selfie_segmentation_solution_simd_wasm_bin.wasm"
    test -s "$staging/fontawesome/webfonts/fa-solid-900.woff2"
    test -s "$staging/licenses/THIRD_PARTY.md"
    mv "$staging" "$release"
fi

ln -s "releases/$revision" "$link"
mv -Tf "$link" "$output/current"
find "$releases" -mindepth 1 -maxdepth 1 -type d ! -path "$release" -mtime +30 -exec rm -rf {} +
trap - EXIT

exec "$@"
