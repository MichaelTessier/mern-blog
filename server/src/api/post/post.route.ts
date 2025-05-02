import express from 'express';
import { postController } from './post.controller';
import { validateSchemaMiddleware } from '../middlewares/validateSchema.middleware';
import { postCreateDtoSchema, postIdParamSchema, postUpdateDtoSchema } from './post.schema';

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
  validateSchemaMiddleware.request(postCreateDtoSchema), 
  postController.create
);

router.patch(
  '/posts/:id', 
  validateSchemaMiddleware.params(postIdParamSchema), 
  validateSchemaMiddleware.request(postUpdateDtoSchema), 
  postController.update
);


router.delete(
  '/posts/:id', 
  validateSchemaMiddleware.params(postIdParamSchema), 
  postController.delete
);

export default router;