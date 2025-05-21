import { ObjectId } from "mongodb"
import { PostMapper } from "../post.mapper"
import { postData } from "../__data__"

describe('Post Mapper', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should map post entity to DTO correctly', () => {
    expect(PostMapper.toDTO(postData.postEntity)._id).toEqual("682b3f21e20ab6312b77d619")
  })

  it('should map update DTO to entity correctly', () => {
    expect(PostMapper.toUpdateEntity(postData.postEntity).updatedAt).toEqual(new Date())
  })

  it('should map create DTO to entity correctly', () => {
    const post  = PostMapper.toCreateEntity(postData.postCreateDTO)

    expect(ObjectId.isValid(post._id)).toEqual(true)
    expect(post.createdAt).toEqual(new Date())
    expect(post.updatedAt).toEqual(new Date())
  })

})