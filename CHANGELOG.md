# Changelog

All notable changes to ITI Companion are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

ITI Companion is an unofficial app and is not affiliated with the Information
Technology Institute.

## [0.2.0] — 2026-11-04

### Added

- **Phase outcome chips.** The Progress card now states the result of every
  phase instead of a dash: **PASSED** (green), **PENDING** (gray, current phase
  result not announced yet), **NEXT UP** (sky blue), **NOT ACCEPTED** (red) and
  **WAITING LIST** (white with dark text, for applicants moved to the waiting
  list at the final phase).
- **Status dots.** Completed phases get a green dot (including waitlisted ones),
  failed phases a red dot, and phases that have not happened yet stay gray.
- **DOM capture fallback.** The dashboard can now be filled from the visible
  Acceptance Phases page when the site's API responses never reach the WebView.
  The injected script reads only what is on screen and never touches form
  fields.
- **Date parser for the site's own wording.** Dates such as `12 Nov 2026`,
  `12/11/2026 14:30` and ISO timestamps are understood, so exam reminders and
  the "When" field work even when the portal exposes no machine-readable date.
- `CHANGELOG.md` and per-release notes for GitHub Releases.

### Changed

- The "next exam" card shows the date exactly as the portal prints it when that
  wording is available.
- Progress rows keep the current phase name in bold, while the result is shown
  as a compact rounded chip.
- Moving to a different phase clears the previous phase's status and sessions,
  so stale dates cannot be shown as upcoming.

### Fixed

- Dashboard stayed empty on devices where the ITI API calls are not observable
  from the WebView; the progress page itself is now a data source.
- Reminders were skipped when a captured session had only a human-readable date.
- Android local builds on Windows failed in `react-native-worklets` with
  `ninja: error: mkdir(...): No such file or directory`. The Windows CMake
  plugin now also recognises `build.gradle.kts`, and the unused optional peers
  `react-native-reanimated` / `react-native-worklets` are excluded from
  autolinking.

### Performance and size

- Release builds target `arm64-v8a` only instead of four CPU architectures.
- R8 minification, resource shrinking, JS bundle compression, legacy native
  library packaging, and disabled GIF/WebP decoders.
- Typical signed release APK: about **11.6 MB**, down from roughly 25 MB.

### Notes

- Minimum supported Android version is set by Expo SDK 58 / React Native 0.88.
- This release still requires signing in on `identity.iti.gov.eg`; the app does
  not store credentials.

## [0.1.0] — 2026-10-29

### Added

- First public preview.
- Read-only mobile layout for the ITI applicant portal, injected into the
  existing WebView session.
- Native home dashboard with the current phase, next exam, countdown, location
  and captured status.
- Local exam reminders scheduled 24 hours and 2 hours before a captured session.
- Offline snapshot of phase, exam dates and progress stored on the device.
- Configurable support links and an unofficial-app disclaimer.

[0.2.0]: https://github.com/Y0ung-Phara0h/iti-companion/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Y0ung-Phara0h/iti-companion/releases/tag/v0.1.0
