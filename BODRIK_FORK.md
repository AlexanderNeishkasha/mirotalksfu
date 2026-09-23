# Bodrik FM's MiroTalk SFU fork

This is a modified version of [MiroTalk SFU](https://github.com/miroslavpejic85/mirotalksfu)
(version 2.4.71, base commit `7a74f019d02cbbd9b7dbe5757f2d74ed607537e5`).
The original authors' copyright notices and the [GNU AGPL-3.0 license](LICENSE)
remain in place. The `bodrik` branch contains the corresponding MiroTalk
application source for Bodrik FM's meeting service. The stock `main` branch is
upstream's newer, **unmodified** code; use `bodrik` for this deployment.

Changes include room-bound admission, short-lived TURN credentials, a native
mediasoup music participant, room/slug branding, two maintained languages,
profile and chat UI changes, and in-place network/media recovery. These are
ordinary source changes, not runtime patches applied to an upstream download.
The service-specific backend, TURN server, deployment configuration, environment
variables, credentials, and user-uploaded data are not stored in this repository.

To build from the checked-out `bodrik` source, run `docker build -t mirotalk-sfu-bodrik .`.
Runtime settings depend on the deployment; refer to `.env.template` for upstream
configuration names. Never commit real `.env` files, certificates or tokens.
For reproducibility, select an explicit fork commit rather than building an
unreviewed moving branch. The meeting's About dialog links to this fork; set
`MIROTALK_SOURCE_REVISION` to the deployed 40-character fork commit SHA at runtime
so the link points to the exact corresponding source. Without that setting it
links to the moving `bodrik` branch. Verify the link before production cutover.

When updating from upstream, review changes on the separate `upstream` remote and
merge or cherry-pick deliberately. Do not overwrite the `bodrik` branch with the
newer upstream `main` or mix its unrelated changes into the initial migration.
