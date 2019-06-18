const config = {
  botToken: process.env.BOT_TOKEN || '',
  pg: {
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'postgres',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
  },
};

if (!config.botToken) {
  console.log('Please add BOT_TOKEN');
  process.exit(1);
}

export default config;
