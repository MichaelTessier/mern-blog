import { env } from 'node:process';

export default {
  mongodbUser: env['MONGODB_USER'],
  mongodbPassword: env['MONGODB_PASSWORD'],
};
