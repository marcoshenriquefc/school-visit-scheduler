import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET ?? 'change_this_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  enableRubeusRetryJob: (process.env.ENABLE_RUBEUS_RETRY_JOB ?? 'true') === 'true',
  rubeusRetryHour: Number(process.env.RUBEUS_RETRY_HOUR ?? 18),
  publicApiKeyRequired: (process.env.PUBLIC_API_KEY_REQUIRED ?? 'false') === 'true',
};
