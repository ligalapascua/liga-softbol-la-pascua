# Liga de Softbol La Pascua

PWA (Aplicación Web Progresiva) para Android, iOS y Web que muestra, con una
interfaz mejorada, el contenido de la **Liga de Softbol La Pascua**
hospedada en [sofbollapascua.leaguerepublic.com](https://sofbollapascua.leaguerepublic.com),
consumiendo la **API JSON de LeagueRepublic**.

> El plan de desarrollo detallado está en [`Plan.md`](./Plan.md).

## Características

- **Tablas de posiciones** por categoría (C Femenino, C Masculino, C Especial)
  con forma reciente (W/D/L), PJ, PG, PE, PP, carreras a favor/en contra,
  diferencia y puntos.
- **Calendario y resultados** de partidos por categoría y fecha, con marcador,
  sede, estado y notas.
- **Ficha de partido** con detalle completo (equipos, marcador, sede, nota,
  árbitros/oficiales cuando aplique).
- **Ficha de equipo** con plantilla y estadísticas acumuladas de jugadores.
- **Líderes estadísticos** de la temporada por categoría y métrica.
- **Noticias** y **sobre la liga** (contactos, redes, patrocinadores).
- **Offline**: caché de datos con `AsyncStorage` + `NetInfo`.
- **Instalable** como app desde el navegador (Add to Home Screen) en Android e
  iOS, y publicable en Play Store / App Store vía EAS Build.
- **Modo claro/oscuro** con la paleta azul de la identidad de la liga.

## Stack

- [Expo](https://expo.dev) SDK 52 + [expo-router](https://docs.expo.dev/router/introduction/)
- React Native 0.76 + react-native-web (PWA)
- TypeScript
- Zustand (estado)
- EAS Build (binarios Android/iOS)
- Lucide (iconos), Inter + Poppins (tipografía)

## Estructura

```
app/            # Rutas (expo-router, file-based)
components/     # Componentes reutilizables
lib/            # Cliente API, tipos, caché, tema
store/          # Estado global (Zustand)
assets/         # Iconos, splash, logos
public/         # Manifest e iconos PWA
docs/           # URL, credenciales y referencia de la API
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

`LEAGUE_ID = 815179436` · `SEASON_ID = 904656134` (configurables).

## Scripts

| Comando                  | Descripción                          |
|--------------------------|--------------------------------------|
| `npm run dev`            | Inicia Expo (dev web/móvil)          |
| `npm run build:web`      | Exporta la PWA a `dist/`             |
| `npm run lint`           | Lint del proyecto                    |
| `npm run build:android`  | Build EAS Android (producción)       |
| `build.bat`              | Menú interactivo de builds (EAS)     |
| `Origen.bat`             | Cambia el remoto del repo            |
| `push.bat`               | `git add` + `commit` + `push`        |

## Documentación de referencia

- API: [`docs/LeagueRepublic-API-Reference-v1.3.pdf`](./docs/LeagueRepublic-API-Reference-v1.3.pdf)
- Plan: [`Plan.md`](./Plan.md)

## Licencia

Privado — Liga de Softbol La Pascua.
