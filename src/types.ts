export interface IMatchesResult {
  live: ILiveMatch[];
  upcoming: IUpcomingMatch[];
}

export interface IRound {
  mapName: string;
  scores: Array<{
    team: string;
    score: number | null;
  }>;
}

export interface ILiveMatch {
  teams: string[];
  eventName: string;
  rounds: IRound[];
}

export interface IUpcomingMatch {
  timestamp: number;
  teams: string[];
  eventName: string;
  mapName: string;
}
