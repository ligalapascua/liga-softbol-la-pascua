import { useColorScheme } from "react-native";
import { dark, light, type Theme } from "./theme";

export function useTheme(): { theme: Theme; isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return { theme: isDark ? dark : light, isDark };
}
