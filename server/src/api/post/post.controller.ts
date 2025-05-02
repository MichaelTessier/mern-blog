import { Request, Response } from "express";
import { PostRepository } from "./post.repository";
import { PostCreateDTO, PostIdParam } from "./post.schema";
import { createErrorFromKey, isErrorKey } from "../errorHandler";

class PostController {
  private postRepository: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  public list = async (_req: Request, res: Response) => {
    const data = await this.postRepository.findPosts();

    res.status(200).json(data);
  }

  public getById = async (req: Request<PostIdParam>, res: Response) => {
    const data = await this.postRepository.findPostById(req.params.id);

    if(isErrorKey(data)) {
      const error = createErrorFromKey({
        key: data,
        message: `Error when get post by id ${req.params.id}`,
      });

      throw error;
    }

    res.status(200).json(data);
  }

  public create = async (req: Request<{}, {}, PostCreateDTO>, res: Response) => {
    const data = await this.postRepository.create(req.body);

    if(isErrorKey(data)) {
      const error = createErrorFromKey(
        {
          key: data,
          message: `Error when create post`,
        }
      );

      throw error;
    }

    res.status(201).json(data);
  }

  public update = async (req: Request<PostIdParam, {}, PostCreateDTO>, res: Response) => {
    const data = await this.postRepository.update(req.params.id, req.body);

    if(isErrorKey(data)) {
      const error = createErrorFromKey(
        {
          key: data,
          message: `Error when update post with id ${req.params.id}`,
        }
      );

      throw error;
    }

    res.status(201).json(data);
  }

  public delete = async (req: Request<PostIdParam>, res: Response) => {
    const data = await this.postRepository.delete(req.params.id);

    if(isErrorKey(data)) {
      const error = createErrorFromKey(
        {
          key: data,
          message: `Error when delete post with id ${req.params.id}`,
        }
      );

      throw error;
    }

    res.status(204).json();
  }
}

export const postController = new PostController