# Plan de Desarrollo — PWA Liga de Softbol La Pascua

> Aplicación Web Progresiva (PWA) multiplataforma (Android / iOS / Web) que muestra,
> con una UI mejorada, el contenido de la liga hospedada en
> `https://sofbollapascua.leaguerepublic.com`, consumiendo la **API JSON de
> LeagueRepublic**.

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
- **leagueID = `815179436`** (proporcionado por el usuario; corresponde a la
  Liga de Softbol La Pascua). Permite llamar a `getSeasonsForLeague`.
- **seasonID = `904656134`** (temporada 2026, `currentSeason=true`).
  Confirmado vía `getSeasonsForLeague/815179436.json`:
  inicio 2026-07-13, fin 2026-12-31. Por ahora es la única temporada, pero la
  app usará `getSeasonsForLeague` para soportar múltiples temporadas en el
  futuro (selector de temporada).
- Categorías (fixture groups) detectadas:

  | Categoría       | fixtureTypeID | fixtureGroupIdentifier |
  |-----------------|---------------|------------------------|
  | C FEMENINO      | 1             | `954732477`            |
  | C MASCULINO     | 1             | `977170964`            |
  | C ESPECIAL      | 1             | `174235648`            |
  | Otros Partidos  | 4             | `85844533`             |

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
- Rama: `main`. Actualmente solo contiene `docs/`, `build.bat`, `Origen.bat`,
  `push.bat`, `README.md`, `Plan.md`.
- `build.bat` y `Origen.bat` son heredados del proyecto `gastos` (RefillCenter)
  y deben adaptarse a este repo.
- No existe proyecto Expo local previo: se creará uno nuevo aquí.

---

## 2. Stack tecnológico

- **Expo** SDK 52 (mismo stack que el proyecto `gastos` del usuario).
- **expo-router** (navegación file-based, ~4.0).
- **React Native** 0.76 + **react-native-web** 0.19 (PWA).
- **TypeScript** 5.9.
- **EAS Build** para binarios Android (APK/AAB) e iOS (IPA).
- Estado: **Zustand** (ligero, sin boilerplate).
- Datos: **AsyncStorage** + **NetInfo** (caché offline).
- UI: **Lucide React Native** (iconos), **@expo-google-fonts/inter** y
  **poppins**, **expo-linear-gradient**, **react-native-safe-area-context**,
  **react-native-screens**, **react-native-reanimated**.
- Tema: modo claro/oscuro con `useColorScheme`.

---

## 3. Estructura del proyecto

```
liga-softbol-la-pascua/
├── app/                          # Rutas (expo-router)
│   ├── _layout.tsx               # Root: proveedores (theme, fonts, cache)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom tabs: Inicio / Posiciones / Partidos / Stats
│   │   ├── index.tsx             # Home
│   │   ├── standings.tsx         # Tablas por categoría
│   │   ├── fixtures.tsx          # Calendario / resultados
│   │   └── stats.tsx             # Líderes estadísticos
│   ├── category/[id].tsx         # Vista de categoría (equipos + tabla + partidos)
│   ├── match/[id].tsx            # Ficha de partido (getFullFixtureDetails)
│   ├── team/[id].tsx             # Ficha de equipo + plantilla + stats
│   ├── player/[id].tsx           # Ficha de jugador (stats acumuladas)
│   ├── news.tsx                  # Noticias (links al sitio / scraping ligero)
│   ├── about.tsx                 # Sobre la liga
│   └── +not-found.tsx
├── components/                   # Componentes reutilizables
│   ├── ui/                       # Card, Badge, Button, EmptyState, Skeleton, etc.
│   ├── StandingRow.tsx
│   ├── FixtureCard.tsx
│   ├── CategoryTabs.tsx
│   ├── TeamLogo.tsx
│   └── RecentForm.tsx
├── lib/
│   ├── api.ts                    # Cliente LeagueRepublic (tipado + caché)
│   ├── types.ts                  # Tipos de la API
│   ├── cache.ts                  # Caché offline (AsyncStorage + TTL)
│   └── theme.ts                  # Tokens de color / tipografía
├── store/
│   └── app.store.ts              # Zustand: categoría seleccionada, temporada, tema
├── assets/
│   ├── images/                   # Iconos, splash, logos de la liga
│   └── fonts/                    # (si se incrustan)
├── public/
│   ├── manifest.webmanifest       # PWA manifest
│   └── icon-*.png                 # Iconos PWA
├── scripts/
│   └── optimize-assets.js
├── app.json                      # Config Expo
├── eas.json                      # Perfiles EAS Build
├── tsconfig.json
├── package.json
├── metro.config.cjs
├── .easignore
├── .gitignore
├── build.bat                     # (adaptado)
├── Origen.bat                    # (adaptado)
├── push.bat
├── README.md
└── Plan.md
```

