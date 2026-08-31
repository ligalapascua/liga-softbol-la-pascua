// Tabla de posiciones: columna de equipo fija + stats con scroll horizontal.
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "../lib/useTheme";
import { elevation, font, radius, spacing, type Theme } from "../lib/theme";
import type { StandingLine } from "../lib/types";
import { TeamLogo } from "./TeamLogo";
import { RecentForm } from "./RecentForm";

// Ancho mínimo de la columna de equipo; se ajusta al ancho de pantalla.
const TEAM_COL_MIN = 190;

interface Col {
  key: string;
  label: string;
  width: number;
  value: (l: StandingLine) => string;
  accent?: boolean;
  hint: string;
}

const COLS: Col[] = [
  { key: "pj", label: "PJ", width: 34, value: (l) => String(l.overallPlayed), hint: "Partidos jugados" },
  { key: "pg", label: "PG", width: 34, value: (l) => String(l.overallWon), hint: "Partidos ganados" },
  { key: "pp", label: "PP", width: 34, value: (l) => String(l.overallLoss), hint: "Partidos perdidos" },
  { key: "pe", label: "PE", width: 34, value: (l) => String(l.overallTied), hint: "Partidos empatados" },
  { key: "cf", label: "CF", width: 38, value: (l) => fmt(l.overallScoreFor), hint: "Carreras a favor" },
  { key: "cc", label: "CC", width: 38, value: (l) => fmt(l.overallScoreAgainst), hint: "Carreras en contra" },
  { key: "dif", label: "DIF", width: 44, value: (l) => signed(l.scoreDifference), hint: "Diferencia de carreras" },
  { key: "pct", label: "%", width: 46, value: (l) => `${l.overallWinPercentage.toFixed(0)}%`, hint: "Porcentaje de victorias" },
  { key: "pts", label: "PTS", width: 44, value: (l) => fmt(l.points), accent: true, hint: "Puntos" },
];

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function signed(n: number): string {
  const v = fmt(Math.abs(n));
  return n > 0 ? `+${v}` : n < 0 ? `-${v}` : "0";
}

export function StandingsTable({ lines }: { lines: StandingLine[] }) {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const sorted = [...lines].sort((a, b) => Number(a.position) - Number(b.position));

  // Ancho de la columna de equipo: ocupa el espacio disponible dejando
  // un mínimo para stats. Si hay muchas columnas, el área de stats hace
  // scroll horizontal y el nombre del equipo aprovecha todo el ancho.
  const statsMinArea = 120;
  const teamColWidth = Math.max(TEAM_COL_MIN, screenWidth - statsMinArea);

  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          overflow: "hidden",
        },
        elevation(2),
      ]}
    >
      <View style={{ flexDirection: "row" }}>
        {/* Columna fija: posición + equipo */}
        <View
          style={{
            width: teamColWidth,
            borderRightWidth: 1,
            borderRightColor: theme.border,
            backgroundColor: theme.surface,
          }}
        >
          <HeaderCell theme={theme} width={teamColWidth} align="left" pad>
            Equipo
          </HeaderCell>
          {sorted.map((l, i) => (
            <Link key={l.teamID} href={`/team/${l.teamID}`} asChild>
              <Pressable
                style={({ pressed }) => ({
                  height: 54,
                  backgroundColor: rowBg(theme, i, pressed),
                  borderTopWidth: 1,
                  borderTopColor: theme.borderSubtle,
                })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.sm, height: "100%" }}>
                  <PositionBadge position={Number(l.position)} theme={theme} />
                  <TeamLogo name={l.teamName} size={26} />
                  <Text
                    style={{
                      flex: 1,
                      color: theme.text,
                      fontSize: 13,
                      fontFamily: font.medium,
                    }}
                    numberOfLines={1}
                  >
                    {l.teamName}
                  </Text>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>

        {/* Stats con scroll horizontal */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
          <View>
            <View style={{ flexDirection: "row" }}>
              {COLS.map((c) => (
                <HeaderCell key={c.key} theme={theme} width={c.width} accent={c.accent}>
                  {c.label}
                </HeaderCell>
              ))}
              <HeaderCell theme={theme} width={116}>
                FORMA
              </HeaderCell>
            </View>

            {sorted.map((l, i) => (
              <View
                key={l.teamID}
                style={{
                  flexDirection: "row",
                  height: 54,
                  alignItems: "center",
                  backgroundColor: rowBg(theme, i, false),
                  borderTopWidth: 1,
                  borderTopColor: theme.borderSubtle,
                }}
              >
                {COLS.map((c) => (
                  <Text
                    key={c.key}
                    style={{
                      width: c.width,
                      textAlign: "center",
                      fontSize: 13,
                      color: c.accent ? theme.primary : theme.textMuted,
                      fontFamily: c.accent ? font.bold : font.regular,
                    }}
                  >
                    {c.value(l)}
                  </Text>
                ))}
                <View style={{ width: 116, alignItems: "center" }}>
                  <RecentForm form={l.recentForm} max={5} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function rowBg(theme: Theme, index: number, pressed: boolean): string {
  if (pressed) return theme.primarySoft;
  return index % 2 === 0 ? theme.surface : theme.surfaceAlt;
}

function HeaderCell({
  children,
  theme,
  width,
  align = "center",
  accent,
  pad,
}: {
  children: React.ReactNode;
  theme: Theme;
  width: number;
  align?: "left" | "center";
  accent?: boolean;
  pad?: boolean;
}) {
  return (
    <View
      style={{
        width,
        height: 38,
        justifyContent: "center",
        alignItems: align === "left" ? "flex-start" : "center",
        paddingHorizontal: pad ? spacing.md : 0,
        backgroundColor: theme.primaryDark,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          letterSpacing: 0.8,
          color: accent ? theme.accent : theme.textInverse,
          fontFamily: font.bold,
          opacity: accent ? 1 : 0.85,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

function PositionBadge({ position, theme }: { position: number; theme: Theme }) {
  const top3 = position <= 3;
  const color =
    position === 1 ? theme.gold : position === 2 ? "#94A3B8" : position === 3 ? "#B45309" : theme.textFaint;
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: radius.sm,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.xs,
        backgroundColor: top3 ? `${color}22` : "transparent",
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: top3 ? color : theme.textFaint,
          fontFamily: font.bold,
        }}
      >
        {position}
      </Text>
    </View>
  );
}

/** Leyenda de abreviaturas de la tabla. */
export function StandingsLegend() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginTop: spacing.md,
      }}
    >
      {COLS.map((c) => (
        <Text
          key={c.key}
          style={{ fontSize: 10, color: theme.textFaint, fontFamily: font.regular }}
        >
          <Text style={{ fontFamily: font.bold, color: theme.textMuted }}>{c.label}</Text>{" "}
          {c.hint}
        </Text>
      ))}
    </View>
  );
}
