import { MongoClient } from 'mongodb';
import { database } from '@/services/mongodb/mongodb.service';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';

vi.mock('mongodb');
const dbMock = MongoClient.prototype.db as Mock; 

describe('MongoDB Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockDb = undefined;

    dbMock.mockReturnValue(mockDb);

  });


  it('should throw an error if get is called before connect', async () => {
    expect(() => database.get()).toThrow('Database not initialized. Call connect first.');
  });

  it('should connect to the database', async () => {
    const mockDb = { collection: vi.fn() };
    dbMock.mockReturnValue(mockDb);

    await database.connect();
    expect(MongoClient.prototype.db).toHaveBeenCalledWith('blogData');
  });

  it('should return the database instance after connection', async () => {
    const mockDb = { collection: vi.fn() };
    dbMock.mockReturnValue(mockDb);

    await database.connect();
    const db = database.get();

    expect(db).toBe(mockDb);
  });

  
  it('should throw an error if an error occurred during connection', async () => {
    const error = new Error('Connection error');
    dbMock.mockImplementation(() => {
      throw error;
    })

    await expect(database.connect()).rejects.toThrow('Connection error');

  })
});