import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { getStatisticSummaryForTeam, getTeamsForFixtureGroup } from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { elevation, font, radius, spacing, type Theme } from "../../lib/theme";
import { CategoryTabs } from "../../components/CategoryTabs";
import { EmptyState, Loading, SectionHeader } from "../../components/ui";
import { TeamLogo } from "../../components/TeamLogo";
import type { PersonStatSummary, Team } from "../../lib/types";

// Métricas de la tabla de líderes.
// `key` = nombre que devuelve la API (leagueStatTypeName), salvo AVG/OBP/SLG
// que se calculan en el cliente porque la API no los expone.
interface Metric {
  key: string;
  label: string;
  hint: string;
  format: (v: number) => string;
  computed?: boolean;
}

const AVG_KEY = "AVG";
const OBP_KEY = "OBP";
const SLG_KEY = "SLG";

function int(v: number): string {
  return String(Math.round(v));
}

function avg3(v: number): string {
  return v > 0 ? v.toFixed(3).replace(/^0/, "") : "—";
}

// Orden de columnas solicitado por el usuario.
const METRICS: Metric[] = [
  { key: AVG_KEY, label: "AVG", hint: "Promedio de bateo (H/AB)", format: avg3, computed: true },
  { key: "AB", label: "AB", hint: "Turnos al bate", format: int },
  { key: "H", label: "H", hint: "Hits", format: int },
  { key: "R", label: "R", hint: "Carreras anotadas", format: int },
  { key: "RBI", label: "RBI", hint: "Carreras impulsadas", format: int },
  { key: "BB", label: "BB", hint: "Bases por bolas", format: int },
  { key: "K", label: "K", hint: "Ponches", format: int },
  { key: "1B", label: "1B", hint: "Sencillos", format: int },
  { key: "2B", label: "2B", hint: "Dobles", format: int },
  { key: "3B", label: "3B", hint: "Triples", format: int },
  { key: "HR", label: "HR", hint: "Jonrones", format: int },
  { key: OBP_KEY, label: "OBP", hint: "% de embasado (H+BB)/(AB+BB)", format: avg3, computed: true },
  { key: SLG_KEY, label: "SLG", hint: "Slugging (1B+2·2B+3·3B+4·HR)/AB", format: avg3, computed: true },
];

interface PlayerRow {
  personID: number;
  name: string;
  teamName: string;
  stats: Map<string, number>;
}

export default function StatsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { back } = useLocalSearchParams<{ back?: string }>();
  const { seasonID, categories, selectedCategory, selectCategory } = useAppStore();
  const [players, setPlayers] = useState<PlayerRow[] | null>(null);
  const [availableMetrics, setAvailableMetrics] = useState<Metric[]>([]);
  const [sortBy, setSortBy] = useState<string>("AB");
  const [error, setError] = useState<string | null>(null);
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

      // Métricas calculadas que la API no devuelve.
      const rows = [...map.values()];
      const hasH = found.has("H");
      const hasAB = found.has("AB");
      const hasBB = found.has("BB");
      const has1B = found.has("1B");
      const has2B = found.has("2B");
      const has3B = found.has("3B");
      const hasHR = found.has("HR");

      for (const r of rows) {
        const ab = r.stats.get("AB") ?? 0;
        const h = r.stats.get("H") ?? 0;
        const bb = r.stats.get("BB") ?? 0;
        if (hasH && hasAB) r.stats.set(AVG_KEY, ab > 0 ? h / ab : 0);
        if (hasH && hasAB && hasBB) {
          const denom = ab + bb;
          r.stats.set(OBP_KEY, denom > 0 ? (h + bb) / denom : 0);
        }
        if (hasAB && (has1B || has2B || has3B || hasHR)) {
          const s1 = r.stats.get("1B") ?? 0;
          const s2 = r.stats.get("2B") ?? 0;
          const s3 = r.stats.get("3B") ?? 0;
          const hr = r.stats.get("HR") ?? 0;
          r.stats.set(SLG_KEY, ab > 0 ? (s1 + 2 * s2 + 3 * s3 + 4 * hr) / ab : 0);
        }
      }
      if (hasH && hasAB) found.add(AVG_KEY);
      if (hasH && hasAB && hasBB) found.add(OBP_KEY);
      if (hasAB && (has1B || has2B || has3B || hasHR)) found.add(SLG_KEY);

      const metrics = METRICS.filter((m) => found.has(m.key));
      setAvailableMetrics(metrics);
      setSortBy((prev) => (metrics.some((m) => m.key === prev) ? prev : "AB"));
      setPlayers(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [selectedCategory, seasonID]);

  useEffect(() => {
    setPlayers(null);
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

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

      <View style={{ marginTop: spacing.lg }}>
        {!players && !error ? (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <Loading label="Recopilando estadísticas de todos los equipos…" />
          </View>
        ) : error ? (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <EmptyState title="No se pudieron cargar las estadísticas" message={error} onRetry={load} />
          </View>
        ) : availableMetrics.length === 0 || leaders.length === 0 ? (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <EmptyState
              title="Sin estadísticas"
              message="Esta categoría aún no tiene estadísticas registradas."
            />
          </View>
        ) : (
          <>
            <View style={{ paddingHorizontal: spacing.lg }}>
              <SectionHeader
                title="Líderes estadísticos"
                subtitle={sortMetric ? `Ordenado por ${sortMetric.hint}` : undefined}
              />
            </View>

            {/* Selector de métrica para ordenar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}
            >
              {availableMetrics.map((m) => {
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
              metrics={availableMetrics}
              sortBy={sortBy}
              theme={theme}
            />

            <Text
              style={{
                color: theme.textFaint,
                fontSize: 10,
                fontFamily: font.regular,
                marginTop: spacing.sm,
                marginHorizontal: spacing.lg,
                textAlign: "center",
              }}
            >
              Desliza la tabla horizontalmente para ver todas las columnas
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
  const { width: screenWidth } = useWindowDimensions();
  // La columna del jugador usa el espacio que sobre tras reservar un
  // mínimo para stats; si hay muchas columnas, el área de stats hace
  // scroll horizontal y el nombre se queda fijo aprovechando todo el
  // ancho disponible.
  const STAT_COL = 48;
  const minStatsArea = 120;
  const nameColWidth = Math.max(140, screenWidth - Math.min(minStatsArea, metrics.length * STAT_COL));

  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: theme.borderSubtle,
          overflow: "hidden",
        },
        elevation(2),
      ]}
    >
      <View style={{ flexDirection: "row" }}>
        {/* Columna fija: puesto + jugador + equipo — aprovecha el ancho */}
        <View style={{ width: nameColWidth, borderRightWidth: 1, borderRightColor: theme.border }}>
          <HeaderCell theme={theme} align="left" pad>
            JUGADOR
          </HeaderCell>
          {leaders.map((p, i) => (
            <View
              key={p.personID}
              style={{
                height: 50,
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
              <View style={{ flex: 1, marginLeft: spacing.xs }}>
                <Text
                  style={{ color: theme.text, fontSize: 13, fontFamily: font.medium }}
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

        {/* Stats: scroll horizontal, todas las columnas siempre presentes */}
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
                  height: 50,
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
  width?: number;
  align?: "left" | "center";
  accent?: boolean;
  pad?: boolean;
}) {
  return (
    <View
      style={{
        width,
        flex: width ? undefined : 1,
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
