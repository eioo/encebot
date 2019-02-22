import * as dateFormat from 'dateformat';
import * as dotenv from 'dotenv';
import * as TelegramBot from 'node-telegram-bot-api';

import { fetchMatches } from './hltv';
import { IUpcomingMatch } from './types';

dotenv.config();

const botToken = process.env.BOT_TOKEN || '';
const chatIds = (process.env.CHAT_IDS || '').split(',');

if (!botToken) {
  console.error('No BOT_TOKEN in environment variables');
  process.exit(1);
}

class EnceBot {
  private bot: TelegramBot;
  private matchesAcknowledged: number[] = [];

  constructor(private token: string) {
    this.bot = new TelegramBot(this.token);
    this.setupEventHandlers();
    this.bot.startPolling();

    this.checkForNewMatches();
    setInterval(() => {
      this.checkForNewMatches();
    }, 10000);
  }

  private setupEventHandlers() {
    this.bot.on('message', msg => {
      if (msg.from) {
        console.log('Message from: ' + msg.from.id);
      }
    });

    this.bot.onText(/^\/ence/, async msg => {
      const matches = await fetchMatches();
      const response = this.formatUpcomingMatches(matches.upcoming);

      if (response) {
        this.bot.sendMessage(msg.chat.id, response, {
          parse_mode: 'Markdown',
        });
      }
    });
  }

  private async checkForNewMatches() {
    const matches = await fetchMatches();
    const newMatches = [];

    for (const match of matches.upcoming) {
      if (
        match.teams.includes('ENCE') &&
        !this.matchesAcknowledged.includes(match.timestamp)
      ) {
        newMatches.push(match);
        this.matchesAcknowledged.push(match.timestamp);
        console.log('New match: ' + this.formatTimestamp(match.timestamp));
      }
    }

    if (newMatches.length) {
      for (const chatId of chatIds) {
        this.bot.sendMessage(chatId, this.formatUpcomingMatches(newMatches), {
          parse_mode: 'Markdown',
        });
      }
    }
  }

  private formatUpcomingMatches(matches: IUpcomingMatch[]): string {
    const matchesText = matches
      .map(match => {
        if (match.teams.includes('ENCE')) {
          return `\`${this.formatTimestamp(match.timestamp)}\` - *${
            match.teams[0]
          }* vs. *${match.teams[1]}* ➡️ ${match.eventName}`;
        }

        return '';
      })
      .filter(x => x)
      .join('\n');

    if (matchesText) {
      return '*Upcoming ENCE matches*\n' + matchesText;
    }

    return '';
  }

  private formatTimestamp(timestamp: number): string {
    return dateFormat(new Date(timestamp), 'dd.mm. HH:MM');
  }
}

// tslint:disable-next-line:no-unused-expression
new EnceBot(botToken);
