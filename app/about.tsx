import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Github, Instagram, Music2, Phone, Globe, Triangle, Cloud, Server } from "lucide-react-native";
import { useTheme } from "../lib/useTheme";
import { elevation, font, radius, spacing } from "../lib/theme";
import { SectionHeader } from "../components/ui";

const BASE = "https://sofbollapascua.leaguerepublic.com";

const SOCIALS = [
  { label: "Liga de Softbol La Pascua", sub: "TikTok oficial", url: "https://www.tiktok.com/@liga.de.sftbol.la", icon: Music2 },
];

const SPONSORS = [
  { label: "Finca Corazón de Jesús", url: "https://www.instagram.com/fincacorazondejesus/" },
  { label: "Motorepuestos EAV", url: "https://www.instagram.com/motorepuestoseav/" },
  { label: "Los Portus 2014", url: "https://www.instagram.com/losportus_2014.ca/" },
  { label: "Donde Merce", url: "https://www.instagram.com/dond_merce/" },
];

const PORTFOLIOS = [
  { label: "Netlify", url: "https://alfsan.netlify.app", Icon: Globe },
  { label: "Vercel", url: "https://alfsan.vercel.app", Icon: Triangle },
  { label: "Cloudflare", url: "https://ingalfsan.pages.dev/", Icon: Cloud },
  { label: "Render", url: "https://alfsan.onrender.com/", Icon: Server },
];

export default function AboutScreen() {
  const { theme } = useTheme();
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <LinearGradient
        colors={theme.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: spacing.lg,
          paddingBottom: spacing.xl,
          borderBottomLeftRadius: radius.xxl,
          borderBottomRightRadius: radius.xxl,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 22, fontFamily: font.display }}>
          Liga de Softbol{"\n"}La Pascua
        </Text>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 13,
            lineHeight: 20,
            fontFamily: font.regular,
            opacity: 0.85,
            marginTop: spacing.md,
          }}
        >
          Aplicación para seguir las categorías C Femenino, C Masculino y C Especial.
          Los datos provienen de la API oficial de LeagueRepublic y se actualizan
          automáticamente.
        </Text>
      </LinearGradient>

      <View style={{ padding: spacing.lg, gap: spacing.xl }}>
        <View>
          <SectionHeader title="Redes sociales" />
          <View style={{ gap: spacing.sm }}>
            {SOCIALS.map((s) => (
              <LinkRow key={s.url} label={s.label} sub={s.sub} url={s.url} Icon={s.icon} />
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="Patrocinadores" />
          <View style={{ gap: spacing.sm }}>
            {SPONSORS.map((s) => (
              <LinkRow key={s.url} label={s.label} url={s.url} Icon={Instagram} />
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="Contacto" />
          <LinkRow label="Contactos de la liga" url={`${BASE}/contacts.html`} Icon={Phone} />
        </View>

        <View>
          <SectionHeader title="Créditos" subtitle="Desarrollo de la aplicación" />
          <LinkRow
            label="Ing. Jose Alfredo Sanchez"
            sub="Desarrollador"
            url="https://github.com/ingalfsan"
            Icon={Github}
          />
          {/* Portafolios del autor */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: spacing.sm,
              marginTop: spacing.md,
              paddingHorizontal: spacing.xs,
            }}
          >
            {PORTFOLIOS.map((p) => (
              <PortfolioIcon key={p.url} url={p.url} label={p.label} Icon={p.Icon} />
            ))}
          </View>
        </View>

        <Text
          style={{
            color: theme.textFaint,
            fontSize: 11,
            textAlign: "center",
            fontFamily: font.regular,
            lineHeight: 17,
          }}
        >
          Datos suministrados por LeagueRepublic.{"\n"}
          Liga de Softbol La Pascua · Temporada 2026
        </Text>
      </View>
    </ScrollView>
  );
}

function LinkRow({
  label,
  sub,
  url,
  Icon,
}: {
  label: string;
  sub?: string;
  url: string;
  Icon: typeof Instagram;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          padding: spacing.md,
          borderRadius: radius.lg,
          backgroundColor: theme.surface,
          borderColor: pressed ? theme.primary : theme.borderSubtle,
          borderWidth: 1,
        },
        elevation(1),
      ]}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: radius.md,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.primarySoft,
        }}
      >
        <Icon color={theme.primary} size={17} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.text, fontSize: 13, fontFamily: font.medium }}>{label}</Text>
        {sub ? (
          <Text style={{ color: theme.textFaint, fontSize: 11, fontFamily: font.regular }}>
            {sub}
          </Text>
        ) : null}
      </View>
      <ChevronRight color={theme.textFaint} size={17} />
    </Pressable>
  );
}

function PortfolioIcon({
  url,
  label,
  Icon,
}: {
  url: string;
  label: string;
  Icon: typeof Instagram;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      accessibilityLabel={`Portafolio en ${label}`}
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: radius.md,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: pressed ? theme.primary : theme.borderSubtle,
        },
        elevation(1),
      ]}
    >
      <Icon color={theme.primary} size={20} />
    </Pressable>
  );
}
