import { postController } from "../post.controller";
import { PostRepository } from "../post.repository";
import { Request, Response } from "express";
import { ConflictError, ERRORS_KEY, NotFoundError } from "@/api/errorHandler";
import { postData } from "../__data__";

vi.mock('../post.repository');

describe('Post Controller', () => {
  const mockPostRepository = vi.mocked(new PostRepository());
  postController['postRepository'] = mockPostRepository ;

  const req = { params: { id: '1' }, body: postData.postDTO } as Request<{id: string}, {}, typeof postData.postDTO>;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as Partial<Response> as Response;

  describe('list', () => {  
    it('should return all posts', async () => {

      const mockResponse = { posts: [postData.postDTO]}

      mockPostRepository.findPosts.mockResolvedValue({ posts: [postData.postDTO]});

      await postController.list(req, res);

      expect(mockPostRepository.findPosts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('getById', () => {
    it('should return a post by ID', async () => {
      mockPostRepository.findPostById.mockResolvedValue(postData.postDTO);

      await postController.getById(req, res);

      expect(mockPostRepository.findPostById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(postData.postDTO);
    });

    it('should throw an error if post not found', async () => {
      mockPostRepository.findPostById.mockResolvedValue(ERRORS_KEY.NOT_FOUND);

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
      mockPostRepository.create.mockResolvedValue(postData.postDTO);

      await postController.create(req, res);

      expect(mockPostRepository.create).toHaveBeenCalledWith(postData.postDTO);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(postData.postDTO);
      
    });

    it('should throw an error if post creation fails', async () => {
      mockPostRepository.create.mockResolvedValue(ERRORS_KEY.CONFLICT);

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
      mockPostRepository.update.mockResolvedValue(postData.postDTO);

      await postController.update(req, res);

      expect(mockPostRepository.update).toHaveBeenCalledWith('1', postData.postDTO);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(postData.postDTO);
    });

    it('should throw an error if post update fails', async () => {
      mockPostRepository.update.mockResolvedValue(ERRORS_KEY.NOT_FOUND);

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
      mockPostRepository.delete.mockResolvedValue();

      await postController.delete(req, res);

      expect(mockPostRepository.delete).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('should throw an error if post deletion fails', async () => {
      mockPostRepository.delete.mockResolvedValue(ERRORS_KEY.NOT_FOUND);

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