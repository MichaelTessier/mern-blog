import express from 'express';
import request from 'supertest';
import router from '../post.route';
import { postController } from '@/api/post/post.controller';
import { validateSchemaMiddleware } from '@/api/middlewares/validateSchema.middleware';
import { database } from '@/services/mongodb/mongodb.service';

vi.mock('@/services/mongodb/mongodb.service');
vi.mock('@/api/post/post.controller');
vi.mock('@/api/middlewares/validateSchema.middleware');

const app = express();
app.use(express.json());
app.use(router);


describe('Post Routes', () => {

  beforeAll(async () => {
    await database.connect();
  });

  afterAll(() => {
    vi.clearAllMocks();
  })
  
  const mockPostController = vi.mocked(postController);
  const mockValidateSchemaMiddleware = vi.mocked(validateSchemaMiddleware);

  describe('GET /posts', () => {
    it('should call postController.list', async () => {

      const response = await request(app).get('/posts');

      expect(mockPostController.list).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'list called' }); 
    });
  })

  describe('GET /posts/:id', () => {
    it('should call postController.getById', async () => {
      const response = await request(app).get('/posts/6813c4c9fd33f0e52d13dc68');

      expect(mockValidateSchemaMiddleware.params).toHaveBeenCalled();
      expect(mockPostController.getById).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'getById called' });
    });
  })

  describe('POST /posts', () => {
    it('should call postController.create', async () => {
      const response = await request(app).post('/posts').send({ title: 'Test', description: 'Test', content: 'Test', author: '123' });

      expect(mockValidateSchemaMiddleware.request).toHaveBeenCalled();
      expect(mockPostController.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'create called' });
    });
  })

  describe('PATCH /posts/:id', () => {
    it('should call postController.update', async () => {
      const response = await request(app).patch('/posts/6813c4c9fd33f0e52d13dc68').send({ title: 'Test', description: 'Test', content: 'Test', author: '123' });

      expect(mockValidateSchemaMiddleware.params).toHaveBeenCalled();
      expect(mockValidateSchemaMiddleware.request).toHaveBeenCalled();
      expect(mockPostController.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'update called' });
    });
  })

  describe('DELETE /posts/:id', () => {
    it('should call postController.delete', async () => {
      const response = await request(app).delete('/posts/6813c4c9fd33f0e52d13dc68');

      expect(mockValidateSchemaMiddleware.params).toHaveBeenCalled();
      expect(mockPostController.delete).toHaveBeenCalled();
      expect(response.status).toBe(204);
    });
  })


  
});