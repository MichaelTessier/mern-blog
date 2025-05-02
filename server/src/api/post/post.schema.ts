import { ObjectId } from "mongodb";
import { z } from "zod";


export const postEntitySchema = z.object({
  _id: z.instanceof(ObjectId),
  title: z.string({
    required_error: "Description is required",
  }).min(1, { message: "Title is too short" }).max(100, { message: "Title is too long" }),
  description: z.string({
    required_error: "Description is required",
  }).min(1, { message: "Description is too short" }).max(500, { message: "Description is too long" }),
  content: z.string({
    required_error: "Content is required",
  }).min(1, { message: "Content is too short" }).max(5000, { message: "Content is too long" }),
  author: z.string({
    required_error: "Author is required",
  }).min(1, { message: "Invalid author" }), // Refactoring with author Id
})

export type PostEntity = z.infer<typeof postEntitySchema>;

export const postDTOSchema = z.object({
  id: z.string(),
  title: postEntitySchema.shape.title,
  description: postEntitySchema.shape.description,
  content: postEntitySchema.shape.content,
  author: postEntitySchema.shape.author,
})

export type PostDTO = z.infer<typeof postDTOSchema>;

export const PostDTO = {
  toDomainEntity(entity: PostEntity) {
    const candidate: PostDTO = {
      id: entity._id.toHexString(),
      title: entity.title,
      description: entity.description,
      content: entity.content,
      author: entity.author,
    };

    return postDTOSchema.safeParse(candidate);
  }
}

// Add pagination
export const postListDTOSchema = z.object({
  posts: z.array(postDTOSchema),
})

export type PostDTOList = z.infer<typeof postListDTOSchema>;

export const postIdParamSchema = z.object({
  id: z.string().refine((id) => ObjectId.isValid(id), {
    message: "Invalid post ID",
  }),
})

export type PostIdParam = z.infer<typeof postIdParamSchema>;

export const postCreateDtoSchema = postDTOSchema.omit({id: true})

export type PostCreateDTO = z.infer<typeof postCreateDtoSchema>;

export const postUpdateDtoSchema = postDTOSchema.partial().omit({id: true})

export type PostUpdateDTO = z.infer<typeof postUpdateDtoSchema>;