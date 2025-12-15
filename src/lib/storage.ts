// Local storage keys
const STORAGE_KEYS = {
  USERS: 'dwoms_users',
  CURRENT_USER: 'dwoms_current_user',
  PRODUCTION_ENTRIES: 'dwoms_production_entries',
  TASKS: 'dwoms_tasks',
  INVENTORY: 'dwoms_inventory',
} as const;

// Generic storage helpers
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export { STORAGE_KEYS };
