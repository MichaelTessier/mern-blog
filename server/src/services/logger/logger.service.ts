import winston from "winston";
import loggerConfig from "@/services/logger/logger.config";

export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    if (!this.logger) {
      this.logger = winston.createLogger({
        level: loggerConfig.loggerLevel,
        format: winston.format.json(),
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(
                { format: 'YYYY-MM-DD HH:mm:ss' }
              ),
              winston.format.colorize(),
              winston.format.simple(),
              winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
            ),
          }),
        ],
      });
    }
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  error(message: string, error?: unknown) {
    this.logger.error(message, error);
  }

  info(message: string) {
    this.logger.info(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }
}