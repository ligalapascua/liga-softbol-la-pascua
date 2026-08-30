import { Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import { MapPin } from "lucide-react-native";
import { useTheme } from "../lib/useTheme";
import { elevation, font, radius, spacing, type Theme } from "../lib/theme";
import { parseFixtureDate } from "../lib/api";
import type { Fixture } from "../lib/types";
import { TeamLogo } from "./TeamLogo";
import { cleanDesc } from "./CategoryTabs";

function fmtDay(d: Date): string {
  return d
    .toLocaleDateString("es-VE", { day: "2-digit", month: "short" })
    .replace(".", "")
    .toUpperCase();
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });
}

export function FixtureCard({ fixture }: { fixture: Fixture }) {
  const { theme } = useTheme();
  const date = parseFixtureDate(fixture.fixtureDate);
  const played = fixture.result;
  const home = Number(fixture.homeScore ?? 0);
  const road = Number(fixture.roadScore ?? 0);
  const homeWin = played && home > road;
  const roadWin = played && road > home;

  return (
    <Link href={`/match/${fixture.fixtureID}`} asChild>
      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: theme.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: pressed ? theme.primary : theme.borderSubtle,
            marginBottom: spacing.sm,
            overflow: "hidden",
          },
          elevation(1),
        ]}
      >
        {/* Cabecera: categoría + fecha/estado */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: theme.surfaceAlt,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              letterSpacing: 0.5,
              color: theme.primary,
              fontFamily: font.bold,
            }}
          >
            {cleanDesc(fixture.fixtureGroupDesc)}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Text style={{ fontSize: 11, color: theme.textMuted, fontFamily: font.medium }}>
              {fmtDay(date)} · {fmtTime(date)}
            </Text>
            <StatusDot played={played} theme={theme} />
          </View>
        </View>

        {/* Cuerpo: equipos + marcador */}
        <View style={{ padding: spacing.md, gap: spacing.sm }}>
          <TeamRow name={fixture.homeTeamName} score={fixture.homeScore} win={homeWin} played={played} />
          <TeamRow name={fixture.roadTeamName} score={fixture.roadScore} win={roadWin} played={played} />
        </View>

        {/* Pie: sede y nota */}
        {fixture.venueAndSubVenueDesc || fixture.fixtureNote ? (
          <View
            style={{
              paddingHorizontal: spacing.md,
              paddingBottom: spacing.md,
              gap: spacing.xs,
            }}
          >
            {fixture.venueAndSubVenueDesc ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                <MapPin color={theme.textFaint} size={11} />
                <Text style={{ color: theme.textFaint, fontSize: 11, fontFamily: font.regular }}>
                  {fixture.venueAndSubVenueDesc}
                </Text>
              </View>
            ) : null}
            {fixture.fixtureNote ? (
              <Text
                style={{
                  color: theme.textFaint,
                  fontSize: 11,
                  fontStyle: "italic",
                  fontFamily: font.regular,
                }}
                numberOfLines={2}
              >
                {fixture.fixtureNote}
              </Text>
            ) : null}
          </View>
        ) : null}
      </Pressable>
    </Link>
  );
}

function StatusDot({ played, theme }: { played: boolean; theme: Theme }) {
  return (
    <View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: played ? theme.win : theme.accent,
      }}
    />
  );
}

function TeamRow({
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
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TeamLogo name={name} size={30} />
      <Text
        style={{
          flex: 1,
          color: played && !win ? theme.textMuted : theme.text,
          fontSize: 14,
          fontFamily: win ? font.bold : font.medium,
        }}
        numberOfLines={1}
      >
        {name}
      </Text>
      {played ? (
        <View
          style={{
            minWidth: 30,
            alignItems: "center",
            paddingVertical: 2,
            paddingHorizontal: spacing.sm,
            borderRadius: radius.sm,
            backgroundColor: win ? theme.primarySoft : "transparent",
          }}
        >
          <Text
            style={{
              color: win ? theme.primary : theme.textMuted,
              fontSize: 16,
              fontFamily: font.bold,
            }}
          >
            {score ?? "-"}
          </Text>
        </View>
      ) : (
        <Text style={{ color: theme.textFaint, fontSize: 13, fontFamily: font.regular }}>—</Text>
      )}
    </View>
  );
}
