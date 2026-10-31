# Project map and CSS guide

This document is the "where is it?" reference for ITI Companion. It covers the repository
layout, the injected stylesheet section by section, the DOM markers the script adds, and the
parts you must not touch unless you also change the code that depends on them.

> Line numbers refer to `app/src/lib/mobile-css.ts` as of this commit. They shift when the
> file is edited — use the banner comments (`/* ---- app shell --- */`, etc.) to relocate a
> section, then search for the selector text.

---

## 1. Repository layout

```
ITI_Progressive_Web_App_(PWA)/
├── README.md                     GitHub front page
├── LICENSE                       GNU GPL v3 full text
├── PLAN.md                       Architecture research, options and decision log
├── Final_icon@1x.png             source artwork for the launcher icon
├── docs/
│   ├── PROJECT_MAP.md            this file
│   ├── BUILD_AND_MAINTAIN.md     builds, stores, future work, troubleshooting
│   ├── PRIVACY.md                store privacy policy template
│   └── screenshots/              phone-width captures used in the README
└── app/                          the Expo application
```

---

## 2. Application source map

All paths below are relative to `app/`.

| Path                              | Responsibility                                                                                                                    | Touch it when…                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `src/app/_layout.tsx`             | Root stack, notification handler, deep link to the Application tab                                                                | You add a new top-level route or change notification behaviour |
| `src/app/(tabs)/_layout.tsx`      | Bottom tab bar (Home / Application)                                                                                               | You add or rename a tab                                        |
| `src/app/(tabs)/index.tsx`        | Native Home dashboard: phase, next exam, countdown, progress, support card                                                        | You change dashboard content or layout                         |
| `src/app/(tabs)/site.tsx`         | WebView host: URL loading, toolbar, back handling, message bridge, logout                                                         | You change navigation, injection wiring or the bridge          |
| `src/app/settings.tsx`            | Settings: notifications, display, diagnostics, captured data, sign-out, support                                                   | You add a setting or diagnostic field                          |
| `src/components/ui.tsx`           | Design-system primitives: `Card`, `Pill`, `PrimaryButton`, `SecondaryButton`, `Field`, `SectionTitle`                             | You change a shared control                                    |
| `src/components/support-card.tsx` | "Free forever" card used on Home and Settings                                                                                     | You change the support copy or buttons                         |
| `src/lib/config.ts`               | ITI URLs, host allowlist, capture regex, `SUPPORT` links                                                                          | You change a URL, the API allowlist or support links           |
| `src/lib/injected.ts`             | Script injected into every page: overlay hiding, page marker, brand, phase numbering, login hint, diagnostics, read-only observer | You change DOM behaviour or capture plumbing                   |
| `src/lib/mobile-css.ts`           | The entire phone stylesheet for the portal and login page                                                                         | You change how the ITI site looks                              |
| `src/lib/adapter.ts`              | Tolerant JSON → `Summary` mapper                                                                                                  | You learn real API field names                                 |
| `src/lib/storage.ts`              | SecureStore summary (chunked) + AsyncStorage settings                                                                             | You add a cached field or setting                              |
| `src/lib/notifications.ts`        | Permission, Android channel, T-24 h / T-2 h reminders                                                                             | You change reminder timing                                     |
| `src/lib/store.tsx`               | React context: summary, settings, captures, diagnostics, reload/logout coordination                                               | You add app-wide state                                         |
| `src/lib/types.ts`                | `Summary`, `ExamSession`, `ProgressItem`, `Settings`, `WebViewDiagnostic`                                                         | You add a data field                                           |
| `src/lib/theme.ts`                | Native colours, spacing and radius tokens                                                                                         | You adjust the native palette                                  |
| `src/lib/nav.ts`                  | Small navigation helpers                                                                                                          | You add a navigation shortcut                                  |
| `tools/qa-server.mjs`             | Serves the generated CSS and mocks at `127.0.0.1:8787`                                                                            | You iterate on CSS without a device                            |
| `tools/mock/progress.html`        | DOM replica of the authenticated progress page                                                                                    | You test progress-page CSS                                     |
| `tools/har-shape.mjs`             | HAR → keys/types only, safe to share                                                                                              | You improve the adapter                                        |

### Runtime data flow

