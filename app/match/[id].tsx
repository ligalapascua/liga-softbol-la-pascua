import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ExternalLink, MapPin, StickyNote } from "lucide-react-native";
import { getFullFixtureDetails, parseFixtureDate } from "../../lib/api";
import { useTheme } from "../../lib/useTheme";
import { radius, spacing } from "../../lib/theme";
import { Card, EmptyState, Loading } from "../../components/ui";
import { TeamLogo } from "../../components/TeamLogo";
import { Badge } from "../../components/ui";
import type { FullFixtureDetails } from "../../lib/types";

export default function MatchScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<FullFixtureDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setData(null);
    getFullFixtureDetails(Number(id))
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Error"));
    return () => {
      alive = false;
    };
  }, [id]);

  const f = data?.fixture;
  const date = f ? parseFixtureDate(f.fixtureDate) : null;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl }}>
      {!data && !error ? (
        <Loading />
      ) : error || !f ? (
        <EmptyState title="No se pudo cargar el partido" message={error ?? undefined} />
      ) : (
        <>
          <Card style={{ alignItems: "center", gap: spacing.md }}>
            <Badge text={f.fixtureGroupDesc.replace(/["']/g, "")} />
            <Text style={{ color: theme.textMuted, fontSize: 12, fontFamily: "Inter_400Regular" }}>
              {date?.toLocaleDateString("es-VE", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg }}>
              <TeamSide name={f.homeTeamName} score={f.homeScore} win={Number(f.homeScore) > Number(f.roadScore)} />
              <Text style={{ color: theme.textMuted, fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" }}>
                {f.result ? ":" : "vs"}
              </Text>
              <TeamSide name={f.roadTeamName} score={f.roadScore} win={Number(f.roadScore) > Number(f.homeScore)} />
            </View>
            <Text style={{ color: theme.textMuted, fontSize: 12, fontFamily: "Inter_400Regular" }}>
              {f.fixtureStatusDesc}
            </Text>
          </Card>

          {f.venueAndSubVenueDesc || data?.venue?.venueName ? (
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <MapPin color={theme.primary} size={18} />
                <Text style={{ color: theme.text, fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>Sede</Text>
              </View>
              <Text style={{ color: theme.textMuted, marginTop: spacing.xs, fontFamily: "Inter_400Regular" }}>
                {f.venueAndSubVenueDesc ?? data?.venue?.venueName}
                {data?.venue?.venueAddr1 ? `\n${data.venue.venueAddr1}` : ""}
              </Text>
            </Card>
          ) : null}

          {f.fixtureNote ? (
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <StickyNote color={theme.primary} size={18} />
                <Text style={{ color: theme.text, fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>Nota</Text>
              </View>
              <Text style={{ color: theme.textMuted, marginTop: spacing.xs, fontFamily: "Inter_400Regular" }}>
                {f.fixtureNote}
              </Text>
            </Card>
          ) : null}

          <Pressable
            onPress={() => Linking.openURL(`https://sofbollapascua.leaguerepublic.com/match/${f.fixtureID}.html`)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.sm,
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <ExternalLink color={theme.primary} size={16} />
            <Text style={{ color: theme.primary, fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>
              Ver en el sitio oficial
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

function TeamSide({ name, score, win }: { name: string; score: string | null; win: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: "center", gap: spacing.xs, flex: 1 }}>
      <TeamLogo name={name} size={56} />
      <Text style={{ color: theme.text, fontWeight: "600", textAlign: "center", fontFamily: "Inter_600SemiBold" }} numberOfLines={2}>
        {name}
      </Text>
      <Text style={{ color: win ? theme.primary : theme.text, fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold" }}>
        {score ?? "-"}
      </Text>
    </View>
  );
}
