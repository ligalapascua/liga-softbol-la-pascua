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

// Métricas de la tabla de líderes.
// `key` = nombre que devuelve la API (leagueStatTypeName), salvo AVG que
// se calcula en el cliente (H/AB) porque la API no lo expone.
// `primary` = visible por defecto; el resto se muestra al expandir.
interface Metric {
  key: string;
  label: string;
  hint: string;
  format: (v: number) => string;
  primary?: boolean;
  computed?: boolean;
}

const AVG_KEY = "AVG";

const METRICS: Metric[] = [
  {
    key: AVG_KEY,
    label: "AVG",
    hint: "Promedio de bateo (H/AB)",
    format: (v) => (v > 0 ? v.toFixed(3).replace(/^0/, "") : "—"),
    primary: true,
    computed: true,
  },
  { key: "AB", label: "AB", hint: "Turnos al bate", format: int, primary: true },
  { key: "H", label: "H", hint: "Hits", format: int, primary: true },
  { key: "HR", label: "HR", hint: "Jonrones", format: int },
  { key: "RBI", label: "RBI", hint: "Carreras impulsadas", format: int },
  { key: "R", label: "R", hint: "Carreras anotadas", format: int },
  { key: "BB", label: "BB", hint: "Bases por bolas", format: int },
  { key: "1B", label: "1B", hint: "Sencillos", format: int },
  { key: "2B", label: "2B", hint: "Dobles", format: int },
  { key: "3B", label: "3B", hint: "Triples", format: int },
  { key: "K", label: "K", hint: "Ponches", format: int },
];

function int(v: number): string {
  return String(Math.round(v));
}

interface PlayerRow {
  personID: number;
  name: string;
  teamName: string;
  stats: Map<string, number>;
}

export default function StatsScreen() {
  const { theme } = useTheme();
  const { seasonID, categories, selectedCategory, selectCategory } = useAppStore();
  const [players, setPlayers] = useState<PlayerRow[] | null>(null);
  const [availableMetrics, setAvailableMetrics] = useState<Metric[]>([]);
  const [sortBy, setSortBy] = useState<string>(AVG_KEY);
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

      // Consolidar todas las métricas de cada jugador en una sola fila.
      const map = new Map<number, PlayerRow>();
      const found = new Set<string>();
      for (const { teamName, stats } of perTeam) {
        for (const s of stats) {
          found.add(s.leagueStatTypeName);
          const value = parseFloat(s.statTypeValue) || 0;
          const row = map.get(s.personID);
          if (row) {
            row.stats.set(s.leagueStatTypeName, value);
          } else {
            map.set(s.personID, {
              personID: s.personID,
              name: `${s.firstName} ${s.lastName}`.trim(),
              teamName,
              stats: new Map([[s.leagueStatTypeName, value]]),
            });
          }
        }
      }

      // AVG no viene de la API: se calcula como H/AB.
      const rows = [...map.values()];
      const canComputeAvg = found.has("H") && found.has("AB");
      if (canComputeAvg) {
        for (const r of rows) {
          const ab = r.stats.get("AB") ?? 0;
          const h = r.stats.get("H") ?? 0;
          r.stats.set(AVG_KEY, ab > 0 ? h / ab : 0);
        }
        found.add(AVG_KEY);
      }

      const metrics = METRICS.filter((m) => found.has(m.key));
      setAvailableMetrics(metrics);
      setSortBy((prev) =>
        metrics.some((m) => m.key === prev) ? prev : metrics[0]?.key ?? AVG_KEY
      );
      setPlayers(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [selectedCategory, seasonID]);

  useEffect(() => {
    setPlayers(null);
    setExpanded(false);
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const visibleMetrics = useMemo(
    () => availableMetrics.filter((m) => expanded || m.primary),
    [availableMetrics, expanded]
  );

  const hasExtraColumns = availableMetrics.some((m) => !m.primary);

  const leaders = useMemo(() => {
    if (!players) return [];
    return players
      .filter((p) => (p.stats.get("AB") ?? 0) > 0)
      .sort((a, b) => (b.stats.get(sortBy) ?? 0) - (a.stats.get(sortBy) ?? 0));
  }, [players, sortBy]);

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
            {/* La acción del encabezado expande/colapsa columnas: siempre visible. */}
            <SectionHeader
              title="Líderes"
              subtitle={sortMetric ? `Ordenado por ${sortMetric.hint}` : undefined}
              action={
                hasExtraColumns
                  ? {
                      label: expanded ? "− Menos" : "+ Más columnas",
                      onPress: () => setExpanded((v) => !v),
                    }
                  : undefined
              }
            />

            {/* Chips para elegir la métrica de ordenamiento. */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}
            >
              {visibleMetrics.map((m) => {
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
              leaders={leaders.slice(0, 30)}
              metrics={visibleMetrics}
              sortBy={sortBy}
              theme={theme}
            />

            <Text
              style={{
                color: theme.textFaint,
                fontSize: 10,
                fontFamily: font.regular,
                marginTop: spacing.sm,
                textAlign: "center",
              }}
            >
              {expanded
                ? "Desliza la tabla para ver todas las columnas"
                : "Toca “+ Más columnas” para ver HR, RBI, R, BB y más"}
            </Text>
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
  const NAME_COL = 150;
  const STAT_COL = 46;

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
        {/* Columna fija: puesto + jugador + equipo */}
        <View
          style={{
            width: NAME_COL,
            borderRightWidth: 1,
            borderRightColor: theme.border,
          }}
        >
          <HeaderCell theme={theme} width={NAME_COL} align="left" pad>
            JUGADOR
          </HeaderCell>
          {leaders.map((p, i) => (
            <View
              key={p.personID}
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
                  style={{ color: theme.text, fontSize: 12, fontFamily: font.medium }}
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
                <Text
                  style={{ color: theme.textFaint, fontSize: 10, fontFamily: font.regular }}
                  numberOfLines={1}
                >
                  {p.teamName}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Stats: con scroll horizontal solo si hay muchas columnas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
          <View>
            <View style={{ flexDirection: "row" }}>
              {metrics.map((m) => (
                <HeaderCell key={m.key} theme={theme} width={STAT_COL} accent={m.key === sortBy}>
                  {m.label}
                </HeaderCell>
              ))}
            </View>
            {leaders.map((p, i) => (
              <View
                key={p.personID}
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
                      {m.format(p.stats.get(m.key) ?? 0)}
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
  const medal = rank === 1 ? theme.gold : rank === 2 ? "#94A3B8" : rank === 3 ? "#B45309" : null;
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
      <Text style={{ fontSize: 11, color: medal ?? theme.textFaint, fontFamily: font.bold }}>
        {rank}
      </Text>
    </View>
  );
}
