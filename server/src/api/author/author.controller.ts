import { Request, Response } from "express";
import { createErrorFromKey, isErrorKey } from "@/api/errorHandler";
import { AuthorRepository } from './author.repository';
import { AuthorCreateDTO, AuthorIdParam, AuthorUpdateDTO } from "./author.schema";

class AuthorController {
  private authorRepository: AuthorRepository; 

  constructor() {
    this.authorRepository = new AuthorRepository();
  }

  public list = async (_req: Request, res: Response) => {
    const data = await this.authorRepository.findAuthors();

    if (isErrorKey(data)) {
      const error = createErrorFromKey({
        key: data,
        message: `Error when get authors`,
      });

      throw error;
    }


    res.status(200).json(data);
  };

  public getById = async (req: Request<AuthorIdParam>, res: Response) => {
    const data = await this.authorRepository.findAuthorById(req.params.id);

    if (isErrorKey(data)) {
      const error = createErrorFromKey({
        key: data,
        message: `Error when get author by id ${req.params.id}`,
      });

      throw error;
    }

    res.status(200).json(data);
  }

  public create = async (req: Request<{}, {}, AuthorCreateDTO>, res: Response) => {
    
    const data = await this.authorRepository.create(req.body);

    if(isErrorKey(data)) {
      const error = createErrorFromKey(
        {
          key: data,
          message: `Error when create author`,
        }
      );

      throw error;
    }

    res.status(201).json(data);
  }


  public update = async (req: Request<AuthorIdParam, {}, AuthorUpdateDTO>, res: Response) => {
    const data = await this.authorRepository.update(req.params.id, req.body);

    if(isErrorKey(data)) {
      const error = createErrorFromKey(
        {
          key: data,
          message: `Error when update author with id ${req.params.id}`,
        }
      );

      throw error;
    }

    res.status(201).json(data);
  }

  public delete = async (req: Request<AuthorIdParam>, res: Response) => {
    const data = await this.authorRepository.delete(req.params.id);

    if(isErrorKey(data)) {
      const error = createErrorFromKey(
        {
          key: data,
          message: `Error when delete author with id ${req.params.id}`,
        }
      );

      throw error;
    }

    res.status(204).json(); // end() ??
  }

  
}


export const authorController = new AuthorController();