import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Card,
  Field,
  Pill,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
} from '@/components/ui';
import { SupportCard } from '@/components/support-card';
import { goSettings } from '@/lib/nav';
import { phaseOutcome, type PhaseOutcome } from '@/lib/phases';
import { useApp } from '@/lib/store';
import { colors, radius, spacing } from '@/lib/theme';
import type { ExamSession } from '@/lib/types';

type PillTone = 'neutral' | 'success' | 'warning' | 'dark' | 'red';

/**
 * Visual language for the progress rows. A chip replaces the old status text so
 * the result of every phase is readable at a glance.
 */
const OUTCOME_LABEL: Record<PhaseOutcome, string> = {
  passed: 'PASSED',
  pending: 'PENDING',
  next: 'NEXT UP',
  failed: 'NOT ACCEPTED',
  waitlist: 'WAITING LIST',
  upcoming: '',
};

const OUTCOME_STYLE: Record<
  Exclude<PhaseOutcome, 'upcoming'>,
  { background: string; text: string; border?: string }
> = {
  passed: { background: colors.green, text: '#FFFFFF' },
  pending: { background: colors.muted, text: '#FFFFFF' },
  next: { background: colors.sky, text: '#FFFFFF' },
  failed: { background: colors.red, text: '#FFFFFF' },
  // White chip on a white card: a border keeps it visible, black text reads on it.
  waitlist: { background: '#FFFFFF', text: '#111111', border: colors.line },
};

/** Green = done (also waitlisted, which means accepted), red = failed, else gray. */
function dotColor(outcome: PhaseOutcome): string {
  if (outcome === 'passed' || outcome === 'waitlist') return colors.green;
  if (outcome === 'failed') return colors.red;
  return colors.line;
}

function OutcomeChip({ outcome }: { outcome: PhaseOutcome }) {
  if (outcome === 'upcoming') return null;

  const tone = OUTCOME_STYLE[outcome];
  return (
    <View
      style={[
        styles.progressChip,
        { backgroundColor: tone.background, borderColor: tone.border ?? tone.background },
      ]}
    >
      <Text style={[styles.progressChipText, { color: tone.text }]}>
        {OUTCOME_LABEL[outcome]}
      </Text>
    </View>
  );
}

function toneForStatus(status?: string): PillTone {
  if (!status) return 'neutral';
  if (/pass|accept|done|complete|attend/i.test(status)) return 'success';
  if (/wait|assign|pending|progress/i.test(status)) return 'warning';
  if (/reject|fail|miss|absent|disqual/i.test(status)) return 'red';
  return 'neutral';
}

