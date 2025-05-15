import express from 'express';
import { validateSchemaMiddleware } from '@/api/middlewares/validateSchema.middleware';
import { postController } from './post.controller';
import { postCreateDTOSchema, postIdParamSchema, postUpdateDTOSchema } from './post.schema';

const router = express.Router();

router.get(
  '/posts', 
  postController.list
);

router.get(
  '/posts/:id', 
  validateSchemaMiddleware.params(postIdParamSchema), 
  postController.getById
);

router.post('/posts', 
  validateSchemaMiddleware.request(postCreateDTOSchema), 
  postController.create
);

router.patch(
  '/posts/:id', 
  validateSchemaMiddleware.params(postIdParamSchema), 
  validateSchemaMiddleware.request(postUpdateDTOSchema), 
  postController.update
);


router.delete(
  '/posts/:id', 
  validateSchemaMiddleware.params(postIdParamSchema), 
  postController.delete
);

export default router;