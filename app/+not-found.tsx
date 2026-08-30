import { Text, View } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "../lib/useTheme";
import { font, radius, spacing } from "../lib/theme";

export default function NotFoundScreen() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xxl,
        gap: spacing.md,
      }}
    >
      <Text style={{ fontSize: 58, color: theme.primary, fontFamily: font.display }}>404</Text>
      <Text style={{ color: theme.text, fontSize: 16, fontFamily: font.medium }}>
        Esta página no existe.
      </Text>
      <Link
        href="/"
        style={{
          color: "#FFFFFF",
          fontFamily: font.semibold,
          fontSize: 13,
          backgroundColor: theme.primary,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderRadius: radius.pill,
          overflow: "hidden",
          marginTop: spacing.sm,
        }}
      >
        Volver al inicio
      </Link>
    </View>
  );
}
