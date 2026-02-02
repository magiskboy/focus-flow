export interface StorageAdapter<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(item: T): Promise<void>;
  update(id: string, item: Partial<T>): Promise<void>;
  delete(id: string): Promise<void>;
}
