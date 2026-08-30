// Tipos de la API JSON de LeagueRepublic.
// Fuente: docs/LeagueRepublic-API-Reference-v1.3.pdf + respuestas reales
// de la liga 815179436 (temporada 2026, seasonID 904656134).

export type FixtureTypeID = 1 | 2 | 4;

export interface Season {
  seasonID: number;
  seasonName: string;
  seasonStartDate: string;
  seasonEndDate: string;
  seasonStartDateInMilliseconds: number;
  seasonEndDateInMilliseconds: number;
  currentSeason: boolean;
}

export interface FixtureGroup {
  fixtureGroupDesc: string;
  fixtureGroupIdentifier: number;
  fixtureTypeDesc: string;
  fixtureTypeID: FixtureTypeID;
}

export interface StandingLine {
  teamID: number;
  teamName: string;
  position: string;
  points: number;
  bonusPoints: number;
  adjustmentMade: string | null;

  overallPlayed: number;
  overallWon: number;
  overallTied: number;
  overallLoss: number;
  overallWinPercentage: number;
  overallScoreFor: number;
  overallScoreAgainst: number;
  overallScoreForLevel2: number;
  overallScoreForLevel3: number;
  overallScoreAgainstLevel2: number;
  overallScoreAgainstLevel3: number;

  homePlayed: number;
  homeWon: number;
  homeTied: number;
  homeLoss: number;
  homeScoreFor: number;
  homeScoreAgainst: number;
  homeRecentForm: string;

  roadPlayed: number;
  roadWon: number;
  roadTied: number;
  roadLoss: number;
  roadScoreFor: number;
  roadScoreAgainst: number;
  roadRecentForm: string;

  recentForm: string;
  scoreDifference: number;
}

export interface StandingGroup {
  standingsDesc: string;
  standingsLines: StandingLine[];
}

export interface Fixture {
  fixtureID: number;
  fixtureTypeID: FixtureTypeID;
  fixtureGroupDesc: string;
  fixtureGroupIdentifier: number;
  homeTeam: number;
  roadTeam: number;
  homeTeamName: string;
  roadTeamName: string;
  homeScore: string | null;
  roadScore: string | null;
  homeScoreNote: string | null;
  roadScoreNote: string | null;
  additionalScore: string | null;
  fixtureDate: string; // "20260715 18:40"
  fixtureDateInMilliseconds: number;
  fixtureDateStatusID: number;
  fixtureDateStatusDesc: string;
  fixtureStatus: number;
  fixtureStatusDesc: string;
  fixtureNote: string | null;
  noResultOutcome: boolean;
  result: boolean;
  roundDesc: string | null;
  shortCode: string;
  venueAndSubVenueDesc: string | null;
  officialAssignments: unknown | null;
}

export interface Team {
  teamID: number;
  teamName: string;
}

export interface Venue {
  venueName?: string | null;
  venueAddr1?: string | null;
  venueAddr2?: string | null;
  venueAddr3?: string | null;
  venueZipOrPostCode?: string | null;
  contactPhoneNumber?: string | null;
  venueNotes?: string | null;
  subVenueName?: string | null;
}

export interface OfficialAssignment {
  officialName?: string;
  officialRoleDesc?: string;
  officialID?: number;
}

export interface FullFixtureDetails {
  fixture: Fixture;
  venue?: Venue;
  venueAndSubVenueDesc?: string;
  officials?: OfficialAssignment[];
  homeTeamPlayers?: unknown;
  roadTeamPlayers?: unknown;
}

export interface PersonStatSummary {
  personID: number;
  firstName: string;
  lastName: string;
  handicapValue: string | null;
  leagueStatTypeID: number;
  leagueStatTypeName: string;
  statTypeValue: string;
  numberEntered: number;
  eloRating?: number | null;
  eloSeasonRating?: number | null;
}

export interface StatisticSummary {
  listCumulativePersonStatSummary: PersonStatSummary[];
}

export interface ApiError {
  error: string;
}

export class LeagueApiError extends Error {
  constructor(public readonly apiMessage: string) {
    super(`LeagueRepublic API: ${apiMessage}`);
    this.name = "LeagueApiError";
  }
}
