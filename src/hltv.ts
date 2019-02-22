import axios from 'axios';
import * as cheerio from 'cheerio';

import { ILiveMatch, IMatchesResult, IUpcomingMatch } from './types';

const URLS = {
  matches: 'https://www.hltv.org/matches',
};

export async function fetchMatches(): Promise<IMatchesResult> {
  const request = await axios.get(URLS.matches, {
    headers: {
      'User-Agent': 'node-hltv',
    },
  });

  const { data } = request;
  const $ = cheerio.load(data);

  return {
    live: parseLiveMatches($),
    upcoming: parseUpcomingMatches($),
  };
}

function parseLiveMatches($: CheerioStatic): ILiveMatch[] {
  const liveMatches: ILiveMatch[] = [];

  $('.live-match').each((i, elem) => {
    const eventName = $(elem)
      .find('.event-name')
      .text()
      .trim();
    const teams = $(elem).find('.team-name');
    const teamOne = $(teams.get(0))
      .text()
      .trim();
    const teamTwo = $(teams.get(1))
      .text()
      .trim();
    const maps = $(elem)
      .find('.header .map')
      .map((_, map) =>
        $(map)
          .text()
          .trim()
      )
      .get();
    const scores: number[] = $(elem)
      .find('.mapscore')
      .map((_, score) => Number($(score).text()))
      .get();

    const spliced = scores.splice(0, Math.ceil(scores.length / 2));
    const chunkedScores = [spliced, scores];

    const rounds = chunkedScores[0].map((score, index) => {
      return {
        mapName: maps[index],
        scores: [
          {
            team: teamOne,
            score: chunkedScores[0][index],
          },
          {
            team: teamTwo,
            score: chunkedScores[1][index],
          },
        ],
      };
    });

    liveMatches.push({
      eventName,
      teams: [teamOne, teamTwo],
      rounds,
    });
  });

  return liveMatches;
}

function parseUpcomingMatches($: CheerioStatic): IUpcomingMatch[] {
  const upcomingMatches: IUpcomingMatch[] = [];

  $('.upcoming-matches table tr').each((i, elem) => {
    const teams = $(elem).find('.team');

    if (!teams.length) {
      return;
    }
    const teamOne = $(teams.get(0))
      .text()
      .trim();
    const teamTwo = $(teams.get(1))
      .text()
      .trim();
    const timestamp = $(elem)
      .find('div.time')
      .attr('data-unix');
    const eventName = $(elem)
      .find('.event-name')
      .text()
      .trim();
    const mapName = $(elem)
      .find('.map-text')
      .text()
      .trim();

    upcomingMatches.push({
      timestamp: Number(timestamp),
      teams: [teamOne, teamTwo],
      eventName,
      mapName,
    });
  });

  return upcomingMatches;
}
