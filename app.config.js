// Configuración dinámica de Expo.
// Inyecta el manifest PWA y meta tags en el HTML exportado.

/** @param {{ config: any }} ctx */
export default ({ config }) => {
  return {
    ...config,
    web: {
      ...config.web,
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
