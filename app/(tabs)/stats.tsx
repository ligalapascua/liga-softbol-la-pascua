import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { getStatisticSummaryForTeam, getTeamsForFixtureGroup } from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { elevation, font, radius, spacing, type Theme } from "../../lib/theme";
import { CategoryTabs } from "../../components/CategoryTabs";
import { EmptyState, Loading, SectionHeader } from "../../components/ui";
import { TeamLogo } from "../../components/TeamLogo";
import type { PersonStatSummary, Team } from "../../lib/types";

// Métricas que se muestran como columnas en la tabla de líderes.
// `key` es el nombre exacto que devuelve la API (leagueStatTypeName).
// `label` es la abreviatura corta para la cabecera.
// `format` controla cómo se renderiza el valor.
// `primary` = siempre visible; las demás van colapsadas.
interface Metric {
  key: string;
  label: string;
  format: (v: number) => string;
  primary?: boolean;
}

const METRICS: Metric[] = [
  { key: "AVG", label: "AVG", format: (v) => v.toFixed(3).replace(/^0/, ""), primary: true },
  { key: "AB", label: "AB", format: (v) => String(Math.round(v)), primary: true },
  { key: "H", label: "H", format: (v) => String(Math.round(v)), primary: true },
  { key: "HR", label: "HR", format: (v) => String(Math.round(v)) },
  { key: "BB", label: "BB", format: (v) => String(Math.round(v)) },
  { key: "R", label: "R", format: (v) => String(Math.round(v)) },
  { key: "RBI", label: "RBI", format: (v) => String(Math.round(v)) },
  { key: "2B", label: "2B", format: (v) => String(Math.round(v)) },
  { key: "3B", label: "3B", format: (v) => String(Math.round(v)) },
  { key: "SB", label: "SB", format: (v) => String(Math.round(v)) },
];

interface PlayerRow {
  personID: number;
  name: string;
  teamName: string;
  stats: Map<string, number>; // key -> valor numérico
}