```
ITI portal (inside WebView)
        │
        │  document-start / load injection
        ▼
src/lib/injected.ts ──adds──► html.iti-app + data-iti-page
        │                     <style id="iti-companion-style"> (mobile-css.ts)
        │                     .iti-app-brand, data-iti-step, data-iti-empty, …
        │
        │  fetch / XHR response clone (allowlist only)
        ▼
ReactNativeWebView.postMessage({ type: 'api' | 'diag' })
        │
        ▼
src/app/(tabs)/site.tsx  onMessage
        │
        ├── type 'diag' ──► store.diagnostic ──► Settings screen
        └── type 'api'  ──► store.capture ──► adapter.mergeSummary
                                               │
                                               ▼
                                     SecureStore (chunked) + Home UI
```

---

## 3. CSS architecture

`mobile-css.ts` exports one template string (`MOBILE_CSS`) that is injected into a
`<style id="iti-companion-style">` element. Three rules keep it safe:

1. **Everything is inside `@media (max-width: 900px)`.** Desktop mode forces a 1280 px
   viewport, which never matches, so the site is untouched when the user asks for desktop.
2. **Everything is gated by `html.iti-app`.** The class is added by `markDocument()` on every
   injection pass (the document-start pass on Android can run before `<html>` exists).
3. **Each page is gated by `data-iti-page`.** `internal` targets the Angular portal;
   `identity` targets the IdentityServer login page. Selectors never leak between them.

The sheet sets `html.iti-app { font-size: 62.5% }`. Browsers default to 16 px, so this is
effectively **10 px**: the site uses `rem` units, and every page scales proportionally.
**Changing that one value rescales every page** (the WebView self-check reports the computed
value, normally `10px`).

Declarations end in `!important` on purpose: the portal ships its own CSS and Angular inline
styles, and the injected sheet must win regardless of load order. Removing `!important` from
a rule usually makes the rule silently stop working.

---

## 4. CSS section map (`app/src/lib/mobile-css.ts`)

The prefix `html.iti-app[data-iti-page="internal"] ` (or `"identity"`) is omitted from the
selector column to keep the tables readable. Add it back when searching.

### 4.1 Base and gates — lines 11–33

| Selector                          | Line | Controls                                                           |
| --------------------------------- | ---- | ------------------------------------------------------------------ |
| `html.iti-app`                    | 12   | Root font size (`10px`), text rendering, horizontal overflow guard |
| `html.iti-app body`               | 18   | Body width, margins, background                                    |
| `html.iti-app img, iframe, video` | 23   | Maximum width of media                                             |
| `html.iti-app table`              | 28   | Table width / wrapping                                             |

### 4.2 App shell — lines 34–105

| Selector                                                                                                               | Line | Controls                                                         |
| ---------------------------------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------- |
| `.admin-layout__side-menu`, `.admin-layout__control`, `.admin-layout__control-arrow`, `.admin-layout__brand-container` | 35   | **Hides the drawer, its collapse arrow and the old brand block** |
| `.admin-layout__container`                                                                                             | 41   | Full-width container                                             |
| `.admin-layout__header`                                                                                                | 45   | Header position, height, padding                                 |
| `.admin-layout__body`                                                                                                  | 54   | Main content area width and padding                              |
| `.header`                                                                                                              | 59   | Header row layout                                                |
| `.iti-app-brand`                                                                                                       | 66   | Injected logo + name lockup                                      |
| `.iti-app-brand img`                                                                                                   | 76   | Logo size                                                        |
| `.iti-app-brand span`                                                                                                  | 82   | Wordmark typography                                              |
| `.action-menu`                                                                                                         | 93   | Top-right account menu                                           |
| `.action-menu__item`                                                                                                   | 97   | Account menu items                                               |
| `.admin-layout__copyright`                                                                                             | 100  | Footer line                                                      |

The logo in `.iti-app-brand` is created in `injected.ts → ensureBrand()`. It is the only DOM
element the app adds to the portal chrome.

### 4.3 Page headings — lines 106–131

| Selector                                                  | Line | Controls                 |
| --------------------------------------------------------- | ---- | ------------------------ |
| `.page-header`                                            | 107  | Page title block spacing |
| `.page-header__title-section`, `.page-header__title-data` | 114  | Title flex layout        |
| `.page-header__title`                                     | 118  | Title size and wrapping  |
| `.page-header__title-data span`                           | 125  | Title metadata           |

