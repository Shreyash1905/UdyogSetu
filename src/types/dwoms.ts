// User roles enum
export type UserRole = 'admin' | 'supervisor' | 'worker' | 'client';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdBy?: string;
  createdAt: string;
}

// Production entry interface
export interface ProductionEntry {
  id: string;
  workerId: string;
  workerName: string;
  productName: string;
  quantity: number;
  shift: 'morning' | 'afternoon' | 'night';
  date: string;
  timestamp: string;
}

// Task status flow
export type TaskStatus = 'Assigned' | 'In Progress' | 'Quality Check' | 'Completed';

// Task interface
export interface Task {
  id: string;
  productType: string;
  assignedWorkerId: string;
  assignedWorkerName: string;
  status: TaskStatus;
  estimatedTime: number; // in minutes
  createdBy: string;
  timestamp: string;
  completedAt?: string;
}

// Inventory item interface
export interface InventoryItem {
  id: string;
  itemName: string;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  lastUpdated: string;
}

// Dashboard metrics
export interface DashboardMetrics {
  totalProduction: number;
  activeTasks: number;
  completedTasks: number;
  lowStockItems: number;
  todayProduction: number;
  workerProductivity: { workerId: string; workerName: string; quantity: number }[];
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
