import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { Settings, Summary } from './types';

const SUMMARY_BASE = 'iti_summary_v1';
const SETTINGS_KEY = 'iti_settings_v1';
const CHUNK_SIZE = 1200;

export const defaultSettings: Settings = {
  desktopMode: false,
  notifications: false,
  debug: false,
};

async function writeSecure(keyBase: string, value: string): Promise<void> {
  const chunks = Math.max(1, Math.ceil(value.length / CHUNK_SIZE));

  // Remove chunks left over from a previous, longer payload.
  const previousRaw = await SecureStore.getItemAsync(`${keyBase}_n`);
  const previous = previousRaw ? Number.parseInt(previousRaw, 10) : 0;

  for (let index = 0; index < chunks; index += 1) {
    const chunk = value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);
    await SecureStore.setItemAsync(`${keyBase}_${index}`, chunk);
  }
  for (let index = chunks; index < previous; index += 1) {
    await SecureStore.deleteItemAsync(`${keyBase}_${index}`);
  }
  await SecureStore.setItemAsync(`${keyBase}_n`, String(chunks));
}

async function readSecure(keyBase: string): Promise<string | null> {
  const countRaw = await SecureStore.getItemAsync(`${keyBase}_n`);
  const count = countRaw ? Number.parseInt(countRaw, 10) : 0;
  if (!Number.isFinite(count) || count <= 0) return null;

  let value = '';
  for (let index = 0; index < count; index += 1) {
    const chunk = await SecureStore.getItemAsync(`${keyBase}_${index}`);
    if (chunk === null) return null;
    value += chunk;
  }
  return value;
}

export async function loadSummary(): Promise<Summary | null> {
  try {
    const raw = await readSecure(SUMMARY_BASE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Summary>;
    if (!Array.isArray(parsed.sessions) || !Array.isArray(parsed.progress)) {
      return null;
    }
    return parsed as Summary;
  } catch {
    return null;
  }
}

export async function saveSummary(summary: Summary): Promise<void> {
  try {
    await writeSecure(SUMMARY_BASE, JSON.stringify(summary));
  } catch {
    // Caching is best-effort; never block the UI on it.
  }
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      desktopMode: parsed.desktopMode === true,
      notifications: parsed.notifications === true,
      debug: parsed.debug === true,
    };
  } catch {
    return { ...defaultSettings };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage failures.
  }
}

export async function clearStoredData(): Promise<void> {
  try {
    const countRaw = await SecureStore.getItemAsync(`${SUMMARY_BASE}_n`);
    const count = countRaw ? Number.parseInt(countRaw, 10) : 0;
    for (let index = 0; index < count; index += 1) {
      await SecureStore.deleteItemAsync(`${SUMMARY_BASE}_${index}`);
    }
    await SecureStore.deleteItemAsync(`${SUMMARY_BASE}_n`);
  } catch {
    // Ignore.
  }
}

const LOGOUT_PENDING_KEY = 'iti_logout_pending_v1';

/**
 * Sign-out is a WebView navigation, so it cannot be guaranteed to finish
 * before the process dies. Persisting the intent lets the next launch retry it.
 */
export async function loadLogoutPending(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(LOGOUT_PENDING_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function saveLogoutPending(value: boolean): Promise<void> {
  try {
    if (value) await AsyncStorage.setItem(LOGOUT_PENDING_KEY, '1');
    else await AsyncStorage.removeItem(LOGOUT_PENDING_KEY);
  } catch {
    // Ignore storage failures.
  }
}
