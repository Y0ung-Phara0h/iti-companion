# ITI Companion 0.2.0

An unofficial Android companion for ITI applicants. Not affiliated with the
Information Technology Institute.

## What's new

### Progress at a glance

Every phase in the Progress card now shows its result as a colored chip:

| Chip                     | Meaning                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| **PASSED** (green)       | Phase completed successfully                                         |
| **PENDING** (gray)       | Current phase, result not announced yet                              |
| **NEXT UP** (sky blue)   | The phase that comes after the current one                           |
| **NOT ACCEPTED** (red)   | Phase failed or the applicant was rejected                           |
| **WAITING LIST** (white) | Accepted, but placed on the waiting list (typically the final phase) |

The dot next to each row follows the same logic: green for completed phases
(including waitlisted), red for failed, gray for phases still ahead.

### The dashboard fills even when the API is quiet

Some devices never see the portal's API responses inside the WebView. The app
now also reads the visible Acceptance Phases page — phase, note, phase rail and
the next session — so Home is populated after you open that page, even if
Settings → Diagnostics reports `0 API responses`.

The capture is read-only: it never modifies the page and never reads form
fields or credentials.

### Better dates and reminders

The app understands the dates the portal actually prints (`12 Nov 2026`,
`12/11/2026 14:30`, ISO). Reminders no longer require a hidden timestamp, and
the "When" field shows the portal's own wording when available.

### Much smaller download

- `arm64-v8a` only, instead of four CPU architectures
- R8 minification and resource shrinking
- Compressed JS bundle and native libraries

The release APK is now about **11.6 MB** (previously ~25 MB).

### Build fixes

- Windows local builds no longer fail inside `react-native-worklets`; the
  unused optional peers are excluded from Android autolinking.
- The Windows CMake path plugin now handles Kotlin DSL (`build.gradle.kts`).

## Install

1. Download `iti-companion-0.2.0.apk`.
2. Allow installation from this source if Android asks.
3. Open the app, sign in on the official `identity.iti.gov.eg` page, then open
   **Application → Acceptance Phases** once so the dashboard can fill.

If an older build with a different signing key is installed, uninstall it
first — Android refuses to upgrade across keys.

## Known limitations

- `arm64-v8a` only: the APK will not install on old 32-bit phones or most
  emulators. Build with `-PreactNativeArchitectures=arm64-v8a,x86_64` if you
  need an emulator.
- Google sign-in may be blocked inside embedded WebViews; use the ITI
  credentials instead.
- The app is unofficial. Always confirm dates and results on the official
  portal.

## Verification

```text
SHA-256: C3D3C0610599A8AE6DEEE30A2BDD2BEF42334481B8CDCA0A150D227694F0D939
```

Full changelog: [`CHANGELOG.md`](../CHANGELOG.md)
