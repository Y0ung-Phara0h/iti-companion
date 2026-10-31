import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { mergeSummary } from './adapter';
import { cancelExamReminders, syncExamReminders } from './notifications';
import {
  clearStoredData,
  defaultSettings,
  loadLogoutPending,
  loadSettings,
  loadSummary,
  saveLogoutPending,
  saveSettings,
  saveSummary,
} from './storage';
import type {
  CapturedPayload,
  RecentCapture,
  Settings,
  Summary,
  WebViewDiagnostic,
} from './types';

type AppContextValue = {
  hydrated: boolean;
  summary: Summary | null;
  settings: Settings;
  capturedCount: number;
  recent: RecentCapture[];
  diagnostic: WebViewDiagnostic | null;
  reloadToken: number;
  /**
   * Set by signOut(). The Application tab reacts by loading the identity
   * server's logout page, which is the only way to clear the WebView cookies.
   * It stays true until that tab acknowledges it, so signing out works even
   * when the WebView has never been mounted.
   */
  logoutPending: boolean;
  capture: (payload: CapturedPayload) => void;
  reportDiagnostic: (next: WebViewDiagnostic) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  reloadSite: () => void;
  clearCachedData: () => Promise<void>;
  acknowledgeLogout: () => void;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [capturedCount, setCapturedCount] = useState(0);
  const [recent, setRecent] = useState<RecentCapture[]>([]);
  const [diagnostic, setDiagnostic] = useState<WebViewDiagnostic | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [logoutPending, setLogoutPending] = useState(false);

  const lastReminderSignature = useRef('');

  useEffect(() => {
    let active = true;

    void (async () => {
      const [storedSummary, storedSettings, storedLogout] = await Promise.all([
        loadSummary(),
        loadSettings(),
        loadLogoutPending(),
      ]);
      if (!active) return;

      if (storedSummary) setSummary(storedSummary);
      if (storedLogout) setLogoutPending(true);
      setSettings(storedSettings);
      setHydrated(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !summary) return;
    void saveSummary(summary);
  }, [hydrated, summary]);

  useEffect(() => {
    if (!hydrated) return;
    void saveSettings(settings);
  }, [hydrated, settings]);

  useEffect(() => {
    if (!hydrated || !settings.notifications || !summary) return;

    const signature = summary.sessions
      .map(session => `${session.title}|${session.startsAt ?? session.dateText ?? ''}`)
      .join(';');

    if (!signature || signature === lastReminderSignature.current) return;

    const timer = setTimeout(() => {
      lastReminderSignature.current = signature;
      void syncExamReminders(summary.sessions);
    }, 1200);

    return () => clearTimeout(timer);
  }, [hydrated, settings.notifications, summary]);

  const capture = useCallback((payload: CapturedPayload) => {
    setCapturedCount(count => count + 1);
    setRecent(previous =>
      [
        {
          url: payload.url.replace(/^https?:\/\/[^/]+/, ''),
          status: payload.status,
          at: payload.at,
        },
        ...previous,
      ].slice(0, 12),
    );
    setSummary(previous => mergeSummary(previous, payload));
  }, []);

  const reportDiagnostic = useCallback((next: WebViewDiagnostic) => {
    setDiagnostic(next);
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(previous => ({ ...previous, ...patch }));

    if (patch.desktopMode !== undefined) {
      setReloadToken(token => token + 1);
    }
    if (patch.notifications === false) {
      lastReminderSignature.current = '';
      void cancelExamReminders();
    }
  }, []);

  const reloadSite = useCallback(() => {
    setReloadToken(token => token + 1);
  }, []);

  const clearCachedData = useCallback(async () => {
    await clearStoredData();
    await cancelExamReminders();
    lastReminderSignature.current = '';
    setSummary(null);
    setCapturedCount(0);
    setRecent([]);
  }, []);

  const acknowledgeLogout = useCallback(() => {
    void saveLogoutPending(false);
    setLogoutPending(false);
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([clearCachedData(), saveLogoutPending(true)]);
    setLogoutPending(true);
  }, [clearCachedData]);

  const value = useMemo<AppContextValue>(
    () => ({
      hydrated,
      summary,
      settings,
      capturedCount,
      recent,
      diagnostic,
      reloadToken,
      logoutPending,
      capture,
      reportDiagnostic,
      updateSettings,
      reloadSite,
      clearCachedData,
      acknowledgeLogout,
      signOut,
    }),
    [
      acknowledgeLogout,
      capturedCount,
      capture,
      clearCachedData,
      diagnostic,
      hydrated,
      logoutPending,
      recent,
      reloadToken,
      reportDiagnostic,
      settings,
      signOut,
      summary,
      updateSettings,
      reloadSite,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
