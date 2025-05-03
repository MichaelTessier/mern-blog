import { env } from 'node:process';

export const mongoDbUri = () => {
  if(!env['MONGODB_USER'] || !env['MONGODB_PASSWORD']) {
    throw new Error('MongoDB credentials are not set in environment variables');
  }
  return `mongodb+srv://${env['MONGODB_USER']}:${env['MONGODB_PASSWORD']}@cluster0.gyizz7f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
}