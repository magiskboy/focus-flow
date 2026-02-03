import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Stub IndexedDB for tests (happy-dom does not provide it)
vi.mock('idb', () => ({
  openDB: vi.fn(() =>
    Promise.resolve({
      getAll: vi.fn().mockResolvedValue([]),
      get: vi.fn().mockResolvedValue(undefined),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    }),
  ),
}));
