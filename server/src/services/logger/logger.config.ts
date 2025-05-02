import { env } from 'node:process';

export default {
  loggerLevel: env['LOGGER_LEVEL'] || 'info',
};
