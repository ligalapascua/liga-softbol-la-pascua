import { Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "../lib/useTheme";
import { radius, spacing } from "../lib/theme";
import { parseFixtureDate } from "../lib/api";
import type { Fixture } from "../lib/types";
import { TeamLogo } from "./TeamLogo";
import { cleanDesc } from "./CategoryTabs";
import { Badge } from "./ui";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("es-VE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FixtureCard({ fixture }: { fixture: Fixture }) {
  const { theme } = useTheme();
  const date = parseFixtureDate(fixture.fixtureDate);
  const hasResult = fixture.result;
  const homeWin =
    hasResult &&
    Number(fixture.homeScore ?? 0) > Number(fixture.roadScore ?? 0);
  const roadWin =
    hasResult &&
    Number(fixture.roadScore ?? 0) > Number(fixture.homeScore ?? 0);

  return (
    <Link href={`/match/${fixture.fixtureID}`} asChild>
      <Pressable
        style={({ pressed }) => ({
          backgroundColor: theme.surface,
          borderRadius: radius.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: theme.border,
          opacity: pressed ? 0.85 : 1,
          marginBottom: spacing.sm,
        })}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Badge text={cleanDesc(fixture.fixtureGroupDesc)} />
          <Text style={{ color: theme.textMuted, fontSize: 11, fontFamily: "Inter_400Regular" }}>
            {fmtDate(date)}
          </Text>
        </View>

        <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
          <TeamRow name={fixture.homeTeamName} score={fixture.homeScore} win={homeWin} />
          <TeamRow name={fixture.roadTeamName} score={fixture.roadScore} win={roadWin} />
        </View>

        {fixture.venueAndSubVenueDesc ? (
          <Text
            style={{
              marginTop: spacing.sm,
              color: theme.textMuted,
              fontSize: 11,
              fontFamily: "Inter_400Regular",
            }}
          >
            {fixture.venueAndSubVenueDesc}
          </Text>
        ) : null}

        {fixture.fixtureNote ? (
          <Text
            style={{
              marginTop: spacing.xs,
              color: theme.textMuted,
              fontSize: 11,
              fontStyle: "italic",
              fontFamily: "Inter_400Regular",
            }}
            numberOfLines={2}
          >
            {fixture.fixtureNote}
          </Text>
        ) : null}
      </Pressable>
    </Link>
  );
}

function TeamRow({ name, score, win }: { name: string; score: string | null; win: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <TeamLogo name={name} size={28} />
        <Text
          style={{
            color: win ? theme.text : theme.textMuted,
            fontSize: 14,
            fontWeight: win ? "700" : "500",
            flexShrink: 1,
            fontFamily: win ? "Inter_700Bold" : "Inter_500Medium",
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
      <Text
        style={{
          color: win ? theme.text : theme.textMuted,
          fontSize: 16,
          fontWeight: "700",
          fontFamily: "Inter_700Bold",
          minWidth: 24,
          textAlign: "right",
        }}
      >
        {score ?? "-"}
      </Text>
    </View>
  );
}
