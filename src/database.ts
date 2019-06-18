import { Client } from 'pg';

import config from './config';
import { IChats, ITrackedMatches } from './types';
import { log } from './utils';

let client: Client;

export async function start() {
  client = new Client(config.pg);
  await client.connect();
  await migrate();
  log(`[db] started`);
}

async function migrate() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS chats (
      chat_id bigint NOT NULL,
      notifications bool DEFAULT false,
      tracked_matches jsonb DEFAULT '{}',
      PRIMARY KEY (chat_id)
    )
  `);
}

export async function setNotificationState(chatId: number, newState: boolean) {
  log(`[db] ${chatId} new notification state: ${newState}.`);

  await client.query(
    `
    INSERT INTO chats(chat_id, notifications) values ($1, $2)
    ON CONFLICT (chat_id)
    DO UPDATE SET notifications = $2
  `,
    [chatId, newState]
  );
}

export async function updateTrackedMatches(
  chatId: string | number,
  trackedMatches: ITrackedMatches
) {
  await client.query(
    `
      INSERT INTO chats(chat_id, tracked_matches) values ($1, $2)
      ON CONFLICT (chat_id)
      DO UPDATE SET tracked_matches = $2
    `,
    [chatId, trackedMatches]
  );
}

export async function getChats(): Promise<IChats> {
  const res = await client.query('SELECT * FROM chats');
  const chats: IChats = {};

  for (const { chat_id, notifications, tracked_matches } of res.rows) {
    chats[chat_id] = {
      notifications,
      trackedMatches: tracked_matches,
    };
  }

  return chats;
}
