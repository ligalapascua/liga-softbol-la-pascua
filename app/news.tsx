import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { ExternalLink } from "lucide-react-native";
import { useTheme } from "../lib/useTheme";
import { radius, spacing } from "../lib/theme";
import { Card, SectionTitle } from "../components/ui";

const NEWS_SOURCES = [
  {
    slug: "la_liga_de_softbol_la_pascua_se_prepara_para_su_gran_allstar_2026",
    title: "La Liga de Softbol La Pascua se prepara para su gran All-Star 2026",
  },
  {
    slug: "dixon_cuarez_se_lleva_el_mvp_de_la_jornada_en_la_categora_c_masculino",
    title: "Dixon Cuarez se lleva el MVP de la jornada en la categoría C Masculino",
  },
  {
    slug: "rosmerth_manrique_mvp_de_la_jornada_en_la_categora_c_especial",
    title: "Rosmerth Manrique, MVP de la jornada en la categoría C Especial",
  },
  {
    slug: "se_prende_la_categora_c_masculino_solo_cuatro_sobreviven_y_todos_van_por_las_semifinales",
    title: "Se prende la categoría C Masculino: solo cuatro sobreviven y todos van por las semifinales",
  },
];

function url(slug: string) {
  return `https://sofbollapascua.leaguerepublic.com/newsArticle/${slug}.html`;
}

export default function NewsScreen() {
  const { theme } = useTheme();
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl }}>
      <SectionTitle>Últimas noticias</SectionTitle>
      <Text style={{ color: theme.textMuted, marginBottom: spacing.md, fontFamily: "Inter_400Regular" }}>
        Las noticias se publican en el sitio oficial. Toca para leer el artículo completo.
      </Text>
      {NEWS_SOURCES.map((n) => (
        <Pressable
          key={n.slug}
          onPress={() => Linking.openURL(url(n.slug))}
          style={({ pressed }) => ({
            backgroundColor: theme.surface,
            borderRadius: radius.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: theme.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: theme.text, fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>
            {n.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm }}>
            <ExternalLink color={theme.primary} size={14} />
            <Text style={{ color: theme.primary, fontSize: 12, fontFamily: "Inter_500Medium" }}>Leer más</Text>
          </View>
        </Pressable>
      ))}

      <Pressable
        onPress={() => Linking.openURL("https://sofbollapascua.leaguerepublic.com/newsForAll.html")}
        style={({ pressed }) => ({
          alignItems: "center",
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: theme.primaryDark,
          opacity: pressed ? 0.8 : 1,
          marginTop: spacing.sm,
        })}
      >
        <Text style={{ color: theme.textInverse, fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>
          Ver todas las noticias
        </Text>
      </Pressable>
    </ScrollView>
  );
}
