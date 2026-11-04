import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';
import { parseDateText } from './dates';
import type { ExamSession } from './types';

const CHANNEL_ID = 'exams';
const REMINDERS = [
  { offsetMs: 24 * 60 * 60 * 1000, label: 'Tomorrow' },
  { offsetMs: 2 * 60 * 60 * 1000, label: 'In 2 hours' },
];

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Exam reminders',
    importance: AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#C82333',
  });
}

export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  await ensureChannel();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelExamReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Ignore: nothing scheduled, or the API is unavailable on this platform.
  }
}

/**
 * Reminder time for a session. DOM captures often carry only the visible text
 * ("12 Nov 2026"), so fall back to that instead of dropping the reminder.
 */
function startTime(session: ExamSession): number {
  if (session.startsAt) {
    const explicit = new Date(session.startsAt).getTime();
    if (!Number.isNaN(explicit)) return explicit;
  }

  const parsed = parseDateText(session.dateText);
  return parsed ? new Date(parsed).getTime() : Number.NaN;
}

export async function syncExamReminders(
  sessions: ExamSession[],
): Promise<number> {
  try {
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) return 0;

    await ensureChannel();
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = Date.now();
    const upcoming = sessions
      .map(session => ({ session, at: startTime(session) }))
      .filter(entry => Number.isFinite(entry.at) && entry.at > now)
      .sort((a, b) => a.at - b.at)
      .slice(0, 6);

    let scheduled = 0;

    for (const { session, at: startsAt } of upcoming) {
      for (const reminder of REMINDERS) {
        const fireAt = startsAt - reminder.offsetMs;
        if (fireAt <= now + 60_000) continue;

        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${reminder.label}: ${session.title}`,
              body: [session.location, new Date(startsAt).toLocaleString()]
                .filter(Boolean)
                .join(' · '),
              data: { url: '/site' },
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: new Date(fireAt),
              channelId: CHANNEL_ID,
            },
          });

          scheduled += 1;
        } catch {
          // Exact-alarm permission can be revoked at any time; keep the
          // remaining reminders instead of failing the whole batch.
        }
      }
    }

    return scheduled;
  } catch {
    return 0;
  }
}
