import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Instagram, Music2 } from "lucide-react-native";
import { useTheme } from "../lib/useTheme";
import { radius, spacing } from "../lib/theme";
import { Card, SectionTitle } from "../components/ui";

const SOCIALS = [
  { label: "@liga.de.sftbol.la", url: "https://www.tiktok.com/@liga.de.sftbol.la", icon: Music2 },
  { label: "Finca Corazón de Jesús", url: "https://www.instagram.com/fincacorazondejesus/", icon: Instagram },
  { label: "Repuestos EAV", url: "https://www.instagram.com/motorepuestoseav/", icon: Instagram },
  { label: "Los Portus 2014", url: "https://www.instagram.com/losportus_2014.ca/", icon: Instagram },
  { label: "Donde Merce", url: "https://www.instagram.com/dond_merce/", icon: Instagram },
];

export default function AboutScreen() {
  const { theme } = useTheme();
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl }}>
      <Card style={{ backgroundColor: theme.primaryDark, borderColor: theme.primaryDark }}>
        <Text style={{ color: theme.textInverse, fontSize: 20, fontWeight: "700", fontFamily: "Poppins_600SemiBold" }}>
          Liga de Softbol La Pascua
        </Text>
        <Text style={{ color: theme.textInverse, opacity: 0.85, marginTop: spacing.sm, fontFamily: "Inter_400Regular" }}>
          Aplicación no oficial para seguir las categorías C Femenino, C Masculino y C Especial
          de la Liga de Softbol La Pascua. Datos obtenidos de la API JSON de LeagueRepublic.
        </Text>
      </Card>

      <View>
        <SectionTitle>Redes y patrocinadores</SectionTitle>
        {SOCIALS.map((s) => (
          <Pressable
            key={s.url}
            onPress={() => Linking.openURL(s.url)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
              marginBottom: spacing.sm,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <s.icon color={theme.primary} size={20} />
            <Text style={{ color: theme.text, fontWeight: "500", fontFamily: "Inter_500Medium" }}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => Linking.openURL("https://sofbollapascua.leaguerepublic.com/contacts.html")}
        style={({ pressed }) => ({
          alignItems: "center",
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ color: theme.primary, fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>
          Contacto oficial
        </Text>
      </Pressable>
    </ScrollView>
  );
}