### 4.4 Application stepper and tabs — lines 132–190

| Selector                              | Line | Controls                                 |
| ------------------------------------- | ---- | ---------------------------------------- |
| `.tabs`                               | 133  | Tab strip container                      |
| `.tabs__header`                       | 137  | Tab header border                        |
| `.tabs__container`                    | 140  | Horizontal scroll, snap                  |
| `.tabs__container::-webkit-scrollbar` | 152  | Hides the scrollbar                      |
| `.tabs__tab`                          | 155  | Tab pill spacing                         |
| `.stepper`                            | 161  | Wraps the five steps onto multiple lines |
| `.stepper__item`                      | 171  | Individual step                          |
| `.stepper__item-title`                | 176  | Step label                               |
| `.stepper__item-order`                | 181  | Step number bubble                       |
| `.stepper__item-arrow`                | 186  | Arrow between steps                      |

### 4.5 Progress overview (phase rail) — lines 191–337

| Selector                                                      | Line | Controls                                     |
| ------------------------------------------------------------- | ---- | -------------------------------------------- |
| `.application-progress`                                       | 192  | Page grid → single column                    |
| `.application-progress__info-section`                         | 200  | Detail panel, ordered **after** the rail     |
| `.application-progress__applicant-action-batchs-section`      | 209  | Phase rail, ordered **first**                |
| `.application-progress__applicant-action-batchs-section > h2` | 216  | "Your phases" heading                        |
| `.applicant-action-batch-list`                                | 226  | Horizontal snap scroller                     |
| `.applicant-action-batch-list::-webkit-scrollbar`             | 237  | Hides the scrollbar                          |
| `.applicant-action-batch-list__action-batch`                  | 242  | Snap item wrapper and width                  |
| `cm-applicant-action-batch-item`                              | 248  | Angular host element                         |
| `.applicant-action-batch-item`                                | 252  | Phase card background, radius, padding       |
| `.applicant-action-batch-item::before`                        | 275  | Left colour accent bar (`--iti-phase-color`) |
| `.applicant-action-batch-item::after`                         | 284  | Number badge                                 |
| `.applicant-action-batch-item > span:first-child`             | 300  | Phase name                                   |
| `.applicant-action-batch-item > span + span`                  | 308  | Phase status                                 |
| `.applicant-action-batch-item.active`                         | 322  | Selected phase                               |
| `.applicant-action-batch-item.active::after`                  | 329  | Selected number badge                        |
| `.applicant-action-batch-item.active > span + span`           | 333  | Selected status text                         |

The number in `::after` comes from the `data-iti-step` attribute set by
`injected.ts → decorateProgress()`. The accent colour comes from `--iti-phase-color`, copied
from Angular's inline background before the rule neutralises it.

### 4.6 Batch details — lines 338–595

| Selector                                                                      | Line | Controls                                          |
| ----------------------------------------------------------------------------- | ---- | ------------------------------------------------- |
| `.applicant-action-batch-details`                                             | 339  | Flex column for visual ordering                   |
| `.applicant-action-batch-details__title`                                      | 346  | Title row                                         |
| `.applicant-action-batch-details__action-batch-name`                          | 354  | Batch name typography                             |
| `.applicant-action-batch-details__action-batch-right-section`                 | 361  | Status + exam button group                        |
| `cm-badge`                                                                    | 368  | Badge host                                        |
| `cm-badge .surface`, `cm-badge .surface__content`                             | 374  | Badge surface reset                               |
| `cm-badge .badge__text`                                                       | 381  | Badge pill                                        |
| `.applicant-action-batch-details__action-batch-note`                          | 391  | Informational note box                            |
| `.…__action-batch-step`, `.…__dress-code`, `.…__actions`                      | 407  | Shared full-width reset                           |
| `.…__dress-code`                                                              | 416  | `order: 2` (after the note)                       |
| `.…__action-batch-step`                                                       | 419  | `order: 3`                                        |
| `.…__actions`                                                                 | 422  | `order: 4`                                        |
| `.action-batch-step-item`, `.action-step-item`                                | 428  | Dark "current step" tile                          |
| `.action-batch-step-item__header`, `.action-step-item__header`                | 441  | Tile header                                       |
| `.action-batch-step-item__name`, `.action-step-item__name`                    | 455  | Tile name                                         |
| `.action-batch-step-item__data`, `.action-step-item__data`                    | 461  | Tile data grid                                    |
| `.action-batch-step-item__image-section`, `.action-step-item__image-section`  | 469  | Illustration column                               |
| `.action-batch-step-item__image`, `.action-step-item__image`                  | 477  | Illustration                                      |
| `.action-batch-step-item__description`, `.action-step-item__description`      | 485  | Tile body text                                    |
| `cm-dress-code-item`, `.dress-code`                                           | 500  | Dress-code card                                   |
| `.dress-code__image`                                                          | 509  | Dress illustration                                |
| `.dress-code__image[data-iti-empty]`                                          | 522  | **Hides the illustration when none was uploaded** |
| `.dress-code__info`                                                           | 525  | Text column                                       |
| `.dress-code__name`                                                           | 533  | "Dress code" label                                |
| `.dress-code__description`                                                    | 542  | Dress description                                 |
| `.dress-code__dress`                                                          | 554  | Dress container                                   |
| `.dress-code__tops`, `.dress-code__bottoms`                                   | 564  | Top/bottom groups                                 |
| `.dress-code__tops > h6:first-child`, `.dress-code__bottoms > h6:first-child` | 572  | Group labels                                      |
| `.dress-code__top`, `.dress-code__bottom`                                     | 583  | Individual items                                  |

