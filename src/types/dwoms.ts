// User roles enum
export type UserRole = 'admin' | 'supervisor' | 'worker' | 'client';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  supervisorId?: string;
  profileImageURL?: string;
  createdBy?: string;
  createdAt: string;
}

// Leave Application Interface
export interface LeaveApplication {
  id: string;
  workerId: string;
  workerName: string;
  department: string;
  supervisorId: string;
  leaveType: 'Casual' | 'Sick' | 'Paid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
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
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface ClientOrder {
  id: string;
  clientId: string;
  clientName: string;
  materialName: string;
  quantity: number;
  unit: string;
  requiredDate: string;
  department: string;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed';
  assignedSupervisorId?: string;
  assignedSupervisorName?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}
