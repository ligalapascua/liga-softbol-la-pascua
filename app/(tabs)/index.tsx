import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import {
  getFixturesForSeason,
  isFuture,
  isPast,
} from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import { useTheme } from "../../lib/useTheme";
import { radius, spacing, type Theme } from "../../lib/theme";
import { Card, EmptyState, Loading, SectionTitle } from "../../components/ui";
import { CategoryTabs } from "../../components/CategoryTabs";
import { FixtureCard } from "../../components/FixtureCard";
import type { Fixture } from "../../lib/types";

export default function HomeScreen() {
  const { theme } = useTheme();
  const { seasonName, categories, selectedCategory, selectCategory } = useAppStore();
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setFixtures(null);
    setError(null);
    getFixturesForSeason()
      .then((f) => alive && setFixtures(f))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Error"));
    return () => {
      alive = false;
    };
  }, []);

  const forCategory = useMemo(() => {
    if (!fixtures || !selectedCategory) return [];
    return fixtures.filter(
      (f) => f.fixtureGroupIdentifier === selectedCategory.fixtureGroupIdentifier
    );
  }, [fixtures, selectedCategory]);

  const upcoming = forCategory.filter(isFuture).slice(0, 4);
  const recent = forCategory.filter(isPast).slice(-4).reverse();

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.lg,
        gap: spacing.lg,
        paddingBottom: spacing.xxl,
      }}
    >
      <Card style={{ backgroundColor: theme.primaryDark, borderColor: theme.primaryDark }}>
        <Text style={{ color: theme.textInverse, fontSize: 22, fontFamily: "Poppins_600SemiBold" }}>
          Liga de Softbol La Pascua
        </Text>
        <Text style={{ color: theme.textInverse, opacity: 0.85, marginTop: 4, fontFamily: "Inter_400Regular" }}>
          Temporada {seasonName}
        </Text>
      </Card>

      <View>
        <SectionTitle>Categorías</SectionTitle>
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={selectCategory}
        />
      </View>

      <View>
        <SectionTitle>Próximos partidos</SectionTitle>
        {!fixtures ? (
          <Loading />
        ) : error ? (
          <EmptyState title="No se pudieron cargar los partidos" message={error} />
        ) : upcoming.length === 0 ? (
          <EmptyState title="No hay partidos programados" message="Revisa más tarde." />
        ) : (
          upcoming.map((f) => <FixtureCard key={f.fixtureID} fixture={f} />)
        )}
      </View>

      <View>
        <SectionTitle>Últimos resultados</SectionTitle>
        {!fixtures ? (
          <Loading />
        ) : recent.length === 0 ? (
          <EmptyState title="Aún no hay resultados" />
        ) : (
          recent.map((f) => <FixtureCard key={f.fixtureID} fixture={f} />)
        )}
      </View>

      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <QuickLink href="/standings" label="Posiciones" theme={theme} />
        <QuickLink href="/stats" label="Líderes" theme={theme} />
      </View>

      <Pressable
        onPress={() => Linking.openURL("https://sofbollapascua.leaguerepublic.com/index.html")}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ color: theme.primary, fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>
          Ver sitio oficial
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function QuickLink({ href, label, theme }: { href: string; label: string; theme: Theme }) {
  return (
    <Link href={href as any} asChild>
      <Pressable
        style={({ pressed }) => ({
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ color: theme.text, fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>
          {label}
        </Text>
        <ChevronRight color={theme.primary} size={18} />
      </Pressable>
    </Link>
  );
}
