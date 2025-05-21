import { vi, describe, it, expect, afterEach, Mock } from "vitest";
import { PostRepository } from '@/api/post/post.repository';
import { mockDb } from '@/services/mongodb/__mocks__/mongodb.service'; 
import { PostMapper } from '@/api/post/post.mapper';
import { ObjectId } from 'mongodb';
import { ERRORS_KEY } from "@/api/errorHandler";
import { postData } from "../__data__";
import { postDTOSchema } from '../post.schema';

vi.mock('@/services/mongodb/mongodb.service');

vi.mock('../post.schema', async (importActual) => {
  const actual = await importActual() as any;

  return {
    ...actual,
    postDTOSchema: {
      safeParse: vi.fn().mockReturnValue({ success: true, data: { mocked: true } }),
    }
  };
});

describe('PostRepository', () => {
  const repository = new PostRepository();

  beforeEach(() => {
    vi.useFakeTimers()
    
    mockDb.find.mockReset();
    mockDb.findOne.mockReset();
    mockDb.insertOne.mockReset();
    mockDb.deleteOne.mockReset();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    
    vi.useRealTimers();
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
      (postDTOSchema.safeParse as Mock).mockReturnValueOnce({ success: false });
      vi.spyOn(PostMapper, 'toDTO').mockImplementation(() => ({} as any));

      const result = await repository.findPosts();
      
      expect(postDTOSchema.safeParse).toHaveBeenCalled();
      expect(PostMapper.toDTO).toHaveBeenCalled();
      expect(mockDb.find).toHaveBeenCalled();
      expect(result).toEqual({
        "posts": [],
      });

    });
  })

  describe('create', () => {
    it('should insert a new post', async () => {
      mockDb.insertOne.mockResolvedValue({ acknowledged: true, insertedId: '6813c4c9fd33f0e52d13dc68'});

      (postDTOSchema.safeParse as Mock).mockReturnValueOnce({ success: true, data: postData.postEntity });
      
      const result = await repository.create(postData.postCreateDTO);
      
      expect(result).toHaveProperty('_id');

      expect(postDTOSchema.safeParse).toHaveBeenCalled();
      expect(mockDb.insertOne).toHaveBeenCalled();
    });

    it('should throw an error if database query fails', async () => {
      mockDb.insertOne.mockRejectedValue(new Error('Database error')); 
  
      await expect(repository.create(postData.postCreateDTO)).rejects.toThrow('Database error');
    });

    it('should return NOT_FOUND if post does not exist', async () => {
      mockDb.insertOne.mockResolvedValue({
        acknowledged: false,
        insertedId: null,
      }); 
  
      const result = await repository.create(postData.postCreateDTO);
  
      expect(result).toEqual(ERRORS_KEY.CONFLICT);
    });

    it('should return VALIDATION error if DTO validation fails', async () => {
      mockDb.insertOne.mockResolvedValue({ acknowledged: true, insertedId: '123' });
      
      (postDTOSchema.safeParse as Mock).mockReturnValueOnce({ success: false });

      vi.spyOn(PostMapper, 'toDTO').mockImplementation(() => ({} as any));

      const result = await repository.create(postData.postCreateDTO);
  
      expect(postDTOSchema.safeParse).toHaveBeenCalled();
      expect(PostMapper.toDTO).toHaveBeenCalled();
      expect(result).toEqual(ERRORS_KEY.VALIDATION);
    });

  })

  describe('findPostById', () => {
    it('should find a post by ID', async () => {
      mockDb.findOne.mockResolvedValue(postData.postEntity);

      const mockPost = {
        ...postData.postEntity,
        _id: postData.postEntity._id.toString(),
      };

      (postDTOSchema.safeParse as Mock).mockReturnValueOnce({ success: true, data: mockPost});

      const result = await repository.findPostById(postData.postEntity._id.toString());
      
      expect(mockDb.findOne).toHaveBeenCalledWith({ _id: postData.postEntity._id });  
      expect(postDTOSchema.safeParse).toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });

    it('should return NOT_FOUND if post does not exist', async () => {
      mockDb.findOne.mockResolvedValue(null); 
  
      const result = await repository.findPostById('6813c4c9fd33f0e52d13dc68');
  
      expect(mockDb.findOne).toHaveBeenCalledWith({ _id: new ObjectId('6813c4c9fd33f0e52d13dc68') });

      expect(result).toEqual(ERRORS_KEY.NOT_FOUND);
    });


    it('should return VALIDATION error if DTO validation fails', async () => {
      mockDb.findOne.mockResolvedValue(postData.postEntity);
      (postDTOSchema.safeParse as Mock).mockReturnValueOnce({ success: false });
      vi.spyOn(PostMapper, 'toDTO').mockImplementation(() => ({} as any));


      const result = await repository.findPostById(postData.postEntity._id.toString());
  
      expect(postDTOSchema.safeParse).toHaveBeenCalled();
      expect(PostMapper.toDTO).toHaveBeenCalled();
      expect(mockDb.findOne).toHaveBeenCalledWith({ _id: postData.postEntity._id });
      expect(result).toEqual(ERRORS_KEY.VALIDATION);
    });
  
    it('should throw an error if database query fails', async () => {
      mockDb.findOne.mockRejectedValue(new Error('Database error')); 
  
      await expect(repository.findPostById('6813c4c9fd33f0e52d13dc68')).rejects.toThrow('Database error');
    });
  })

  describe('update', () => {
    it('should update a post by ID', async () => {
      const _id = postData.postEntity._id
      const postUpdate = { 
        ...postData.postUpdateDTO,
        updatedAt: new Date(), 
      }

      const mockPost = { 
        ...postData.postEntity,
        ...postUpdate,
      }

      mockDb.findOneAndUpdate.mockResolvedValue(mockPost);
      (postDTOSchema.safeParse as Mock).mockReturnValueOnce({ success: true, data: mockPost});

      const result = await repository.update(_id.toString(), postData.postUpdateDTO ) as any;
      
      expect(postDTOSchema.safeParse).toHaveBeenCalled();
      expect(mockDb.findOneAndUpdate).toHaveBeenCalledWith({ _id }, { 
        $set: postUpdate
      }, { returnDocument: 'after' }); 

      expect(result).toEqual(mockPost);
    });

    it('should return NOT_FOUND if post does not exist', async () => {
      const _id = postData.postEntity._id
      const postUpdate = { 
        ...postData.postUpdateDTO,
        updatedAt: new Date(), 
      }

      mockDb.findOneAndUpdate.mockResolvedValue(null);
  
      const result = await repository.update(_id.toString(), postData.postUpdateDTO);
  
      expect(mockDb.findOneAndUpdate).toHaveBeenCalledWith({ _id }, { $set: postUpdate }, { returnDocument: 'after' });

      expect(result).toEqual(ERRORS_KEY.NOT_FOUND);
    });

    it('should throw an error if database query fails', async () => {
      mockDb.findOneAndUpdate.mockRejectedValue(new Error('Database error')); 
  
      await expect(repository.update('6813c4c9fd33f0e52d13dc68', { title: 'Test', description: 'Test', content: 'Test', author: '123' })).rejects.toThrow('Database error');
    });

    it('should return VALIDATION error if DTO validation fails', async () => { 
      const _id = postData.postEntity._id
      const postUpdate = { 
        ...postData.postUpdateDTO,
        updatedAt: new Date(), 
      }
  
      mockDb.findOneAndUpdate.mockResolvedValue(postUpdate);
      
      vi.spyOn(PostMapper, 'toDTO').mockImplementation(() => ({} as any));
      (postDTOSchema.safeParse as Mock).mockReturnValueOnce({ success: false});


      const result = await repository.update(_id.toString(), postUpdate );
  
      expect(postDTOSchema.safeParse).toHaveBeenCalled();
      expect(PostMapper.toDTO).toHaveBeenCalled();
      expect(mockDb.findOneAndUpdate).toHaveBeenCalledWith({ _id }, { $set: postUpdate }, { returnDocument: 'after' });
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