---

## 4. Pantallas y funcionalidades

### 4.1 Home (`(tabs)/index`)
- Hero con nombre de la liga + logo + temporada activa.
- Selector de **temporada** (vía `getSeasonsForLeague`, leagueID `815179436`).
- Selector de categoría (chips): C Femenino / C Masculino / C Especial.
- Próximos partidos (los fixtures futuros más cercanos).
- Últimos resultados.
- Accesos rápidos a Posiciones, Partidos, Stats.
- Noticias: tarjetas con los titulares del sitio (links externos al detalle en
  `sofbollapascua.leaguerepublic.com`); sin scraping pesado.

### 4.2 Posiciones (`(tabs)/standings`)
- Pestañas por categoría.
- Tabla con: posición, equipo, PJ, PG, PE, PP, CF, CC, Dif, Puntos, Forma
  reciente (chips W/D/L).
- Cabecera destacada para el líder.
- Tap en equipo → `team/[id]`.

### 4.3 Partidos (`(tabs)/fixtures`)
- Filtro por categoría y por estado (Próximos / Resultados).
- Agrupación por fecha.
- Tarjeta de partido: equipos, marcador, fecha/hora, sede, estado.
- Tap → `match/[id]`.

### 4.4 Ficha de partido (`match/[id]`)
- Datos de `getFullFixtureDetails`: equipos, marcador, estado, fecha, sede
  (con dirección si viene), nota, árbitros/oficiales si los hay.
- Enlace al partido en el sitio original (por si hay más detalle).

### 4.5 Ficha de equipo (`team/[id]`)
- Nombre + categoría.
- Posición actual en la tabla.
- Plantilla con estadísticas acumuladas (`getStatisticSummaryForTeam`).
- Últimos resultados del equipo (filtrados de `getFixturesForSeason`).

### 4.6 Estadísticas (`(tabs)/stats`)
- Selector de categoría y de métrica (BB, HR, AVG, etc., según lo que devuelva
  `getStatisticSummaryForTeam`).
- Top N líderes de la temporada.

### 4.7 Noticias (`news.tsx`)
- Lista de titulares con thumbnail y enlace externo al artículo completo en el
  sitio original (no se duplica el contenido).

### 4.8 Sobre la liga (`about.tsx`)
- Texto breve + contactos + redes (TikTok, Instagram de patrocinadores) tomados
  del sitio original.

---

## 5. Capa de datos (`lib/api.ts`)

- Constantes:
  - `LEAGUE_ID = 815179436` (Liga de Softbol La Pascua).
  - `SEASON_ID = 904656134` (temporada 2026; la app puede descubrirlas vía
    `getSeasonsForLeague` y dejar que el usuario cambie de temporada).
- Funciones tipadas:
  - `getSeasonsForLeague(leagueID)` → lista de temporadas.
  - `getFixtureGroupsForSeason(seasonID)`
  - `getStandingsForFixtureGroup(fixtureTypeID, fixtureGroupID)`
  - `getFixturesForSeason(seasonID)`
  - `getFixturesForFixtureGroup(fixtureTypeID, fixtureGroupID)`
  - `getFullFixtureDetails(fixtureID)`
  - `getTeamsForFixtureGroup(fixtureTypeID, fixtureGroupID)`
  - `getStatisticSummaryForTeam(seasonID, teamID)`
- Caché de red con `fetch` simple + timeout; caché persistente con
  `AsyncStorage` (TTL por endpoint, p. ej. 5 min para fixtures, 1 h para
  standings). Si offline, se sirve la última versión caché.
- Manejo de errores: si la API devuelve `{"error": ...}`, se lanza una excepción
  tipada con el mensaje, y la UI muestra un `EmptyState` reintentable.

---

## 6. PWA

- `app.json` → `web.bundler = "metro"`.
- `public/manifest.webmanifest` con nombre, colores `#0B4281`/`#2B83E6`,
  iconos, `display: "standalone"`, `start_url`, `lang: "es"`.
- Service worker vía `expo` (modo web) para offline de la shell + datos
  cachéados.
