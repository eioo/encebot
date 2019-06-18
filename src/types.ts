import { UpcomingMatch } from 'hltv/lib/models/UpcomingMatch';

export interface IChats {
  [chatId: string]: {
    notifications: boolean;
    trackedMatches: ITrackedMatches;
  };
}

export interface ITrackedMatches {
  [matchId: string]: UpcomingMatch;
}
