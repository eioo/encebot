import { UpcomingMatch } from 'hltv/lib/models/UpcomingMatch';

import { EnceBot } from './bot';
import { timestamp } from './utils';

export class MessageFormatter {
  constructor(public bot: EnceBot) {}

  public dateChange(oldMatch: UpcomingMatch, newMatch: UpcomingMatch) {
    if (
      !oldMatch.date ||
      !newMatch.date ||
      !newMatch.team1 ||
      !newMatch.team2 ||
      !newMatch.event
    ) {
      return '';
    }

    let text = '';

    text += `*${this.bot.bestTeam} match schedule change*\n\n`;
    text += `*${newMatch.team1.name}* vs. *${newMatch.team2.name}*`;
    text += `\n${newMatch.event.name}\n`;
    text += `\`${timestamp(oldMatch.date)}\` - old date\n`;
    text += `\`${timestamp(newMatch.date)}\` - new date`;

    return text;
  }

  public upcomingMatches(matches: UpcomingMatch[]): string {
    let text = '';

    for (const match of matches) {
      if (match.date && match.team1 && match.team2 && match.event) {
        const ts = timestamp(match.date);

        text += `\`${ts}\` - *${match.team1.name}* vs. *${match.team2.name}*`;
        text += `\n${match.event.name}\n\n`;
      }
    }

    text = text.trim();

    if (text) {
      return `*Upcoming ${this.bot.bestTeam} matches*\n` + text;
    }

    return `*No upcoming ${
      this.bot.bestTeam
    } matches*\nWill notify when there is!`;
  }
}
