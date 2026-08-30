import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { getStandingsForFixtureGroup } from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { spacing, type Theme } from "../../lib/theme";
import { Card, EmptyState, Loading, SectionTitle } from "../../components/ui";
import { CategoryTabs, cleanDesc } from "../../components/CategoryTabs";
import { StandingRow } from "../../components/StandingRow";
import type { StandingGroup } from "../../lib/types";

export default function StandingsScreen() {
  const { theme } = useTheme();
  const { categories, selectedCategory, selectCategory } = useAppStore();
  const [groups, setGroups] = useState<StandingGroup[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCategory) return;
    let alive = true;
    setGroups(null);
    setError(null);
    getStandingsForFixtureGroup(
      selectedCategory.fixtureTypeID,
      selectedCategory.fixtureGroupIdentifier
    )
      .then((g) => alive && setGroups(g))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Error"));
    return () => {
      alive = false;
    };
  }, [selectedCategory]);

  const lines = useMemo(
    () => groups?.flatMap((g) => g.standingsLines) ?? [],
    [groups]
  );

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xxl }}>
      <View style={{ paddingTop: spacing.lg }}>
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={selectCategory}
        />
      </View>

      <View style={{ paddingHorizontal: spacing.lg }}>
        <Card>
          <View style={{ flexDirection: "row", paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <Text style={{ width: 26, textAlign: "center", color: theme.textMuted, fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" }}>
              #
            </Text>
            <Text style={{ flex: 1, color: theme.textMuted, fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" }}>
              Equipo
            </Text>
            <Text style={hdr(theme)}>PJ</Text>
            <Text style={hdr(theme)}>PG</Text>
            <Text style={hdr(theme)}>PE</Text>
            <Text style={hdr(theme)}>PP</Text>
            <Text style={{ ...hdr(theme), minWidth: 30 }}>Pts</Text>
            <View style={{ marginLeft: spacing.sm, width: 60 }} />
          </View>

          {!groups ? (
            <Loading />
          ) : error ? (
            <EmptyState title="No se pudieron cargar las posiciones" message={error} />
          ) : lines.length === 0 ? (
            <EmptyState title="Sin datos" message="No hay posiciones para esta categoría." />
          ) : (
            lines
              .sort((a, b) => Number(a.position) - Number(b.position))
              .map((line) => (
                <StandingRow
                  key={line.teamID}
                  line={line}
                  isLeader={Number(line.position) === 1}
                />
              ))
          )}
        </Card>

        {groups && groups.length > 0 ? (
          <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: spacing.sm, textAlign: "center", fontFamily: "Inter_400Regular" }}>
            {cleanDesc(groups[0].standingsDesc)} · {lines.length} equipos
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

function hdr(theme: Theme) {
  return {
    color: theme.textMuted,
    fontSize: 11,
    textAlign: "center" as const,
    minWidth: 22,
    fontFamily: "Inter_700Bold",
  };
}
