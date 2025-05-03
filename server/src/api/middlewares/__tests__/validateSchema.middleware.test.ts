import { vi, describe, it, expect } from "vitest";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateSchemaMiddleware } from "../validateSchema.middleware";

describe("validateSchemaMiddleware", () => {
  describe("params", () => {
    const schema = z.object({
      id: z.string().uuid(),
    });
    const paramsMiddleware = validateSchemaMiddleware.params(schema);

    it("should validate params correctly", () => {
      const req = { params: { id: '123e4567-e89b-12d3-a456-426614174000' } } as Request<{id: string}>;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      paramsMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should throw an error if validation fails", () => {
      const req = { params: { id: 'invalid' } } as Request<{id: string}>;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      expect(() => paramsMiddleware(req, res, next)).toThrow('Invalid uuid');
    });
  });

  describe("request", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const requestMiddleware = validateSchemaMiddleware.request(schema);

    it("should validate request body correctly", () => {
      const req = { body: { name: 'John', age: 30 } } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;
      requestMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should throw an error if validation fails", () => {
      const req = { body: { name: 'John', age: 'invalid' } } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      expect(() => requestMiddleware(req, res, next)).toThrow('Expected number, received string');
    });
  });
});
