import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole, AuthContextType } from '@/types/dwoms';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/lib/storage';
import { initializeDummyData } from '@/lib/dummyData';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize dummy data and check for existing session
  useEffect(() => {
    initializeDummyData();
    const storedUser = getStorageItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getStorageItem<User[]>(STORAGE_KEYS.USERS, []);
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser) {
      // For demo purposes, any password works
      // In production, you'd verify against hashed passwords
      setUser(foundUser);
      setStorageItem(STORAGE_KEYS.CURRENT_USER, foundUser);
      return true;
    }

    return false;
  }, []);

  const signup = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getStorageItem<User[]>(STORAGE_KEYS.USERS, []);

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStorageItem(STORAGE_KEYS.USERS, users);
    setUser(newUser);
    setStorageItem(STORAGE_KEYS.CURRENT_USER, newUser);

    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!user) return false;

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    setStorageItem(STORAGE_KEYS.CURRENT_USER, updatedUser);

    // Update in users list as well
    const users = getStorageItem<User[]>(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      setStorageItem(STORAGE_KEYS.USERS, users);
    }
    return true;
  }, [user]);

  const updatePassword = useCallback(async (password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Since we don't actually store passwords in this dummy auth, we just return true
    // In a real app, this would update the backend
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, updateProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