**Visual order on the page:** title → note → dress code → step details → action tabs/card.
This is done with `order` on a flex parent, not by moving DOM nodes, so Angular's bindings
keep working.

### 4.7 Action card (exam/interview details) — lines 596–708

| Selector                                             | Line | Controls             |
| ---------------------------------------------------- | ---- | -------------------- |
| `.applicant-action-batch-action-list__tab`           | 597  | Action tab           |
| `.applicant-action-batch-action-list__tab.active`    | 613  | Selected tab         |
| `.applicant-action-batch-action-list .tabs__header`  | 618  | Tab header           |
| `.applicant-action-batch-action-list .tabs__content` | 626  | Tab panel            |
| `.applicant-action-batch-action-item`                | 630  | Action card          |
| `.applicant-action-batch-action-item__title`         | 641  | Card title row       |
| `.applicant-action-batch-action-item__name`          | 648  | Action name          |
| `.applicant-action-batch-action-item__description`   | 655  | Description          |
| `.applicant-action-batch-action-item__info`          | 662  | Metadata block       |
| `.…__action-step`, `.…__action`                      | 669  | Action body          |
| `.…__action`                                         | 674  | Action button/text   |
| `.…__attandance` (ITI's spelling)                    | 679  | Attendance block     |
| `.…__attandance-title`                               | 686  | Attendance label     |
| `.…__session-body`                                   | 691  | Session details      |
| `.…__session-time`, `.…__session-location`           | 698  | Time / location rows |
| `.…__session-exam-link`                              | 704  | Exam link            |

> ITI spells it `attandance`. Do not "fix" it: the CSS must match the real class name.

### 4.8 Home page — lines 709–952

| Selector                                                           | Line | Controls                                          |
| ------------------------------------------------------------------ | ---- | ------------------------------------------------- |
| `.home`                                                            | 710  | Page wrapper                                      |
| `.home__body`                                                      | 713  | Single-column body                                |
| `.home__data`                                                      | 720  | Program/intake data block                         |
| `.home__intake`                                                    | 729  | Intake card                                       |
| `.home__program`                                                   | 740  | Program card                                      |
| `.home__program-header`                                            | 750  | Header row                                        |
| `.home__program-title`                                             | 757  | Program title                                     |
| `.home__program-header cm-button`, `.home__program-header .button` | 765  | "Apply and manage" button                         |
| `.home__program-info`                                              | 775  | Program metadata                                  |
| `.home__program-icon`                                              | 781  | Program icon                                      |
| `.home__intake-info`                                               | 784  | Intake metadata                                   |
| `.home__intake-title`                                              | 793  | Intake title                                      |
| `.home__intake-date`                                               | 799  | Date row (stacked)                                |
| `.home__intake-date-title`                                         | 807  | Date label                                        |
| `.home__intake-date-info`                                          | 819  | Date value                                        |
| `.home__program-description`                                       | 825  | Description                                       |
| `.home__process`                                                   | 832  | Applying-process block                            |
| `.home__process > h1`                                              | 841  | Process heading                                   |
| `.process-list`                                                    | 848  | Process grid                                      |
| `.process-list__process-item` + card internals                     | 855  | Process card reset (many Angular `cm-*` wrappers) |
| `.process-list__process-item .surface`                             | 870  | Surface reset                                     |
| `.process-list__process-item .card__container`                     | 873  | Container reset                                   |
| `.process-item__body`                                              | 876  | Card body                                         |
| `.process-item__title-section`                                     | 882  | Title + number row                                |
| `.process-item__order`                                             | 890  | Step number                                       |
| `.process-item__title`                                             | 895  | Step title                                        |
| `.process-item__requirements`                                      | 902  | Requirements list                                 |
| `.process-item__requirement`                                       | 908  | Requirement item                                  |
| `.home__left-side`                                                 | 913  | Left column                                       |
| `.home__intro`                                                     | 919  | Intro text                                        |
| `.home__help`                                                      | 928  | Help card                                         |
| `.home__help h1`                                                   | 935  | Help heading                                      |
| `.home__contacts`                                                  | 941  | Contact list                                      |
| `.home__contact`                                                   | 947  | Contact row                                       |

### 4.9 Login page — lines 953–end

| Selector                                                                                        | Line | Controls                            |
| ----------------------------------------------------------------------------------------------- | ---- | ----------------------------------- |
| `html.iti-app[data-iti-page="identity"]`, `… body`                                              | 954  | Login page background and font size |
| `.master`                                                                                       | 959  | Full-height centring container      |
| `.master__card`                                                                                 | 969  | Login card width, radius, shadow    |
| `.master__header`                                                                               | 982  | Card header                         |
| `.master__header-logo`                                                                          | 987  | Header logo                         |
| `.master__content`                                                                              | 993  | Card content                        |
| `.master__brand`                                                                                | 999  | **Hides the building illustration** |
| `.master__body`                                                                                 | 1002 | Body padding                        |
| `.login`                                                                                        | 1005 | Form wrapper                        |
| `.login__title`                                                                                 | 1011 | "Log In" title                      |
| `.login__form`                                                                                  | 1019 | Form layout                         |
| `.form-floating`                                                                                | 1024 | Floating-label wrapper              |
| `.form-control`                                                                                 | 1028 | Input size, border, radius          |
| `.form-control:focus`                                                                           | 1040 | Focus ring                          |
| `.form-floating > .form-label`                                                                  | 1045 | Label position                      |
| `.form-floating > .form-control:focus ~ .form-label`, `…:not(:placeholder-shown) ~ .form-label` | 1056 | Floating label state                |
| `.login__remember-me`                                                                           | 1063 | Remember-me row                     |
| `.login__remember-me input[type="checkbox"]`                                                    | 1070 | Checkbox                            |
| `.login__remember-me .form-label`                                                               | 1076 | Checkbox label                      |
| `.login__submit`                                                                                | 1081 | Login button                        |
| `.login__submit:active`                                                                         | 1094 | Button press                        |
| `.login__links`                                                                                 | 1097 | Links row                           |
| `.login__link`                                                                                  | 1105 | Individual link                     |
| `.login__external-container`                                                                    | 1112 | External providers block            |
| `.login__external-title`                                                                        | 1117 | Providers title                     |
| `.login__externals`                                                                             | 1124 | Providers row                       |
| `.login__external`                                                                              | 1129 | Provider button                     |
| `.login h3`                                                                                     | 1139 | Help heading                        |
| `.login h4`                                                                                     | 1146 | Help subheading                     |
| `.login__newTicket`                                                                             | 1151 | Support-ticket link                 |
| `.text-danger`                                                                                  | 1155 | Validation messages                 |

The floating labels only work because `injected.ts → decorateLogin()` adds
`placeholder=" "` to every `.login .form-control`. Without it,
`:not(:placeholder-shown)` never matches and the label overlaps typed text.

### 4.10 Key values at a glance

| Value                 | Where            | Why it matters                                             |
| --------------------- | ---------------- | ---------------------------------------------------------- |
| `max-width: 900px`    | line 11          | The only width where any of this applies                   |
| `font-size: 62.5%`    | line 13          | Root = 10 px; every `rem` below depends on it              |
| `1.4rem / 2.1rem`     | line 19          | Base body text                                             |
| `5.6rem`              | lines 48, 55, 63 | Header height and the body offset that matches it          |
| `1.2rem` page padding | line 56          | Content inset on the portal                                |
| `3rem`                | line 78          | Header logo height                                         |
| `13.5rem`             | line 84          | Max width of the injected wordmark                         |
| `15.4rem`             | lines 243–244    | Phase-card width; the rail scroller sizes itself from this |
| `7.6rem`              | line 259         | Minimum phase-card height                                  |
| `1.4rem`              | line 267         | Phase-card radius                                          |
| `0.45rem`             | line 281         | Phase accent bar width                                     |
| `42rem`               | line 973         | Login card max width (fits a 360–412 px phone)             |
| `2rem`                | line 978         | Login card radius                                          |
| `4.2rem`              | line 988         | Login header logo height                                   |

Values not listed are in the rule at the line shown in the tables above. Prefer editing the
declaration rather than adding an override later in the file; duplicate selectors make the
cascade hard to reason about.

---

## 5. DOM markers added by `injected.ts`

| Marker                                   | Added by             | Consumed by                          | Notes                                                          |
| ---------------------------------------- | -------------------- | ------------------------------------ | -------------------------------------------------------------- |
| `html.iti-app`                           | `markDocument()`     | every CSS rule                       | Must exist or the whole sheet is inert                         |
| `data-iti-page="internal" \| "identity"` | `markDocument()`     | every page-gated rule                | Recomputed from `location.hostname` on every pass              |
| `<style id="iti-companion-style">`       | `ensureStyle()`      | the page                             | Re-appended on load so it wins the cascade                     |
| `.iti-app-brand`                         | `ensureBrand()`      | shell CSS                            | Injected as the first child of `.admin-layout__header .header` |
| `data-iti-step="1…n"`                    | `decorateProgress()` | phase-card `::after`                 | Position in the rail                                           |
| `--iti-phase-color`                      | `decorateProgress()` | phase-card `::before`                | Copied from Angular's inline background                        |
| `data-iti-empty`                         | `decorateProgress()` | `.dress-code__image[data-iti-empty]` | Set when no illustration is uploaded                           |
| `data-iti-watched`                       | `watchLogin()`       | login form                           | Prevents duplicate submit listeners                            |
| `iti-login-submitted`                    | `watchLogin()`       | `sessionStorage`                     | Round-trip flag for the login notice                           |
| `#iti-login-hint`                        | `watchLogin()`       | —                                    | Inline notice element                                          |
| `window.__itiCompanionPatched`           | script               | script                               | Keeps fetch/XHR patched once                                   |

---

## 6. Native theming and copy

| What                                   | Where                                                                                                                                                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native accent red, navy, text, borders | `src/lib/theme.ts` → `colors`                                                                                                                                                                                     |
| Native spacing / radii                 | `src/lib/theme.ts` → `spacing`, `radius`                                                                                                                                                                          |
| Portal red used by injected CSS        | `mobile-css.ts`, search `#c82333` (and `#a31524`)                                                                                                                                                                 |
| Portal phase colours                   | Inline styles from Angular, copied to `--iti-phase-color`; fallback is in `.applicant-action-batch-item`                                                                                                          |
| App name, icon, permissions, package   | `app.json`                                                                                                                                                                                                        |
| App icon assets                        | `app/assets/icon.png` (1024, launcher), `app/assets/android-icon-foreground.png` (adaptive, transparent, artwork scaled to ~63% so it fits the circular mask over `#20202D`), `app/assets/favicon.png` (web only) |
| Support copy and buttons               | `src/components/support-card.tsx` + `SUPPORT` in `src/lib/config.ts`                                                                                                                                              |
| Support URLs                           | `SUPPORT.kofiUrl`, `SUPPORT.bmcUrl` in `src/lib/config.ts`                                                                                                                                                        |
| Disclaimer text                        | `src/app/(tabs)/index.tsx` (bottom) and `src/app/settings.tsx` (About)                                                                                                                                            |
| Login-failure notice text              | `injected.ts → watchLogin()`                                                                                                                                                                                      |
| Target URLs and API allowlist          | `src/lib/config.ts`                                                                                                                                                                                               |

---

## 7. Safe to edit vs. do not touch

### Safe

- Text, labels and layout inside native screens.
- Colours and spacing in `src/lib/theme.ts`.
- Declarations inside existing rules in `mobile-css.ts`.
- **New** rules appended inside the media query, fully gated:
  ```css
  html.iti-app[data-iti-page="internal"] .some-class {
    /* … */
  }
  ```
- `SUPPORT` links, app version and `versionCode`.
- README/docs and the QA mock.

### Change only with the matching JavaScript

| If you rename…          | Also update                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `iti-app`               | `markDocument()` and every gate in `mobile-css.ts`           |
| `data-iti-page` values  | `pageType()`, `markDocument()` and the CSS gates             |
| `iti-companion-style`   | `ensureStyle()`, `reportDiagnostic()`                        |
| `__itiCompanionPatched` | the duplicate-run guard at the bottom of the script          |
| `data-iti-step`         | `decorateProgress()` + `.applicant-action-batch-item::after` |
| `--iti-phase-color`     | `decorateProgress()` + `::before`                            |
| `data-iti-empty`        | `decorateProgress()` + the hiding rule                       |
| `.iti-app-brand`        | `ensureBrand()` + shell CSS                                  |
| `data-iti-watched`      | `watchLogin()`                                               |
| `iti-login-submitted`   | `watchLogin()`                                               |
| a CSS class from ITI    | the selector **and** the section tables above                |

### Do not

- **Do not remove `!important`** from portal rules to "clean up". ITI's stylesheet and inline
  styles will win.
- **Do not gate CSS on a single early injection pass.** Android can run the document-start
  script before `<html>` exists; the retry logic is what makes styling work at all.
- **Do not change the WebView origin or user agent.** Cookies, OIDC redirects, uploads and
  CORS depend on staying on `*.iti.gov.eg`.
- **Do not read the password field, persist cookies or log captured bodies.** The privacy
  promise and the stores' data-safety forms depend on it.
- **Do not commit `app/android/` or `app/ios/`.** They are generated by Expo CNG; configure
  native behaviour in `app.json` / config plugins.
- **Do not add remote code or `eval` of network content** to the injected script.
- **Do not edit `app/node_modules/` or `app/dist/`.** Both are generated.
- **Do not rename `attandance`.** That is ITI's spelling in the DOM.

### Crash and regression checklist

Before merging a change:

1. `npx tsc --noEmit`
2. `npx expo lint`
3. `npx expo export --platform android`
4. Open Home, Settings and the Application tab on a device.
5. Settings → Diagnostics: marker `iti-app set`, stylesheet `injected`, root font `10px`.
6. Open the progress page (or `tools/mock/progress.html` at 384 px) and the login page.
7. Verify no horizontal scrolling and no blank/hidden content.

`injected.ts` is a **string** evaluated by the WebView, so TypeScript does not check it. Keep
it conservative (ES5-style `var`/`function`, no top-level `await`), guard every DOM access,
and make every decorator idempotent. A syntax error there does not fail the build — it fails
silently on the phone.

---

## 8. Recipes

### Hide one more element on the portal

Add its class to the hide list in `mobile-css.ts` (line 35), or append:

```css
html.iti-app[data-iti-page="internal"] .the-class {
  display: none !important;
}
```

If Angular re-creates the element, verify with the MutationObserver (it re-runs `decorate()`
on DOM changes).

### Change the phase-card design

1. `decorateProgress()` supplies `data-iti-step` and `--iti-phase-color`.
2. Edit `.applicant-action-batch-item` and its `::before` / `::after` rules (lines 252–336).
3. Keep the rail width on `.applicant-action-batch-list__action-batch`; the scroller sizes
   itself from that element.

### Style a page that is not covered yet

1. Open the page on desktop, copy a stable class from DevTools.
2. Add a section banner + gated rules inside the media query.
3. Add the class to the section table in this document.
4. Test at 384 px with `node tools/qa-server.mjs` if the page needs a login.

### Add a support link

In `app/src/lib/config.ts`:

```ts
export const SUPPORT = {
  kofiUrl: "https://ko-fi.com/your-name",
  bmcUrl: "https://buymeacoffee.com/your-name",
};
```

The card filters empty values, so one, both or neither can be configured. No other file needs
to change.

### Change the capture allowlist

Edit `CAPTURABLE_API` in `src/lib/config.ts`. Keep it anchored to the ITI gateway and the
specific resource families; broaden it only after checking the privacy implications. Then
update `adapter.ts` if the new payload should appear on Home.
