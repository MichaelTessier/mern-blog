import { describe, it, vi, expect } from "vitest";
import { mock } from 'vitest-mock-extended';
import { postController } from "../post.controller";
import { PostRepository } from "../post.repository";
import { Request, Response } from "express";
import { ConflictError, CustomError, ERRORS_KEY, NotFoundError } from "@/api/errorHandler";

vi.mock('../post.repository', () => ({
  PostRepository: class {
    findPosts = vi.fn();
    findPostById = vi.fn();
    create = vi.fn();
    update = vi.fn();
    delete = vi.fn();
  },
}));

describe('Post Controller', () => {
  const mockPostRepository = vi.mocked(new PostRepository());
  postController['postRepository'] = mockPostRepository ;
  const mockPost = { id: '1', title: 'Post 1', content: 'Content 1', description : 'Description 1', author: 'Author' }

  describe('list', () => {  
    it('should return all posts', async () => {
      const mockPosts = [mockPost];

      mockPostRepository.findPosts.mockResolvedValue({ posts: mockPosts});

      const req = {} as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      await postController.list(req, res);

      expect(mockPostRepository.findPosts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ posts: mockPosts});
    });
  });

  describe('getById', () => {
    it('should return a post by ID', async () => {
      mockPostRepository.findPostById.mockResolvedValue(mockPost);
      const req = { params: { id: '1' } } as Request<{id: string}>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      await postController.getById(req, res);

      expect(mockPostRepository.findPostById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it('should throw an error if post not found', async () => {
      mockPostRepository.findPostById.mockResolvedValue(ERRORS_KEY.NOT_FOUND);

      const req = { params: { id: '1' } } as Request<{id: string}>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      const error = {
        key: ERRORS_KEY.NOT_FOUND,
        message: `Error when get post by id ${req.params.id}`,
      };

      await expect(async () => {
        await postController.getById(req, res);
      }).rejects.toThrowError(new NotFoundError(error));
    })
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const req = { body: mockPost } as Request<{}, {}, typeof mockPost>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      mockPostRepository.create.mockResolvedValue(mockPost);

      await postController.create(req, res);

      expect(mockPostRepository.create).toHaveBeenCalledWith(mockPost);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPost);
      
    });

    it('should throw an error if post creation fails', async () => {
      mockPostRepository.create.mockResolvedValue(ERRORS_KEY.CONFLICT);

      const req = { body: mockPost } as Request<{}, {}, typeof mockPost>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      const error = {
        key: ERRORS_KEY.CONFLICT,
        message: `Error when create post`,
      };

      await expect(async () => {
        await postController.create(req, res);
      }).rejects.toThrowError(new ConflictError(error));
    });
  });

  describe('update', () => {
    it('should update an existing post', async () => {
      const req = { params: { id: '1' }, body: mockPost } as Request<{id: string}, {}, typeof mockPost>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      mockPostRepository.update.mockResolvedValue(mockPost);

      await postController.update(req, res);

      expect(mockPostRepository.update).toHaveBeenCalledWith('1', mockPost);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it('should throw an error if post update fails', async () => {
      mockPostRepository.update.mockResolvedValue(ERRORS_KEY.NOT_FOUND);

      const req = { params: { id: '1' }, body: mockPost } as Request<{id: string}, {}, typeof mockPost>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      const error = {
        key: ERRORS_KEY.NOT_FOUND,
        message: `Error when update post with id ${req.params.id}`,
      };

      await expect(async () => {
        await postController.update(req, res);
      }).rejects.toThrowError(new NotFoundError(error));
    });
  });

  describe('delete', () => {
    it('should delete a post by ID', async() => {
      const req = { params: { id: '1' } } as Request<{id: string}>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      mockPostRepository.delete.mockResolvedValue();

      await postController.delete(req, res);

      expect(mockPostRepository.delete).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('should throw an error if post deletion fails', async () => {
      mockPostRepository.delete.mockResolvedValue(ERRORS_KEY.NOT_FOUND);

      const req = { params: { id: '1' } } as Request<{id: string}>;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as Partial<Response> as Response;

      const error = {
        key: ERRORS_KEY.NOT_FOUND,
        message: `Error when delete post with id ${req.params.id}`,
      };

      await expect(async () => {
        await postController.delete(req, res);
      }).rejects.toThrowError(new NotFoundError(error));
    });
  });
})