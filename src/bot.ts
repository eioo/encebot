import HLTV from 'hltv';
import { UpcomingMatch } from 'hltv/lib/models/UpcomingMatch';
import * as TelegramBot from 'node-telegram-bot-api';

import config from './config';
import * as database from './database';
import { MessageFormatter } from './messageFormatter';
import { IChats } from './types';
import { log } from './utils';

export class EnceBot {
  public bestTeam = 'ENCE';
  private bot: TelegramBot;
  private formatter: MessageFormatter;
  private chats: IChats;

  constructor() {
    this.formatter = new MessageFormatter(this);
    this.startBot();
  }

  private async startBot() {
    await database.start();
    this.chats = await database.getChats();

    this.bot = new TelegramBot(config.botToken);
    this.messageHandler();
    this.bot.startPolling();

    this.checkForMatchUpdates();

    setInterval(() => {
      this.checkForMatchUpdates();
    }, 10000);

    log('[bot] started');
  }

  private messageHandler() {
    this.bot.on('message', msg => {
      if (!msg.from || msg.from.is_bot) {
        return;
      }
    });

    this.bot.onText(/^\/ence/, async msg => {
      const args = (msg.text || '').split(' ').slice(1);

      if (args.length === 0) {
        const upcoming = await this.getUpcomingMatchesForTeam();

        this.bot.sendMessage(
          msg.chat.id,
          this.formatter.upcomingMatches(upcoming),
          {
            parse_mode: 'Markdown',
          }
        );
      }

      if (args.length === 1) {
        if (['enable', 'disable'].includes(args[0])) {
          const newState = args[0] === 'enable' ? true : false;
          const response = `Match notifications for *${this.bestTeam}* ${
            args[0]
          }d.`;

          await database.setNotificationState(msg.chat.id, newState);
          this.chats = await database.getChats();

          return this.reply(msg, response);
        }
      }
    });
  }

  private async getUpcomingMatchesForTeam() {
    const matches = await HLTV.getMatches();
    const upcoming: UpcomingMatch[] = matches.filter(
      m =>
        !m.live &&
        m.team1 &&
        m.team2 &&
        [m.team1, m.team2].some(
          x => x.name.toLowerCase() === this.bestTeam.toLowerCase()
        )
    );

    return upcoming;
  }

  private async checkForMatchUpdates() {
    const upcoming = await this.getUpcomingMatchesForTeam();

    if (!upcoming.length) {
      return;
    }

    for (const [chatId, chat] of Object.entries(this.chats)) {
      if (!chat.notifications) {
        continue;
      }

      const newMatches: UpcomingMatch[] = [];

      for (const match of upcoming) {
        const tracked = chat.trackedMatches[match.id];

        if (tracked) {
          if (tracked.date !== match.date) {
            const message = this.formatter.dateChange(tracked, match);
            this.reply(chatId, message);
          }
        } else {
          newMatches.push(match);
        }

        chat.trackedMatches[match.id] = match;
        database.updateTrackedMatches(chatId, chat.trackedMatches);
      }

      if (newMatches.length) {
        const message = this.formatter.upcomingMatches(newMatches);
        this.reply(chatId, message);
      }
    }
  }

  private reply(msg: TelegramBot.Message | number | string, text: string) {
    const chatId = typeof msg === 'object' ? msg.chat.id : Number(msg);

    this.bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
    });
  }

  private sendToAll(text: string) {
    for (const chatId of Object.keys(this.chats)) {
      this.reply(chatId, text);
    }
  }
}
