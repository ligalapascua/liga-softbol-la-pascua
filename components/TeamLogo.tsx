// Avatar circular con las iniciales del equipo (no hay logos en la API).
import { Text, View } from "react-native";
import { useTheme } from "../lib/useTheme";
import { radius, spacing } from "../lib/theme";

function initials(name: string): string {
  const clean = name.replace(/["'`]/g, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function TeamLogo({
  name,
  size = 36,
}: {
  name: string;
  size?: number;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.primaryDark,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.sm,
      }}
    >
      <Text
        style={{
          color: theme.textInverse,
          fontWeight: "700",
          fontSize: size * 0.32,
          fontFamily: "Inter_700Bold",
        }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}
