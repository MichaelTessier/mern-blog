import { NextFunction, Response, Request } from "express";

export const ERRORS_KEY = {
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION: "VALIDATION",
  INVALID_INPUT: "INVALID_INPUT",
  FORBIDDEN: "FORBIDDEN",
  UNAUTHORIZED: "UNAUTHORIZED",
  INTERNAL_SERVER: "INTERNAL_SERVER",
} as const;


const ErrorStatusMap: Record<ErrorKey, number> = {
  [ERRORS_KEY.NOT_FOUND]: 404,
  [ERRORS_KEY.CONFLICT]: 409,
  [ERRORS_KEY.VALIDATION]: 422,
  [ERRORS_KEY.INVALID_INPUT]: 400,
  [ERRORS_KEY.FORBIDDEN]: 403,
  [ERRORS_KEY.UNAUTHORIZED]: 401,
  [ERRORS_KEY.INTERNAL_SERVER]: 500,
} as const;

export type ErrorKey = typeof ERRORS_KEY[keyof typeof ERRORS_KEY];

export class CustomError extends Error {
  key: ErrorKey;
  error: string | undefined;

  constructor({ message, key, stack, error }: { message: string; key: ErrorKey, stack?: string, error?: string }) {
    super(message);
    this.key = key;
    this.stack = stack;
    this.error = error;
  }
}

export class NotFoundError extends CustomError {}
export class ConflictError extends CustomError {}
export class InvalidInputError extends CustomError {}
export class ValidationError extends CustomError {}
export class ForbiddenError extends CustomError {}
export class UnauthorizedError extends CustomError {}

export function setErrorResponse(res: Response, status: number, error: CustomError) {
  res.status(status).json({
    key: error.key,
    message: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  })
}


export function errorHandler (error: unknown, req: Request, res: Response, next: NextFunction) {

  if(error instanceof CustomError) {
    const errorStatus = ErrorStatusMap[error.key];
    setErrorResponse(res, errorStatus, error);

    return
  }

  if(error instanceof Error) {
    setErrorResponse(res, 500, new CustomError({
      key: ERRORS_KEY.INTERNAL_SERVER,
      message: 'Internal Server Error',
      error: error.message,
    }));

    return 
  }

  next()
}


export function isErrorKey(error: unknown): error is ErrorKey {
  return typeof error === "string" && Object.values(ERRORS_KEY).includes(error as ErrorKey);
}

type ErrorParams = ConstructorParameters<typeof CustomError>

export const ErrorKeyMap: Record<ErrorKey, new (...args: ErrorParams) => CustomError> = {
  NOT_FOUND: NotFoundError,
  CONFLICT: ConflictError,
  VALIDATION: ValidationError,
  INVALID_INPUT: InvalidInputError,
  FORBIDDEN: ForbiddenError,
  UNAUTHORIZED: UnauthorizedError,
  INTERNAL_SERVER: CustomError,
} as const;

export function createErrorFromKey(...args: ErrorParams): CustomError {
  const ErrorConstructor = ErrorKeyMap[args[0].key];
  return new ErrorConstructor(...args);
}

