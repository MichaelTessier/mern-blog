import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import router from "../author.route";
import { authorController } from "@/api/author/author.controller";
import { validateSchemaMiddleware } from "@/api/middlewares/validateSchema.middleware";
import { ERRORS_KEY } from "@/api/errorHandler";
import { database } from '@/services/mongodb/mongodb.service';

vi.mock('@/services/mongodb/mongodb.service');
vi.mock("@/api/author/author.controller");
vi.mock("@/api/middlewares/validateSchema.middleware");


const app = express();
app.use(express.json());
app.use(router);

describe("Author Routes", () => {
  beforeAll(async () => {
    await database.connect();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });


  afterAll(() => {
    vi.clearAllMocks();
  })


  const mockAuthorController = vi.mocked(authorController);
  const mockValidateSchemaMiddleware = vi.mocked(validateSchemaMiddleware);

  describe("GET /authors", () => {
    it("should call AuthorController.list and return authors", async () => {
      const mockAuthors = [
        { id: "1", firstName: "John", lastName: "Doe", biography: "An amazing author." },
      ];
      mockAuthorController.list.mockImplementationOnce((req: Request, res: Response): any => {
        res.status(200).json({ authors: mockAuthors });
      });

      const response = await request(app).get("/authors");

      expect(mockAuthorController.list).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ authors: mockAuthors });
    });
  });

  describe("GET /authors/:id", () => {
    it("should call AuthorController.getById and return an author", async () => {
      const mockAuthor = { id: "1", firstName: "John", lastName: "Doe", biography: "An amazing author." };
      mockAuthorController.getById.mockImplementationOnce((req: Request, res: Response): any => {
        res.status(200).json(mockAuthor);
      });

      const response = await request(app).get("/authors/1");

      expect(mockAuthorController.getById).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAuthor);
    });

    it("should return 404 if author is not found", async () => {
      mockAuthorController.getById.mockImplementationOnce((req: Request, res: Response): any => {
        res.status(404).json({ key: ERRORS_KEY.NOT_FOUND, message: "Author not found" });
      });

      const response = await request(app).get("/authors/999");

      expect(mockAuthorController.getById).toHaveBeenCalled();
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ key: ERRORS_KEY.NOT_FOUND, message: "Author not found" });
    });
  });

  describe("POST /authors", () => {
    it("should call AuthorController.create and return the created author", async () => {
      const newAuthor = { firstName: "John", lastName: "Doe", biography: "An amazing author." };
      const createdAuthor = { id: "1", ...newAuthor };

      // mockValidateSchemaMiddleware.request.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => next());
      mockAuthorController.create.mockImplementationOnce((req: Request, res: Response): any => {
        res.status(201).json(createdAuthor);
      });

      const response = await request(app).post("/authors").send(newAuthor);

      // expect(mockValidateSchemaMiddleware.request).toHaveBeenCalled();
      expect(mockAuthorController.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdAuthor);
    });

    // TODO: Fix the validation error test
    it.skip("should return 400 if validation fails", async () => {
      const invalidAuthor = { firstName: "", lastName: "Doe", biography: "An amazing author." };

      // mockValidateSchemaMiddleware.request.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
      //   res.status(400).json({ key: ERRORS_KEY.INVALID_INPUT, message: "Validation failed" });
      // });

      const response = await request(app).post("/authors").send(invalidAuthor);

      // expect(mockValidateSchemaMiddleware.request).toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ key: ERRORS_KEY.INVALID_INPUT, message: "Validation failed" });
    });
  });

  describe("PUT /authors/:id", () => {
    // TODO: Fix the validation error test
    it.skip("should call AuthorController.update and return the updated author", async () => {
      const updatedAuthor = { id: "1", firstName: "John", lastName: "Doe", biography: "Updated biography." };

      // mockValidateSchemaMiddleware.request.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => next());
      mockAuthorController.update.mockImplementationOnce((req: Request, res: Response): any => {
        res.status(200).json(updatedAuthor);
      });

      const response = await request(app).put("/authors/1").send(updatedAuthor);

      // expect(mockValidateSchemaMiddleware.request).toHaveBeenCalled();
      expect(mockAuthorController.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedAuthor);
    });
  });

  describe("DELETE /authors/:id", () => {
    it("should call AuthorController.delete and return 204", async () => {
      mockAuthorController.delete.mockImplementationOnce((req: Request, res: Response): any => {
        res.status(204).send();
      });

      const response = await request(app).delete("/authors/1");

      expect(mockAuthorController.delete).toHaveBeenCalled();
      expect(response.status).toBe(204);
    });
  });
});