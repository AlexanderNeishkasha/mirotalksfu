# Bodrik FM's MiroTalk SFU fork

This is a modified version of [MiroTalk SFU](https://github.com/miroslavpejic85/mirotalksfu)
(version 2.4.71, base commit `7a74f019d02cbbd9b7dbe5757f2d74ed607537e5`).
The original authors' copyright notices and the [GNU AGPL-3.0 license](LICENSE)
remain in place. The `main` branch contains the corresponding MiroTalk
application source for Bodrik FM's meeting service. The original fork `main`
tracks a newer upstream snapshot and is kept separately as `upstream-main`;
it must not be merged into this deployment without review.

Changes include room-bound admission, short-lived TURN credentials, a native
mediasoup music participant, room/slug branding, two maintained languages,
profile and chat UI changes, and in-place network/media recovery. These are
ordinary source changes, not runtime patches applied to an upstream download.

The Bodrik meeting no longer offers whiteboard, collaborative/private editor,
polls, or room-wide emoji reactions. Their controls, initialization, room state,
and signaling handlers are removed; stale room-reaction commands are not relayed.
Quill and PDF.js are no longer loaded. Chat emoji and chat-message reactions remain.
Video drawing is also retired, so Fabric.js is no longer loaded.
Peer-to-peer/shared URL media playback is retired; screen sharing, file transfer,
and chat URL rendering remain available. Snapshot capture is retired; recording
remains available in the Tools menu. The localized About dialog explains the
upstream platform and links to the deployed public source. Broadcasting mode,
breakout rooms, and RTMP streaming (including its standalone servers) are also
retired. The meeting uses ordinary participant media permissions; screen sharing,
recording, and the native music participant remain. Video AI avatars and the
LiveKit client are retired; ordinary camera capture, profiles, and virtual
backgrounds remain available. Document-level picture-in-picture is retired;
ordinary per-video PiP remains. Empty camera selectors offer a localized
permission retry that releases its temporary stream without publishing video.
The service-specific backend, TURN server, deployment configuration, environment
variables, credentials, and user-uploaded data are not stored in this repository.

Local JS/CSS URLs are versioned automatically by the HTML injector. Production
uses `MIROTALK_SOURCE_REVISION`; development uses cached file-content hashes
invalidated by a polling watcher. Generated backend scripts and CDN URLs are
left untouched. Do not add manual `?v=` values to templates or pin them in tests.

To build from the checked-out `main` source, run `docker build -t mirotalk-sfu-bodrik .`.
Runtime settings depend on the deployment; refer to `.env.template` for upstream
configuration names. Never commit real `.env` files, certificates or tokens.
For reproducibility, select an explicit fork commit rather than building an
unreviewed moving branch. This `main` branch does not publish Docker images
or deploy on push: the private deployment pins this repository as a submodule
and builds the image on its own host. The archived upstream branch retains its
original workflow but is not part of the Bodrik release process.
The meeting's About dialog links to this fork; set
`MIROTALK_SOURCE_REVISION` to the deployed 40-character fork commit SHA at runtime
so the link points to the exact corresponding source. Without that setting it
links to the moving `main` branch. Verify the link before production cutover.

When updating from upstream, review changes on the separate `upstream` remote and
merge or cherry-pick deliberately. Do not mix the archived upstream snapshot's
unrelated changes into the initial migration.
