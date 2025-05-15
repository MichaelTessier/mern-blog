import { LoggerService } from "@/services/logger/logger.service";
import { database } from "@/services/mongodb/mongodb.service";
import { Db, ObjectId } from "mongodb";
import { AuthorCreateDTO, AuthorDTO, AuthorDTOList, AuthorEntity, AuthorUpdateDTO } from "./author.schema";
import { ErrorKey, ERRORS_KEY } from "../errorHandler";

export class AuthorRepository {
  private logger: LoggerService;
  private db: Db

  constructor() {
    this.logger = new LoggerService();
    this.db = database.get();
  }

  private getAuthorsCollection = () => this.db.collection<AuthorEntity>("authors");

  findAuthors = async (): Promise<AuthorDTOList | ErrorKey> => {
    const data = await this.getAuthorsCollection().find().toArray();

    if(!data) {
      this.logger.error(`Authors not found`);
      return ERRORS_KEY.NOT_FOUND;
    }

    this.logger.info(`Fetched ${data.length} authors`);

    const authors = data.map((author) => {
      const authorDTO = AuthorDTO.toDomainEntity(author)
      
      if(!authorDTO.success) {
        this.logger.error(`AuthorDTO validation failed: ${authorDTO.error}`);
        return false
      }

      return authorDTO.data
    }).filter(Boolean)

    return {
      authors,
    };
  }

  findAuthorById = async (id: string): Promise<AuthorDTO | ErrorKey> => {
    const data = await this.getAuthorsCollection().findOne({ _id: new ObjectId(id) })

    if (!data) {
      this.logger.error(`Author with id ${id} not found`);
      return ERRORS_KEY.NOT_FOUND;
    }

    const authorDTO = AuthorDTO.toDomainEntity(data)

    if(!authorDTO.success) {
      this.logger.error(`AuthorDTO validation failed: ${authorDTO.error}`);
      return ERRORS_KEY.VALIDATION
    }

    return authorDTO.data;
  }

  create = async(author: AuthorCreateDTO): Promise<AuthorDTO | ErrorKey> => {
    const authorEntity = AuthorDTO.toCreateEntity(author)

    if(!authorEntity.success) {
      this.logger.error(`AuthorEntity validation failed: ${authorEntity.error}`);
      return ERRORS_KEY.VALIDATION;
    }

    const data = await this.getAuthorsCollection().insertOne(authorEntity.data);

    if(!data.acknowledged) {
      this.logger.error(`Author not created`);
      return ERRORS_KEY.NOT_FOUND;
    }

    const authorDTO = AuthorDTO.toDomainEntity(authorEntity.data)

    if(!authorDTO.success) {
      this.logger.error(`AuthorDTO validation failed: ${authorDTO.error}`);
      return ERRORS_KEY.VALIDATION
    }

    return authorDTO.data;
  }

  update = async(id: string, author: AuthorUpdateDTO): Promise<AuthorUpdateDTO | ErrorKey> => {
    const authorEntity = AuthorDTO.toUpdateEntity(author)
    if(!authorEntity.success) {
      this.logger.error(`AuthorEntity validation failed: ${authorEntity.error}`);
      return ERRORS_KEY.VALIDATION;
    }

    const data = await this.getAuthorsCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: authorEntity.data },
      { returnDocument: "after" }
    );

    if(!data) {
      this.logger.error(`Author with id ${id} not found`);
      return ERRORS_KEY.NOT_FOUND;
    }

    const authorDTO = AuthorDTO.toDomainEntity(data)

    if(!authorDTO.success) {
      this.logger.error(`AuthorDTO validation failed: ${authorDTO.error}`);
      return ERRORS_KEY.VALIDATION
    }

    return authorDTO.data;
  }

  delete = async(id: string): Promise<void | ErrorKey> => {
    const data = await this.getAuthorsCollection().deleteOne({ _id: new ObjectId(id) })

    if(!data) {
      this.logger.error(`Author with id ${id} not found`);
      return ERRORS_KEY.NOT_FOUND;
    }

    return;
  }
} 