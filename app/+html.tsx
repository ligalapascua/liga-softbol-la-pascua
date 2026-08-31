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
        {/* Eliminar el badge "Powered by Netlify" y el Netlify Drawer.
            Netlify los inyecta vía JS después del load, así que usamos un
            MutationObserver + interval para eliminarlos dinámicamente. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function removeNetlify() {
                  // Buscar por texto, href, src, alt y clases relacionadas
                  var selectors = [
                    'a[href*="netlify.com"]',
                    'img[src*="netlify"]',
                    'img[alt*="Netlify"]',
                    'img[alt*="netlify"]',
                    '#netlify-badge',
                    '.netlify-badge',
                    '#ntls-drawer',
                    '.ntls-drawer',
                    '#netlify-identity-menu',
                    '#netlify-identity-widget',
                    '#netlify-collab',
                    '[class*="netlify"]',
                    '[id*="netlify"]',
                    '[data-netlify]',
                    'iframe[src*="netlify"]'
                  ];
                  selectors.forEach(function(sel) {
                    document.querySelectorAll(sel).forEach(function(el) {
                      // No eliminar nuestros propios scripts/links del manifest
                      if (el.tagName === 'SCRIPT' || el.tagName === 'LINK') return;
                      el.remove();
                    });
                  });
                  // También buscar iframes y elementos con position:fixed en el bottom
                  document.querySelectorAll('iframe, div, a, img').forEach(function(el) {
                    var style = window.getComputedStyle(el);
                    var pos = style.position;
                    var bottom = style.bottom;
                    if (pos === 'fixed' && (bottom === '0px' || bottom === '0')) {
                      var text = (el.textContent || '').toLowerCase();
                      var alt = (el.getAttribute('alt') || '').toLowerCase();
                      var src = (el.getAttribute('src') || '').toLowerCase();
                      var href = (el.getAttribute('href') || '').toLowerCase();
                      if (text.indexOf('netlify') >= 0 || alt.indexOf('netlify') >= 0 ||
                          src.indexOf('netlify') >= 0 || href.indexOf('netlify') >= 0) {
                        el.remove();
                      }
                    }
                  });
                }
                // Ejecutar inmediatamente y luego observar el DOM
                removeNetlify();
                if (typeof MutationObserver !== 'undefined') {
                  var observer = new MutationObserver(function() { removeNetlify(); });
                  observer.observe(document.documentElement, {
                    childList: true, subtree: true, attributes: true
                  });
                  // Dejar de observar después de 10 segundos
                  setTimeout(function() { observer.disconnect(); }, 10000);
                }
                // Backup: ejecutar periódicamente por 10 segundos
                var interval = setInterval(removeNetlify, 500);
                setTimeout(function() { clearInterval(interval); }, 10000);
              })();
            `,
          }}
        />
      </head>
      <body>
        <ScrollViewStyleReset />
        {children}
      </body>
    </html>
  );
}
