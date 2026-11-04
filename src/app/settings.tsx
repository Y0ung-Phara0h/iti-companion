import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Card,
  Field,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
} from '@/components/ui';
import { SupportCard } from '@/components/support-card';
import { ensureNotificationPermission } from '@/lib/notifications';
import { useApp } from '@/lib/store';
import { colors, radius, spacing } from '@/lib/theme';

function Row({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.line, true: colors.red }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.line}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    summary,
    settings,
    capturedCount,
    recent,
    diagnostic,
    updateSettings,
    clearCachedData,
    signOut,
  } = useApp();

  const version = Constants.expoConfig?.version ?? '0.2.0';

  const onToggleNotifications = async (next: boolean) => {
    if (!next) {
      updateSettings({ notifications: false });
      return;
    }

    const granted = await ensureNotificationPermission().catch(() => false);
    if (!granted) {
      Alert.alert(
        'Notifications are blocked',
        'Allow notifications for ITI Companion in Android settings, then turn this back on.',
        [
          { text: 'Not now', style: 'cancel' },
          {
            text: 'Open settings',
            onPress: () => {
              void Linking.openSettings();
            },
          },
        ],
      );
      return;
    }

    updateSettings({ notifications: true });
  };

  const onClearData = () => {
    Alert.alert(
      'Clear cached data?',
      'Removes the saved phase, exam dates and scheduled reminders from this device. You stay signed in on the ITI site.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            void clearCachedData();
          },
        },
      ],
    );
  };

  const onSignOut = () => {
    Alert.alert(
      'Sign out?',
      'Cached data and reminders are cleared, then the ITI logout page opens. You will need to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            void signOut();
            router.back();
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xxl },
      ]}
    >
      <SectionTitle>Notifications</SectionTitle>
      <Card style={styles.card}>
        <Row
          title="Exam reminders"
          description="A reminder 24 hours and 2 hours before every captured exam session."
          value={settings.notifications}
          onValueChange={next => {
            void onToggleNotifications(next);
          }}
        />
        <Divider />
        <SecondaryButton
          label="Open system notification settings"
          onPress={() => {
            void Linking.openSettings();
          }}
        />
        <Text style={styles.help}>
          Android 13 and newer ask for permission the first time you enable
          this. Reminders survive restarts and work offline.
        </Text>
      </Card>

      <SectionTitle>Display</SectionTitle>
      <Card style={styles.card}>
        <Row
          title="Force desktop layout"
          description="Renders the site at 1280 px wide. Use it when tables look cramped; the page then pans horizontally."
          value={settings.desktopMode}
          onValueChange={next => updateSettings({ desktopMode: next })}
        />
        <Divider />
        <Row
          title="Diagnostics"
          description="Logs captured API paths and whether the phone stylesheet was applied."
          value={settings.debug}
          onValueChange={next => updateSettings({ debug: next })}
        />
      </Card>

      <SectionTitle>Captured data</SectionTitle>
      <Card style={styles.card}>
        {summary ? (
          <>
            <View style={styles.fields}>
              <Field
                label="Applicant"
                value={summary.applicantName ?? 'Not captured'}
              />
              <Field label="Phase" value={summary.phase ?? 'Not captured'} />
            </View>
            <View style={styles.fields}>
              <Field
                label="Exam sessions"
                value={String(summary.sessions.length)}
              />
              <Field
                label="Captured"
                value={
                  summary.updatedAt
                    ? new Date(summary.updatedAt).toLocaleString()
                    : '—'
                }
              />
            </View>
          </>
        ) : (
          <Text style={styles.help}>
            Nothing captured yet. Sign in on the Application tab and open
            Acceptance Phases once.
          </Text>
        )}

        {settings.debug && diagnostic ? (
          <>
            <Divider />
            <Text style={styles.mono}>WebView self-check</Text>
            <View style={styles.fields}>
              <Field label="Page" value={diagnostic.page} />
              <Field
                label="Layout"
                value={diagnostic.desktop ? 'desktop 1280' : 'mobile'}
              />
            </View>
            <View style={styles.fields}>
              <Field
                label="Document marker"
                value={diagnostic.marked ? 'iti-app set' : 'missing'}
              />
              <Field
                label="Stylesheet"
                value={diagnostic.styled ? 'injected' : 'missing'}
              />
            </View>
            <Field label="Root font" value={diagnostic.rootFont || '—'} />
            <Text style={styles.mono} numberOfLines={1}>
              {diagnostic.href}
            </Text>
          </>
        ) : null}

        {capturedCount > 0 ? (
          <>
            <Divider />
            <Text style={styles.mono}>
              {capturedCount} API response{capturedCount === 1 ? '' : 's'}{' '}
              captured in this session
            </Text>
            {recent.slice(0, 6).map(item => (
              <Text
                key={`${item.at}-${item.url}`}
                style={styles.mono}
                numberOfLines={1}
              >
                {item.status} · {item.url}
              </Text>
            ))}
          </>
        ) : null}

        <Divider />
        <SecondaryButton label="Clear cached data" onPress={onClearData} />
      </Card>

      <SectionTitle>Account</SectionTitle>
      <Card style={styles.card}>
        <Text style={styles.help}>
          Signing out opens the official ITI logout page inside the app so the
          session cookies are actually cleared.
        </Text>
        <PrimaryButton label="Sign out" onPress={onSignOut} />
      </Card>

      <SectionTitle>About</SectionTitle>
      <Card style={styles.card}>
        <View style={styles.fields}>
          <Field label="Version" value={version} />
          <Field label="Publisher" value="Unofficial" />
        </View>
        <Text style={styles.help}>
          ITI Companion is an unofficial companion app built by applicants, not
          by the Information Technology Institute. It does not collect
          credentials: you type them only on identity.iti.gov.eg, inside the
          embedded browser.
        </Text>
        <Text style={styles.help}>
          Cached data (phase, exam dates, location and a short progress list) is
          stored in this device&apos;s secure storage. Raw API responses and
          passwords are never saved.
        </Text>
        <Divider />
        <View style={styles.links}>
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              void Linking.openURL('https://internal.iti.gov.eg/home');
            }}
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}
          >
            <Text style={styles.linkText}>Open ITI website</Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              void Linking.openURL(
                'https://ititic.zohodesk.com/portal/en/newticket',
              );
            }}
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}
          >
            <Text style={styles.linkText}>ITI support portal</Text>
          </Pressable>
        </View>
      </Card>

      <SectionTitle>Support</SectionTitle>
      <SupportCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  card: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  rowDescription: { fontSize: 12, lineHeight: 17, color: colors.muted },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  help: { fontSize: 12, lineHeight: 18, color: colors.muted },
  fields: { flexDirection: 'row', gap: spacing.lg },
  mono: {
    fontSize: 10,
    color: colors.faint,
    fontFamily: 'monospace',
  },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  link: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: radius.sm,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.redDark,
  },
  pressed: { opacity: 0.6 },
});
