// Local storage keys
const STORAGE_KEYS = {
  USERS: 'udyogsetu_users',
  CURRENT_USER: 'udyogsetu_current_user',
  PRODUCTION_ENTRIES: 'udyogsetu_production_entries',
  TASKS: 'udyogsetu_tasks',
  INVENTORY: 'udyogsetu_inventory',
  LEAVES: 'udyogsetu_leaves',
  CLIENT_ORDERS: 'udyogsetu_client_orders',
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
