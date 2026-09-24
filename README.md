# Bodrik FM meeting fork

This is a fork of [MiroTalk SFU](https://github.com/miroslavpejic85/mirotalksfu)
for [Bodrik FM](https://bodrik.fm), based on MiroTalk SFU 2.4.71 (upstream
commit [`7a74f019`](https://github.com/miroslavpejic85/mirotalksfu/commit/7a74f019d02cbbd9b7dbe5757f2d74ed607537e5)).
It adds room-bound admission, a native music participant, meeting profiles,
chat images, Russian/English UI, theming and in-place reconnection.

This repository contains the modified MiroTalk application source, not the
Bodrik FM backend, deployment secrets or user data. See [fork notes](BODRIK_FORK.md)
for build instructions, deployment revision and update policy. The original
copyright notices are retained; the code is licensed under [GNU AGPL-3.0](LICENSE).
The upstream maintainers are not responsible for this fork's integration.

For local checks, run `npm ci`, `npm run lint` (syntax and language JSON),
`npm run test:bodrik`, and `npm test` (upstream Mocha tests). `npm run
format:check -- <paths>` checks formatting; `format:write` changes files.
Enable the versioned push gate with `git config --local core.hooksPath .githooks`.
It checks pushed changes and blocks failures; `BODRIK_SKIP_CHECKS=1 git push`
is an emergency override. Docker image builds do not run tests or lint.
