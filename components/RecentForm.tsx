// Chips de forma reciente (W/D/L) a partir de recentForm como "WWLWD".
import { Text, View } from "react-native";
import { useTheme } from "../lib/useTheme";
import { font, radius, spacing } from "../lib/theme";

export function RecentForm({
  form,
  max = 5,
  size = 18,
}: {
  form: string;
  max?: number;
  size?: number;
}) {
  const { theme } = useTheme();
  const chars = form.replace(/[^WDLwdl]/g, "").slice(-max).toUpperCase();

  const colorFor = (c: string) =>
    c === "W" ? theme.win : c === "D" ? theme.tie : theme.loss;

  if (!chars) {
    return (
      <Text style={{ color: theme.textFaint, fontSize: 11, fontFamily: font.regular }}>
        —
      </Text>
    );
  }

  return (
    <View style={{ flexDirection: "row", gap: 3 }}>
      {chars.split("").map((c, i) => (
        <View
          key={`${c}-${i}`}
          style={{
            width: size,
            height: size,
            borderRadius: radius.sm - 2,
            backgroundColor: colorFor(c),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: size * 0.55,
              fontFamily: font.bold,
            }}
          >
            {c}
          </Text>
        </View>
      ))}
    </View>
  );
}
