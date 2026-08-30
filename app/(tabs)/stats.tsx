import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  getStatisticSummaryForTeam,
  getTeamsForFixtureGroup,
} from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { radius, spacing } from "../../lib/theme";
import { CategoryTabs, cleanDesc } from "../../components/CategoryTabs";
import { Card, EmptyState, Loading, SectionTitle } from "../../components/ui";
import { TeamLogo } from "../../components/TeamLogo";
import type { PersonStatSummary, Team } from "../../lib/types";

export default function StatsScreen() {
  const { theme } = useTheme();
  const { seasonID, categories, selectedCategory, selectCategory } = useAppStore();
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [allStats, setAllStats] = useState<PersonStatSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCategory) return;
    let alive = true;
    setTeams(null);
    setAllStats(null);
    setError(null);
    setMetric(null);

    (async () => {
      try {
        const t = await getTeamsForFixtureGroup(
          selectedCategory.fixtureTypeID,
          selectedCategory.fixtureGroupIdentifier
        );
        if (!alive) return;
        setTeams(t);
        const summaries = await Promise.all(
          t.map((team) =>
            getStatisticSummaryForTeam(seasonID, team.teamID).then(
              (s) => s.listCumulativePersonStatSummary ?? []
            )
          )
        );
        if (!alive) return;
        const flat = summaries.flat();
        setAllStats(flat);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Error");
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedCategory, seasonID]);

  const metrics = useMemo(() => {
    if (!allStats) return [];
    const set = new Map<string, number>();
    for (const s of allStats) set.set(s.leagueStatTypeName, (set.get(s.leagueStatTypeName) ?? 0) + 1);
    return [...set.keys()].sort((a, b) => (set.get(b)! - set.get(a)!));
  }, [allStats]);

  useEffect(() => {
    if (metrics.length && !metric) setMetric(metrics[0]);
  }, [metrics, metric]);

  const leaders = useMemo(() => {
    if (!allStats || !metric) return [];
    return allStats
      .filter((s) => s.leagueStatTypeName === metric)
      .map((s) => ({
        ...s,
        numeric: parseFloat(s.statTypeValue) || 0,
      }))
      .sort((a, b) => b.numeric - a.numeric)
      .slice(0, 15);
  }, [allStats, metric]);

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
        <SectionTitle>Líderes estadísticos</SectionTitle>

        {!allStats ? (
          <Loading label="Recopilando estadísticas de todos los equipos..." />
        ) : error ? (
          <EmptyState title="No se pudieron cargar las estadísticas" message={error} />
        ) : metrics.length === 0 ? (
          <EmptyState title="Sin estadísticas" message="Esta categoría no tiene estadísticas disponibles." />
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}>
              {metrics.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMetric(m)}
                  style={{
                    backgroundColor: metric === m ? theme.primary : theme.surface,
                    borderWidth: 1,
                    borderColor: metric === m ? theme.primary : theme.border,
                    borderRadius: radius.pill,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                  }}
                >
                  <Text style={{ color: metric === m ? theme.textInverse : theme.text, fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>
                    {m}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Card>
              {leaders.length === 0 ? (
                <EmptyState title="Sin datos para esta métrica" />
              ) : (
                leaders.map((p, i) => (
                  <View
                    key={`${p.personID}-${p.leagueStatTypeID}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: spacing.sm,
                      borderBottomWidth: i === leaders.length - 1 ? 0 : 1,
                      borderBottomColor: theme.border,
                    }}
                  >
                    <Text style={{ width: 24, textAlign: "center", color: i < 3 ? theme.primary : theme.textMuted, fontWeight: "700", fontFamily: "Inter_700Bold" }}>
                      {i + 1}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.text, fontWeight: "500", fontFamily: "Inter_500Medium" }} numberOfLines={1}>
                        {p.firstName} {p.lastName}
                      </Text>
                    </View>
                    <Text style={{ color: theme.primary, fontWeight: "700", fontSize: 16, fontFamily: "Inter_700Bold" }}>
                      {p.statTypeValue}
                    </Text>
                  </View>
                ))
              )}
            </Card>
          </>
        )}
      </View>
    </ScrollView>
  );
}
