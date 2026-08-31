import { Linking, Pressable, ScrollView, Text, View, Image } from "react-native";
import { ExternalLink } from "lucide-react-native";
import { useTheme } from "../lib/useTheme";
import { elevation, font, radius, spacing } from "../lib/theme";
import { SectionHeader } from "../components/ui";

interface NewsItem {
  slug: string;
  title: string;
  image: string;
}

const NEWS: NewsItem[] = [
  {
    slug: "la_liga_de_softbol_la_pascua_se_prepara_para_su_gran_allstar_2026",
    title: "La Liga de Softbol La Pascua se prepara para su gran All-Star 2026",
    image: "https://images.leaguerepublic.com/data/images/650249628/110.jpg",
  },
  {
    slug: "dixon_cuarez_se_lleva_el_mvp_de_la_jornada_en_la_categora_c_masculino",
    title: "Dixon Cuarez se lleva el MVP de la jornada en la categoría C Masculino",
    image: "https://images.leaguerepublic.com/data/images/384533287/110.jpg",
  },
  {
    slug: "rosmerth_manrique_mvp_de_la_jornada_en_la_categora_c_especial",
    title: "Rosmerth Manrique, MVP de la jornada en la categoría C Especial",
    image: "https://images.leaguerepublic.com/data/images/572005311/110.jpg",
  },
  {
    slug: "se_prende_la_categora_c_masculino_solo_cuatro_sobreviven_y_todos_van_por_las_semifinales",
    title: "Se prende la categoría C Masculino: solo cuatro sobreviven y todos van por las semifinales",
    image: "https://images.leaguerepublic.com/data/images/622544922/110.jpg",
  },
];

const BASE = "https://sofbollapascua.leaguerepublic.com";

export default function NewsScreen() {
  const { theme } = useTheme();
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <SectionHeader
        title="Últimas noticias"
        subtitle="Publicadas en el sitio oficial de la liga"
      />

      <View style={{ gap: spacing.md }}>
        {NEWS.map((n) => (
          <Pressable
            key={n.slug}
            onPress={() => Linking.openURL(`${BASE}/newsArticle/${n.slug}.html`)}
            style={({ pressed }) => [
              {
                backgroundColor: theme.surface,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: pressed ? theme.primary : theme.borderSubtle,
                overflow: "hidden",
              },
              elevation(1),
            ]}
          >
            {/* Miniatura lateral sin perder aspect ratio (cover en cuadrado) */}
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <Image
                source={{ uri: n.image }}
                style={{ width: 96, height: 96, borderRadius: radius.md }}
                resizeMode="cover"
                accessibilityLabel={n.title}
              />
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 15,
                    lineHeight: 21,
                    fontFamily: font.semibold,
                  }}
                >
                  {n.title}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.xs,
                    marginTop: spacing.sm,
                  }}
                >
                  <ExternalLink color={theme.primary} size={12} />
                  <Text style={{ color: theme.primary, fontSize: 11, fontFamily: font.semibold }}>
                    Leer artículo
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => Linking.openURL(`${BASE}/newsForAll.html`)}
        style={({ pressed }) => ({
          alignItems: "center",
          padding: spacing.md,
          borderRadius: radius.lg,
          backgroundColor: theme.primaryDark,
          opacity: pressed ? 0.85 : 1,
          marginTop: spacing.lg,
        })}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 13, fontFamily: font.semibold }}>
          Ver todas las noticias
        </Text>
      </Pressable>
    </ScrollView>
  );
}
