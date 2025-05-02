
import { Db, MongoClient, ServerApiVersion } from 'mongodb';
import mongodbConfig from './mongodb.config';
import 'dotenv/config';
import { LoggerService } from '../logger/logger.service';

const logger = new LoggerService();

const uri = `mongodb+srv://${mongodbConfig.mongodbUser}:${mongodbConfig.mongodbPassword}@cluster0.gyizz7f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
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


