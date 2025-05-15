import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AuthorRepository } from "../author.repository";
import { mockDb } from "@/services/mongodb/__mocks__/mongodb.service";
import { ObjectId } from "mongodb";
import { ERRORS_KEY } from "@/api/errorHandler";
import { AuthorDTO } from "../author.schema";

vi.mock('@/services/mongodb/mongodb.service');

describe.skip("AuthorRepository", () => {
  const repository = new AuthorRepository();

  beforeEach(() => {
    // Réinitialise les mocks avant chaque test
    mockDb.find.mockReset();
    mockDb.findOne.mockReset();
    mockDb.insertOne.mockReset();
    mockDb.deleteOne.mockReset();
    mockDb.findOneAndUpdate.mockReset();
  });

  afterEach(() => {
    // Réinitialise les appels des mocks après chaque test
    vi.clearAllMocks();
  });

  describe("findAuthors", () => {
    it("should fetch all authors", async () => {
      const mockAuthors = [
        { _id: new ObjectId(), first_name: "John", last_name: "Doe", biography: "An amazing author." },
      ];
      mockDb.find.mockReturnValue({ toArray: vi.fn().mockResolvedValue(mockAuthors) });

      const result = await repository.findAuthors();

      expect(result.authors).toHaveLength(1);
      expect(result.authors[0]).toMatchObject({
        firstName: "John",
        lastName: "Doe",
        biography: "An amazing author.",
      });
      expect(mockDb.find).toHaveBeenCalled();
    });

    it("should return NOT_FOUND if no authors are found", async () => {
      mockDb.find.mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) });

      const result = await repository.findAuthors();

      expect(result).toBe(ERRORS_KEY.NOT_FOUND);
      expect(mockDb.find).toHaveBeenCalled();
    });
  });

  describe("findAuthorById", () => {
    it("should fetch an author by ID", async () => {
      const mockAuthor = { _id: new ObjectId(), first_name: "John", last_name: "Doe", biography: "An amazing author." };
      mockDb.findOne.mockResolvedValue(mockAuthor);

      const result = await repository.findAuthorById(mockAuthor._id.toHexString());

      expect(result).toMatchObject({
        id: mockAuthor._id.toHexString(),
        firstName: "John",
        lastName: "Doe",
        biography: "An amazing author.",
      });
      expect(mockDb.findOne).toHaveBeenCalledWith({ _id: mockAuthor._id });
    });

    it("should return NOT_FOUND if author is not found", async () => {
      mockDb.findOne.mockResolvedValue(null);

      const result = await repository.findAuthorById(new ObjectId().toHexString());

      expect(result).toBe(ERRORS_KEY.NOT_FOUND);
      expect(mockDb.findOne).toHaveBeenCalled();
    });
  });

  describe("createAuthor", () => {
    it("should create a new author", async () => {
      const newAuthor = { firstName: "John", lastName: "Doe", biography: "An amazing author." };
      const insertedId = new ObjectId();
      mockDb.insertOne.mockResolvedValue({ acknowledged: true, insertedId });

      const result = await repository.createAuthor(newAuthor);

      expect(result).toMatchObject({
        id: insertedId.toHexString(),
        firstName: "John",
        lastName: "Doe",
        biography: "An amazing author.",
      });
      expect(mockDb.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        first_name: "John",
        last_name: "Doe",
        biography: "An amazing author.",
      }));
    });

    it("should throw an error if insert fails", async () => {
      mockDb.insertOne.mockResolvedValue({ acknowledged: false });

      await expect(repository.createAuthor({ firstName: "John", lastName: "Doe", biography: "An amazing author." }))
        .rejects.toThrow("Failed to create author");
    });
  });

  describe("updateAuthor", () => {
    it("should update an existing author", async () => {
      const updatedAuthor = { firstName: "John", lastName: "Doe", biography: "Updated biography." };
      const authorId = new ObjectId();
      mockDb.findOneAndUpdate.mockResolvedValue({ value: { _id: authorId, ...updatedAuthor } });

      const result = await repository.updateAuthor(authorId.toHexString(), updatedAuthor);

      expect(result).toMatchObject({
        id: authorId.toHexString(),
        firstName: "John",
        lastName: "Doe",
        biography: "Updated biography.",
      });
      expect(mockDb.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: authorId },
        { $set: { first_name: "John", last_name: "Doe", biography: "Updated biography." } },
        { returnDocument: "after" }
      );
    });

    it("should return NOT_FOUND if author is not found", async () => {
      mockDb.findOneAndUpdate.mockResolvedValue({ value: null });

      const result = await repository.updateAuthor(new ObjectId().toHexString(), { firstName: "John" });

      expect(result).toBe(ERRORS_KEY.NOT_FOUND);
      expect(mockDb.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe("deleteAuthor", () => {
    it("should delete an author by ID", async () => {
      const authorId = new ObjectId();
      mockDb.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await repository.deleteAuthor(authorId.toHexString());

      expect(result).toBe(true);
      expect(mockDb.deleteOne).toHaveBeenCalledWith({ _id: authorId });
    });

    it("should return NOT_FOUND if author is not found", async () => {
      mockDb.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await repository.deleteAuthor(new ObjectId().toHexString());

      expect(result).toBe(ERRORS_KEY.NOT_FOUND);
      expect(mockDb.deleteOne).toHaveBeenCalled();
    });
  });
});