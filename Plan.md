# Plan de Desarrollo — PWA Liga de Softbol La Pascua

> Aplicación Web Progresiva (PWA) multiplataforma (Android / iOS / Web) que muestra,
> con una UI moderna, el contenido de la liga hospedada en
> `https://sofbollapascua.leaguerepublic.com`, consumiendo la **API JSON de
> LeagueRepublic**.

**Estado: completado.** La app está desplegada en
<https://ligalapascua.netlify.app> y lista para builds móviles vía `build.bat`.

---

## 1. Contexto y hallazgos previos

### Sitio origen
- URL: `https://sofbollapascua.leaguerepublic.com/index.html`
- Secciones actuales: Inicio, Sobre la Liga, Noticias, Fotos/Videos, Enlaces,
  Contactos, Estadísticas, Equipos, Centro de Partidos.
- Paleta del sitio: azul primario `#2B83E6`, azul menú `#0B4281`, texto blanco.

### API LeagueRepublic
- Documentación: `docs/LeagueRepublic-API-Reference-v1.3.pdf`
- La API JSON fue **habilitada** por el usuario en
  `Admin Home > API > API Settings`.
- **leagueID = `815179436`** (Liga de Softbol La Pascua). Permite llamar a
  `getSeasonsForLeague`.
- **seasonID = `904656134`** (temporada 2026, `currentSeason=true`).
  Confirmado vía `getSeasonsForLeague/815179436.json`:
  inicio 2026-07-13, fin 2026-12-31. Por ahora es la única temporada, pero la
  app usa `getSeasonsForLeague` para soportar múltiples temporadas en el
  futuro (selector de temporada).
- Categorías (fixture groups) detectadas:

  | Categoría       | fixtureTypeID | fixtureGroupIdentifier |
  |-----------------|---------------|------------------------|
  | C FEMENINO      | 1             | `954732477`            |
  | C MASCULINO     | 1             | `977170964`            |
  | C ESPECIAL      | 1             | `174235648`            |
  | Otros Partidos  | 4             | `85844533`             |

### CORS
La API de LeagueRepublic **no envía** `Access-Control-Allow-Origin`, por lo que
las peticiones desde el navegador (web) se bloquean. Solución implementada:
**proxy vía Netlify redirects** (`/api/*` → `api.leaguerepublic.com/json/*`),
configurado en `netlify.toml`. En nativo (Android/iOS) no hay CORS y se usa la
URL directa. La lógica está en `lib/api.ts` con `Platform.OS === "web"`.

### Endpoints verificados (todos responden con datos reales)
| Endpoint                              | Parámetros                          | Uso en la app                    |
|---------------------------------------|-------------------------------------|----------------------------------|
| `getSeasonsForLeague`                 | leagueID `815179436`                | Selector de temporada            |
| `getFixtureGroupsForSeason`           | seasonID                            | Listado de categorías            |
| `getStandingsForFixtureGroup`         | fixtureTypeID, fixtureGroupID       | Tablas de posiciones             |
| `getFixturesForSeason`                | seasonID                            | Calendario / resultados globales |
| `getFixturesForFixtureGroup`          | fixtureTypeID, fixtureGroupID       | Partidos por categoría           |
| `getFixturesForFixtureGroupWithOfficialAssignments` | idem + oficiales     | (reserva, árbitros)              |
| `getFullFixtureDetails`               | fixtureID                           | Ficha de partido                 |
| `getTeamsForFixtureGroup`             | fixtureTypeID, fixtureGroupID       | Equipos por categoría            |
| `getStatisticSummaryForTeam`          | seasonID, teamID                    | Estadísticas de jugadores        |

### Repositorio
- `origin`: `https://github.com/ligalapascua/liga-softbol-la-pascua.git`
- Rama: `main`.
- Historial limpio: `docs/Acceso.txt` (con credenciales) fue purgado del
  historial con `git-filter-repo` y añadido a `.gitignore`.
- Cuenta Expo: `ligalapascua` (Owner), projectId
  `dfc30d6b-2302-44e6-944c-9d0bac2b406c`.

---

## 2. Stack tecnológico

