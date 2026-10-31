import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui";
import { SUPPORT } from "@/lib/config";
import { colors, radius, spacing } from "@/lib/theme";

type SupportLink = {
  key: string;
  label: string;
  emoji: string;
  url: string;
};

/**
 * Add a full https URL in `SUPPORT` (src/lib/config.ts) and the matching
 * button shows up here. Empty values are filtered out, so the card still reads
 * correctly before the accounts exist.
 */
const LINKS: SupportLink[] = [
  {
    key: "kofi",
    label: "Support Me on Ko-fi",
    emoji: "☕",
    url: SUPPORT.kofiUrl,
  },
  {
    key: "bmc",
    label: "Support Me on InstaPay",
    emoji: "🧡",
    url: SUPPORT.bmcUrl,
  },
].filter((link) => /^https?:\/\//i.test(link.url.trim()));

/**
 * Shown at the bottom of Home and on the Settings screen. It states the
 * funding model plainly: free forever, open source, one maintainer, optional
 * tips. It must never block the app or ask for an account.
 */
export function SupportCard() {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.heartBadge}>
          <Text style={styles.heart}>♥</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.kicker}>FREE FOREVER</Text>
          <Text style={styles.title}>Built by one person, for applicants</Text>
        </View>
      </View>

      <Text style={styles.body}>
        No ads, no subscription and no paywall. ITI Companion is free and open
        source, and it will stay that way. If it saved you time, you can buy me
        a coffee — completely optional.
      </Text>

      {LINKS.length > 0 ? (
        <View style={styles.links}>
          {LINKS.map((link) => (
            <Pressable
              key={link.key}
              accessibilityRole="link"
              accessibilityLabel={`Support the developer on ${link.label}`}
              onPress={() => {
                void Linking.openURL(link.url);
              }}
              style={({ pressed }) => [styles.link, pressed && styles.pressed]}
            >
              <Text style={styles.linkText}>
                {link.emoji} {link.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.pending}>
          Ko-fi and Support Me with InstaPay links are being set up and will
          appear here soon. The app works exactly the same with or without them.
        </Text>
      )}

      <Text style={styles.note}>
        Tips are voluntary and never unlock anything. The source code is
        licensed under the GNU GPL v3, so every copy stays free and open.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFBF8",
    borderColor: "#F2D9CF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heartBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.redSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  heart: { fontSize: 19, color: colors.red },
  headerText: { flex: 1, gap: 2 },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: colors.red,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  links: {
    gap: spacing.sm,
  },
  link: {
    // Full-width stacked buttons: the label always has the full card width,
    // so a long one ("Support Me with InstaPay") can never be clipped.
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.red,
  },
  linkText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  pressed: { opacity: 0.75 },
  pending: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    fontStyle: "italic",
  },
  note: {
    fontSize: 10,
    lineHeight: 15,
    color: colors.faint,
  },
});
