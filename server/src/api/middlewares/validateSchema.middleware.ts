import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { ERRORS_KEY, InvalidInputError } from "../errorHandler";
import { LoggerService } from "@/services/logger/logger.service";

export class ValidateSchemaMiddleware {
  private logger: LoggerService;

  constructor() {
    this.logger = new LoggerService();
  }

  params = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const schemaResult = schema.safeParse(req.params);

    if (!schemaResult.success) {
      this.logger.error(`Params validation failed: ${schemaResult.error.issues[0].message}`);
      
      throw new InvalidInputError({
        message: schemaResult.error.issues[0].message,
        key: ERRORS_KEY.INVALID_INPUT,  
      })
    }

    next();
  }

  request = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const schemaResult = schema.safeParse(req.body);

    if (!schemaResult.success) {
      this.logger.error(`Request validation failed: ${schemaResult.error.issues[0].message}`);
      
      throw new InvalidInputError({
        message: schemaResult.error.issues[0].message,
        key: ERRORS_KEY.INVALID_INPUT,  
      })
    }

    next();
  }
}

export const validateSchemaMiddleware = new ValidateSchemaMiddleware();