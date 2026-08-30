// Configuración dinámica de Expo.
// Inyecta el manifest PWA y meta tags en el HTML exportado.
import type { ExpoConfig, ConfigContext } from "@expo/config-types";

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    web: {
      ...config.web,
      // Expo usa estos valores para generar meta tags PWA en index.html
      name: "Liga Softbol La Pascua",
      shortName: "Softbol La Pascua",
      lang: "es",
      themeColor: "#0B4281",
      backgroundColor: "#0B4281",
      favicon: "./assets/images/favicon.png",
      bundler: "metro",
    },
  };
};
