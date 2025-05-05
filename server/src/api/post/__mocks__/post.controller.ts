export const postController = {
  list: vi.fn((req, res) => res.status(200).json({ message: 'list called' })),
  getById: vi.fn((req, res) => res.status(200).json({ message: 'getById called' })),
  create: vi.fn((req, res) => res.status(201).json({ message: 'create called' })),
  update: vi.fn((req, res) => res.status(200).json({ message: 'update called' })),
  delete: vi.fn((req, res) => res.status(204).end()),
}