- **Expo** SDK 52.
- **expo-router** (navegación file-based, ~4.0).
- **React Native** 0.76 + **react-native-web** 0.19 (PWA).
- **TypeScript** 5.9.
- **EAS Build** para binarios Android (APK/AAB) e iOS (IPA).
- Estado: **Zustand** (ligero, sin boilerplate).
- Datos: **AsyncStorage** + **NetInfo** (caché offline).
- UI: **Lucide React Native** (iconos), **@expo-google-fonts/inter** y
  **poppins**, **expo-linear-gradient**, **react-native-safe-area-context**,
  **react-native-screens**, **react-native-reanimated**.
- Tema: modo claro/oscuro con `useColorScheme` y tokens en `lib/theme.ts`.

---

## 3. Estructura del proyecto

```
liga-softbol-la-pascua/
├── app/                          # Rutas (expo-router)
│   ├── _layout.tsx               # Root: proveedores (theme, fonts, cache)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom tabs + carga inicial (temporada, categorías)
│   │   ├── index.tsx             # Home (hero gradiente + próximos + últimos + accesos)
│   │   ├── standings.tsx         # Tablas de posiciones
│   │   ├── fixtures.tsx          # Partidos (Resultados / Próximos)
│   │   └── stats.tsx             # Líderes estadísticos
│   ├── match/[id].tsx            # Ficha de partido (scoreboard gradiente)
│   ├── team/[id].tsx             # Ficha de equipo (hero + plantilla + partidos)
│   ├── news.tsx                  # Noticias (links al sitio oficial)
│   ├── about.tsx                 # Sobre la liga (redes, patrocinadores)
│   └── +not-found.tsx
├── components/
│   ├── ui/index.tsx              # Card, SectionHeader, Segmented, Skeleton, EmptyState
│   ├── StandingsTable.tsx        # Tabla: columna fija + scroll horizontal
│   ├── FixtureCard.tsx           # Tarjeta de partido (cabecera/cuerpo/pie)
│   ├── CategoryTabs.tsx          # Chips de categoría
│   ├── TeamLogo.tsx              # Avatar con color derivado del nombre
│   └── RecentForm.tsx            # Chips W/D/L
├── lib/
│   ├── api.ts                    # Cliente LeagueRepublic (8 endpoints + proxy web)
│   ├── types.ts                  # Tipos de la API
│   ├── cache.ts                  # Caché offline (AsyncStorage + TTL)
│   ├── theme.ts                  # Tokens de color / tipografía / elevación
│   └── useTheme.ts               # Hook de tema (claro/oscuro)
├── store/
│   └── app.store.ts              # Zustand: categoría, temporada, tema
├── assets/                       # Iconos, splash, logos
├── public/                       # Manifest e iconos PWA
├── scripts/
│   ├── inject-manifest.js        # Inyecta meta tags PWA en dist/index.html
│   └── clean.js                  # Limpia node_modules / .expo / dist
├── app.json                      # Config Expo (projectId EAS)
├── app.config.js                 # Config dinámica (web/manifest)
├── eas.json                      # Perfiles EAS Build
├── netlify.toml                  # Deploy web (build, proxy, SPA redirects)
├── tsconfig.json
├── package.json
├── metro.config.cjs
├── .easignore
├── .gitignore
├── build.bat                     # Menú interactivo de builds EAS
├── Origen.bat                    # Cambia el remoto del repo
├── push.bat                      # git add + commit + push
├── README.md
└── Plan.md
```

---

## 4. Pantallas y funcionalidades

### 4.1 Home (`(tabs)/index`)
- Hero con gradiente azul de la liga, nombre, temporada activa y stats
  (categorías, partidos jugados).
- Selector de categoría (chips): C Femenino / C Masculino / C Especial.
- Accesos rápidos: Posiciones, Líderes, Noticias, La Liga.
- Próximos partidos (3 más cercanos).
- Últimos resultados (3 más recientes).
- Enlace al sitio oficial.
- Pull-to-refresh.

### 4.2 Posiciones (`(tabs)/standings`)
- Pestañas por categoría.
- Tabla con **columna de equipo fija** (posición + avatar + nombre) y stats
  con **scroll horizontal**: PJ, PG, PP, PE, CF, CC, DIF, %, PTS, FORMA.
