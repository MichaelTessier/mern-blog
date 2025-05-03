import express from 'express';
import serverConfig from './server.config';
import postRoutes from './post/post.route';
import { LoggerService } from '@/services/logger/logger.service';
import { errorHandler } from './errorHandler';

const logger = new LoggerService();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))


app.use(postRoutes);
app.use(errorHandler);

const server = app.listen(serverConfig.serverPort, () => {
  logger.info(`Server is running on port ${serverConfig.serverPort}`);
});

server.on('error', (error) => {
  logger.error(`Server error: ${error}`);
});
