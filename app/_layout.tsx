import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "../lib/useTheme";
import { font } from "../lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { theme, isDark } = useTheme();
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.bg }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.primaryDark },
            headerTintColor: "#FFFFFF",
            headerShadowVisible: false,
            headerTitleStyle: { fontFamily: font.display, fontSize: 17 },
            contentStyle: { backgroundColor: theme.bg },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="match/[id]" options={{ title: "Partido" }} />
          <Stack.Screen name="team/[id]" options={{ title: "Equipo" }} />
          <Stack.Screen name="news" options={{ title: "Noticias" }} />
          <Stack.Screen name="news/[slug]" options={{ title: "Noticia" }} />
          <Stack.Screen name="about" options={{ title: "Sobre la Liga" }} />
          <Stack.Screen name="+not-found" options={{ title: "No encontrado" }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
