import { ObjectId } from "mongodb";
import { PostCreateDTO, PostDTO, PostEntity, PostUpdateDTO } from "../post.schema";


const postEntity: PostEntity = {
  _id: new ObjectId("682b3f21e20ab6312b77d619"),
  title: "Un Autre test",
  description: "Belle description test",
  content: "Un contenu",
  createdAt: new Date("2025-05-19T14:24:33.348Z"),
  updatedAt: new Date("2025-05-20T08:14:55.339Z"),
  author: "681a139779ee76df07075e1a"
}

const postDTO: PostDTO = {
  _id: "682b3f21e20ab6312b77d619",
  title: "Un Autre test",
  description: "Belle description test",
  content: "Un contenu",
  createdAt: new Date("2025-05-19T14:24:33.348Z"),
  updatedAt: new Date("2025-05-20T08:14:55.339Z"),
  author: "681a139779ee76df07075e1a"
}

const postCreateDTO: PostCreateDTO = {
  title: "Un Autre test",
  description: "Belle description test",
  content: "Un contenu",
  author: "681a139779ee76df07075e1a"
}


const postUpdateDTO: PostUpdateDTO = {
  description: "Update de la description",
}


export const postData = {
  postEntity,
  postDTO,
  postCreateDTO,
  postUpdateDTO,
}
