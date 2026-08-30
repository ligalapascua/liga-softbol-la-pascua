// Selector horizontal de categorías (chips).
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "../lib/useTheme";
import { elevation, font, radius, spacing } from "../lib/theme";
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

  if (categories.length === 0) {
    return (
      <View style={{ flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg }}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              height: 34,
              width: 104,
              borderRadius: radius.pill,
              backgroundColor: theme.skeleton,
              opacity: 0.6,
            }}
          />
        ))}
      </View>
    );
  }

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
            style={({ pressed }) => [
              {
                backgroundColor: active ? theme.primary : theme.surface,
                borderWidth: 1,
                borderColor: active ? theme.primary : theme.border,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                opacity: pressed && !active ? 0.7 : 1,
              },
              active ? elevation(2) : null,
            ]}
          >
            <Text
              style={{
                color: active ? theme.textInverse : theme.textMuted,
                fontSize: 13,
                fontFamily: active ? font.semibold : font.medium,
                letterSpacing: 0.2,
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
