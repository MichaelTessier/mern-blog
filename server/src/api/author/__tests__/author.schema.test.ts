import { describe, it, expect } from "vitest";
import { AuthorDTO, authorEntitySchema, authorDTOSchema, authorCreateDTOSchema, authorUpdateDTOSchema } from "../author.schema";
import { ObjectId } from "mongodb";

describe("Author Schema", () => {
  describe("toDomainEntity", () => {
    it("should transform a valid AuthorEntity into an AuthorDTO", () => {
      const authorEntity = {
        _id: new ObjectId(),
        first_name: "John",
        last_name: "Doe",
        biography: "An amazing author.",
      };

      const result = AuthorDTO.toDomainEntity(authorEntity);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: authorEntity._id.toHexString(),
        firstName: "John",
        lastName: "Doe",
        biography: "An amazing author.",
      });
    });

    it("should fail validation if AuthorEntity is invalid", () => {
      const invalidAuthorEntity = {
        _id: new ObjectId(),
        first_name: "",
        last_name: "Doe",
        biography: "An amazing author.",
      };

      const result = AuthorDTO.toDomainEntity(invalidAuthorEntity);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("First name is too short");
    });
  });

  describe("toCreateEntity", () => {
    it("should transform a valid AuthorCreateDTO into an AuthorEntity", () => {
      const authorCreateDTO = {
        firstName: "John",
        lastName: "Doe",
        biography: "An amazing author.",
      };

      const result = AuthorDTO.toCreateEntity(authorCreateDTO);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        first_name: "John",
        last_name: "Doe",
        biography: "An amazing author.",
      });
      expect(result.data?._id).toBeInstanceOf(ObjectId);
    });

    it("should fail validation if AuthorCreateDTO is invalid", () => {
      const invalidAuthorCreateDTO = {
        firstName: "",
        lastName: "Doe",
        biography: "An amazing author.",
      };

      const result = AuthorDTO.toCreateEntity(invalidAuthorCreateDTO);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("First name is too short");
    });
  });

  describe("toUpdateEntity", () => {
    it("should transform a valid AuthorUpdateDTO into an AuthorUpdateEntity", () => {
      const authorUpdateDTO = {
        firstName: "John",
      };

      const result = AuthorDTO.toUpdateEntity(authorUpdateDTO);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        first_name: "John",
      });
    });

    // TODO: fix this
    it.skip("should fail validation if AuthorUpdateDTO is invalid", () => {
      const invalidAuthorUpdateDTO = {
        firstName: "",
      };

      const result = AuthorDTO.toUpdateEntity(invalidAuthorUpdateDTO);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("First name is too short");
    });
  });

  describe("Validation Schemas", () => {
    it("should validate a valid AuthorEntity", () => {
      const authorEntity = {
        _id: new ObjectId(),
        first_name: "John",
        last_name: "Doe",
        biography: "An amazing author.",
      };

      const result = authorEntitySchema.safeParse(authorEntity);

      expect(result.success).toBe(true);
    });

    it("should validate a valid AuthorDTO", () => {
      const authorDTO = {
        id: new ObjectId().toHexString(),
        firstName: "John",
        lastName: "Doe",
        biography: "An amazing author.",
      };

      const result = authorDTOSchema.safeParse(authorDTO);

      expect(result.success).toBe(true);
    });

    it("should validate a valid AuthorCreateDTO", () => {
      const authorCreateDTO = {
        firstName: "John",
        lastName: "Doe",
        biography: "An amazing author.",
      };

      const result = authorCreateDTOSchema.safeParse(authorCreateDTO);

      expect(result.success).toBe(true);
    });

    it("should validate a valid AuthorUpdateDTO", () => {
      const authorUpdateDTO = {
        firstName: "John",
      };

      const result = authorUpdateDTOSchema.safeParse(authorUpdateDTO);

      expect(result.success).toBe(true);
    });
  });
});