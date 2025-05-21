import { ObjectId } from "mongodb";
import { PostCreateDTO, PostDTO, PostEntity, PostUpdateDTO } from "./post.schema";

export class PostMapper {
  static toCreateEntity(post: PostCreateDTO): PostEntity {
    return {
      ...post,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static toUpdateEntity(post: PostUpdateDTO): Partial<PostEntity> {
    return {
      ...post,
      updatedAt: new Date(),
    };
  }

  static toDTO(post: PostEntity): PostDTO {
    return {
      ...post,
      _id: post._id.toString(),
    };
  }
}