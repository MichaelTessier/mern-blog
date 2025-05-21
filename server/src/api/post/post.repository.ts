import { LoggerService } from "@/services/logger/logger.service";
import { database } from "@/services/mongodb/mongodb.service";
import { Db, ObjectId } from "mongodb";
import { PostEntity, PostDTOList, PostDTO, PostCreateDTO, PostUpdateDTO, postDTOSchema } from "./post.schema";
import { ErrorKey, ERRORS_KEY } from "../errorHandler";
import { PostMapper } from "./post.mapper";

export class PostRepository {
  private logger: LoggerService;
  private db: Db

  constructor() {
    this.logger = new LoggerService();
    this.db = database.get();
  }

  private getPostsCollection = () => this.db.collection<PostEntity>("posts");

  findPosts = async (): Promise<PostDTOList> => {
    const data = await this.getPostsCollection().find().toArray();

    this.logger.info(`Fetched ${data.length} posts`);

    const posts = data?.map((post) => {
      const postDto = postDTOSchema.safeParse(PostMapper.toDTO(post))

      if (!postDto.success) {
        this.logger.error(`PostDTO validation failed: ${postDto.error}`);
        return false
      }

      return postDto.data;
    }).filter(Boolean) ?? []
    
    return {
      posts,
    };
  }

  findPostById = async (id: string): Promise<PostDTO | ErrorKey> => {
    const data = await this.getPostsCollection().findOne({ _id: new ObjectId(id) })

    if (!data) {
      this.logger.error(`Post with id ${id} not found`);
      return ERRORS_KEY.NOT_FOUND;
    }

    const postDto = postDTOSchema.safeParse(PostMapper.toDTO(data))

    if(!postDto.success) {
      this.logger.error(`PostDTO validation failed: ${postDto.error}`);
      return ERRORS_KEY.VALIDATION
    }

    return postDto.data;
  }

  create = async(post: PostCreateDTO): Promise<PostDTO | ErrorKey> => {
    const postEntity = PostMapper.toCreateEntity(post);

    const data = await this.getPostsCollection().insertOne(postEntity);

    if (!data.acknowledged) {
      this.logger.error(`Failed to create post`);
      return ERRORS_KEY.CONFLICT;
    }

    const postDto = postDTOSchema.safeParse(PostMapper.toDTO(postEntity))

    if(!postDto.success) {
      this.logger.error(`PostDTO validation failed: ${postDto.error}`);
      return ERRORS_KEY.VALIDATION
    }

    this.logger.info(`Post created with id ${data.insertedId}`);

    return postDto.data;

  }

  update = async(id: string, post: PostUpdateDTO) : Promise<PostDTO | ErrorKey> => {
    const data = await this.getPostsCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: PostMapper.toUpdateEntity(post) },
      { returnDocument: "after" }
    )

    if (!data) {
      this.logger.error(`Failed to update post with id ${id}`);
      return ERRORS_KEY.NOT_FOUND;
    }

    const postDto = postDTOSchema.safeParse(PostMapper.toDTO(data))

    if(!postDto.success) {
      this.logger.error(`PostDTO validation failed: ${postDto.error}`);
      return ERRORS_KEY.VALIDATION
    }

    return postDto.data;
  }

  delete = async(id: string) : Promise<void | ErrorKey> => {
    const data = await this.getPostsCollection().deleteOne(
      { _id: new ObjectId(id) },
    )

    if (data.deletedCount === 0) {
      this.logger.error(`Failed to delete post with id ${id}`);
      return ERRORS_KEY.NOT_FOUND;
    }

    return;
  }

}
