import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { goSite } from '@/lib/nav';
import { configureNotificationHandler } from '@/lib/notifications';
import { AppProvider } from '@/lib/store';

configureNotificationHandler();

function useNotificationNavigation(): void {
  const handled = useRef(false);

  useEffect(() => {
    const openSite = () => {
      if (handled.current) return;
      handled.current = true;
      goSite();
      setTimeout(() => {
        handled.current = false;
      }, 1500);
    };

    const last = Notifications.getLastNotificationResponse();
    if (last?.notification) {
      Notifications.clearLastNotificationResponse();
      openSite();
    }

    const subscription =
      Notifications.addNotificationResponseReceivedListener(() => openSite());

    return () => subscription.remove();
  }, []);
}

export default function RootLayout() {
  useNotificationNavigation();

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: true,
              title: 'Settings',
              presentation: 'modal',
              headerTintColor: '#1F2430',
              headerStyle: { backgroundColor: '#FFFFFF' },
            }}
          />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
