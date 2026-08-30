import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// Shell HTML de la PWA web. Incluye manifest, theme-color e iconos Apple.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0B4281" />
        <meta
          name="description"
          content="Liga de Softbol La Pascua: posiciones, resultados, partidos y estadísticas."
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Softbol La Pascua" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        {/* Ocultar el badge "Powered by Netlify" y el Netlify Drawer. */}
        <style>{`
          #netlify-badge,
          .netlify-badge,
          [data-netlify-badge],
          #netlify-identity-menu,
          #netlify-identity-widget,
          #ntls-drawer,
          .ntls-drawer,
          #netlify-collab,
          [class*="netlify"] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }
        `}</style>
      </head>
      <body>
        <ScrollViewStyleReset />
        {children}
      </body>
    </html>
  );
}
