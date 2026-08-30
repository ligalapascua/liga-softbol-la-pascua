// Selector horizontal de categorías (chips).
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "../lib/useTheme";
import { radius, spacing } from "../lib/theme";
import type { FixtureGroup } from "../lib/types";

export function CategoryTabs({
  categories,
  selected,
  onSelect,
}: {
  categories: FixtureGroup[];
  selected: FixtureGroup | null;
  onSelect: (g: FixtureGroup) => void;
}) {
  const { theme } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
    >
      {categories.map((g) => {
        const active = selected?.fixtureGroupIdentifier === g.fixtureGroupIdentifier;
        return (
          <Pressable
            key={g.fixtureGroupIdentifier}
            onPress={() => onSelect(g)}
            style={{
              backgroundColor: active ? theme.primary : theme.surface,
              borderWidth: 1,
              borderColor: active ? theme.primary : theme.border,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            }}
          >
            <Text
              style={{
                color: active ? theme.textInverse : theme.text,
                fontSize: 13,
                fontWeight: "600",
                fontFamily: "Inter_600SemiBold",
              }}
            >
              {cleanDesc(g.fixtureGroupDesc)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function cleanDesc(desc: string): string {
  return desc.replace(/["'`]/g, "").trim();
}

export function CategoryTabsContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={{ marginVertical: spacing.md }}>{children}</View>;
}
