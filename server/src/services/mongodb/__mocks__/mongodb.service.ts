export const mockDb = {
  collection: vi.fn().mockReturnThis(),
  find: vi.fn(),
  findOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
  insertOne: vi.fn(),
  deleteOne: vi.fn(),
};

export const database = {
  connect: vi.fn(),
  get: vi.fn().mockReturnValue(mockDb),
};
