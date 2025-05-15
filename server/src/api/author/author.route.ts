import express from 'express'
import { validateSchemaMiddleware } from '@/api/middlewares/validateSchema.middleware'
import { authorController } from './author.controller'
import { authorCreateDTOSchema, authorIdParamSchema, authorUpdateDTOSchema } from './author.schema'

const router = express.Router()

router.get(
  '/authors', 
  authorController.list
)

router.get(
  '/authors/:id', 
  validateSchemaMiddleware.params(authorIdParamSchema), 
  authorController.getById
)

router.post('/authors', 
  validateSchemaMiddleware.request(authorCreateDTOSchema), 
  authorController.create
);

router.patch(
  '/authors/:id', 
  validateSchemaMiddleware.params(authorIdParamSchema), 
  validateSchemaMiddleware.request(authorUpdateDTOSchema), 
  authorController.update
);

router.delete(
  '/authors/:id', 
  validateSchemaMiddleware.params(authorIdParamSchema), 
  authorController.delete
);

export default router