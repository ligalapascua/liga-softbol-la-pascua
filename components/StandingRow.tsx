import { Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "../lib/useTheme";
import { radius, spacing } from "../lib/theme";
import type { StandingLine } from "../lib/types";
import { TeamLogo } from "./TeamLogo";
import { RecentForm } from "./RecentForm";

export function StandingRow({
  line,
  isLeader,
}: {
  line: StandingLine;
  isLeader?: boolean;
}) {
  const { theme } = useTheme();
  const pos = Number(line.position) || 0;

  return (
    <Link href={`/team/${line.teamID}`} asChild>
      <Pressable
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          backgroundColor: isLeader ? theme.surfaceAlt : "transparent",
          opacity: pressed ? 0.85 : 1,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        })}
      >
        <Text
          style={{
            width: 26,
            textAlign: "center",
            color: pos === 1 ? theme.primary : theme.textMuted,
            fontSize: 14,
            fontWeight: "700",
            fontFamily: "Inter_700Bold",
          }}
        >
          {pos}
        </Text>

        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <TeamLogo name={line.teamName} size={30} />
          <Text
            style={{
              color: theme.text,
              fontSize: 14,
              fontWeight: "500",
              flexShrink: 1,
              fontFamily: "Inter_500Medium",
            }}
            numberOfLines={1}
          >
            {line.teamName}
          </Text>
        </View>

        <Text style={cell(theme.text)}>{line.overallPlayed}</Text>
        <Text style={cell(theme.text)}>{line.overallWon}</Text>
        <Text style={cell(theme.text)}>{line.overallTied}</Text>
        <Text style={cell(theme.text)}>{line.overallLoss}</Text>
        <Text
          style={{
            ...cell(theme.primary),
            fontWeight: "700",
            fontFamily: "Inter_700Bold",
            minWidth: 30,
          }}
        >
          {Number(line.points).toFixed(0)}
        </Text>
        <View style={{ marginLeft: spacing.sm }}>
          <RecentForm form={line.recentForm} max={5} />
        </View>
      </Pressable>
    </Link>
  );
}

function cell(color: string) {
  return {
    color,
    fontSize: 13,
    textAlign: "center" as const,
    minWidth: 22,
    fontFamily: "Inter_400Regular",
  };
}
