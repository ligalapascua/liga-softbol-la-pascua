import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { getFixturesForSeason, isFuture, isPast, parseFixtureDate } from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { font, spacing } from "../../lib/theme";
import { CategoryTabs } from "../../components/CategoryTabs";
import { FixtureCard } from "../../components/FixtureCard";
import { EmptyState, Loading, Segmented } from "../../components/ui";
import type { Fixture } from "../../lib/types";

type Filter = "results" | "upcoming";

export default function FixturesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { back } = useLocalSearchParams<{ back?: string }>();
  const { categories, selectedCategory, selectCategory } = useAppStore();
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("results");
  const [refreshing, setRefreshing] = useState(false);

  // Botón de atrás en el header cuando se navega desde Inicio.
  useEffect(() => {
    navigation.setOptions({
      headerLeft: back === "home"
        ? () => (
            <Pressable onPress={() => router.navigate("/")} hitSlop={12} style={{ marginLeft: 4 }}>
              <ArrowLeft color="#FFFFFF" size={22} />
            </Pressable>
          )
        : undefined,
    });
  }, [navigation, back, router]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const f = await getFixturesForSeason();
      setFixtures(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // Agrupar por fecha (YYYY-MM-DD) preservando el orden del filtro.
  const groups = useMemo(() => {
    if (!fixtures || !selectedCategory) return [];
    const byCat = fixtures.filter(
      (f) => f.fixtureGroupIdentifier === selectedCategory.fixtureGroupIdentifier
    );
    const subset = filter === "upcoming" ? byCat.filter(isFuture) : byCat.filter(isPast);
    const sorted = subset.sort((a, b) =>
      filter === "upcoming"
        ? a.fixtureDateInMilliseconds - b.fixtureDateInMilliseconds
        : b.fixtureDateInMilliseconds - a.fixtureDateInMilliseconds
    );

    const map = new Map<string, Fixture[]>();
    for (const f of sorted) {
      const d = parseFixtureDate(f.fixtureDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) ?? [];
      arr.push(f);
      map.set(key, arr);
    }
    return [...map.entries()].map(([key, items]) => ({
      key,
      label: parseFixtureDate(items[0].fixtureDate).toLocaleDateString("es-VE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      items,
    }));
  }, [fixtures, selectedCategory, filter]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: spacing.xxl, paddingTop: spacing.lg }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
    >
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={selectCategory}
      />

      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "results", label: "Resultados" },
            { value: "upcoming", label: "Próximos" },
          ]}
        />
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
        {!fixtures && !error ? (
          <Loading />
        ) : error ? (
          <EmptyState title="No se pudieron cargar los partidos" message={error} onRetry={load} />
        ) : total === 0 ? (
          <EmptyState
            title={filter === "upcoming" ? "No hay partidos programados" : "Aún no hay resultados"}
            message={
              filter === "upcoming"
                ? "Cuando se publique el calendario aparecerá aquí."
                : undefined
            }
          />
        ) : (
          groups.map((g) => (
            <View key={g.key} style={{ marginBottom: spacing.lg }}>
              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: 11,
                  letterSpacing: 0.6,
                  fontFamily: font.bold,
                  textTransform: "uppercase",
                  marginBottom: spacing.sm,
                }}
              >
                {g.label}
              </Text>
              {g.items.map((f) => (
                <FixtureCard key={f.fixtureID} fixture={f} />
              ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