- Build web: `npx expo export --platform web` (genera `dist/`).
- Instalable desde el navegador (Add to Home Screen) en Android e iOS.

---

## 7. Builds móviles (EAS)

- `eas.json` con perfiles:
  - `development` (Android APK interno, sin keystore).
  - `preview` (Android APK para pruebas / iOS simulador).
  - `production` (Android AAB Play Store / iOS IPA App Store).
  - `adhoc` (iOS Ad-Hoc).
- `app.json`:
  - `name`: "Liga Softbol La Pascua"
  - `slug`: "liga-softbol-la-pascua"
  - `android.package`: "com.ligalapascua.app"
  - `ios.bundleIdentifier`: "com.ligalapascua.app"
  - `extra.eas.projectId`: pendiente (se obtiene con `eas init` o del proyecto
    ya creado en expo.dev).
  - `owner`: cuenta Expo del usuario.
- `build.bat` se adapta para:
  - Mantener el menú interactivo (APK, AAB, IPA, web, limpiar, estado, etc.).
  - Eliminar referencias a "RefillCenter".
  - Llamar a `eas-cli` con los perfiles de `eas.json`.
  - Crear `.easignore` si no existe.

---

## 8. Adaptación de scripts heredados

### `build.bat`
- Quitar la cadena final "RefillCenter".
- Ajustar mensajes a "Liga Softbol La Pascua".
- Conservar la lógica del menú y la creación de `.easignore`.
- Asegurar que los perfiles referenciados existen en `eas.json`
  (`development`, `preview`, `production`, `adhoc`).

### `Origen.bat`
- Reemplazar los remotos `ingalfsan/gastos` y `tecnimedi/gastos` por el
  único remoto de este proyecto:
  `https://github.com/ligalapascua/liga-softbol-la-pascua.git`.
- Opcional: añadir un segundo remoto (fork/backup) si el usuario lo indica.

### `push.bat`
- Se mantiene (`git add . && git commit && git push`). Se可以考虑 añadir
  verificación de rama y evitar commits vacíos.

---

## 9. Tema y diseño

- Colores base del sitio: primario `#2B83E6`, secundario `#212121`,
  menú `#0B4281`.
- Modo claro/oscuro con `useColorScheme` y tokens en `lib/theme.ts`.
- Tipografía: Inter (cuerpo) + Poppins (titulares).
- Componentes: tarjetas con esquinas redondeadas, sombras suaves, espaciado
  generoso, chips de forma reciente (verde/ámbar/rojo), esqueletos de carga.
- Iconografía: Lucide.

---

## 10. Tareas (checklist)

1. [ ] Scaffold del proyecto Expo (package.json, app.json, tsconfig, eas.json,
      metro.config, .gitignore, .easignore).
2. [ ] Instalación de dependencias (`npm install`) y verificación de toolchain
      (node, npm, eas-cli).
3. [ ] `lib/types.ts` y `lib/api.ts` con los 7 endpoints + caché.
4. [ ] `lib/theme.ts` y `store/app.store.ts`.
5. [ ] Componentes UI base + `StandingRow`, `FixtureCard`, `CategoryTabs`,
      `RecentForm`, `TeamLogo`.
6. [ ] Pantallas: Home, Posiciones, Partidos, Stats, Match, Team, Player,
      News, About, NotFound.
7. [ ] PWA: manifest, iconos, export web.
8. [ ] Adaptar `build.bat` y `Origen.bat`.
9. [ ] Enlazar EAS (`eas init` / projectId) y configurar credenciales.
10. [ ] Verificación: `npx expo lint`, `npx tsc --noEmit`,
      `npx expo export --platform web`, dev web en navegador.
11. [ ] Commit inicial del proyecto y push al repo.

---

## 11. Pendientes / decisiones abiertas

- ~~**leagueID real**~~: resuelto — `815179436`. La app usará
  `getSeasonsForLeague(815179436)` para listar temporadas y permitir cambio.
  Hoy solo existe la 2026 (`904656134`).
- **projectId de EAS**: se obtiene con `eas init` (requiere login Expo) o del
  panel expo.dev si el proyecto ya fue creado allí.
- **Iconos y splash**: usar los del sitio original
  (`images.leaguerepublic.com/data/images/759703211/...`) descargados a
  `assets/`, o generar unos nuevos con la identidad de la liga.
- **Noticias**: por defecto, enlaces externos al sitio. Si se quiere contenido
  embebido, se evaluará scraping ligero (frágil ante cambios de LeagueRepublic).
