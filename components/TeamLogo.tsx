// Avatar con iniciales del equipo y color derivado del nombre.
import { Text, View } from "react-native";
import { useTheme } from "../lib/useTheme";
import { font, spacing } from "../lib/theme";

const COLORS = [
  "#0B4281",
  "#2B83E6",
  "#0E7490",
  "#065F46",
  "#7C2D12",
  "#5B21B6",
  "#9D174D",
  "#1E3A8A",
  "#166534",
  "#854D0E",
];

function initials(name: string): string {
  const clean = name.replace(/["'`.]/g, "").trim();
  const words = clean.split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return clean.slice(0, 2).toUpperCase() || "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function TeamLogo({
  name,
  size = 36,
  spaced = true,
}: {
  name: string;
  size?: number;
  spaced?: boolean;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colorFor(name),
        alignItems: "center",
        justifyContent: "center",
        marginRight: spaced ? spacing.sm : 0,
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: size * 0.34,
          fontFamily: font.bold,
        }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}
