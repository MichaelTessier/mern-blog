import { ObjectId } from "mongodb";
import { postDTOSchema, postEntitySchema, postIdParamSchema } from "../post.schema";
import { postData } from "../__data__";

describe('Post Schema', () => {

  describe('postEntitySchema', () => {
    it('should validate post entity schema', () => {
      const result = postEntitySchema.safeParse(postData.postEntity);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(postData.postEntity) 
    })

    it('should invalidate post entity schema with missing fields', () => {
      const result = postEntitySchema.safeParse({
        ...postData.postEntity,
        title: ''
      });

      expect(result.success).toBe(false);  
      expect(result.error?.issues[0].message).toEqual('Title is too short');
    })
  });

  describe('postDTOSchema', () => {
    it('should validate post DTO schema', () => {
      const result = postDTOSchema.safeParse(postData.postDTO);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(postData.postDTO);
    })

    it('should invalidate post DTO schema with missing fields', () => {
      const result = postDTOSchema.safeParse({
        ...postData.postDTO,
        title: '',
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toEqual('Title is too short');
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