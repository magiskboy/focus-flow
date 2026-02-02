import { openDB, type IDBPDatabase } from 'idb';
import type { StorageAdapter } from './types';

export class IndexedDBAdapter<T extends { id: string }> implements StorageAdapter<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dbPromise: Promise<IDBPDatabase<any>>;
  private storeName: string;

  constructor(storeName: string, dbName: string = 'FocusFlowDB', version: number = 1) {
    this.storeName = storeName;
    this.dbPromise = openDB(dbName, version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      },
    });
  }

  async getAll(): Promise<T[]> {
    const db = await this.dbPromise;
    return db.getAll(this.storeName);
  }

  async getById(id: string): Promise<T | undefined> {
    const db = await this.dbPromise;
    return db.get(this.storeName, id);
  }

  async create(item: T): Promise<void> {
    const db = await this.dbPromise;
    await db.put(this.storeName, item);
  }

  async update(id: string, item: Partial<T>): Promise<void> {
    const db = await this.dbPromise;
    const existing = await db.get(this.storeName, id);
    if (existing) {
      await db.put(this.storeName, { ...existing, ...item });
    }
  }

  async delete(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(this.storeName, id);
  }
}
