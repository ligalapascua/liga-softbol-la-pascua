# Liga de Softbol La Pascua

PWA (Aplicación Web Progresiva) para Android, iOS y Web que muestra, con una
interfaz moderna, el contenido de la **Liga de Softbol La Pascua** hospedada en
[sofbollapascua.leaguerepublic.com](https://sofbollapascua.leaguerepublic.com),
consumiendo la **API JSON de LeagueRepublic**.

> El plan de desarrollo detallado está en [`Plan.md`](./Plan.md).

## Características

- **Tablas de posiciones** por categoría (C Femenino, C Masculino, C Especial)
  con columna de equipo fija y stats con scroll horizontal: PJ, PG, PP, PE,
  CF, CC, DIF, %, PTS y forma reciente (chips W/D/L). Top 3 destacado con
  medalla oro/plata/bronce.
- **Calendario y resultados** con filtro por categoría y por estado
  (Resultados / Próximos), agrupados por fecha. Tarjeta de partido con
  cabecera (categoría + fecha + estado), cuerpo (equipos + marcador) y
  pie (sede + nota).
- **Ficha de partido** con scoreboard de gradiente, equipos, marcador,
  estado, sede y nota.
- **Ficha de equipo** con hero de gradiente, balance G/P/E, forma reciente,
  plantilla con estadísticas acumuladas y últimos partidos.
- **Líderes estadísticos** por categoría y métrica, con medallas para el
  top 3 y nombre del equipo por jugador.
- **Noticias** (enlaces al sitio oficial) y **Sobre la liga** (redes,
  patrocinadores, contactos).
- **Offline**: caché de datos con `AsyncStorage` + `NetInfo`.
- **Instalable** como app desde el navegador (Add to Home Screen) en Android e
  iOS, y publicable en Play Store / App Store vía EAS Build.
- **Modo claro/oscuro** con la paleta azul de la identidad de la liga.
- **Pull-to-refresh** y skeletons animados en todas las listas.

## Stack

- [Expo](https://expo.dev) SDK 52 + [expo-router](https://docs.expo.dev/router/introduction/)
- React Native 0.76 + react-native-web (PWA)
- TypeScript 5.9
- Zustand (estado global)
- EAS Build (binarios Android/iOS)
- Lucide (iconos), Inter + Poppins (tipografía), expo-linear-gradient

## Estructura

```
app/                # Rutas (expo-router, file-based)
  (tabs)/            # Bottom tabs: Inicio / Posiciones / Partidos / Stats
    _layout.tsx      # Carga inicial (temporada + categorías)
    index.tsx        # Home (hero + próximos + últimos + accesos)
    standings.tsx    # Tabla de posiciones
    fixtures.tsx     # Partidos (Resultados / Próximos)
    stats.tsx        # Líderes estadísticos
  match/[id].tsx     # Ficha de partido
  team/[id].tsx      # Ficha de equipo + plantilla
  news.tsx           # Noticias (links al sitio)
  news/[slug].tsx    # Artículo de noticia dentro de la app
  about.tsx          # Sobre la liga
  +not-found.tsx
components/          # Componentes reutilizables
  ui/index.tsx       # Card, SectionHeader, Segmented, Skeleton, EmptyState
  StandingsTable.tsx # Tabla con columna fija + scroll horizontal
  FixtureCard.tsx    # Tarjeta de partido
  CategoryTabs.tsx   # Chips de categoría
  TeamLogo.tsx       # Avatar con color derivado del nombre
  RecentForm.tsx     # Chips W/D/L
lib/                 # Cliente API, tipos, caché, tema
  api.ts             # 8 endpoints LeagueRepublic + proxy web
  types.ts           # Tipos de la API
  cache.ts           # Caché offline (AsyncStorage + TTL)
  theme.ts           # Tokens de color / tipografía / elevación
  useTheme.ts        # Hook de tema (claro/oscuro)
store/               # Estado global (Zustand)
assets/              # Iconos, splash, logos
public/              # Manifest e iconos PWA
scripts/
  inject-manifest.js # Inyecta meta tags PWA en dist/index.html
  clean.js           # Limpia node_modules / .expo / dist
netlify/
  functions/         # Funciones serverless (news-article)
server.cjs           # Servidor Express para Render
render.yaml          # Configuración de Render Blueprint
netlify.toml         # Configuración de Netlify
docs/                # Referencia de la API
```

## Requisitos

- Node.js 18+ y npm
- Expo CLI / EAS CLI (`npm i -g eas-cli`)
- Cuenta Expo (para EAS Build)

## Configuración

La API JSON de LeagueRepublic debe estar **habilitada** desde el panel de la
liga: `Admin Home > API > API Settings` (marcar *Enable JSON API*).

Identificadores clave:

| Identificador | Valor         | Descripción                          |
|---------------|---------------|--------------------------------------|
| leagueID      | `815179436`   | Liga de Softbol La Pascua            |
| seasonID      | `904656134`   | Temporada 2026 (actual)              |

Categorías (fixture groups) de la temporada 2026:

| Categoría      | fixtureTypeID | fixtureGroupIdentifier |
|----------------|---------------|------------------------|
| C Femenino     | 1             | `954732477`            |
| C Masculino    | 1             | `977170964`            |
| C Especial     | 1             | `174235648`            |
| Otros Partidos | 4             | `85844533`             |

`LEAGUE_ID = 815179436` · `SEASON_ID = 904656134` (configurables en `lib/api.ts`).

### CORS (solo web)

La API de LeagueRepublic no envía `Access-Control-Allow-Origin`, por lo que en
web las peticiones se hacen a través de un **proxy** configurado en
`netlify.toml`:

```
/api/*  ->  https://api.leaguerepublic.com/json/*
```

En nativo (Android/iOS) no hay CORS y se usa la URL directa. La lógica está en
`lib/api.ts` (`Platform.OS === "web"` → `/api`, sino URL directa).

## Scripts

| Comando                  | Descripción                                    |
|--------------------------|------------------------------------------------|
| `npm run dev`            | Inicia Expo (dev web/móvil)                    |
| `npm run build:web`      | Exporta la PWA a `dist/` + inyecta manifest    |
| `npm run start:render`   | Arranca servidor Express para Render           |
| `npm run lint`           | Lint del proyecto                              |
| `npm run build:android`  | Build EAS Android (producción, AAB)            |
| `npm run clean`          | Limpia `node_modules` / `.expo` / `dist`       |
| `build.bat`              | Menú interactivo de builds EAS (ver abajo)     |
| `Origen.bat`             | Cambia el remoto del repo                      |
| `push.bat`               | `git add` + `commit` + `push`                  |

## Builds móviles con `build.bat`

Menú interactivo para generar binarios vía EAS Build:

| Opción | Perfil EAS     | Salida                    | Uso                       |
|--------|----------------|---------------------------|---------------------------|
| 1      | `preview`      | APK (Android)             | Pruebas en dispositivo    |
| 2      | `production`   | AAB (Android)             | Play Store                |
| 3      | `development`  | APK (Android, sin keystore)| Desarrollo               |
| 4      | `preview`      | Build simulador iOS       | Simulador iOS             |
| 5      | `adhoc`        | IPA (iOS Ad-Hoc)          | Pruebas en dispositivos   |
| 6      | `production`   | IPA (iOS)                 | App Store                 |
| 7      | `development`  | Build desarrollo iOS      | Desarrollo iOS            |
| 8      | —              | `expo start --web`        | Dev server web            |
| 9      | —              | Limpia cache + reinstall  | Reset                     |
| 10     | —              | `eas-cli build:list`      | Estado de builds          |
| 11     | —              | Diagnóstico EAS           | Troubleshooting           |
| 12     | —              | Credenciales EAS          | Keystore / certificados   |

**Primera vez**: ejecuta la opción 12 para configurar credenciales
(`eas-cli credentials --platform android` genera el keystore automáticamente).

## Despliegue web

La PWA está desplegada en dos plataformas para máxima disponibilidad:

| Plataforma | URL | Tipo |
|------------|-----|------|
| **Netlify** | <https://ligalapascua.netlify.app> | Static Site + Functions |
| **Render** | <https://liga-softbol-la-pascua.onrender.com> | Web Service (Express) |

Ambas se actualizan automáticamente en cada push a `main`.

### Netlify (Static Site + Functions)

Configuración en `netlify.toml`:

- **Build**: `npm run build:web`
- **Publish**: `dist/`
- **Proxy API**: `/api/*` → `api.leaguerepublic.com/json/*` (evita CORS)
- **Funciones**: `netlify/functions/` (endpoint de noticias)
- **SPA redirects**: todas las rutas sirven `index.html` (expo-router)

### Render (Web Service con Express)

Configuración en `render.yaml` y `server.cjs`:

- **Build**: `npm install && npm run build:web`
- **Start**: `npm run start:render` (arranca `server.cjs`)
- **Proxy API**: el servidor Express enruta `/api/*` a la API de LeagueRepublic
- **Noticias**: el servidor Express maneja `/news-article` directamente
- **SPA**: todas las demás rutas sirven `index.html`

> **Nota sobre el plan Free de Render**: el servicio se duerme tras 15 minutos
> sin actividad. La primera visita después tarda ~30 segundos en despertar.

### Visitor access en Netlify (privacidad del sitio)

Por defecto Netlify marca los sitios como **privados** (Team Protection): los
visitantes externos ven un mensaje "This site is private" y deben iniciar
sesión con una cuenta invitada del equipo. Para que el sitio sea público:

1. Abre
   <https://app.netlify.com/projects/ligalapascua/configuration/general#visitor-access>
2. En **Visitor access** → **Site access**, selecciona **Public**
3. Guarda los cambios

Si el sitio vuelve a mostrar "This site is private", revisa este setting —
es independiente de la configuración de `netlify.toml`.

## Documentación de referencia

- API: [`docs/LeagueRepublic-API-Reference-v1.3.pdf`](./docs/LeagueRepublic-API-Reference-v1.3.pdf)
- Plan: [`Plan.md`](./Plan.md)

## Licencia

Privado — Liga de Softbol La Pascua.
