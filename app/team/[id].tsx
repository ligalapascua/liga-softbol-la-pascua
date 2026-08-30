import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { getFixturesForSeason, getStatisticSummaryForTeam } from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { elevation, font, radius, spacing, type Theme } from "../../lib/theme";
import { EmptyState, Loading, SectionHeader } from "../../components/ui";
import { FixtureCard } from "../../components/FixtureCard";
import { TeamLogo } from "../../components/TeamLogo";
import { RecentForm } from "../../components/RecentForm";
import type { Fixture, PersonStatSummary } from "../../lib/types";

export default function TeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamID = Number(id);
  const { theme } = useTheme();
  const { seasonID } = useAppStore();
  const [stats, setStats] = useState<PersonStatSummary[] | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!teamID) return;
    setError(null);
    try {
      const [s, f] = await Promise.all([
        getStatisticSummaryForTeam(seasonID, teamID)
          .then((r) => r.listCumulativePersonStatSummary ?? [])
          .catch(() => [] as PersonStatSummary[]),
        getFixturesForSeason(),
      ]);
      setStats(s);
      setFixtures(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [teamID, seasonID]);

  useEffect(() => {
    load();
  }, [load]);

  const teamFixtures = useMemo(() => {
    if (!fixtures) return [];
    return fixtures
      .filter((f) => f.homeTeam === teamID || f.roadTeam === teamID)
      .sort((a, b) => b.fixtureDateInMilliseconds - a.fixtureDateInMilliseconds);
  }, [fixtures, teamID]);

  const teamName = useMemo(() => {
    const f = teamFixtures[0];
    if (!f) return "Equipo";
    return f.homeTeam === teamID ? f.homeTeamName : f.roadTeamName;
  }, [teamFixtures, teamID]);

  // Balance y forma reciente calculados de los partidos jugados.
  const record = useMemo(() => {
    let w = 0,
      l = 0,
      t = 0;
    const form: string[] = [];
    const playedAsc = [...teamFixtures].filter((f) => f.result).reverse();
    for (const f of playedAsc) {
      const isHome = f.homeTeam === teamID;
      const mine = Number(isHome ? f.homeScore : f.roadScore);
      const theirs = Number(isHome ? f.roadScore : f.homeScore);
      if (mine > theirs) (w++, form.push("W"));
      else if (mine < theirs) (l++, form.push("L"));
      else (t++, form.push("D"));
    }
    return { w, l, t, form: form.join("") };
  }, [teamFixtures, teamID]);

  const players = useMemo(() => {
    if (!stats) return [];
    const map = new Map<number, { name: string; stats: PersonStatSummary[] }>();
    for (const s of stats) {
      const entry =
        map.get(s.personID) ?? { name: `${s.firstName} ${s.lastName}`.trim(), stats: [] };
      entry.stats.push(s);
      map.set(s.personID, entry);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [stats]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <LinearGradient
        colors={theme.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          alignItems: "center",
          paddingTop: spacing.lg,
          paddingBottom: spacing.xl,
          paddingHorizontal: spacing.lg,
          borderBottomLeftRadius: radius.xxl,
          borderBottomRightRadius: radius.xxl,
          gap: spacing.sm,
        }}
      >
        <TeamLogo name={teamName} size={68} spaced={false} />
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 20,
            textAlign: "center",
            fontFamily: font.display,
          }}
        >
          {teamName}
        </Text>
        {record.w + record.l + record.t > 0 ? (
          <>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 13,
                fontFamily: font.medium,
                opacity: 0.85,
              }}
            >
              {record.w}G · {record.l}P{record.t > 0 ? ` · ${record.t}E` : ""}
            </Text>
            <RecentForm form={record.form} max={6} size={20} />
          </>
        ) : null}
      </LinearGradient>

      <View style={{ padding: spacing.lg, gap: spacing.xl }}>
        <View>
          <SectionHeader title="Partidos" subtitle={`${teamFixtures.length} en la temporada`} />
          {!fixtures && !error ? (
            <Loading />
          ) : error ? (
            <EmptyState title="Error al cargar" message={error} onRetry={load} />
          ) : teamFixtures.length === 0 ? (
            <EmptyState title="Sin partidos registrados" />
          ) : (
            teamFixtures.slice(0, 12).map((f) => <FixtureCard key={f.fixtureID} fixture={f} />)
          )}
        </View>

        <View>
          <SectionHeader title="Plantilla" subtitle={players.length ? `${players.length} jugadores` : undefined} />
          {!stats ? (
            <Loading />
          ) : players.length === 0 ? (
            <EmptyState
              title="Sin estadísticas disponibles"
              message="Este equipo aún no tiene estadísticas registradas."
            />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {players.map((p) => (
                <PlayerCard key={p.name} name={p.name} stats={p.stats} theme={theme} />
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function PlayerCard({
  name,
  stats,
  theme,
}: {
  name: string;
  stats: PersonStatSummary[];
  theme: Theme;
}) {
  const shown = stats.filter((s) => (parseFloat(s.statTypeValue) || 0) !== 0).slice(0, 8);
  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          padding: spacing.md,
        },
        elevation(1),
      ]}
    >
      <Text style={{ color: theme.text, fontSize: 14, fontFamily: font.semibold }}>{name}</Text>
      {shown.length === 0 ? (
        <Text
          style={{
            color: theme.textFaint,
            fontSize: 11,
            fontFamily: font.regular,
            marginTop: spacing.xs,
          }}
        >
          Sin estadísticas acumuladas
        </Text>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm }}>
          {shown.map((s) => (
            <View
              key={s.leagueStatTypeID}
              style={{
                backgroundColor: theme.surfaceAlt,
                borderRadius: radius.sm,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                minWidth: 52,
              }}
            >
              <Text style={{ color: theme.textFaint, fontSize: 9, fontFamily: font.bold, letterSpacing: 0.4 }}>
                {s.leagueStatTypeName}
              </Text>
              <Text style={{ color: theme.text, fontSize: 14, fontFamily: font.bold }}>
                {s.statTypeValue}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
