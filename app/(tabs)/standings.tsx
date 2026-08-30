import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { getStandingsForFixtureGroup } from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { font, spacing } from "../../lib/theme";
import { EmptyState, Loading, SectionHeader } from "../../components/ui";
import { CategoryTabs, cleanDesc } from "../../components/CategoryTabs";
import { StandingsTable, StandingsLegend } from "../../components/StandingsTable";
import type { StandingGroup } from "../../lib/types";

export default function StandingsScreen() {
  const { theme } = useTheme();
  const { categories, selectedCategory, selectCategory } = useAppStore();
  const [groups, setGroups] = useState<StandingGroup[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!selectedCategory) return;
    setError(null);
    try {
      const g = await getStandingsForFixtureGroup(
        selectedCategory.fixtureTypeID,
        selectedCategory.fixtureGroupIdentifier
      );
      setGroups(g);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [selectedCategory]);

  useEffect(() => {
    setGroups(null);
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

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
        {!groups && !error ? (
          <Loading />
        ) : error ? (
          <EmptyState title="No se pudieron cargar las posiciones" message={error} onRetry={load} />
        ) : !groups || groups.length === 0 ? (
          <EmptyState title="Sin datos" message="No hay posiciones para esta categoría." />
        ) : (
          groups.map((g, gi) => (
            <View key={`${g.standingsDesc}-${gi}`} style={{ marginBottom: spacing.xl }}>
              {groups.length > 1 ? (
                <SectionHeader title={cleanDesc(g.standingsDesc)} />
              ) : (
                <SectionHeader
                  title="Tabla de posiciones"
                  subtitle={`${cleanDesc(g.standingsDesc)} · ${g.standingsLines.length} equipos`}
                />
              )}
              {g.standingsLines.length === 0 ? (
                <EmptyState title="Sin equipos en esta tabla" />
              ) : (
                <>
                  <StandingsTable lines={g.standingsLines} />
                  <Text
                    style={{
                      color: theme.textFaint,
                      fontSize: 10,
                      fontFamily: font.regular,
                      marginTop: spacing.sm,
                      textAlign: "center",
                    }}
                  >
                    Desliza la tabla para ver más columnas
                  </Text>
                  <StandingsLegend />
                </>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
