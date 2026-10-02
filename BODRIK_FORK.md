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
ordinary per-video PiP remains. ChatGPT/DeepSeek chat, meeting scheduling,
SMTP alerts/invitations, Slack/Mattermost/Discord integrations, and participant
geolocation (including IP geolocation lookup) are retired end to end. Server
recording, chunk uploads, S3 storage, and the standalone recording receiver are
removed. Local recording still buffers the encoder's final data, repairs WebM
duration, and downloads to the participant's device; it retains music/participant
volume and microphone-mute handling. The hidden local Appearance tab, custom color state and Pickr are removed;
`BodrikTheme` follows the authoritative Studio palette as the only theme source. Standalone landing/login/room-creation/catalog,
waiting-room and widget pages are retired; canonical Bodrik invitation exchange,
room-bound JWT admission, permission guidance, privacy and error pages remain.
OIDC, ngrok and Sentry integrations and their dependencies are removed.
Virtual backgrounds load MediaPipe only on activation, and gifler only for GIFs.
Each effect owns a cloned camera track, generated output, abortable pipeline and
animation; disabling, switching cameras and leaving invalidate obsolete work.
All retained browser libraries, Font Awesome fonts and virtual-background
JS/WASM/models are built from exact package-lock versions into an image artifact;
the SFU entrypoint publishes it atomically through a host bind mount without a
second image build. Production and development nginx serve `/vendor/` directly
from `.vendor/current` with bounded caching, so participants make no third-party CDN requests. Emoji Mart receives a local Unicode 15 dataset instead of its default jsDelivr URL, and Font Awesome 6.7.2 replaces the warning-prone 6.1.1 font. License notices ship
with the generated assets. Load failures retain ordinary camera capture. GIF downloads are cancellable,
temporary URLs are revoked, and zero-delay GIF frames are normalized to prevent
gifler 0.1.0's catch-up loop from freezing a tab. Raw producer camera capture is
owned separately from its derived output so closing effects cannot leak capture.

Unused QR/W3CSS/Stats dependencies, sticky-note remnants, post-call surveys,
external analytics and browser speech synthesis are retired. Human chat now uses
only the room-authorized Socket.IO channel; mediasoup SCTP DataChannel setup and
its producer/consumer lifecycle are removed. Public/private moderation, message
reactions, images, files, links and Markdown remain. The server derives sender
identity and room membership from admitted socket state, excludes lobby peers,
and never relays private chat outside the target's current room.

Unused join/exit/disconnect webhooks and their standalone receiver example are
removed; the authoritative Rust conference integration does not consume them.
Branding configuration now contains only meeting/legal metadata, language/app
identity, icons, OpenGraph data and About source/version. Landing-page sections
and environment keys are retired. An audited asset sweep removes unreferenced
upstream landing, infrastructure, RTMP, broadcasting and obsolete notification
images/sounds while retaining configured Bodrik icons plus dynamic avatar,
virtual-background and sound families. The public provider API is reduced to the
two backend consumers: room-bound join URL issuance and authoritative meeting
termination. Room catalogs, generic meeting/token/statistics endpoints, Swagger,
its example clients and endpoint-specific configuration are removed. Upstream privacy, 404, 50X and maintenance
HTML pages are removed: `/privacy` redirects to the same-site Bodrik privacy
page, unknown browser routes redirect to Bodrik `/404`, and unknown API routes return
JSON 404. Device access is optional: participants without a camera and microphone
can join as listeners, while explicit attempts to enable a missing/blocked device
still show the in-room actionable retry dialog. The obsolete permission page and
its large landing-page JS/CSS/vendor dependencies are removed.
Empty camera selectors offer a localized
permission retry that releases its temporary stream without publishing video.
The service-specific backend, TURN server, deployment configuration, environment
variables, credentials, and user-uploaded data are not stored in this repository.

Local JS/CSS URLs are versioned automatically by the HTML injector. Production
uses `MIROTALK_SOURCE_REVISION`; development uses cached file-content hashes
invalidated by a polling watcher. Generated backend scripts remain untouched;
self-hosted vendor JS/CSS use the same versioning, while lazy binary/model assets
carry their locked package version. Do not add manual cache versions elsewhere.

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
