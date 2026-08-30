// Inyecta el link al manifest PWA y meta tags Apple en dist/index.html.
// Necesario porque expo export no procesa +html.tsx.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
const indexHtml = join(dist, "index.html");

if (!existsSync(indexHtml)) {
  console.error("inject-manifest: no se encontró dist/index.html");
  process.exit(1);
}

let html = readFileSync(indexHtml, "utf-8");

const tags = [
  '<link rel="manifest" href="/manifest.webmanifest" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
  '<meta name="apple-mobile-web-app-title" content="Softbol La Pascua" />',
  '<link rel="apple-touch-icon" href="/icon-192.png" />',
];

const toInject = tags.filter((t) => !html.includes(t));

if (toInject.length === 0) {
  console.log("inject-manifest: tags ya presentes, sin cambios.");
  process.exit(0);
}

// Insertar antes de </head>
html = html.replace("</head>", `${toInject.join("\n  ")}\n</head>`);
writeFileSync(indexHtml, html, "utf-8");
console.log(`inject-manifest: inyectadas ${toInject.length} tags PWA en dist/index.html`);
