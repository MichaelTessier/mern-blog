import { env } from 'node:process';

export default {
  serverPort: env['SERVER_PORT'] || 3000,
};
