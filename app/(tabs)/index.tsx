import { useCallback, useEffect, useMemo, useState } from "react";
import { Linking, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, ExternalLink, Trophy, BarChart3, Newspaper, Info } from "lucide-react-native";
import { getFixturesForSeason, isFuture, isPast } from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { elevation, font, radius, spacing, type Theme } from "../../lib/theme";
import { EmptyState, Loading, SectionHeader } from "../../components/ui";
import { CategoryTabs } from "../../components/CategoryTabs";
import { FixtureCard } from "../../components/FixtureCard";
import type { Fixture } from "../../lib/types";

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { seasonName, categories, selectedCategory, selectCategory } = useAppStore();
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const f = await getFixturesForSeason();
      setFixtures(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const forCategory = useMemo(() => {
    if (!fixtures || !selectedCategory) return [];
    return fixtures.filter(
      (f) => f.fixtureGroupIdentifier === selectedCategory.fixtureGroupIdentifier
    );
  }, [fixtures, selectedCategory]);

  const upcoming = useMemo(
    () =>
      forCategory
        .filter(isFuture)
        .sort((a, b) => a.fixtureDateInMilliseconds - b.fixtureDateInMilliseconds)
        .slice(0, 3),
    [forCategory]
  );

  const recent = useMemo(
    () =>
      forCategory
        .filter(isPast)
        .sort((a, b) => b.fixtureDateInMilliseconds - a.fixtureDateInMilliseconds)
        .slice(0, 3),
    [forCategory]
  );

  const played = forCategory.filter(isPast).length;

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
    >
      {/* Hero */}
      <LinearGradient
        colors={theme.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xl,
          borderBottomLeftRadius: radius.xxl,
          borderBottomRightRadius: radius.xxl,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 11,
            letterSpacing: 1.4,
            fontFamily: font.bold,
            opacity: 0.75,
          }}
        >
          TEMPORADA {seasonName}
        </Text>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 26,
            fontFamily: font.display,
            marginTop: spacing.xs,
            letterSpacing: -0.5,
          }}
        >
          Liga de Softbol{"\n"}La Pascua
        </Text>

        <View style={{ flexDirection: "row", gap: spacing.xl, marginTop: spacing.lg }}>
          <HeroStat label="Categorías" value={String(categories.length || "—")} />
          <HeroStat label="Partidos jugados" value={String(played || "—")} />
        </View>
      </LinearGradient>

      {/* Categorías */}
      <View style={{ marginTop: spacing.lg }}>
        <View style={{ paddingHorizontal: spacing.lg }}>
          <SectionHeader title="Categorías" />
        </View>
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={selectCategory}
        />
      </View>

      {/* Accesos rápidos */}
      <View
        style={{
          flexDirection: "row",
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          marginTop: spacing.lg,
        }}
      >
        <QuickAction icon={Trophy} label="Posiciones" onPress={() => router.push("/standings")} theme={theme} />
        <QuickAction icon={BarChart3} label="Líderes" onPress={() => router.push("/stats")} theme={theme} />
        <QuickAction icon={Newspaper} label="Noticias" onPress={() => router.push("/news")} theme={theme} />
        <QuickAction icon={Info} label="La Liga" onPress={() => router.push("/about")} theme={theme} />
      </View>

      {/* Próximos */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
        <SectionHeader
          title="Próximos partidos"
          action={{ label: "Ver todos", onPress: () => router.push("/fixtures") }}
        />
        {!fixtures && !error ? (
          <Loading />
        ) : error ? (
          <EmptyState title="No se pudieron cargar los partidos" message={error} onRetry={load} />
        ) : upcoming.length === 0 ? (
          <EmptyState title="No hay partidos programados" message="Revisa más tarde." />
        ) : (
          upcoming.map((f) => <FixtureCard key={f.fixtureID} fixture={f} />)
        )}
      </View>

      {/* Últimos resultados */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
        <SectionHeader
          title="Últimos resultados"
          action={{ label: "Ver todos", onPress: () => router.push("/fixtures") }}
        />
        {!fixtures && !error ? (
          <Loading />
        ) : recent.length === 0 ? (
          <EmptyState title="Aún no hay resultados" />
        ) : (
          recent.map((f) => <FixtureCard key={f.fixtureID} fixture={f} />)
        )}
      </View>

      {/* Sitio oficial */}
      <Pressable
        onPress={() => Linking.openURL("https://sofbollapascua.leaguerepublic.com/index.html")}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sm,
          marginHorizontal: spacing.lg,
          marginTop: spacing.xl,
          padding: spacing.md,
          borderRadius: radius.lg,
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <ExternalLink color={theme.primary} size={15} />
        <Text style={{ color: theme.primary, fontSize: 13, fontFamily: font.semibold }}>
          Ver sitio oficial
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={{ color: "#FFFFFF", fontSize: 22, fontFamily: font.display }}>{value}</Text>
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 11,
          fontFamily: font.regular,
          opacity: 0.7,
          marginTop: -2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onPress,
  theme,
}: {
  icon: typeof Trophy;
  label: string;
  onPress: () => void;
  theme: Theme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          alignItems: "center",
          gap: spacing.xs,
          paddingVertical: spacing.md,
          borderRadius: radius.lg,
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          opacity: pressed ? 0.7 : 1,
        },
        elevation(1),
      ]}
    >
      <Icon color={theme.primary} size={20} />
      <Text
        style={{
          color: theme.textMuted,
          fontSize: 10,
          fontFamily: font.medium,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
