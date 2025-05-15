import { NextFunction, Request, Response } from 'express';

export const validateSchemaMiddleware = {
  params: vi.fn(() => (_req: Request, _res: Response, next: NextFunction) => next()),
  request: vi.fn(() => (_req: Request, _res: Response, next: NextFunction) => next()),
}