import { useEffect } from "react";
import { Tabs } from "expo-router";
import { BarChart3, CalendarDays, Home, ListOrdered } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFixtureGroupsForSeason, getSeasonsForLeague } from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { font } from "../../lib/theme";

export default function TabsLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { setSeason, setCategories } = useAppStore();

  useEffect(() => {
    (async () => {
      try {
        const seasons = await getSeasonsForLeague();
        const current = seasons.find((s) => s.currentSeason) ?? seasons[0];
        if (current) setSeason(current.seasonID, current.seasonName);
        const groups = await getFixtureGroupsForSeason(current?.seasonID);
        setCategories(groups);
      } catch {
        // La UI de cada pantalla muestra su propio estado de error.
      }
    })();
  }, [setSeason, setCategories]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textFaint,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.borderSubtle,
          paddingBottom: insets.bottom / 2,
          height: 58 + insets.bottom / 2,
        },
        tabBarLabelStyle: { fontSize: 10, fontFamily: font.medium },
        headerStyle: { backgroundColor: theme.primaryDark },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: font.display, fontSize: 17 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          headerShown: false,
          tabBarIcon: ({ color }) => <Home color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="standings"
        options={{
          title: "Posiciones",
          headerTitle: "Tabla de posiciones",
          tabBarIcon: ({ color }) => <ListOrdered color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="fixtures"
        options={{
          title: "Partidos",
          headerTitle: "Partidos y resultados",
          tabBarIcon: ({ color }) => <CalendarDays color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          headerTitle: "Líderes estadísticos",
          tabBarIcon: ({ color }) => <BarChart3 color={color} size={21} />,
        }}
      />
    </Tabs>
  );
}