function countdown(target: string | undefined, now: number): string | null {
  if (!target) return null;
  const time = new Date(target).getTime();
  if (Number.isNaN(time)) return null;

  const diff = time - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDateTime(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const day = date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${day} · ${time}`;
}

/** Prefer the wording the site used for scraped, human-readable dates. */
function whenLabel(session: ExamSession): string {
  const text = session.dateText;
  if (text && /\s/.test(text) && !/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    return text;
  }
  return formatDateTime(session.startsAt) ?? text ?? 'To be announced';
}

function Step({ number, children }: { number: string; children: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{children}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { summary, settings, capturedCount, recent, reloadSite } = useApp();

  // Seed from the clock once, then refresh it every minute for the countdown.
  const [now, setNow] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const nextSession = useMemo<ExamSession | undefined>(() => {
    if (!summary?.sessions.length) return undefined;

    const timed = summary.sessions.filter(session => {
      if (!session.startsAt) return false;
      return !Number.isNaN(new Date(session.startsAt).getTime());
    });

    const upcoming = timed
      .filter(session => new Date(session.startsAt as string).getTime() > now)
      .sort(
        (a, b) =>
          new Date(a.startsAt as string).getTime() -
          new Date(b.startsAt as string).getTime(),
      );

    if (upcoming.length) return upcoming[0];

    const past = [...timed].sort(
      (a, b) =>
        new Date(b.startsAt as string).getTime() -
        new Date(a.startsAt as string).getTime(),
    );

    return past[0] ?? summary.sessions[0];
  }, [now, summary]);

  const onRefresh = () => {
    setRefreshing(true);
    reloadSite();
    setTimeout(() => setRefreshing(false), 1200);
  };

  const countdownLabel = countdown(nextSession?.startsAt, now);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 14 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.red}
            colors={[colors.red]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>ITI</Text>
            </View>
            <View>
              <Text style={styles.title}>Admission</Text>
              <Text style={styles.subtitle}>Applicant companion · unofficial</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={goSettings}
            style={({ pressed }) => [styles.gear, pressed && styles.pressed]}
          >
            <Text style={styles.gearText}>⚙</Text>
          </Pressable>
        </View>

        {!summary ? (
          <Card style={styles.hero}>
            <Text style={styles.heroTitle}>Your exams, on your phone.</Text>
            <Text style={styles.heroBody}>
              Sign in once on the real ITI site. This screen then shows your
              current phase, exam date and location automatically.
            </Text>
            <PrimaryButton
              label="Open the application"
              onPress={() => router.push('/site' as never)}
            />
            <View style={styles.steps}>
              <Step number="1">Log in with your ITI account.</Step>
              <Step number="2">Open Acceptance Phases / Progress.</Step>
              <Step number="3">Come back here — data is captured read-only.</Step>
            </View>
          </Card>
        ) : (
          <>
            <Card style={styles.phaseCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.phaseLabel}>CURRENT PHASE</Text>
                {summary.phaseStatus ? (
                  <Pill label={summary.phaseStatus} tone="warning" />
                ) : null}
              </View>
              <Text style={styles.phaseName}>
                {summary.phase ?? 'Application in progress'}
              </Text>
              {summary.phaseNote ? (
                <Text style={styles.phaseNote} numberOfLines={3}>
                  {summary.phaseNote}
                </Text>
              ) : null}
              {summary.applicantName ? (
                <Text style={styles.applicant}>{summary.applicantName}</Text>
              ) : null}
            </Card>

            <Card>
              <View style={styles.rowBetween}>
                <Text style={styles.kicker}>NEXT UP</Text>
                {nextSession?.status ? (
                  <Pill
                    label={nextSession.status}
                    tone={toneForStatus(nextSession.status)}
                  />
                ) : null}
              </View>

              {nextSession ? (
                <>
                  <Text style={styles.sessionTitle}>{nextSession.title}</Text>
                  {countdownLabel ? (
                    <Text style={styles.countdown}>{countdownLabel}</Text>
                  ) : null}
                  <View style={styles.meta}>
                    <Field
                      label="When"
                      value={whenLabel(nextSession)}
                    />
                    <Field
                      label="Where"
                      value={nextSession.location ?? 'To be announced'}
                    />
                  </View>
                </>
              ) : (
                <Text style={styles.emptyText}>
                  No exam session captured yet. Open the Application tab and
                  visit Acceptance Phases.
                </Text>
              )}
            </Card>

            {summary.progress.length ? (
              <View style={styles.section}>
                <SectionTitle>Progress</SectionTitle>
                <Card style={styles.progressCard}>
                  {summary.progress.map((item, index) => {
                    const outcome = phaseOutcome(
                      summary.progress,
                      index,
                      summary.phase,
                      summary.phaseStatus,
                    );

                    return (
                      <View
                        key={item.name}
                        style={[
                          styles.progressRow,
                          index > 0 && styles.progressDivider,
                        ]}
                      >
                        <View
                          style={[
                            styles.progressDot,
                            { backgroundColor: dotColor(outcome) },
                          ]}
                        />
                        <Text
                          style={[
                            styles.progressName,
                            item.active && styles.progressNameActive,
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {outcome === 'upcoming' ? (
                          <Text style={styles.progressStatus}>
                            {item.status ?? '—'}
                          </Text>
                        ) : (
                          <OutcomeChip outcome={outcome} />
                        )}
                      </View>
                    );
                  })}
                </Card>
              </View>
            ) : null}

            <View style={styles.actions}>
              <PrimaryButton
                label="Open the application"
                onPress={() => router.push('/site' as never)}
              />
              <SecondaryButton label="Refresh data" onPress={onRefresh} />
            </View>

            {summary.updatedAt ? (
              <Text style={styles.updated}>
                Last updated {new Date(summary.updatedAt).toLocaleString()}
              </Text>
            ) : null}
          </>
        )}

        {settings.debug ? (
          <Card style={styles.debugCard}>
            <Text style={styles.debugTitle}>Diagnostics</Text>
            <Text style={styles.debugText}>
              {capturedCount} API response{capturedCount === 1 ? '' : 's'}{' '}
              captured this session.
            </Text>
            {recent.map(item => (
              <Text key={`${item.at}-${item.url}`} style={styles.recent} numberOfLines={1}>
                {item.status} · {item.url}
              </Text>
            ))}
          </Card>
        ) : null}

        <SupportCard />

        <Text style={styles.disclaimer}>
          Unofficial app. Not affiliated with the Information Technology
          Institute. Credentials are entered only on identity.iti.gov.eg.
          Cached data stays on this device.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink },
  subtitle: {
    fontSize: 10,
    color: colors.faint,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  gear: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearText: { fontSize: 19, color: colors.ink },
  pressed: { opacity: 0.7 },
  hero: { padding: spacing.xl, gap: spacing.lg },
  heroTitle: { fontSize: 23, fontWeight: '800', color: colors.ink },
  heroBody: { fontSize: 14, lineHeight: 21, color: colors.muted },
  steps: { gap: 10, marginTop: 2 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { fontSize: 11, fontWeight: '800', color: colors.redDark },
  stepText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.muted },
  phaseCard: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
    padding: spacing.xl,
  },
  phaseLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.55,
  },
  phaseName: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  phaseNote: { fontSize: 13, lineHeight: 19, color: '#FFFFFF', opacity: 0.7 },
  applicant: { fontSize: 12, color: '#FFFFFF', opacity: 0.5 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  kicker: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '800',
    color: colors.red,
  },
  sessionTitle: { fontSize: 20, fontWeight: '800', color: colors.ink },
  countdown: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.red,
    letterSpacing: -0.5,
  },
  meta: { flexDirection: 'row', gap: spacing.md, marginTop: 2 },
  emptyText: { fontSize: 13, lineHeight: 19, color: colors.muted },
  section: { gap: spacing.sm },
  progressCard: { padding: 0, gap: 0, overflow: 'hidden' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
  },
  progressDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  progressName: { flex: 1, fontSize: 14, color: colors.ink },
  progressNameActive: { fontWeight: '700' },
  progressStatus: { fontSize: 12, color: colors.muted },
  progressChip: {
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  progressChipText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actions: { gap: spacing.sm },
  updated: { fontSize: 11, color: colors.faint, textAlign: 'center' },
  debugCard: { backgroundColor: colors.soft, gap: 4 },
  debugTitle: { fontSize: 12, fontWeight: '800', color: colors.ink },
  debugText: { fontSize: 11, color: colors.muted },
  recent: { fontSize: 10, color: colors.faint, fontFamily: 'monospace' },
  disclaimer: {
    fontSize: 10,
    lineHeight: 15,
    color: colors.faint,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
