
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { authorController } from "../author.controller";
import { AuthorRepository } from "../author.repository";
import { Request, Response } from "express";
import { ERRORS_KEY, NotFoundError } from "@/api/errorHandler";

vi.mock("../author.repository");

describe.skip("Author Controller", () => {
  const mockAuthorRepository = vi.mocked(new AuthorRepository());
  authorController["authorRepository"] = mockAuthorRepository;

  const mockAuthor = {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    biography: "An amazing author.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return all authors", async () => {
      const mockAuthors = [mockAuthor];
      mockAuthorRepository.findAuthors.mockResolvedValue({ authors: mockAuthors });

      const req = {} as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      await authorController.list(req, res);

      expect(mockAuthorRepository.findAuthors).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ authors: mockAuthors });
    });

    it("should return 404 if no authors are found", async () => {
      mockAuthorRepository.findAuthors.mockResolvedValue(ERRORS_KEY.NOT_FOUND);

      const req = {} as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      await authorController.list(req, res);

      expect(mockAuthorRepository.findAuthors).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ key: ERRORS_KEY.NOT_FOUND, message: "Authors not found" });
    });
  });

  describe("getById", () => {
    it("should return an author by ID", async () => {
      mockAuthorRepository.findAuthorById.mockResolvedValue(mockAuthor);

      const req = { params: { id: "1" } } as Request<{ id: string }>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      await authorController.getById(req, res);

      expect(mockAuthorRepository.findAuthorById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAuthor);
    });

    it("should return 404 if author is not found", async () => {
      mockAuthorRepository.findAuthorById.mockResolvedValue(ERRORS_KEY.NOT_FOUND);

      const req = { params: { id: "1" } } as Request<{ id: string }>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      await authorController.getById(req, res);

      expect(mockAuthorRepository.findAuthorById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ key: ERRORS_KEY.NOT_FOUND, message: "Author not found" });
    });
  });

  describe("create", () => {
    it("should create a new author", async () => {
      mockAuthorRepository.createAuthor.mockResolvedValue(mockAuthor);

      const req = { body: mockAuthor } as Request<{}, {}, typeof mockAuthor>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      await authorController.create(req, res);

      expect(mockAuthorRepository.createAuthor).toHaveBeenCalledWith(mockAuthor);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockAuthor);
    });

    it("should return 400 if validation fails", async () => {
      const req = { body: {} } as Request<{}, {}, {}>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      await authorController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ key: ERRORS_KEY.INVALID_INPUT, message: "Invalid input" });
    });
  });

  describe("update", () => {
    it("should update an existing author", async () => {
      const updatedAuthor = { ...mockAuthor, biography: "Updated biography." };
      mockAuthorRepository.updateAuthor.mockResolvedValue(updatedAuthor);

      const req = { params: { id: "1" }, body: updatedAuthor } as Request<{ id: string }, {}, typeof updatedAuthor>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      await authorController.update(req, res);

      expect(mockAuthorRepository.updateAuthor).toHaveBeenCalledWith("1", updatedAuthor);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedAuthor);
    });

    it("should return 404 if author is not found", async () => {
      mockAuthorRepository.updateAuthor.mockResolvedValue(ERRORS_KEY.NOT_FOUND);

      const req = { params: { id: "1" }, body: mockAuthor } as Request<{ id: string }, {}, typeof mockAuthor>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      await authorController.update(req, res);

      expect(mockAuthorRepository.updateAuthor).toHaveBeenCalledWith("1", mockAuthor);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ key: ERRORS_KEY.NOT_FOUND, message: "Author not found" });
    });
  });

  describe("delete", () => {
    it("should delete an author by ID", async () => {
      mockAuthorRepository.deleteAuthor.mockResolvedValue(true);

      const req = { params: { id: "1" } } as Request<{ id: string }>;
      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as Partial<Response> as Response;

      await authorController.delete(req, res);

      expect(mockAuthorRepository.deleteAuthor).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 404 if author is not found", async () => {
      mockAuthorRepository.deleteAuthor.mockResolvedValue(ERRORS_KEY.NOT_FOUND);

      const req = { params: { id: "1" } } as Request<{ id: string }>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      await authorController.delete(req, res);

      expect(mockAuthorRepository.deleteAuthor).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ key: ERRORS_KEY.NOT_FOUND, message: "Author not found" });
    });
  });
});