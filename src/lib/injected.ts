import { MOBILE_CSS } from './mobile-css';

/**
 * Script injected into every document before the page's own scripts run.
 *
 * 1. Hides ITI's `.master__mobile` "open from PC" overlay (a CSS-only gate).
 * 2. Applies the phone stylesheet from `mobile-css.ts`.
 * 3. Adds small, non-destructive DOM markers the stylesheet needs (phase
 *    numbers, a header logo, login placeholders for floating labels).
 * 4. Optionally forces a 1280px desktop layout viewport.
 * 5. Observes (never modifies) a fixed allowlist of ITI API responses and
 *    forwards them to the native layer via ReactNativeWebView.postMessage.
 */
export function buildInjectedScript(desktopMode: boolean): string {
  return `
(function () {
  'use strict';

  var DESKTOP = ${desktopMode ? 'true' : 'false'};

  function pageType() {
    return String(location.hostname || '').toLowerCase().indexOf('identity.') === 0
      ? 'identity'
      : 'internal';
  }

  /**
   * Android runs the document-start injection from onPageStarted, before the
   * HTML parser has created <html>. The root element is null there, and the
   * old code swallowed that error once and never retried. Mark the root on
   * every pass (load, DOMContentLoaded, timer, mutation) instead.
   */
  function markDocument() {
    try {
      var root = document.documentElement;
      if (!root) return false;
      if (!root.classList.contains('iti-app')) root.classList.add('iti-app');
      var page = pageType();
      if (root.getAttribute('data-iti-page') !== page) {
        root.setAttribute('data-iti-page', page);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  markDocument();

  var CSS = ${JSON.stringify(MOBILE_CSS)};

  function ensureStyle(moveToEnd) {
    try {
      var style = document.getElementById('iti-companion-style');
      if (!style) {
        style = document.createElement('style');
        style.id = 'iti-companion-style';
        (document.head || document.documentElement).appendChild(style);
      }
      if (style.textContent !== CSS) style.textContent = CSS;

      // The document-start injection runs before the page's <link> tags are
      // parsed. Re-appending after DOM ready puts our sheet last in the
      // cascade, so page rules never win a tie against the overrides.
      var head = document.head;
      if (moveToEnd && head && style.parentNode !== head) head.appendChild(style);
    } catch (e) {}
  }

  ensureStyle(false);

  function hideBlocker() {
    var nodes = document.querySelectorAll('[class*="master__mobile"]');
    for (var i = 0; i < nodes.length; i += 1) {
      nodes[i].style.setProperty('display', 'none', 'important');
    }
    if (nodes.length) return;

    // Fallback for a future markup change: find the fixed full-screen layer
    // that contains the blocker message, but only scan when that text exists.
    var body = document.body;
    if (!body) return;
    if ((body.textContent || '').indexOf('Sorry Please Open From Pc') === -1) return;

    var divs = body.querySelectorAll('div');
    for (var j = 0; j < divs.length; j += 1) {
      var el = divs[j];
      if (el.children.length) continue;
      if (!/Sorry Please Open From Pc/i.test(el.textContent || '')) continue;
      var parent = el;
      while (parent && getComputedStyle(parent).position !== 'fixed') {
        parent = parent.parentElement;
      }
      if (parent) parent.style.setProperty('display', 'none', 'important');
    }
  }

  /**
   * The logo used to live in the always-open dark drawer. Put a compact
   * horizontal lockup in the real header instead, so hiding the drawer does
   * not remove the institution's identity from the page.
   */
  function ensureBrand() {
    if (pageType() !== 'internal') return;
    var header = document.querySelector('.admin-layout__header .header');
    if (!header || header.querySelector('.iti-app-brand')) return;

    var brand = document.createElement('a');
    brand.className = 'iti-app-brand';
    brand.href = '/home';
    brand.setAttribute('aria-label', 'ITI home');

    var logo = document.createElement('img');
    logo.src = 'https://internal.iti.gov.eg/assets/images/organization/iti-logo.png';
    logo.alt = '';
    logo.setAttribute('aria-hidden', 'true');

    var name = document.createElement('span');
    name.textContent = 'Information Technology Institute';

    brand.appendChild(logo);
    brand.appendChild(name);
    header.insertBefore(brand, header.firstChild);
  }

  /**
   * The phase rail is a list of <cm-applicant-action-batch-item> hosts whose
   * only child is an <h3>. Angular paints status colours as inline styles on
   * that h3; copy the colour to a custom property (for the accent bar) and tag
   * the card with its position before CSS neutralises the inline background.
   */
  function decorateProgress() {
    var items = document.querySelectorAll('cm-applicant-action-batch-item');
    for (var i = 0; i < items.length; i += 1) {
      var card = items[i].querySelector('.applicant-action-batch-item');
      if (!card) card = items[i].firstElementChild;
      if (!card) continue;

      if (!card.getAttribute('data-iti-step')) {
        card.setAttribute('data-iti-step', String(i + 1));
      }

      var inline = card.style && card.style.backgroundColor;
      if (inline) card.style.setProperty('--iti-phase-color', inline);
    }

    // The dress-code illustration is optional. Hide the empty box so the
    // card does not collapse into a tall white rectangle.
    var images = document.querySelectorAll('.dress-code__image');
    for (var j = 0; j < images.length; j += 1) {
      var bg = '';
      try {
        bg = getComputedStyle(images[j]).backgroundImage || '';
      } catch (e) {}
      if (!bg || bg === 'none' || /url\\(\\s*["']?\\s*["']?\\s*\\)/.test(bg)) {
        images[j].setAttribute('data-iti-empty', '');
      } else {
        images[j].removeAttribute('data-iti-empty');
      }
    }

    var heading = document.querySelector(
      '.application-progress__applicant-action-batchs-section > h2',
    );
    if (heading && /^progress:?$/i.test(String(heading.textContent || '').trim())) {
      heading.textContent = 'Your phases';
    }
  }

  /**
   * Bootstrap floating labels need a placeholder to detect "empty"; the ITI
   * login form ships without one, so typed text used to sit under the label.
   */
  function decorateLogin() {
    if (pageType() !== 'identity') return;
    var inputs = document.querySelectorAll('.login .form-control');
    for (var i = 0; i < inputs.length; i += 1) {
      if (!inputs[i].getAttribute('placeholder')) {
        inputs[i].setAttribute('placeholder', ' ');
      }
    }
  }

  /**
   * IdentityServer answers a rejected sign-in by re-rendering this page with
   * no message at all, so a failed attempt looks like a plain refresh. We
   * cannot make the server explain itself, but we can notice the round-trip:
   * a submit happened, and we are back on the login page.
   */
  function watchLogin() {
    if (pageType() !== 'identity') return;

    var form = document.getElementById('account');
    if (!form) return;

    var KEY = 'iti-login-submitted';

    if (!form.getAttribute('data-iti-watched')) {
      form.setAttribute('data-iti-watched', '1');
      form.addEventListener(
        'submit',
        function () {
          try {
            sessionStorage.setItem(KEY, String(Date.now()));
          } catch (e) {}
        },
        true,
      );
    }

    if (document.getElementById('iti-login-hint')) return;

    var submittedAt = 0;
    try {
      submittedAt = Number(sessionStorage.getItem(KEY) || 0);
    } catch (e) {}
    if (!submittedAt || Date.now() - submittedAt > 120000) return;

    // A failed POST returns this same page, so the referrer is the login URL.
    // Any other referrer means a fresh visit, not a rejected attempt.
    var referrer = String(document.referrer || '');
    if (referrer.toLowerCase().indexOf('/account/login') === -1) return;

    try {
      sessionStorage.removeItem(KEY);
    } catch (e) {}

    var hint = document.createElement('div');
    hint.id = 'iti-login-hint';
    hint.setAttribute('role', 'alert');
    hint.style.cssText = [
      'margin:0 0 1.6rem',
      'padding:1.2rem 1.4rem',
      'border:1px solid #f0c36d',
      'border-left:0.4rem solid #c82333',
      'border-radius:1rem',
      'background:#fff8e5',
      'color:#5c4300',
      'font-size:1.3rem',
      'line-height:1.9rem',
      'font-family:inherit',
      'text-align:left',
    ].join(';');
    hint.textContent =
      'The ITI login page reloaded without a message. If you were signing in, ' +
      'the site did not accept the username/email or password, and it does not ' +
      'show its own error. Check both fields, then try again.';

    form.parentNode.insertBefore(hint, form);
  }

  function decorate() {
    markDocument();
    hideBlocker();
    ensureBrand();
    decorateProgress();
    decorateLogin();
    watchLogin();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () {
      scheduled = false;
      decorate();
    }, 150);
  }

  // The WebView runs this script twice (document-start and on load). Only the
  // first pass may patch fetch/XHR and start timers, but both passes must make
  // sure the document is marked and the stylesheet is present: the first pass
  // can run before <html> exists.
  var apiPatched = !!window.__itiCompanionPatched;
  window.__itiCompanionPatched = true;

  function attachObserver() {
    try {
      new MutationObserver(schedule).observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    } catch (e) {}
  }

  decorate();

  var diagSent = false;
  function reportDiagnostic() {
    if (diagSent) return;
    diagSent = true;
    try {
      if (!window.ReactNativeWebView || !window.ReactNativeWebView.postMessage) return;
      var root = document.documentElement;
      var style = document.getElementById('iti-companion-style');
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'diag',
        page: pageType(),
        marked: !!(root && root.classList.contains('iti-app')),
        styled: !!(style && style.textContent && style.textContent.length > 100),
        rootFont: root ? getComputedStyle(root).fontSize : '',
        desktop: DESKTOP,
        href: String(location.href)
      }));
    } catch (e) {}
  }

  if (apiPatched) {
    ensureStyle(true);
    attachObserver();
    setTimeout(reportDiagnostic, 300);
    return true;
  }

  attachObserver();

  var onReady = function () {
    markDocument();
    ensureStyle(true);
    decorate();
    attachObserver();
    setTimeout(reportDiagnostic, 700);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
  window.addEventListener('load', onReady);

  var ticks = 0;
  var timer = setInterval(function () {
    decorate();
    ticks += 1;
    if (ticks > 40) clearInterval(timer);
  }, 250);

  if (DESKTOP) {
    var forceViewport = function () {
      try {
        var meta = document.querySelector('meta[name="viewport"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', 'viewport');
          var parent = document.head || document.documentElement;
          if (!parent) return;
          parent.appendChild(meta);
        }
        if (meta.getAttribute('content') !== 'width=1280') {
          meta.setAttribute('content', 'width=1280');
        }
      } catch (e) {}
    };
    forceViewport();
    try {
      new MutationObserver(forceViewport).observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    } catch (e) {}
  }

  var API = /igateway\\.iti\\.gov\\.eg\\/OldApi(Public)?\\/(Applicant|ApplicantActionBatch|ApplicantActionBatchAction|ApplicantActionCriteria|ApplicantPreference|ApplicantContentType|Examinations|Interview)\\//i;

  function forward(url, status, raw) {
    try {
      if (!API.test(url)) return;
      if (typeof raw !== 'string' || raw.length === 0 || raw.length > 300000) return;
      var body = JSON.parse(raw);
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'api',
          url: String(url),
          status: status,
          body: body
        }));
      }
    } catch (e) {}
  }

  var originalFetch = window.fetch;
  if (typeof originalFetch === 'function') {
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var promise = originalFetch.apply(this, arguments);
      if (!API.test(url)) return promise;
      return promise.then(function (response) {
        try {
          var clone = response.clone();
          clone.text().then(function (raw) {
            forward(url, response.status, raw);
          }).catch(function () {});
        } catch (e) {}
        return response;
      });
    };
  }

  var originalOpen = XMLHttpRequest.prototype.open;
  var originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    try {
      this.__itiUrl = String(url);
    } catch (e) {}
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    var xhr = this;
    try {
      xhr.addEventListener('load', function () {
        forward(xhr.__itiUrl, xhr.status, xhr.responseText);
      });
    } catch (e) {}
    return originalSend.apply(this, arguments);
  };

  return true;
})();
true;
`;
}