export default function StatsScreen() {
  const { theme } = useTheme();
  const { seasonID, categories, selectedCategory, selectCategory } = useAppStore();
  const [players, setPlayers] = useState<PlayerRow[] | null>(null);
  const [availableMetrics, setAvailableMetrics] = useState<Metric[]>([]);
  const [sortBy, setSortBy] = useState<string>("AVG");
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
            return { teamName: t.teamName, stats: s.listCumulativePersonStatSummary ?? [] };
          } catch {
            return { teamName: t.teamName, stats: [] as PersonStatSummary[] };
          }
        })
      );

      // Consolidar por jugador
      const map = new Map<number, PlayerRow>();
      const metricKeysFound = new Set<string>();
      for (const { teamName, stats } of perTeam) {
        for (const s of stats) {
          const numeric = parseFloat(s.statTypeValue) || 0;
          metricKeysFound.add(s.leagueStatTypeName);
          const existing = map.get(s.personID);
          if (existing) {
            existing.stats.set(s.leagueStatTypeName, numeric);
          } else {
            const row: PlayerRow = {
              personID: s.personID,
              name: `${s.firstName} ${s.lastName}`.trim(),
              teamName,
              stats: new Map([[s.leagueStatTypeName, numeric]]),
            };
            map.set(s.personID, row);
          }
        }
      }

      // Filtrar métricas a las que realmente existen en los datos
      const metrics = METRICS.filter((m) => metricKeysFound.has(m.key));
      setAvailableMetrics(metrics);
      if (metrics.length > 0 && !metrics.find((m) => m.key === sortBy)) {
        setSortBy(metrics[0].key);
      }
      setPlayers([...map.values()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [selectedCategory, seasonID, sortBy]);

  useEffect(() => {
    setPlayers(null);
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // Filtrar jugadores con al menos AB > 0 y ordenar por la métrica seleccionada.
  const leaders = useMemo(() => {
    if (!players || availableMetrics.length === 0) return [];
    const sorted = players
      .filter((p) => (p.stats.get("AB") ?? 0) > 0)
      .sort((a, b) => (b.stats.get(sortBy) ?? 0) - (a.stats.get(sortBy) ?? 0));
    return sorted;
  }, [players, availableMetrics, sortBy]);

  const sortMetric = availableMetrics.find((m) => m.key === sortBy);

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
        {!players && !error ? (
          <Loading label="Recopilando estadísticas de todos los equipos…" />
        ) : error ? (
          <EmptyState title="No se pudieron cargar las estadísticas" message={error} onRetry={load} />
        ) : availableMetrics.length === 0 || leaders.length === 0 ? (
          <EmptyState
            title="Sin estadísticas"
            message="Esta categoría aún no tiene estadísticas registradas."
          />
        ) : (
          <>
            <SectionHeader
              title="Líderes estadísticos"
              subtitle={
                sortMetric
                  ? `Ordenado por ${sortMetric.label}${sortMetric.key === "AVG" ? " (promedio de bateo)" : ""}`
                  : undefined
              }
            />

            {/* Selector de métrica para ordenar (solo visibles según expanded) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}
            >
              {availableMetrics
                .filter((m) => expanded || m.primary)
                .map((m) => {
                const active = sortBy === m.key;
                return (
                  <Pressable
                    key={m.key}
                    onPress={() => setSortBy(m.key)}
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
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <LeadersTable
              leaders={leaders.slice(0, 25)}
              metrics={availableMetrics.filter((m) => expanded || m.primary)}
              sortBy={sortBy}
              theme={theme}
            />

            {/* Toggle para expandir/colapsar columnas adicionales */}
            {availableMetrics.some((m) => !m.primary) ? (
              <Pressable
                onPress={() => setExpanded((v) => !v)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: spacing.xs,
                  marginTop: spacing.md,
                  paddingVertical: spacing.sm,
                }}
              >
                {expanded ? (
                  <ChevronUp color={theme.primary} size={16} />
                ) : (
                  <ChevronDown color={theme.primary} size={16} />
                )}
                <Text
                  style={{
                    color: theme.primary,
                    fontSize: 13,
                    fontFamily: font.semibold,
                  }}
                >
                  {expanded ? "Ver menos columnas" : "Ver más columnas (HR, BB, R, RBI…)"}
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function LeadersTable({
  leaders,
  metrics,
  sortBy,
  theme,
}: {
  leaders: PlayerRow[];
  metrics: Metric[];
  sortBy: string;
  theme: Theme;
}) {
  const NAME_COL = 140;
  const STAT_COL = 42;

  return (
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
      <View style={{ flexDirection: "row" }}>
        {/* Columna fija: rank + jugador + equipo */}
        <View
          style={{
            width: NAME_COL,
            borderRightWidth: 1,
            borderRightColor: theme.border,
            backgroundColor: theme.surface,
          }}
        >
          <HeaderCell theme={theme} width={NAME_COL} align="left" pad>
            JUGADOR
          </HeaderCell>
          {leaders.map((p, i) => (
            <View
              key={`${p.personID}-${p.teamName}`}
              style={{
                height: 52,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: spacing.sm,
                backgroundColor: i % 2 === 0 ? theme.surface : theme.surfaceAlt,
                borderTopWidth: 1,
                borderTopColor: theme.borderSubtle,
              }}
            >
              <RankBadge rank={i + 1} theme={theme} />
              <TeamLogo name={p.teamName} size={24} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 12,
                    fontFamily: font.medium,
                  }}
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
                <Text
                  style={{
                    color: theme.textFaint,
                    fontSize: 10,
                    fontFamily: font.regular,
                  }}
                  numberOfLines={1}
                >
                  {p.teamName}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Stats con scroll horizontal */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
          <View>
            <View style={{ flexDirection: "row" }}>
              {metrics.map((m) => (
                <HeaderCell
                  key={m.key}
                  theme={theme}
                  width={STAT_COL}
                  accent={m.key === sortBy}
                >
                  {m.label}
                </HeaderCell>
              ))}
            </View>
            {leaders.map((p, i) => (
              <View
                key={`${p.personID}-${p.teamName}-stats`}
                style={{
                  flexDirection: "row",
                  height: 52,
                  alignItems: "center",
                  backgroundColor: i % 2 === 0 ? theme.surface : theme.surfaceAlt,
                  borderTopWidth: 1,
                  borderTopColor: theme.borderSubtle,
                }}
              >
                {metrics.map((m) => {
                  const value = p.stats.get(m.key) ?? 0;
                  const isSort = m.key === sortBy;
                  return (
                    <Text
                      key={m.key}
                      style={{
                        width: STAT_COL,
                        textAlign: "center",
                        fontSize: 13,
                        color: isSort ? theme.primary : theme.textMuted,
                        fontFamily: isSort ? font.bold : font.regular,
                      }}
                    >
                      {m.format(value)}
                    </Text>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function HeaderCell({
  children,
  theme,
  width,
  align = "center",
  accent,
  pad,
}: {
  children: React.ReactNode;
  theme: Theme;
  width: number;
  align?: "left" | "center";
  accent?: boolean;
  pad?: boolean;
}) {
  return (
    <View
      style={{
        width,
        height: 38,
        justifyContent: "center",
        alignItems: align === "left" ? "flex-start" : "center",
        paddingHorizontal: pad ? spacing.md : 0,
        backgroundColor: theme.primaryDark,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          letterSpacing: 0.6,
          color: accent ? theme.accent : theme.textInverse,
          fontFamily: font.bold,
          opacity: accent ? 1 : 0.85,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

function RankBadge({ rank, theme }: { rank: number; theme: Theme }) {
  const medal =
    rank === 1 ? theme.gold : rank === 2 ? "#94A3B8" : rank === 3 ? "#B45309" : null;
  return (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: radius.sm - 2,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.xs,
        backgroundColor: medal ? `${medal}22` : "transparent",
      }}
    >
      <Text
        style={{
          fontSize: 11,
          color: medal ?? theme.textFaint,
          fontFamily: font.bold,
        }}
      >
        {rank}
      </Text>
    </View>
  );
}
