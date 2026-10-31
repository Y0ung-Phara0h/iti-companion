# Privacy policy — ITI Companion

**Effective date:** _add the publication date_
**App:** ITI Companion (`com.iticompanion.mobile`)
**Maintainer:** Y0ung-Phara0h
**Source code:** _add your GitHub repository URL_

> Template for publishing. Replace the italic placeholders and host this page at a public
> URL before submitting to Google Play or any other store. It describes exactly what the
> shipped app does; update it if the app starts collecting anything new.

## Summary

ITI Companion is an unofficial, free and open-source Android app that shows the ITI
applicant portal in a phone-friendly WebView and adds a native dashboard. **The app does not
collect analytics, does not show ads and does not have user accounts of its own.**

## What the app does not collect

- No name, email, phone number or password is requested by the app.
- No password field is read, stored or transmitted by the app.
- No cookies, tokens, raw API responses or browsing history are stored by the app.
- No analytics, advertising, crash-reporting or attribution SDK is included.
- No data is sold or shared with third parties.

## What stays on your device

- **ITI session cookies.** The portal runs inside an embedded browser, so the ITI identity
  server sets its own session cookies exactly as it would in Chrome. They stay in the app's
  WebView cookie jar and survive app restarts until you sign out.
- **A small summary.** Applicant name/id, current phase and status, exam sessions (title,
  start time, location, status) and a short progress list are cached in Android's encrypted
  storage (`expo-secure-store`).
- **Settings.** Display preferences and notification toggles are stored with
  `AsyncStorage` on the device.
- **Reminder schedule.** Exam reminders are scheduled locally by Android; no server is
  involved.

You can delete the summary, settings and scheduled reminders at any time with **Settings →
Clear cached data**. **Settings → Sign out** opens the official ITI logout page and clears
the WebView session.

## Network requests

The app loads pages and API calls directly from ITI hosts (`*.iti.gov.eg`). Those requests are
subject to ITI's own privacy policy, not this one. The app also opens external links only
when you tap them (for example the ITI support portal or an optional tip page).

There is no backend operated by the maintainer, so no data is sent to the maintainer.

## Notifications

If you enable exam reminders, Android may ask for notification and exact-alarm permissions.
Reminders are generated on the device from the cached exam dates. You can turn them off in
the app or in Android settings.

## Children

The app is intended for ITI applicants and is not directed at children under 13.

## Open source

The source code is licensed under the GNU General Public License v3.0 or later. You can
inspect exactly what the app does, build it yourself and redistribute it under the same
license.

## Changes

If this policy changes, the new version will be published at the same URL with an updated
effective date. Material changes will also be noted in the app's release notes.

## Contact

Questions or removal requests: came_from_the_futrue@hotmail.com

## Disclaimer

ITI Companion is not affiliated with, endorsed by or operated by the Information Technology
Institute. "ITI" is used only to describe compatibility with the ITI applicant portal.