- Top 3 destacado con medalla oro/plata/bronce.
- Filas alternadas, header azul de la liga.
- Leyenda de abreviaturas debajo.
- Tap en equipo → `team/[id]`.

### 4.3 Partidos (`(tabs)/fixtures`)
- Filtro por categoría (chips) y por estado (Segmented: Resultados / Próximos).
- Agrupación por fecha con encabezado de día.
- Tarjeta de partido: cabecera (categoría + fecha + estado), cuerpo (equipos
  + marcador destacado), pie (sede + nota).
- Tap → `match/[id]`.

### 4.4 Ficha de partido (`match/[id]`)
- Scoreboard con gradiente: equipos con avatar, marcador grande, estado.
- Datos de `getFullFixtureDetails`: fecha/hora, sede (con dirección), nota.
- Enlace al partido en el sitio original.

### 4.5 Ficha de equipo (`team/[id]`)
- Hero con gradiente: avatar grande, nombre, balance G/P/E, forma reciente.
- Partidos del equipo (filtrados de `getFixturesForSeason`, 12 más recientes).
- Plantilla con estadísticas acumuladas (`getStatisticSummaryForTeam`),
  tarjetas por jugador con chips de métricas.

### 4.6 Estadísticas (`(tabs)/stats`)
- Selector de categoría (chips) y de métrica (chips horizontales).
- Top 20 líderes de la temporada con medalla para el top 3, nombre del
  equipo y valor destacado.
- Recopila stats de todos los equipos de la categoría en paralelo.

### 4.7 Noticias (`news.tsx`)
- Lista de titulares con enlace externo al artículo completo en el sitio
  original (no se duplica el contenido).
- Enlace a todas las noticias.

### 4.8 Sobre la liga (`about.tsx`)
- Hero con gradiente y descripción de la app.
- Redes sociales (TikTok oficial).
- Patrocinadores (Instagram).
- Contactos de la liga.

---

## 5. Capa de datos (`lib/api.ts`)

- Constantes:
  - `LEAGUE_ID = 815179436` (Liga de Softbol La Pascua).
  - `DEFAULT_SEASON_ID = 904656134` (temporada 2026).
- **Proxy web**: en web, `BASE = "/api"` (Netlify redirect); en nativo,
  `BASE = "https://api.leaguerepublic.com/json"`. Decisión basada en
  `Platform.OS`.
- Funciones tipadas (8 endpoints):
  - `getSeasonsForLeague(leagueID)` → lista de temporadas.
  - `getFixtureGroupsForSeason(seasonID)`
  - `getStandingsForFixtureGroup(fixtureTypeID, fixtureGroupID)`
  - `getFixturesForSeason(seasonID)`
  - `getFixturesForFixtureGroup(fixtureTypeID, fixtureGroupID)`
  - `getFullFixtureDetails(fixtureID)`
  - `getTeamsForFixtureGroup(fixtureTypeID, fixtureGroupID)`
  - `getStatisticSummaryForTeam(seasonID, teamID)`
- Caché de red con `fetch` simple + timeout; caché persistente con
  `AsyncStorage` (TTL por endpoint). Si offline, se sirve la última versión
  caché.
- Manejo de errores: si la API devuelve `{"error": ...}`, se lanza una
  excepción tipada con el mensaje, y la UI muestra un `EmptyState` reintentable.

---

## 6. PWA

- `app.json` → `web.bundler = "metro"`.
- `public/manifest.webmanifest` con nombre, colores `#0B4281`/`#2B83E6`,
  iconos, `display: "standalone"`, `start_url`, `lang: "es"`.
- `scripts/inject-manifest.js` inyecta meta tags PWA (Apple touch icon,
  theme-color, manifest link, etc.) en `dist/index.html` tras `expo export`.
- Build web: `npm run build:web` (genera `dist/` + inyecta manifest).
- Instalable desde el navegador (Add to Home Screen) en Android e iOS.

---

## 7. Builds móviles (EAS)

- `eas.json` con perfiles:
  - `development` (Android APK interno, sin keystore; iOS simulador).
  - `preview` (Android APK para pruebas; iOS simulador).
  - `production` (Android AAB Play Store; iOS IPA App Store).
  - `adhoc` (iOS Ad-Hoc).
