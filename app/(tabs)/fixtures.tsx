import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { getFixturesForSeason, isFuture, isPast } from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { radius, spacing, type Theme } from "../../lib/theme";
import { CategoryTabs } from "../../components/CategoryTabs";
import { FixtureCard } from "../../components/FixtureCard";
import { EmptyState, Loading } from "../../components/ui";
import type { Fixture } from "../../lib/types";

type Filter = "upcoming" | "results";

export default function FixturesScreen() {
  const { theme } = useTheme();
  const { categories, selectedCategory, selectCategory } = useAppStore();
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("results");

  useEffect(() => {
    let alive = true;
    setFixtures(null);
    setError(null);
    getFixturesForSeason()
      .then((f) => alive && setFixtures(f))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Error"));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!fixtures || !selectedCategory) return [];
    const byCat = fixtures.filter(
      (f) => f.fixtureGroupIdentifier === selectedCategory.fixtureGroupIdentifier
    );
    const subset = filter === "upcoming" ? byCat.filter(isFuture) : byCat.filter(isPast);
    return filter === "upcoming"
      ? subset.sort((a, b) => a.fixtureDateInMilliseconds - b.fixtureDateInMilliseconds)
      : subset.sort((a, b) => b.fixtureDateInMilliseconds - a.fixtureDateInMilliseconds);
  }, [fixtures, selectedCategory, filter]);

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xxl }}>
      <View style={{ paddingTop: spacing.lg }}>
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={selectCategory}
        />
      </View>

      <View style={{ flexDirection: "row", paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        <FilterChip active={filter === "results"} onPress={() => setFilter("results")} label="Resultados" theme={theme} />
        <FilterChip active={filter === "upcoming"} onPress={() => setFilter("upcoming")} label="Próximos" theme={theme} />
      </View>

      <View style={{ paddingHorizontal: spacing.lg }}>
        {!fixtures ? (
          <Loading />
        ) : error ? (
          <EmptyState title="No se pudieron cargar los partidos" message={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filter === "upcoming" ? "No hay partidos programados" : "Aún no hay resultados"}
          />
        ) : (
          filtered.map((f) => <FixtureCard key={f.fixtureID} fixture={f} />)
        )}
      </View>
    </ScrollView>
  );
}

function FilterChip({
  active,
  onPress,
  label,
  theme,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
  theme: Theme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        alignItems: "center",
        backgroundColor: active ? theme.primary : theme.surface,
        borderWidth: 1,
        borderColor: active ? theme.primary : theme.border,
      }}
    >
      <Text
        style={{
          color: active ? theme.textInverse : theme.text,
          fontWeight: "600",
          fontFamily: "Inter_600SemiBold",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
