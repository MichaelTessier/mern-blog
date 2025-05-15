import { ObjectId } from "mongodb";
import { z } from "zod";

export const authorEntitySchema = z.object({
  _id: z.instanceof(ObjectId),
  firstName: z.string({
    required_error: "First name is required",
  }).min(1, { message: "First name is too short" }).max(100, { message: "First name is too long" }),
  lastName: z.string({
    required_error: "Last name is required",
  }).min(1, { message: "Last name is too short" }).max(100, { message: "Last name is too long" }),
  biography: z.string({
    required_error: "Biography is required",
  }).min(1, { message: "Biography is too short" }).max(500, { message: "Biography is too long" }),
})

export type AuthorEntity = z.infer<typeof authorEntitySchema>;

export const authorDTOSchema = z.object({
  id: z.string(),
  firstName: authorEntitySchema.shape.firstName,
  lastName: authorEntitySchema.shape.lastName,
  biography: authorEntitySchema.shape.biography,
})

export type AuthorDTO = z.infer<typeof authorDTOSchema>;

export const AuthorDTO = {
  toDomainEntity(entity: AuthorEntity) {
    const candidate: AuthorDTO = {
      id: entity._id.toHexString(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      biography: entity.biography,
    };

    return authorDTOSchema.safeParse(candidate);
  },

  toCreateEntity(entity: AuthorCreateDTO) {
    const candidate: AuthorEntity = {
      _id: new ObjectId(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      biography: entity.biography,
    };

    return authorEntitySchema.safeParse(candidate);
  },

  toUpdateEntity(entity: AuthorUpdateDTO) {
    const candidate: AuthorUpdateEntity = {
      ...(entity.firstName && { firstName: entity.firstName }),
      ...(entity.lastName && { lastName: entity.lastName }),
      ...(entity.biography && { biography: entity.biography}),
    };
    
    return authorEntitySchema.partial().safeParse(candidate); 
  }
}

// Add pagination
export const authorListDTOSchema = z.object({
  authors: z.array(authorDTOSchema),
})

export type AuthorDTOList = z.infer<typeof authorListDTOSchema>;

export const authorIdParamSchema = z.object({
  id: z.string().refine((id) => ObjectId.isValid(id), {
    message: "Invalid author ID",
  }),
})

export type AuthorIdParam = z.infer<typeof authorIdParamSchema>;

export const authorCreateDTOSchema = authorDTOSchema.omit({
  id: true,
})

export type AuthorCreateDTO = z.infer<typeof authorCreateDTOSchema>;


export const authorUpdateEntitySchema = authorEntitySchema.partial().omit({
  _id: true,
})

export type AuthorUpdateEntity = z.infer<typeof authorUpdateEntitySchema>;

export const authorUpdateDTOSchema = authorDTOSchema.partial().omit({
  id: true,
})

export type AuthorUpdateDTO = z.infer<typeof authorUpdateDTOSchema>;

