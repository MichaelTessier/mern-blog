import { LoggerService } from "@/services/logger/logger.service";
import { database } from "@/services/mongodb/mongodb.service";
import { Db, ObjectId } from "mongodb";
import { PostEntity, PostDTOList, PostDTO, PostCreateDTO, PostUpdateDTO, PostEntityAggregated, PostDTOMapper, PostCreateDTOMapper, PostUpdateDTOMapper } from "./post.schema";
import { ErrorKey, ERRORS_KEY } from "../errorHandler";

export class PostRepository {
  private logger: LoggerService;
  private db: Db

  constructor() {
    this.logger = new LoggerService();
    this.db = database.get();
  }

  private getPostsCollection = () => this.db.collection<PostEntity>("posts");

  findPosts = async (): Promise<PostDTOList | ErrorKey | any> => {
    const data = await this.getPostsCollection().aggregate<PostEntityAggregated>([
      {
        $lookup: {
          from: 'authors',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $addFields: {
          author: { $arrayElemAt: ['$author', 0] },
        }
      }
    ]).toArray();

    
    if(!data) {
      this.logger.error(`Posts not found`);
      return ERRORS_KEY.NOT_FOUND;
    }

    this.logger.info(`Fetched ${data.length} posts`);

    const posts = data?.map((post) => {
      const postDTO = PostDTOMapper.toDomain(post)

      if (!postDTO.success) {
        this.logger.error(`PostDTO validation failed: ${postDTO.error}`);
        return false
      }

      return postDTO.data;
    }).filter(Boolean) ?? []
    
    return {
      posts,
    };
  }

  findPostById = async (id: string): Promise<PostDTO | ErrorKey> => {
    const data = await this.getPostsCollection()
      .aggregate<PostEntityAggregated>([
        {
          $match: {
            _id: new ObjectId(id),
          }
        },
        {
          $lookup: {
            from: 'authors',
            localField: 'authorId',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $addFields: {
            author: { $arrayElemAt: ['$author', 0] },
          }
        }
      ])
      .toArray();
    
    if (!data?.length) {
      this.logger.error(`Post with id ${id} not found`);
      return ERRORS_KEY.NOT_FOUND;
    }

    const postDTO = PostDTOMapper.toDomain(data[0])

    if(!postDTO.success) {
      this.logger.error(`PostDTO validation failed: ${postDTO.error}`);
      return ERRORS_KEY.VALIDATION
    }

    return postDTO.data;
  }

  create = async(post: PostCreateDTO): Promise<PostDTO | ErrorKey> => {
    const postEntity = PostCreateDTOMapper.toEntity(post)

    if (!postEntity.success) {
      this.logger.error(`PostDTO validation failed: ${postEntity.error}`);
      return ERRORS_KEY.VALIDATION
    }

    const postInserted = await this.getPostsCollection().insertOne(postEntity.data, {
      forceServerObjectId: true,
    });

    if (!postInserted.acknowledged) {
      this.logger.error(`Failed to create post`);
      return ERRORS_KEY.CONFLICT;
    }

    this.logger.info(`Post created with id ${postInserted.insertedId}`);

    const data = await this.getPostsCollection()
      .aggregate<PostEntityAggregated>([
        {
          $match: {
            _id: postInserted.insertedId,
          }
        },
        {
          $lookup: {
            from: 'authors',
            localField: 'authorId',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $addFields: {
            author: { $arrayElemAt: ['$author', 0] },
          }
        }
      ])
      .toArray();

    if (!data?.length) {
      this.logger.error(`Post with id ${postInserted.insertedId} not found`);
      return ERRORS_KEY.NOT_FOUND;
    }

    const postDTO = PostDTOMapper.toDomain(data[0])

    if(!postDTO.success) {
      this.logger.error(`PostDTO validation failed: ${postDTO.error}`);
      return ERRORS_KEY.VALIDATION
    }

    return postDTO.data;

  }

  update = async(id: string, post: PostUpdateDTO) : Promise<PostDTO | ErrorKey> => {
    const postEntity = PostUpdateDTOMapper.toEntity(post)

    if (!postEntity.success) {
      this.logger.error(`PostUpdateDTO validation failed: ${postEntity.error}`);
      return ERRORS_KEY.VALIDATION
    }

    const postUpdated = await this.getPostsCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: postEntity.data },
    )

    if (!postUpdated.matchedCount) {
      this.logger.error(`Failed to update post with id ${id}`);
      return ERRORS_KEY.NOT_FOUND;
    }

    const data = await this.getPostsCollection()
      .aggregate<PostEntityAggregated>([
        {
          $match: {
            _id: new ObjectId(id),
          }
        },
        {
          $lookup: {
            from: 'authors',
            localField: 'authorId',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $addFields: {
            author: { $arrayElemAt: ['$author', 0] },
          }
        }
      ])
      .toArray();

    if (!data?.length) {
      this.logger.error(`Post with id ${new ObjectId(id)} not found`);
      return ERRORS_KEY.NOT_FOUND;
    }
    
    const postDTO = PostDTOMapper.toDomain(data[0])
      
    if(!postDTO.success) {
      this.logger.error(`PostDTO validation failed: ${postDTO.error}`);
      return ERRORS_KEY.VALIDATION
    }

    return postDTO.data;
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
