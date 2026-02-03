import { LocalStorageAdapter } from './localstorage';

interface Item {
  id: string;
  name: string;
}

describe('LocalStorageAdapter', () => {
  const key = 'test-storage';
  let adapter: LocalStorageAdapter<Item>;

  beforeEach(() => {
    adapter = new LocalStorageAdapter<Item>(key);
    localStorage.removeItem(key);
  });

  it('getAll returns empty array when nothing stored', async () => {
    const result = await adapter.getAll();
    expect(result).toEqual([]);
  });

  it('create adds item and getAll returns it', async () => {
    const item: Item = { id: '1', name: 'First' };
    await adapter.create(item);
    const result = await adapter.getAll();
    expect(result).toEqual([item]);
  });

  it('getById returns item when it exists', async () => {
    const item: Item = { id: '1', name: 'First' };
    await adapter.create(item);
    const result = await adapter.getById('1');
    expect(result).toEqual(item);
  });

  it('getById returns undefined when not found', async () => {
    const result = await adapter.getById('missing');
    expect(result).toBeUndefined();
  });

  it('update merges into existing item', async () => {
    await adapter.create({ id: '1', name: 'First' });
    await adapter.update('1', { name: 'Updated' });
    const result = await adapter.getById('1');
    expect(result).toEqual({ id: '1', name: 'Updated' });
  });

  it('delete removes item', async () => {
    await adapter.create({ id: '1', name: 'First' });
    await adapter.delete('1');
    const result = await adapter.getById('1');
    expect(result).toBeUndefined();
  });

  it('create with existing id updates item', async () => {
    await adapter.create({ id: '1', name: 'First' });
    await adapter.create({ id: '1', name: 'Second' });
    const result = await adapter.getAll();
    expect(result).toEqual([{ id: '1', name: 'Second' }]);
  });
});
