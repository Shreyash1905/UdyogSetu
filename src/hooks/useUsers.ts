import { useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/types/dwoms';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/lib/storage';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load users from localStorage
  useEffect(() => {
    const stored = getStorageItem<User[]>(STORAGE_KEYS.USERS, []);
    setUsers(stored);
    setIsLoading(false);
  }, []);

  // Get workers only
  const getWorkers = useCallback(() => {
    return users.filter(u => u.role === 'worker');
  }, [users]);

  // Get users by role
  const getUsersByRole = useCallback((role: UserRole) => {
    return users.filter(u => u.role === role);
  }, [users]);

  // Add a new user (admin only)
  const addUser = useCallback((user: Omit<User, 'id' | 'createdAt'>, createdBy: string) => {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdBy,
      createdAt: new Date().toISOString(),
    };
    
    const updated = [...users, newUser];
    setUsers(updated);
    setStorageItem(STORAGE_KEYS.USERS, updated);
    
    return newUser;
  }, [users]);

  // Update user role (admin only)
  const updateUserRole = useCallback((userId: string, newRole: UserRole) => {
    const updated = users.map(user => {
      if (user.id === userId) {
        return { ...user, role: newRole };
      }
      return user;
    });
    
    setUsers(updated);
    setStorageItem(STORAGE_KEYS.USERS, updated);
  }, [users]);

  // Delete user (admin only)
  const deleteUser = useCallback((userId: string) => {
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    setStorageItem(STORAGE_KEYS.USERS, updated);
  }, [users]);

  return {
    users,
    isLoading,
    getWorkers,
    getUsersByRole,
    addUser,
    updateUserRole,
    deleteUser,
  };
}
