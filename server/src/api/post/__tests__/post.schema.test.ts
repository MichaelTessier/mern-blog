import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";
import { PostDTO, postDTOSchema, postEntitySchema, postIdParamSchema } from "../post.schema";
import { a } from "vitest/dist/chunks/suite.d.FvehnV49";


describe('Post Schema', () => {

  describe('postEntitySchema', () => {
    it('should validate post entity schema', () => {
      const validPost = {
        _id: new ObjectId(),
        title: 'Valid Title',
        description: 'Valid Description',
        content: 'Valid Content',
        author: 'Valid Author',
      }
      
      const result = postEntitySchema.safeParse(validPost);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validPost) 
    })

    it('should invalidate post entity schema with missing fields', () => {
      const invalidPost = {
        _id: new ObjectId(),
        title: '',
        description: 'Valid Description',
        content: 'Valid Content',
      }

      const result = postEntitySchema.safeParse(invalidPost);
      expect(result.success).toBe(false);  
      expect(result.error?.issues[0].message).toEqual('Title is too short');
    })
  });

  describe('postDTOSchema', () => {
    it('should validate post DTO schema', () => {
      const validPostDTO = {
        id: '1',
        title: 'Valid Title',
        description: 'Valid Description',
        content: 'Valid Content', 
        author: 'Valid Author',
      } 

      const result = postDTOSchema.safeParse(validPostDTO);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validPostDTO);
    })

    it('should invalidate post DTO schema with missing fields', () => {
      const invalidPostDTO = {
        id: '1',
        title: '',
        description: 'Valid Description',
        content: 'Valid Content',
      }

      const result = postDTOSchema.safeParse(invalidPostDTO);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toEqual('Title is too short');
    })
  })

  describe('PostDTO', () => {
    it('should convert post entity to DTO', () => {
      const validPost = {
        _id: new ObjectId('6815c9389fc5c3af20b10f13'),
        title: 'Valid Title',
        description: 'Valid Description',
        content: 'Valid Content',
        author: 'Valid Author',
      }

      const parsedPost = PostDTO.toDomainEntity(validPost);
      expect(parsedPost.success).toBe(true);
      expect(parsedPost.data).toEqual({
         "author": "Valid Author",
         "content": "Valid Content",
         "description": "Valid Description",
         "id": "6815c9389fc5c3af20b10f13",
         "title": "Valid Title",
      })
    })

    it('should invalidate post entity to DTO conversion with invalid data', () => {
      const invalidPost = {
        _id: new ObjectId('6815c9389fc5c3af20b10f13'),
        title: '',
        description: 'Valid Description',
        content: 'Valid Content',
        author: 'Valid Author',
      }
      const parsedPost = PostDTO.toDomainEntity(invalidPost);
      expect(parsedPost.success).toBe(false);
      expect(parsedPost.error?.issues[0].message).toEqual('Title is too short');
    })
  })

  describe('postIdParamSchema', () => {
    it('should validate post ID param schema', () => {
      const validId = { id: '6815c9389fc5c3af20b10f13' };
      const result = postIdParamSchema.safeParse(validId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validId);
    })

    it('should invalidate post ID param schema with invalid ID', () => {
      const invalidId = { id: 'invalid-id' };
      const result = postIdParamSchema.safeParse(invalidId);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toEqual('Invalid post ID');
    })
  })

})