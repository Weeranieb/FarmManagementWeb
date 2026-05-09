# Changelog — Farm OS Web

All notable changes to the Farm OS web app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Linear issue references use the `FAR-N` format and link to https://linear.app/farm-os.

---

## [Unreleased]

### Added
- _work in progress_

### Changed
- _none_

### Fixed
- _none_

### Removed
- _none_

---

## [0.1.0] — 2026-06-08 (Demo Release)

First public-ish release for stakeholder demo. Read-only viewer for farms/ponds plus owner-side dashboards.

### Added
- Login + Signup screens (FAR-8)
- Farm list + create form (FAR-15)
- Pond list + detail view (FAR-16)
- Feed log table + weekly summary per pond (FAR-22)
- Movement history view per pond (FAR-28)
- Buy/Sell entry + summary dashboard (FAR-34)

### Notes
- Backend dependency: API v0.1.0
- Built against React (TBD bundler/version)

---

## How to update this file

1. While working on a Linear issue, append your change under `[Unreleased]` in the appropriate category (Added / Changed / Fixed / Removed).
2. Each entry: `- Short description (FAR-N)`.
3. On release day, move all `[Unreleased]` entries under a new version heading with the date, then leave `[Unreleased]` empty.
4. Bump `package.json` version to match.

## Categories

- **Added** — new features for users
- **Changed** — changes in existing functionality (visible to users)
- **Deprecated** — features marked for removal in a future version
- **Removed** — features removed in this release
- **Fixed** — bug fixes
- **Security** — vulnerability fixes
