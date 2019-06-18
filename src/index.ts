import * as dotenv from 'dotenv';

process.env.NTBA_FIX_319 = '1';
dotenv.config();

import { EnceBot } from './bot';

const bot = new EnceBot();
