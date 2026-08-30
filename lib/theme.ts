// Tokens de tema (claro/oscuro) con la paleta azul de la liga.
import type { TextStyle, ViewStyle } from "react-native";

export const palette = {
  primary: "#2B83E6",
  primaryDark: "#0B4281",
  primaryDeep: "#072C58",
  accent: "#38BDF8",
  secondary: "#212121",
  white: "#FFFFFF",
  // estados forma reciente
  win: "#16A34A",
  tie: "#F59E0B",
  loss: "#DC2626",
  gold: "#EAB308",
};

export interface Theme {
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceRaised: string;
  border: string;
  borderSubtle: string;
  text: string;
  textMuted: string;
  textFaint: string;
  textInverse: string;
  primary: string;
  primaryDark: string;
  primaryDeep: string;
  primarySoft: string;
  accent: string;
  win: string;
  tie: string;
  loss: string;
  gold: string;
  skeleton: string;
  /** Gradiente del hero */
  heroGradient: [string, string];
}

export const light: Theme = {
  bg: "#F4F6FB",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F5FC",
  surfaceRaised: "#FFFFFF",
  border: "#E4E9F2",
  borderSubtle: "#EEF2F8",
  text: "#0D1524",
  textMuted: "#5B6B85",
  textFaint: "#94A3B8",
  textInverse: "#FFFFFF",
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  primaryDeep: palette.primaryDeep,
  primarySoft: "#E8F1FD",
  accent: palette.accent,
  win: palette.win,
  tie: palette.tie,
  loss: palette.loss,
  gold: palette.gold,
  skeleton: "#E4E9F2",
  heroGradient: [palette.primaryDark, palette.primary],
};

export const dark: Theme = {
  bg: "#080D18",
  surface: "#101827",
  surfaceAlt: "#161F31",
  surfaceRaised: "#182234",
  border: "#1F2A3D",
  borderSubtle: "#16202F",
  text: "#F1F5F9",
  textMuted: "#93A3BA",
  textFaint: "#64748B",
  textInverse: "#FFFFFF",
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  primaryDeep: palette.primaryDeep,
  primarySoft: "#12233B",
  accent: palette.accent,
  win: palette.win,
  tie: palette.tie,
  loss: palette.loss,
  gold: palette.gold,
  skeleton: "#1F2A3D",
  heroGradient: [palette.primaryDeep, palette.primaryDark],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
  pill: 999,
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  title: 30,
} as const;

export const font = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  display: "Poppins_600SemiBold",
  displayMedium: "Poppins_500Medium",
} as const;

/** Sombras coherentes por nivel de elevación. */
export function elevation(level: 0 | 1 | 2 | 3): ViewStyle {
  if (level === 0) return {};
  const map = {
    1: { opacity: 0.05, radius: 6, offset: 2, elev: 1 },
    2: { opacity: 0.08, radius: 12, offset: 4, elev: 3 },
    3: { opacity: 0.12, radius: 20, offset: 8, elev: 6 },
  } as const;
  const s = map[level];
  return {
    shadowColor: "#0B1220",
    shadowOpacity: s.opacity,
    shadowRadius: s.radius,
    shadowOffset: { width: 0, height: s.offset },
    elevation: s.elev,
  };
}

export const titleStyle: TextStyle = { fontFamily: font.display };
export const headingStyle: TextStyle = { fontFamily: font.displayMedium };
export const bodyStyle: TextStyle = { fontFamily: font.regular };
export const bodyMediumStyle: TextStyle = { fontFamily: font.medium };
export const bodyBoldStyle: TextStyle = { fontFamily: font.bold };
