import { Text, View } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "../lib/useTheme";
import { spacing } from "../lib/theme";

export default function NotFoundScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl, gap: spacing.md }}>
      <Text style={{ fontSize: 64, fontWeight: "700", color: theme.primary, fontFamily: "Poppins_600SemiBold" }}>
        404
      </Text>
      <Text style={{ color: theme.text, fontSize: 18, fontFamily: "Inter_500Medium" }}>
        Esta página no existe.
      </Text>
      <Link href="/" style={{ color: theme.primary, fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>
        Volver al inicio
      </Link>
    </View>
  );
}
