import { vi, describe, it, expect, afterEach } from "vitest";
import { PostRepository } from '@/api/post/post.repository';
import { mockDb } from '@/services/mongodb/__mocks__/mongodb.service'; 

import { ObjectId } from 'mongodb';
import { ERRORS_KEY } from "@/api/errorHandler";
import { PostDTO } from "../post.schema";

vi.mock('@/services/mongodb/mongodb.service');

describe('PostRepository', () => {
  const repository = new PostRepository();

  beforeEach(() => {
    mockDb.find.mockReset();
    mockDb.findOne.mockReset();
    mockDb.insertOne.mockReset();
    mockDb.deleteOne.mockReset();

    vi.spyOn(PostDTO, 'toDomainEntity').mockImplementation(() => ({
      success: true,
      data: { id: '6813c4c9fd33f0e52d13dc68', title: 'Test', description: 'Test', content: 'Test', author: '123' },
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  })

  describe('findPosts', () => {
    it('should fetch all posts', async () => {
      mockDb.find.mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) });

      const result = await repository.findPosts();
      
      expect(result.posts).toEqual([]);

      expect(mockDb.find).toHaveBeenCalled();
    });


    it('should return VALIDATION error if DTO validation fails', async () => {
      mockDb.find.mockReturnValue({ toArray: vi.fn().mockResolvedValue([{ title: 'Test' }]) });

      vi.spyOn(PostDTO, 'toDomainEntity').mockReturnValue({
        success: false,
        error: { issues: [{ message: 'Invalid data', code: 'custom', path: [] }] } as any,
      });

      const result = await repository.findPosts();
      
      expect(mockDb.find).toHaveBeenCalled();
      expect(result).toEqual({
        "posts": [],
      });

    });
  })

  describe('create', () => {
    it('should insert a new post', async () => {
      mockDb.insertOne.mockResolvedValue({ acknowledged: true, insertedId: '6813c4c9fd33f0e52d13dc68'});
      
      const result = await repository.create({ title: 'Test', description: 'Test', content: 'Test', author: '123' });
      
      expect(result).toHaveProperty('id');

      expect(mockDb.insertOne).toHaveBeenCalled();
    });

    it('should throw an error if database query fails', async () => {
      mockDb.insertOne.mockRejectedValue(new Error('Database error')); 
  
      await expect(repository.create({ title: 'Test', description: 'Test', content: 'Test', author: '123' })).rejects.toThrow('Database error');
    });

    it('should return NOT_FOUND if post does not exist', async () => {
      mockDb.insertOne.mockResolvedValue({
        acknowledged: false,
        insertedId: null,
      }); 
  
      const result = await repository.create({ title: 'Test', description: 'Test', content: 'Test', author: '123' });
  
      expect(result).toEqual(ERRORS_KEY.CONFLICT);
    });

    it('should return VALIDATION error if DTO validation fails', async () => {
      mockDb.insertOne.mockResolvedValue({ acknowledged: true, insertedId: '123' });
      
      vi.spyOn(PostDTO, 'toDomainEntity').mockReturnValue({
        success: false,
        error: { issues: [{ message: 'Invalid data', code: 'custom', path: [] }] } as any,
      });

      const result = await repository.create({ title: 'Test', description: 'Test', content: 'Test', author: '123' });
  
      expect(result).toEqual(ERRORS_KEY.VALIDATION);
    });

  })

  describe('findPostById', () => {
    it('should find a post by ID', async () => {
      const _id = new ObjectId('6813c4c9fd33f0e52d13dc68')
      const mockPost = { _id, title: 'Test', description: 'Test', content: 'Test', author: '123' };
      mockDb.findOne.mockResolvedValue(mockPost);
      const result = await repository.findPostById('6813c4c9fd33f0e52d13dc68');
      
      expect(mockDb.findOne).toHaveBeenCalledWith({ _id });  

      expect(result).toEqual({ id: '6813c4c9fd33f0e52d13dc68', title: 'Test', description: 'Test', content: 'Test', author: '123' });
    });

    it('should return NOT_FOUND if post does not exist', async () => {
      mockDb.findOne.mockResolvedValue(null); 
  
      const result = await repository.findPostById('6813c4c9fd33f0e52d13dc68');
  
      expect(mockDb.findOne).toHaveBeenCalledWith({ _id: new ObjectId('6813c4c9fd33f0e52d13dc68') });

      expect(result).toEqual(ERRORS_KEY.NOT_FOUND);
    });


    it('should return VALIDATION error if DTO validation fails', async () => {
      const _id = new ObjectId('6813c4c9fd33f0e52d13dc68');
      const mockPost = { _id, title: 'Test', description: 'Test', content: 'Test', author: '123' };
  
      mockDb.findOne.mockResolvedValue(mockPost);
      
      vi.spyOn(PostDTO, 'toDomainEntity').mockReturnValue({
        success: false,
        error: { issues: [{ message: 'Invalid data', code: 'custom', path: [] }] } as any,
      });

      const result = await repository.findPostById('6813c4c9fd33f0e52d13dc68');
  
      expect(mockDb.findOne).toHaveBeenCalledWith({ _id });
      expect(result).toEqual(ERRORS_KEY.VALIDATION);
    });
  
    it('should throw an error if database query fails', async () => {
      mockDb.findOne.mockRejectedValue(new Error('Database error')); 
  
      await expect(repository.findPostById('6813c4c9fd33f0e52d13dc68')).rejects.toThrow('Database error');
    });
  })

  describe('update', () => {
    it('should update a post by ID', async () => {
      const _id = new ObjectId('6813c4c9fd33f0e52d13dc68')
      const mockPost = { _id, title: 'Test', description: 'Test', content: 'Test', author: '123' };
      mockDb.findOneAndUpdate.mockResolvedValue(mockPost);

      const result = await repository.update('6813c4c9fd33f0e52d13dc68', mockPost );
      
      expect(mockDb.findOneAndUpdate).toHaveBeenCalledWith({ _id }, { $set: mockPost }, { returnDocument: 'after' }); 

      expect(result).toEqual({ id: '6813c4c9fd33f0e52d13dc68', title: 'Test', description: 'Test', content: 'Test', author: '123' });
    });

    it('should return NOT_FOUND if post does not exist', async () => {
      mockDb.findOneAndUpdate.mockResolvedValue(null); 
  
      const result = await repository.update('6813c4c9fd33f0e52d13dc68', { title: 'Test', description: 'Test', content: 'Test', author: '123' });
  
      expect(mockDb.findOneAndUpdate).toHaveBeenCalledWith({ _id: new ObjectId('6813c4c9fd33f0e52d13dc68') }, { $set: { title: 'Test', description: 'Test', content: 'Test', author: '123' } }, { returnDocument: 'after' });

      expect(result).toEqual(ERRORS_KEY.NOT_FOUND);
    });

    it('should throw an error if database query fails', async () => {
      mockDb.findOneAndUpdate.mockRejectedValue(new Error('Database error')); 
  
      await expect(repository.update('6813c4c9fd33f0e52d13dc68', { title: 'Test', description: 'Test', content: 'Test', author: '123' })).rejects.toThrow('Database error');
    });

    it('should return VALIDATION error if DTO validation fails', async () => {
      const _id = new ObjectId('6813c4c9fd33f0e52d13dc68');
      const mockPost = { _id, title: 'Test', description: 'Test', content: 'Test', author: '123' };
  
      mockDb.findOneAndUpdate.mockResolvedValue(mockPost);
      
      vi.spyOn(PostDTO, 'toDomainEntity').mockReturnValue({
        success: false,
        error: { issues: [{ message: 'Invalid data', code: 'custom', path: [] }] } as any,
      });

      const result = await repository.update('6813c4c9fd33f0e52d13dc68', mockPost );
  
      expect(mockDb.findOneAndUpdate).toHaveBeenCalledWith({ _id }, { $set: mockPost }, { returnDocument: 'after' });
      expect(result).toEqual(ERRORS_KEY.VALIDATION);
    });
  })

  describe('delete', () => {
    it('should delete a post by ID', async () => {
      const _id = new ObjectId('6813c4c9fd33f0e52d13dc68')
      mockDb.deleteOne.mockResolvedValue({ acknowledged: true });

      const result = await repository.delete('6813c4c9fd33f0e52d13dc68');
      
      expect(mockDb.deleteOne).toHaveBeenCalledWith({ _id });

      expect(result).toBeUndefined();
    });

    it('should return NOT_FOUND if post does not exist', async () => {
      mockDb.deleteOne.mockResolvedValue({ deletedCount: 0 }); 
  
      const result = await repository.delete('6813c4c9fd33f0e52d13dc68');
  
      expect(mockDb.deleteOne).toHaveBeenCalledWith({ _id: new ObjectId('6813c4c9fd33f0e52d13dc68') });

      expect(result).toEqual(ERRORS_KEY.NOT_FOUND);
    });
  })
});