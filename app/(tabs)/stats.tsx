import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { getStatisticSummaryForTeam, getTeamsForFixtureGroup } from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { elevation, font, radius, spacing, type Theme } from "../../lib/theme";
import { CategoryTabs } from "../../components/CategoryTabs";
import { EmptyState, Loading, SectionHeader } from "../../components/ui";
import { TeamLogo } from "../../components/TeamLogo";
import type { PersonStatSummary, Team } from "../../lib/types";

interface Leader extends PersonStatSummary {
  numeric: number;
  teamName: string;
}

export default function StatsScreen() {
  const { theme } = useTheme();
  const { seasonID, categories, selectedCategory, selectCategory } = useAppStore();
  const [all, setAll] = useState<Leader[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!selectedCategory) return;
    setError(null);
    try {
      const teams: Team[] = await getTeamsForFixtureGroup(
        selectedCategory.fixtureTypeID,
        selectedCategory.fixtureGroupIdentifier
      );
      const perTeam = await Promise.all(
        teams.map(async (t) => {
          try {
            const s = await getStatisticSummaryForTeam(seasonID, t.teamID);
            return (s.listCumulativePersonStatSummary ?? []).map((p) => ({
              ...p,
              numeric: parseFloat(p.statTypeValue) || 0,
              teamName: t.teamName,
            }));
          } catch {
            return [] as Leader[];
          }
        })
      );
      setAll(perTeam.flat());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [selectedCategory, seasonID]);

  useEffect(() => {
    setAll(null);
    setMetric(null);
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // Métricas con al menos un valor > 0, ordenadas por relevancia.
  const metrics = useMemo(() => {
    if (!all) return [];
    const counts = new Map<string, number>();
    for (const s of all) {
      if (s.numeric > 0) counts.set(s.leagueStatTypeName, (counts.get(s.leagueStatTypeName) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  }, [all]);

  useEffect(() => {
    if (metrics.length && (!metric || !metrics.includes(metric))) setMetric(metrics[0]);
  }, [metrics, metric]);

  const leaders = useMemo(() => {
    if (!all || !metric) return [];
    return all
      .filter((s) => s.leagueStatTypeName === metric && s.numeric > 0)
      .sort((a, b) => b.numeric - a.numeric)
      .slice(0, 20);
  }, [all, metric]);

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
        {!all && !error ? (
          <Loading label="Recopilando estadísticas de todos los equipos…" />
        ) : error ? (
          <EmptyState title="No se pudieron cargar las estadísticas" message={error} onRetry={load} />
        ) : metrics.length === 0 ? (
          <EmptyState
            title="Sin estadísticas"
            message="Esta categoría aún no tiene estadísticas registradas."
          />
        ) : (
          <>
            <SectionHeader title="Líderes" subtitle="Selecciona una estadística" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}
            >
              {metrics.map((m) => {
                const active = metric === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMetric(m)}
                    style={[
                      {
                        backgroundColor: active ? theme.primary : theme.surface,
                        borderWidth: 1,
                        borderColor: active ? theme.primary : theme.border,
                        borderRadius: radius.pill,
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.sm,
                      },
                      active ? elevation(2) : null,
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? theme.textInverse : theme.textMuted,
                        fontSize: 13,
                        fontFamily: active ? font.semibold : font.medium,
                      }}
                    >
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {leaders.length === 0 ? (
              <EmptyState title="Sin datos para esta estadística" />
            ) : (
              <View
                style={[
                  {
                    backgroundColor: theme.surface,
                    borderRadius: radius.xl,
                    borderWidth: 1,
                    borderColor: theme.borderSubtle,
                    overflow: "hidden",
                  },
                  elevation(2),
                ]}
              >
                {leaders.map((p, i) => (
                  <LeaderRow
                    key={`${p.personID}-${p.leagueStatTypeID}`}
                    rank={i + 1}
                    leader={p}
                    theme={theme}
                    last={i === leaders.length - 1}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function LeaderRow({
  rank,
  leader,
  theme,
  last,
}: {
  rank: number;
  leader: Leader;
  theme: Theme;
  last: boolean;
}) {
  const medal =
    rank === 1 ? theme.gold : rank === 2 ? "#94A3B8" : rank === 3 ? "#B45309" : null;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.borderSubtle,
        backgroundColor: rank <= 3 ? theme.surfaceAlt : theme.surface,
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: radius.sm,
          alignItems: "center",
          justifyContent: "center",
          marginRight: spacing.sm,
          backgroundColor: medal ? `${medal}22` : "transparent",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: medal ?? theme.textFaint,
            fontFamily: font.bold,
          }}
        >
          {rank}
        </Text>
      </View>

      <TeamLogo name={leader.teamName} size={30} />

      <View style={{ flex: 1 }}>
        <Text
          style={{ color: theme.text, fontSize: 14, fontFamily: font.medium }}
          numberOfLines={1}
        >
          {leader.firstName} {leader.lastName}
        </Text>
        <Text
          style={{ color: theme.textFaint, fontSize: 11, fontFamily: font.regular }}
          numberOfLines={1}
        >
          {leader.teamName}
        </Text>
      </View>

      <Text
        style={{
          color: theme.primary,
          fontSize: 18,
          fontFamily: font.bold,
          marginLeft: spacing.sm,
        }}
      >
        {leader.statTypeValue}
      </Text>
    </View>
  );
}
