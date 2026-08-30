import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  getFixturesForSeason,
  getStatisticSummaryForTeam,
  parseFixtureDate,
} from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { spacing } from "../../lib/theme";
import { Card, EmptyState, Loading, SectionTitle } from "../../components/ui";
import { FixtureCard } from "../../components/FixtureCard";
import { TeamLogo } from "../../components/TeamLogo";
import type { Fixture, PersonStatSummary } from "../../lib/types";

export default function TeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamID = Number(id);
  const { theme } = useTheme();
  const { seasonID } = useAppStore();
  const [stats, setStats] = useState<PersonStatSummary[] | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamID) return;
    let alive = true;
    setStats(null);
    setFixtures(null);
    setError(null);
    Promise.all([
      getStatisticSummaryForTeam(seasonID, teamID)
        .then((s) => s.listCumulativePersonStatSummary ?? [])
        .catch(() => [] as PersonStatSummary[]),
      getFixturesForSeason().catch((e) => {
        throw e;
      }),
    ])
      .then(([s, f]) => {
        if (!alive) return;
        setStats(s);
        setFixtures(f);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Error"));
    return () => {
      alive = false;
    };
  }, [teamID, seasonID]);

  const teamFixtures = useMemo(() => {
    if (!fixtures) return [];
    return fixtures
      .filter((f) => f.homeTeam === teamID || f.roadTeam === teamID)
      .sort((a, b) => b.fixtureDateInMilliseconds - a.fixtureDateInMilliseconds)
      .slice(0, 10);
  }, [fixtures, teamID]);

  // Agrupar stats por jugador
  const players = useMemo(() => {
    if (!stats) return [];
    const map = new Map<number, { name: string; stats: PersonStatSummary[] }>();
    for (const s of stats) {
      const entry = map.get(s.personID) ?? {
        name: `${s.firstName} ${s.lastName}`.trim(),
        stats: [],
      };
      entry.stats.push(s);
      map.set(s.personID, entry);
    }
    return [...map.values()];
  }, [stats]);

  const teamName = fixtures?.find((f) => f.homeTeam === teamID)?.homeTeamName
    ?? fixtures?.find((f) => f.roadTeam === teamID)?.roadTeamName
    ?? "Equipo";

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl }}>
      <Card style={{ alignItems: "center", gap: spacing.sm }}>
        <TeamLogo name={teamName} size={64} />
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: "700", textAlign: "center", fontFamily: "Poppins_600SemiBold" }}>
          {teamName}
        </Text>
      </Card>

      <View>
        <SectionTitle>Últimos partidos</SectionTitle>
        {!fixtures ? (
          <Loading />
        ) : error ? (
          <EmptyState title="Error" message={error} />
        ) : teamFixtures.length === 0 ? (
          <EmptyState title="Sin partidos" />
        ) : (
          teamFixtures.map((f) => <FixtureCard key={f.fixtureID} fixture={f} />)
        )}
      </View>

      <View>
        <SectionTitle>Plantilla y estadísticas</SectionTitle>
        {!stats ? (
          <Loading />
        ) : players.length === 0 ? (
          <EmptyState title="Sin estadísticas disponibles" message="Este equipo aún no tiene estadísticas registradas." />
        ) : (
          players.map((p) => (
            <Card key={p.name} style={{ marginBottom: spacing.sm }}>
              <Text style={{ color: theme.text, fontWeight: "700", marginBottom: spacing.sm, fontFamily: "Inter_700Bold" }}>
                {p.name}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                {p.stats.map((s) => (
                  <View
                    key={`${s.leagueStatTypeID}`}
                    style={{
                      backgroundColor: theme.surfaceAlt,
                      borderRadius: 8,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                    }}
                  >
                    <Text style={{ color: theme.textMuted, fontSize: 10, fontFamily: "Inter_400Regular" }}>
                      {s.leagueStatTypeName}
                    </Text>
                    <Text style={{ color: theme.text, fontWeight: "700", fontFamily: "Inter_700Bold" }}>
                      {s.statTypeValue}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}