- `app.json`:
  - `name`: "Liga Softbol La Pascua"
  - `slug`: "liga-softbol-la-pascua"
  - `android.package`: "com.ligalapascua.app"
  - `ios.bundleIdentifier`: "com.ligalapascua.app"
  - `extra.eas.projectId`: `dfc30d6b-2302-44e6-944c-9d0bac2b406c`
  - `owner`: `ligalapascua`
- `build.bat`: menú interactivo con 12 opciones (APK, AAB, IPA, web, limpiar,
  estado, diagnóstico, credenciales). Ver README para el detalle de cada
  opción.

---

## 8. Despliegue web (Netlify)

- `netlify.toml`:
  - Build: `npm run build:web`
  - Publish: `dist/`
  - Proxy API: `/api/*` → `api.leaguerepublic.com/json/*` (evita CORS)
  - SPA redirects: `/*` → `/index.html` (expo-router client routing)
  - Headers: Content-Type para manifest, cache para assets
- URL: <https://ligalapascua.netlify.app>
- Despliegue automático en cada push a `main`.

---

## 9. Tema y diseño

- Colores base del sitio: primario `#2B83E6`, secundario `#212121`,
  menú `#0B4281`.
- Modo claro/oscuro con `useColorScheme` y tokens en `lib/theme.ts`.
- Tokens: `palette`, `Theme` (claro/oscuro), `spacing`, `radius`, `fontSizes`,
  `font` (Inter/Poppins), `elevation()` (sombras por nivel).
- Tipografía: Inter (cuerpo) + Poppins (titulares).
- Componentes: tarjetas con esquinas redondeadas, sombras suaves, espaciado
  generoso, chips de forma reciente (verde/ámbar/rojo), skeletons animados,
  pull-to-refresh, gradientes en hero/scoreboard.
- Iconografía: Lucide.

---

## 10. Tareas (checklist)

1. [x] Scaffold del proyecto Expo (package.json, app.json, tsconfig, eas.json,
      metro.config, .gitignore, .easignore).
2. [x] Instalación de dependencias (`npm install`) y verificación de toolchain
      (node, npm, eas-cli).
3. [x] `lib/types.ts` y `lib/api.ts` con los 8 endpoints + caché + proxy web.
4. [x] `lib/theme.ts` y `store/app.store.ts`.
5. [x] Componentes UI base + `StandingsTable`, `FixtureCard`, `CategoryTabs`,
      `RecentForm`, `TeamLogo`.
6. [x] Pantallas: Home, Posiciones, Partidos, Stats, Match, Team, News, About,
      NotFound.
7. [x] PWA: manifest, iconos, export web, inject-manifest.
8. [x] Adaptar `build.bat` y `Origen.bat`.
9. [x] Enlazar EAS (`eas init` / projectId) y configurar credenciales.
10. [x] Verificación: `npx tsc --noEmit`, `npm run build:web`, dev web.
11. [x] Commit inicial del proyecto y push al repo.
12. [x] Fix CORS: proxy LeagueRepublic API vía Netlify redirects.
13. [x] Rediseño UI: tabla de posiciones legible, gradientes, componentes
      modernos, skeletons, pull-to-refresh.
14. [x] Purgar `docs/Acceso.txt` del historial de Git (git-filter-repo).

---

## 11. Pendientes / decisiones abiertas

- **Selector de temporada**: la app descubre la temporada actual vía
  `getSeasonsForLeague`, pero aún no expone un UI para cambiar de temporada
  (cuando existan más).
- **Noticias**: por ahora enlaces externos al sitio. Si se quiere contenido
  embebido, se evaluará scraping ligero (frágil ante cambios de
  LeagueRepublic).
- **Iconos y splash**: usar los del sitio original o generar unos nuevos con
  la identidad de la liga.
- ~~**Netlify Identity / protección de acceso**~~: resuelto. El setting
  **Visitor access** estaba en "Private" (Team Protection). Se cambió a
  **Public** desde
  `app.netlify.com/projects/ligalapascua/configuration/general#visitor-access`.
  Documentado en README.md.
