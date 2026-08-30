// Cliente de la API JSON de LeagueRepublic para la Liga de Softbol La Pascua.
// Documentación: docs/LeagueRepublic-API-Reference-v1.3.pdf
import { readCache, readFresh, writeCache } from "./cache";
import {
  ApiError,
  Fixture,
  FixtureGroup,
  FullFixtureDetails,
  LeagueApiError,
  Season,
  StandingGroup,
  StatisticSummary,
  Team,
} from "./types";

export const LEAGUE_ID = 815179436;
export const DEFAULT_SEASON_ID = 904656134;

const BASE = "https://api.leaguerepublic.com/json";

// TTLs por tipo de recurso.
const TTL = {
  seasons: 24 * 60 * 60 * 1000, // 24h
  fixtureGroups: 60 * 60 * 1000, // 1h
  standings: 60 * 60 * 1000, // 1h
  fixtures: 5 * 60 * 1000, // 5min
  teams: 60 * 60 * 1000, // 1h
  fullFixture: 5 * 60 * 1000, // 5min
  stats: 30 * 60 * 1000, // 30min
} as const;

const DEFAULT_TIMEOUT = 12000;

async function getJson<T>(path: string, timeoutMs = DEFAULT_TIMEOUT): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new LeagueApiError(`HTTP ${res.status}`);
    const data = (await res.json()) as T | ApiError;
    if (data && typeof data === "object" && "error" in data) {
      throw new LeagueApiError((data as ApiError).error);
    }
    return data as T;
  } catch (e) {
    if (e instanceof LeagueApiError) throw e;
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new LeagueApiError("Timeout de red");
    }
    throw new LeagueApiError(
      e instanceof Error ? e.message : "Error de red desconocido"
    );
  } finally {
    clearTimeout(t);
  }
}

async function cached<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const fresh = await readFresh<T>(key, ttl);
  if (fresh) return fresh;
  try {
    const data = await fetcher();
    await writeCache(key, data);
    return data;
  } catch (e) {
    // si hay red/timeout, servir caché expirada si existe
    const stale = await readCache<T>(key);
    if (stale) return stale;
    throw e;
  }
}

// --- Endpoints ---

export async function getSeasonsForLeague(
  leagueID: number = LEAGUE_ID
): Promise<Season[]> {
  return cached(`seasons/${leagueID}`, TTL.seasons, () =>
    getJson<Season[]>(`/getSeasonsForLeague/${leagueID}.json`)
  );
}

export async function getFixtureGroupsForSeason(
  seasonID: number = DEFAULT_SEASON_ID
): Promise<FixtureGroup[]> {
  return cached(`fixtureGroups/${seasonID}`, TTL.fixtureGroups, () =>
    getJson<FixtureGroup[]>(`/getFixtureGroupsForSeason/${seasonID}.json`)
  );
}

export async function getStandingsForFixtureGroup(
  fixtureTypeID: number,
  fixtureGroupIdentifier: number
): Promise<StandingGroup[]> {
  const key = `standings/${fixtureTypeID}/${fixtureGroupIdentifier}`;
  return cached(key, TTL.standings, () =>
    getJson<StandingGroup[]>(
      `/getStandingsForFixtureGroup/${fixtureTypeID}/${fixtureGroupIdentifier}.json`
    )
  );
}

export async function getFixturesForSeason(
  seasonID: number = DEFAULT_SEASON_ID
): Promise<Fixture[]> {
  return cached(`fixtures/season/${seasonID}`, TTL.fixtures, () =>
    getJson<Fixture[]>(`/getFixturesForSeason/${seasonID}.json`)
  );
}

export async function getFixturesForFixtureGroup(
  fixtureTypeID: number,
  fixtureGroupIdentifier: number
): Promise<Fixture[]> {
  const key = `fixtures/fg/${fixtureTypeID}/${fixtureGroupIdentifier}`;
  return cached(key, TTL.fixtures, () =>
    getJson<Fixture[]>(
      `/getFixturesForFixtureGroup/${fixtureTypeID}/${fixtureGroupIdentifier}.json`
    )
  );
}

export async function getFullFixtureDetails(
  fixtureID: number
): Promise<FullFixtureDetails> {
  return cached(`fullFixture/${fixtureID}`, TTL.fullFixture, () =>
    getJson<FullFixtureDetails>(`/getFullFixtureDetails/${fixtureID}.json`)
  );
}

export async function getTeamsForFixtureGroup(
  fixtureTypeID: number,
  fixtureGroupIdentifier: number
): Promise<Team[]> {
  const key = `teams/${fixtureTypeID}/${fixtureGroupIdentifier}`;
  return cached(key, TTL.teams, () =>
    getJson<Team[]>(
      `/getTeamsForFixtureGroup/${fixtureTypeID}/${fixtureGroupIdentifier}.json`
    )
  );
}

export async function getStatisticSummaryForTeam(
  seasonID: number,
  teamID: number
): Promise<StatisticSummary> {
  const key = `stats/${seasonID}/${teamID}`;
  return cached(key, TTL.stats, () =>
    getJson<StatisticSummary>(
      `/getStatisticSummaryForTeam/${seasonID}/${teamID}.json`
    )
  );
}

// --- Utilidades de fechas ---

// "20260715 18:40" -> Date
export function parseFixtureDate(s: string): Date {
  // formato YYYYMMDD HH:mm
  const m = /^(\d{4})(\d{2})(\d{2})\s+(\d{2}):(\d{2})$/.exec(s);
  if (!m) return new Date(s);
  return new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5])
  );
}

export function isFuture(f: Fixture): boolean {
  return !f.result && f.fixtureDateInMilliseconds > Date.now();
}

export function isPast(f: Fixture): boolean {
  return f.result;
}

export { LeagueApiError };
