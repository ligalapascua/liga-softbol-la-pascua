// Tokens de tema (claro/oscuro) con la paleta azul de la liga.
import type { TextStyle } from "react-native";

export const palette = {
  primary: "#2B83E6",
  primaryDark: "#0B4281",
  secondary: "#212121",
  white: "#FFFFFF",
  // estados forma reciente
  win: "#16A34A",
  tie: "#F59E0B",
  loss: "#DC2626",
};

export interface Theme {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryDark: string;
  win: string;
  tie: string;
  loss: string;
  skeleton: string;
}

export const light: Theme = {
  bg: "#F5F7FB",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF2F8",
  border: "#E2E8F0",
  text: "#0F172A",
  textMuted: "#64748B",
  textInverse: "#FFFFFF",
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  win: palette.win,
  tie: palette.tie,
  loss: palette.loss,
  skeleton: "#E2E8F0",
};

export const dark: Theme = {
  bg: "#0B1220",
  surface: "#111A2E",
  surfaceAlt: "#16213A",
  border: "#1E2A44",
  text: "#F1F5F9",
  textMuted: "#94A3B8",
  textInverse: "#0B1220",
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  win: palette.win,
  tie: palette.tie,
  loss: palette.loss,
  skeleton: "#1E2A44",
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

export const titleStyle: TextStyle = {
  fontFamily: "Poppins_600SemiBold",
};

export const headingStyle: TextStyle = {
  fontFamily: "Poppins_500Medium",
};

export const bodyStyle: TextStyle = {
  fontFamily: "Inter_400Regular",
};

export const bodyMediumStyle: TextStyle = {
  fontFamily: "Inter_500Medium",
};

export const bodyBoldStyle: TextStyle = {
  fontFamily: "Inter_700Bold",
};
