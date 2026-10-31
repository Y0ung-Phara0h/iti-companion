import { Tabs } from "expo-router";
import { StyleSheet, View, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/lib/theme";

function TabDot({ color, focused }: { color: ColorValue; focused: boolean }) {
  return (
    <View
      style={[
        styles.dot,
        {
          backgroundColor: color,
          opacity: focused ? 1 : 0.45,
          transform: [{ scale: focused ? 1 : 0.8 }],
        },
      ]}
    />
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    // The wrapper paints the app background behind the floating bar's margins.
    // Without it the gap around the bar shows the white stack background.
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.red,
          tabBarInactiveTintColor: colors.faint,
          tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
          tabBarStyle: {
            // Floating pill: the bar sits above the gesture area instead of
            // being glued to the bottom edge. The bottom safe-area inset is
            // applied as a margin (not padding) so the gap is outside the bar.
            backgroundColor: colors.card,
            borderTopWidth: 0,
            borderRadius: 22,
            height: 62,
            paddingTop: 4,
            paddingBottom: 0,
            marginHorizontal: 16,
            marginBottom: insets.bottom + 12,
            // iOS shadow (harmless on Android) + Android elevation.
            shadowColor: "#1F2430",
            shadowOpacity: 0.14,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 12,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabDot color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="site"
          options={{
            title: "Application",
            tabBarIcon: ({ color, focused }) => (
              <TabDot color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  dot: { width: 18, height: 18, borderRadius: 7 },
});
