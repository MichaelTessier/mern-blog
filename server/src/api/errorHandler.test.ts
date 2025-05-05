import { isErrorKey, ERRORS_KEY, CustomError, setErrorResponse, errorHandler } from './errorHandler';
import { Response, Request, NextFunction } from "express";

describe('Error Handler', () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as Partial<Response> as Response

  const req = {} as Request

  const next = vi.fn() as NextFunction;

  describe('isErrorKey', () => {
    it('should return true for valid error keys', () => {
      expect(isErrorKey(ERRORS_KEY.NOT_FOUND)).toBe(true);
      expect(isErrorKey(ERRORS_KEY.CONFLICT)).toBe(true);
    });
    
    it('should return false for invalid error keys', () => {
      expect(isErrorKey("INVALID_KEY")).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isErrorKey(123)).toBe(false);
      expect(isErrorKey({})).toBe(false);
      expect(isErrorKey([])).toBe(false);
    });
  })

  describe('setErrorResponse', () => {
    it('should set the correct status and response for a CustomError', () => {
      const error = new CustomError({ message: 'Test error', key: ERRORS_KEY.NOT_FOUND});

      setErrorResponse(res, 404, error);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        key: error.key,
        message: error.message,
        stack: undefined,
      })
    })
  }) 

  describe('errorHandler', () => {
    it('should call setErrorResponse with the correct parameters', () => {
      const error = new CustomError({ message: 'Test error', key: ERRORS_KEY.NOT_FOUND });
  
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  })
  
})