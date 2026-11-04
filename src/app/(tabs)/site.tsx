import { useFocusEffect } from 'expo-router';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type Ref,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  WebView as RawWebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
  type WebViewProps,
} from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { isCapturableUrl, isItiUrl, SITE } from '@/lib/config';
import { buildInjectedScript } from '@/lib/injected';
import { useApp } from '@/lib/store';
import { colors, radius, spacing } from '@/lib/theme';

const IGNORED_ERRORS = /ERR_ABORTED|ERR_UNKNOWN_URL_SCHEME|ERR_BLOCKED_BY_CLIENT/i;

/**
 * react-native-webview 14 declares `class WebView<P = undefined>` as
 * `Component<WebViewProps & P>`, so `WebViewProps & undefined` collapses to
 * `never` as soon as TypeScript has to check the `ref` attribute. Re-casting
 * the component keeps every prop typed while restoring a usable ref.
 */
const WebView = RawWebView as unknown as ComponentType<
  WebViewProps & { ref?: Ref<RawWebView> }
>;

function logoutUrl(): string {
  return `${SITE.logout}?t=${Date.now()}`;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname || 'iti.gov.eg';
  } catch {
    return 'iti.gov.eg';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isGoogleAuth(url: string): boolean {
  try {
    return new URL(url).hostname === 'accounts.google.com';
  } catch {
    return false;
  }
}

async function openExternally(url: string): Promise<void> {
  try {
    // Skipping canOpenURL: on Android 11+ it returns false for https/mailto
    // unless the app declares <queries>, while openURL still works.
    await Linking.openURL(url);
  } catch {
    Alert.alert('Could not open link', url);
  }
}

function ToolButton({
  glyph,
  label,
  onPress,
  disabled = false,
  active = false,
  small = false,
}: {
  glyph: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  small?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.toolButton,
        active && styles.toolButtonActive,
        pressed && styles.toolButtonPressed,
        disabled && styles.toolButtonDisabled,
      ]}
    >
      <Text
        style={[
          styles.toolGlyph,
          small && styles.toolGlyphSmall,
          active && styles.toolGlyphActive,
        ]}
      >
        {glyph}
      </Text>
    </Pressable>
  );
}

