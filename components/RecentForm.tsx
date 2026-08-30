// Chips de forma reciente (W/D/L) a partir de recentForm como "WWLWD".
import { Text, View } from "react-native";
import { useTheme } from "../lib/useTheme";
import { radius, spacing } from "../lib/theme";

export function RecentForm({ form, max = 5 }: { form: string; max?: number }) {
  const { theme } = useTheme();
  const chars = form.replace(/[^WDLw]/gi, "").slice(-max).toUpperCase();

  const colorFor = (c: string) =>
    c === "W" ? theme.win : c === "D" ? theme.tie : c === "L" ? theme.loss : theme.textMuted;

  if (!chars) return null;

  return (
    <View style={{ flexDirection: "row", gap: spacing.xs }}>
      {chars.split("").map((c, i) => (
        <View
          key={`${c}-${i}`}
          style={{
            width: 20,
            height: 20,
            borderRadius: radius.sm,
            backgroundColor: colorFor(c),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: theme.textInverse,
              fontSize: 11,
              fontWeight: "700",
              fontFamily: "Inter_700Bold",
            }}
          >
            {c}
          </Text>
        </View>
      ))}
    </View>
  );
}
