import { ObjectId } from "mongodb";
import { SafeParseReturnType, z } from "zod";
import { authorDTOSchema, authorEntitySchema } from "../author/author.schema";

export const postEntitySchema = z.object({
  _id: z.instanceof(ObjectId),
  title: z
    .string({
      required_error: "Title is required",
    })
    .min(1, { message: "Title is too short" })
    .max(100, { message: "Title is too long" }),
  description: z
    .string({
      required_error: "Description is required",
    })
    .min(1, { message: "Description is too short" })
    .max(500, { message: "Description is too long" }),
  content: z
    .string({
      required_error: "Content is required",
    })
    .min(1, { message: "Content is too short" })
    .max(5000, { message: "Content is too long" }),
  authorId: z.instanceof(ObjectId)
}).strict();

export type PostEntity = z.infer<typeof postEntitySchema>;

export const postEntitySchemaAggregated = postEntitySchema
  .extend({
    author: authorEntitySchema,
  })
  .omit({ authorId: true })

export type PostEntityAggregated = z.infer<typeof postEntitySchemaAggregated>;

export const postDTOSchema = z
  .object({
    id: z.string(),
    title: postEntitySchema.shape.title,
    description: postEntitySchema.shape.description,
    content: postEntitySchema.shape.content,
    author: authorDTOSchema,
  })

export type PostDTO = z.infer<typeof postDTOSchema>;


export const PostDTOMapper = {
  toDomain(entity: PostEntityAggregated): SafeParseReturnType<PostEntityAggregated, PostDTO> {
    const candidate: PostDTO = {
      id: entity._id.toHexString(),
      title: entity.title,
      description: entity.description,
      content: entity.content,
      author: {
        id: entity.author._id.toHexString(),
        firstName: entity.author.first_name,
        lastName: entity.author.last_name,
        biography: entity.author.biography,
      },
    };

    return postDTOSchema.safeParse(candidate);
  },
}

// POST LIST
export const postListDTOSchema = z
  .object({
    posts: z.array(postDTOSchema),
  })

export type PostDTOList = z.infer<typeof postListDTOSchema>;

// POST CREATE
export const postCreateEntitySchema = postEntitySchema

export type PostCreateEntity = z.infer<typeof postCreateEntitySchema>;

export const postCreateDTOSchema = postDTOSchema
  .extend({
    authorId: z.string().refine((id) => ObjectId.isValid(id), {
      message: "Invalid author ID",
    })
  })
  .omit({
    id: true, 
    author: true
  })

export type PostCreateDTO = z.infer<typeof postCreateDTOSchema>;

export const PostCreateDTOMapper = {
  toEntity(entity: PostCreateDTO) {
    const candidate: PostCreateEntity = {
      _id: new ObjectId(),
      title: entity.title,
      description: entity.description,
      content: entity.content,
      authorId: new ObjectId(entity.authorId),
    };

    return postEntitySchema.safeParse(candidate);
  },
}

// POST UPDATE
export const postUpdateEntitySchema = postEntitySchema.partial()

export type PostUpdateEntity = z.infer<typeof postUpdateEntitySchema>;

export const postUpdateDTOSchema = postCreateDTOSchema.partial()

export type PostUpdateDTO = z.infer<typeof postUpdateDTOSchema>;

export const PostUpdateDTOMapper = {
  toEntity(entity: PostUpdateDTO) {
    const candidate: PostUpdateEntity = {
      ...(entity.title && { title: entity.title}),
      ...(entity.description && { description: entity.description }),
      ...(entity.content && { content: entity.content }),
      ...(entity?.authorId && { authorId: new ObjectId(entity.authorId) }),
    };

    return postUpdateEntitySchema.safeParse(candidate);
  },
}

// PARAMS
export const postIdParamSchema = z
  .object({
    id: z.string().refine((id) => ObjectId.isValid(id), {
      message: "Invalid post ID",
    }),
  })

export type PostIdParam = z.infer<typeof postIdParamSchema>;
