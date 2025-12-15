import { useState, useEffect, useCallback } from 'react';
import type { ProductionEntry } from '@/types/dwoms';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/lib/storage';

export function useProduction() {
  const [entries, setEntries] = useState<ProductionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load entries from localStorage
  useEffect(() => {
    const stored = getStorageItem<ProductionEntry[]>(STORAGE_KEYS.PRODUCTION_ENTRIES, []);
    setEntries(stored);
    setIsLoading(false);
  }, []);

  // Add a new production entry
  const addEntry = useCallback((entry: Omit<ProductionEntry, 'id' | 'timestamp'>) => {
    const newEntry: ProductionEntry = {
      ...entry,
      id: `prod-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    const updated = [...entries, newEntry];
    setEntries(updated);
    setStorageItem(STORAGE_KEYS.PRODUCTION_ENTRIES, updated);
    
    return newEntry;
  }, [entries]);

  // Get entries filtered by date
  const getEntriesByDate = useCallback((date: string) => {
    return entries.filter(e => e.date === date);
  }, [entries]);

  // Get entries filtered by worker
  const getEntriesByWorker = useCallback((workerId: string) => {
    return entries.filter(e => e.workerId === workerId);
  }, [entries]);

  // Get today's total production
  const getTodayTotal = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return entries
      .filter(e => e.date === today)
      .reduce((sum, e) => sum + e.quantity, 0);
  }, [entries]);

  // Get worker productivity stats
  const getWorkerProductivity = useCallback(() => {
    const productivityMap = new Map<string, { workerId: string; workerName: string; quantity: number }>();
    
    entries.forEach(entry => {
      const existing = productivityMap.get(entry.workerId);
      if (existing) {
        existing.quantity += entry.quantity;
      } else {
        productivityMap.set(entry.workerId, {
          workerId: entry.workerId,
          workerName: entry.workerName,
          quantity: entry.quantity,
        });
      }
    });
    
    return Array.from(productivityMap.values()).sort((a, b) => b.quantity - a.quantity);
  }, [entries]);

  return {
    entries,
    isLoading,
    addEntry,
    getEntriesByDate,
    getEntriesByWorker,
    getTodayTotal,
    getWorkerProductivity,
  };
}