export default function SiteScreen() {
  const insets = useSafeAreaInsets();
  const {
    settings,
    capture,
    captureScraped,
    reportDiagnostic,
    reloadToken,
    logoutPending,
    acknowledgeLogout,
    updateSettings,
  } = useApp();

  const webRef = useRef<RawWebView>(null);
  const lastReloadToken = useRef(reloadToken);
  const initialLogoutHandled = useRef(logoutPending);

  const [url, setUrl] = useState<string>(SITE.home);
  const [canGoBack, setCanGoBack] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [oauthBlocked, setOauthBlocked] = useState(false);

  // True while the WebView is loading the identity-server logout page; the
  // persisted sign-out intent is cleared once that load finishes.
  const pendingLogoutLoad = useRef(false);

  // Seeded from the store so a sign-out performed before this screen ever
  // mounted still reaches the identity server.
  const [sourceUri, setSourceUri] = useState<string>(() =>
    logoutPending ? logoutUrl() : SITE.home,
  );
  const [webKey, setWebKey] = useState(0);

  const injected = useMemo(
    () => buildInjectedScript(settings.desktopMode),
    [settings.desktopMode],
  );

  /* ---------------------------------------------------------------- actions */

  const reload = useCallback(() => {
    setError(null);
    setOauthBlocked(false);
    webRef.current?.reload();
  }, []);

  const toggleDesktop = useCallback(() => {
    updateSettings({ desktopMode: !settings.desktopMode });
  }, [settings.desktopMode, updateSettings]);

  /* ------------------------------------------------------------ store sync */

  // Pull-to-refresh on the dashboard bumps reloadToken.
  useEffect(() => {
    if (reloadToken === lastReloadToken.current) return;
    lastReloadToken.current = reloadToken;
    reload();
  }, [reload, reloadToken]);

  // Sign-out is performed by the WebView itself: only it owns the cookies.
  useEffect(() => {
    if (!logoutPending) return;

    pendingLogoutLoad.current = true;

    if (initialLogoutHandled.current) {
      // The WebView already starts on the logout URL (deep mount).
      initialLogoutHandled.current = false;
      return;
    }

    setError(null);
    setSourceUri(logoutUrl());
    setWebKey(key => key + 1);
  }, [logoutPending]);

  /* --------------------------------------------------------------- back nav */

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (canGoBack) {
            webRef.current?.goBack();
            return true;
          }
          return false;
        },
      );

      return () => subscription.remove();
    }, [canGoBack]),
  );

  /* --------------------------------------------------------------- handlers */

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const raw = event.nativeEvent.data;
      if (typeof raw !== 'string' || raw.length === 0 || raw.length > 1_500_000) {
        return;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return;
      }
      if (!isRecord(parsed)) return;

      // Self-check from the injected script: proves whether the phone WebView
      // actually marked the document and installed the stylesheet.
      if (parsed.type === 'diag') {
        if (typeof parsed.page !== 'string' || !parsed.page) return;
        reportDiagnostic({
          page: parsed.page,
          marked: parsed.marked === true,
          styled: parsed.styled === true,
          rootFont: typeof parsed.rootFont === 'string' ? parsed.rootFont : '',
          desktop: parsed.desktop === true,
          href: typeof parsed.href === 'string' ? parsed.href : '',
          at: Date.now(),
        });
        return;
      }

      // DOM snapshot from the injected script: the fallback that keeps the
      // dashboard working when the site's API calls are not observable here.
      // Checked before the API branch because the payload shape is different.
      if (parsed.type === 'summary') {
        captureScraped(parsed.data);
        return;
      }

      if (parsed.type !== 'api') return;

      const apiUrl = typeof parsed.url === 'string' ? parsed.url : '';
      const status = typeof parsed.status === 'number' ? parsed.status : 0;
      if (!isCapturableUrl(apiUrl)) return;
      if (status < 200 || status >= 300) return;

      capture({
        url: apiUrl,
        status,
        at: Date.now(),
        body: parsed.body,
      });
    },
    [capture, captureScraped, reportDiagnostic],
  );

  const onShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest) => {
      const next = request.url;

      // Android does not send isTopFrame at all; only iOS reports iframes.
      // `undefined` must therefore mean "main frame" for the guard to work.
      if (request.isTopFrame === false) return true;
      if (isItiUrl(next)) return true;

      // Everything outside iti.gov.eg (support portal, Google, tel:, mailto:)
      // belongs in the system browser / dialer, not the embedded view.
      if (isGoogleAuth(next)) setOauthBlocked(true);
      if (/^(https?|mailto|tel|sms|whatsapp|intent|market):/i.test(next)) {
        void openExternally(next);
      }
      return false;
    },
    [],
  );

  const onNavigationStateChange = useCallback((nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
    setUrl(nav.url);

    // IdentityServer's post-logout page: send the user back to the public home
    // page instead of leaving them on a dead end.
    if (/\/Account\/LoggedOut/i.test(nav.url)) {
      webRef.current?.injectJavaScript(
        `window.location.replace(${JSON.stringify(SITE.home)}); true;`,
      );
    }
  }, []);

  const onLoadStart = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const onLoadEnd = useCallback(() => {
    setLoading(false);
    setProgress(1);

    if (pendingLogoutLoad.current) {
      pendingLogoutLoad.current = false;
      acknowledgeLogout();
    }
  }, [acknowledgeLogout]);

  const onLoadProgress = useCallback((event: WebViewProgressEvent) => {
    setProgress(event.nativeEvent.progress);
  }, []);

  const onError = useCallback((event: WebViewErrorEvent) => {
    const description = event.nativeEvent.description ?? '';
    if (IGNORED_ERRORS.test(description)) return;

    setLoading(false);
    setError(
      description
        ? `The embedded browser reported: ${description}`
        : 'The page could not be loaded. Check your connection and try again.',
    );
  }, []);

  const onHttpError = useCallback((event: WebViewHttpErrorEvent) => {
    const status = event.nativeEvent.statusCode;
    if (!status || status < 400) return;

    setLoading(false);
    setError(`The ITI site answered with HTTP ${status}.`);
  }, []);

  /* ------------------------------------------------------------------ view */

  const host = hostOf(url);
  const secure = url.startsWith('https://');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.toolbar}>
        <ToolButton
          glyph="‹"
          label="Go back"
          disabled={!canGoBack}
          onPress={() => webRef.current?.goBack()}
        />

        <View style={styles.address}>
          <View
            style={[
              styles.lock,
              { backgroundColor: secure ? colors.green : colors.faint },
            ]}
          />
          <Text style={styles.addressText} numberOfLines={1}>
            {host}
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.red} />
          ) : null}
        </View>

        <ToolButton
          glyph="PC"
          label={
            settings.desktopMode
              ? 'Switch to the mobile layout'
              : 'Force the desktop layout'
          }
          small
          active={settings.desktopMode}
          onPress={toggleDesktop}
        />
        <ToolButton glyph="⟳" label="Reload" onPress={reload} />
        <ToolButton
          glyph="↗"
          label="Open in browser"
          onPress={() => void openExternally(url)}
        />
      </View>

      <View style={styles.progressTrack}>
        {loading ? (
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(4, Math.round(progress * 100))}%` },
            ]}
          />
        ) : null}
      </View>

      {oauthBlocked ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Google sign-in cannot complete inside an app. Use your ITI username
            and password on the login page instead.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss notice"
            onPress={() => setOauthBlocked(false)}
            hitSlop={8}
          >
            <Text style={styles.noticeClose}>✕</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.webWrap}>
        <WebView
          key={webKey}
          ref={webRef}
          source={{ uri: sourceUri }}
          originWhitelist={['http://*', 'https://*']}
          injectedJavaScriptBeforeContentLoaded={injected}
          injectedJavaScript={injected}
          onMessage={onMessage}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onNavigationStateChange={onNavigationStateChange}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          onLoadProgress={onLoadProgress}
          onError={onError}
          onHttpError={onHttpError}
          onContentProcessDidTerminate={reload}
          javaScriptEnabled
          domStorageEnabled
          cacheEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          setSupportMultipleWindows={false}
          javaScriptCanOpenWindowsAutomatically={false}
          allowsBackForwardNavigationGestures
          mediaPlaybackRequiresUserAction
          mixedContentMode="never"
          textZoom={100}
          style={styles.web}
        />

        {error ? (
          <View style={styles.errorOverlay}>
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Can’t reach the ITI site</Text>
              <Text style={styles.errorText}>{error}</Text>
              <View style={styles.errorActions}>
                <PrimaryButton label="Try again" onPress={reload} />
                <SecondaryButton
                  label="Open in browser"
                  onPress={() => void openExternally(url)}
                />
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.card,
  },
  toolButton: {
    width: 36,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolButtonActive: { backgroundColor: colors.redSoft },
  toolButtonPressed: { opacity: 0.6 },
  toolButtonDisabled: { opacity: 0.3 },
  toolGlyph: {
    fontSize: 22,
    lineHeight: 26,
    color: colors.ink,
    fontWeight: '600',
  },
  toolGlyphSmall: { fontSize: 10, lineHeight: 14, letterSpacing: 0.4 },
  toolGlyphActive: { color: colors.redDark },
  address: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.soft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  lock: { width: 7, height: 7, borderRadius: 4 },
  addressText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  progressTrack: { height: 2, backgroundColor: colors.line },
  progressFill: { height: 2, backgroundColor: colors.red },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.amber,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: colors.amberInk,
    fontWeight: '600',
  },
  noticeClose: { fontSize: 14, color: colors.amberInk, fontWeight: '700' },
  webWrap: { flex: 1, backgroundColor: colors.card },
  web: { flex: 1, backgroundColor: colors.card },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorCard: { width: '100%', maxWidth: 360, gap: spacing.md },
  errorTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  errorText: { fontSize: 13, lineHeight: 19, color: colors.muted },
  errorActions: { gap: spacing.sm, marginTop: spacing.sm },
});
