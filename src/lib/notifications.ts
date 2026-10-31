import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';
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
      .filter(session => {
        if (!session.startsAt) return false;
        return new Date(session.startsAt).getTime() > now;
      })
      .sort(
        (a, b) =>
          new Date(a.startsAt as string).getTime() -
          new Date(b.startsAt as string).getTime(),
      )
      .slice(0, 6);

    let scheduled = 0;

    for (const session of upcoming) {
      const startsAt = new Date(session.startsAt as string).getTime();

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
