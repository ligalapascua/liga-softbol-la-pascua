import { useEffect, useState } from "react";
import { Link, Tabs } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Home, ListOrdered, CalendarDays, BarChart3, ExternalLink } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFixtureGroupsForSeason, getSeasonsForLeague } from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { spacing } from "../../lib/theme";

export default function TabsLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { setSeason, setCategories } = useAppStore();
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const seasons = await getSeasonsForLeague();
        const current = seasons.find((s) => s.currentSeason) ?? seasons[0];
        if (current) setSeason(current.seasonID, current.seasonName);
        const groups = await getFixtureGroupsForSeason(current?.seasonID);
        setCategories(groups);
      } catch (e) {
        setBootError(e instanceof Error ? e.message : "Error inicial");
      }
    })();
  }, [setSeason, setCategories]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: insets.bottom / 2,
          height: 56 + insets.bottom / 2,
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: "Inter_500Medium" },
        headerStyle: { backgroundColor: theme.primaryDark },
        headerTintColor: theme.textInverse,
        headerTitleStyle: { fontFamily: "Poppins_600SemiBold" },
        headerRight: () => (
          <Link href="/news" asChild>
            <Pressable hitSlop={12} style={{ marginRight: spacing.md }}>
              <ExternalLink color={theme.textInverse} size={20} />
            </Pressable>
          </Link>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
          headerTitle: "Softbol La Pascua",
        }}
      />
      <Tabs.Screen
        name="standings"
        options={{
          title: "Posiciones",
          tabBarIcon: ({ color }) => <ListOrdered color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="fixtures"
        options={{
          title: "Partidos",
          tabBarIcon: ({ color }) => <CalendarDays color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => <BarChart3 color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
