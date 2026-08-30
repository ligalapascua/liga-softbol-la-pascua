import { useCallback, useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ExternalLink, MapPin, StickyNote } from "lucide-react-native";
import { getFullFixtureDetails, parseFixtureDate } from "../../lib/api";
import { useTheme } from "../../lib/useTheme";
import { elevation, font, radius, spacing, type Theme } from "../../lib/theme";
import { Card, EmptyState, Loading } from "../../components/ui";
import { TeamLogo } from "../../components/TeamLogo";
import { cleanDesc } from "../../components/CategoryTabs";
import type { FullFixtureDetails } from "../../lib/types";

export default function MatchScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<FullFixtureDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      setData(await getFullFixtureDetails(Number(id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const f = data?.fixture;
  const date = f ? parseFixtureDate(f.fixtureDate) : null;
  const home = Number(f?.homeScore ?? 0);
  const road = Number(f?.roadScore ?? 0);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
    >
      {!data && !error ? (
        <View style={{ padding: spacing.lg }}>
          <Loading />
        </View>
      ) : error || !f ? (
        <View style={{ padding: spacing.lg }}>
          <EmptyState title="No se pudo cargar el partido" message={error ?? undefined} onRetry={load} />
        </View>
      ) : (
        <>
          {/* Scoreboard */}
          <LinearGradient
            colors={theme.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: spacing.lg,
              paddingBottom: spacing.xl,
              paddingHorizontal: spacing.lg,
              borderBottomLeftRadius: radius.xxl,
              borderBottomRightRadius: radius.xxl,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 10,
                letterSpacing: 1.2,
                fontFamily: font.bold,
                opacity: 0.75,
              }}
            >
              {cleanDesc(f.fixtureGroupDesc).toUpperCase()}
            </Text>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 12,
                fontFamily: font.regular,
                opacity: 0.85,
                marginTop: spacing.xs,
                textAlign: "center",
              }}
            >
              {date?.toLocaleDateString("es-VE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {" · "}
              {date?.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginTop: spacing.lg,
                width: "100%",
              }}
            >
              <TeamSide name={f.homeTeamName} score={f.homeScore} win={f.result && home > road} played={f.result} />
              <View style={{ paddingHorizontal: spacing.sm, paddingTop: spacing.xl }}>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontFamily: font.bold,
                    opacity: 0.6,
                  }}
                >
                  {f.result ? "—" : "VS"}
                </Text>
              </View>
              <TeamSide name={f.roadTeamName} score={f.roadScore} win={f.result && road > home} played={f.result} />
            </View>

            <View
              style={{
                marginTop: spacing.lg,
                paddingHorizontal: spacing.md,
                paddingVertical: 3,
                borderRadius: radius.pill,
                backgroundColor: "rgba(255,255,255,0.16)",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 11, fontFamily: font.semibold }}>
                {f.fixtureStatusDesc}
              </Text>
            </View>
          </LinearGradient>

          <View style={{ padding: spacing.lg, gap: spacing.md }}>
            {f.venueAndSubVenueDesc || data?.venue?.venueName ? (
              <InfoCard
                icon={MapPin}
                title="Sede"
                theme={theme}
                lines={[
                  f.venueAndSubVenueDesc ?? data?.venue?.venueName ?? "",
                  data?.venue?.venueAddr1 ?? "",
                ].filter(Boolean)}
              />
            ) : null}

            {f.fixtureNote ? (
              <InfoCard icon={StickyNote} title="Nota del partido" theme={theme} lines={[f.fixtureNote]} />
            ) : null}

            <Pressable
              onPress={() =>
                Linking.openURL(`https://sofbollapascua.leaguerepublic.com/match/${f.fixtureID}.html`)
              }
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: spacing.sm,
                padding: spacing.md,
                borderRadius: radius.lg,
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderWidth: 1,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <ExternalLink color={theme.primary} size={15} />
              <Text style={{ color: theme.primary, fontSize: 13, fontFamily: font.semibold }}>
                Ver en el sitio oficial
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function TeamSide({
  name,
  score,
  win,
  played,
}: {
  name: string;
  score: string | null;
  win: boolean;
  played: boolean;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: spacing.sm }}>
      <TeamLogo name={name} size={56} spaced={false} />
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 13,
          textAlign: "center",
          fontFamily: win ? font.bold : font.medium,
          opacity: played && !win ? 0.7 : 1,
        }}
        numberOfLines={2}
      >
        {name}
      </Text>
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 34,
          fontFamily: font.display,
          opacity: played ? (win ? 1 : 0.65) : 0.4,
        }}
      >
        {played ? score ?? "-" : "–"}
      </Text>
    </View>
  );
}

function InfoCard({
  icon: Icon,
  title,
  lines,
  theme,
}: {
  icon: typeof MapPin;
  title: string;
  lines: string[];
  theme: Theme;
}) {
  return (
    <Card level={1}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <Icon color={theme.primary} size={16} />
        <Text style={{ color: theme.text, fontSize: 14, fontFamily: font.semibold }}>{title}</Text>
      </View>
      {lines.map((l, i) => (
        <Text
          key={i}
          style={{
            color: theme.textMuted,
            fontSize: 13,
            fontFamily: font.regular,
            marginTop: i === 0 ? spacing.sm : 2,
            lineHeight: 19,
          }}
        >
          {l}
        </Text>
      ))}
    </Card>
  );
}
