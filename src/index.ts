import * as dotenv from 'dotenv';

import { OGBot } from './bot';

process.env.NTBA_FIX_319 = '1';
dotenv.config();

const bot = new OGBot();
