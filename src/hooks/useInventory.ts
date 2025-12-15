import { useState, useEffect, useCallback } from 'react';
import type { InventoryItem } from '@/types/dwoms';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/lib/storage';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load inventory from localStorage
  useEffect(() => {
    const stored = getStorageItem<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
    setItems(stored);
    setIsLoading(false);
  }, []);

  // Add a new inventory item
  const addItem = useCallback((item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };
    
    const updated = [...items, newItem];
    setItems(updated);
    setStorageItem(STORAGE_KEYS.INVENTORY, updated);
    
    return newItem;
  }, [items]);

  // Update stock (Stock IN / Stock OUT)
  const updateStock = useCallback((itemId: string, quantity: number, isStockIn: boolean) => {
    const updated = items.map(item => {
      if (item.id === itemId) {
        const newStock = isStockIn 
          ? item.currentStock + quantity 
          : Math.max(0, item.currentStock - quantity);
        
        return {
          ...item,
          currentStock: newStock,
          lastUpdated: new Date().toISOString(),
        };
      }
      return item;
    });
    
    setItems(updated);
    setStorageItem(STORAGE_KEYS.INVENTORY, updated);
  }, [items]);

  // Update item details
  const updateItem = useCallback((itemId: string, updates: Partial<InventoryItem>) => {
    const updated = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          ...updates,
          lastUpdated: new Date().toISOString(),
        };
      }
      return item;
    });
    
    setItems(updated);
    setStorageItem(STORAGE_KEYS.INVENTORY, updated);
  }, [items]);

  // Get low stock items
  const getLowStockItems = useCallback(() => {
    return items.filter(item => item.currentStock <= item.minStockLevel);
  }, [items]);

  // Delete an item
  const deleteItem = useCallback((itemId: string) => {
    const updated = items.filter(item => item.id !== itemId);
    setItems(updated);
    setStorageItem(STORAGE_KEYS.INVENTORY, updated);
  }, [items]);

  return {
    items,
    isLoading,
    addItem,
    updateStock,
    updateItem,
    deleteItem,
    getLowStockItems,
  };
}
