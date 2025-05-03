
import { Db, MongoClient, ServerApiVersion } from 'mongodb';
import { mongoDbUri } from './mongodb.config';
import 'dotenv/config';
import { LoggerService } from '@/services/logger/logger.service';

const logger = new LoggerService();

const client = new MongoClient(mongoDbUri(), {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


let db: Db;

export const database = {
  connect: async () => {
    try {
      db = client.db('blogData');
      logger.info("Connected to MongoDB");
    } catch (error) {
      logger.error("Error connecting to MongoDB:", error);
      throw error;
    }
  },
  get: () => {
    if (!db) {
      throw new Error("Database not initialized. Call connect first.");
    }
    return db;
  },
}


