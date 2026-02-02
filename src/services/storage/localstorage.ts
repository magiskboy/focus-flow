import type { StorageAdapter } from './types';

export class LocalStorageAdapter<T extends { id: string }> implements StorageAdapter<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  private getStoredData(): T[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  private setStoredData(data: T[]) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  async getAll(): Promise<T[]> {
    return this.getStoredData();
  }

  async getById(id: string): Promise<T | undefined> {
    const data = this.getStoredData();
    return data.find((item) => item.id === id);
  }

  async create(item: T): Promise<void> {
    const data = this.getStoredData();
    // Check if ID exists to update or push new
    const index = data.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      data[index] = item;
    } else {
      data.push(item);
    }
    this.setStoredData(data);
  }

  async update(id: string, item: Partial<T>): Promise<void> {
    const data = this.getStoredData();
    const index = data.findIndex((i) => i.id === id);
    if (index >= 0) {
      data[index] = { ...data[index], ...item };
      this.setStoredData(data);
    }
  }

  async delete(id: string): Promise<void> {
    const data = this.getStoredData();
    const newData = data.filter((item) => item.id !== id);
    this.setStoredData(newData);
  }
}
