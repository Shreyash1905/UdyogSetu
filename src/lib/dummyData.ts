import type { User, ProductionEntry, Task, InventoryItem, LeaveApplication, ClientOrder } from '@/types/dwoms';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/lib/storage';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Dummy users with different roles
export const dummyUsers: User[] = [
  {
    id: 'admin-001',
    name: 'Rajesh Kumar',
    email: 'admin@udyogsetu.com',
    role: 'admin',
    department: 'Management',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'supervisor-001',
    name: 'Priya Sharma',
    email: 'supervisor@udyogsetu.com',
    role: 'supervisor',
    department: 'Production A',
    createdBy: 'admin-001',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'worker-001',
    name: 'Amit Singh',
    email: 'worker1@udyogsetu.com',
    role: 'worker',
    department: 'Production A',
    supervisorId: 'supervisor-001',
    createdBy: 'admin-001',
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 'worker-002',
    name: 'Sunita Devi',
    email: 'worker2@udyogsetu.com',
    role: 'worker',
    department: 'Production A',
    supervisorId: 'supervisor-001',
    createdBy: 'admin-001',
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 'worker-003',
    name: 'Ramesh Yadav',
    email: 'worker3@udyogsetu.com',
    role: 'worker',
    department: 'Logistics',
    supervisorId: 'supervisor-001', // Assigned for demo visibility
    createdBy: 'admin-001',
    createdAt: '2024-01-04T00:00:00Z',
  },
  {
    id: 'client-001',
    name: 'Vikram Industries',
    email: 'client@udyogsetu.com',
    role: 'client',
    createdBy: 'admin-001',
    createdAt: '2024-01-05T00:00:00Z',
  },
];

// Dummy production entries
export const dummyProductionEntries: ProductionEntry[] = [
  {
    id: generateId(),
    workerId: 'worker-001',
    workerName: 'Amit Singh',
    productName: 'Steel Bolts M10',
    quantity: 250,
    shift: 'morning',
    date: '2024-12-14',
    timestamp: '2024-12-14T08:30:00Z',
  },
  {
    id: generateId(),
    workerId: 'worker-002',
    workerName: 'Sunita Devi',
    productName: 'Brass Fittings',
    quantity: 180,
    shift: 'morning',
    date: '2024-12-14',
    timestamp: '2024-12-14T09:15:00Z',
  },
  {
    id: generateId(),
    workerId: 'worker-003',
    workerName: 'Ramesh Yadav',
    productName: 'Aluminum Pipes 2"',
    quantity: 45,
    shift: 'afternoon',
    date: '2024-12-14',
    timestamp: '2024-12-14T14:00:00Z',
  },
  {
    id: generateId(),
    workerId: 'worker-001',
    workerName: 'Amit Singh',
    productName: 'Steel Nuts M10',
    quantity: 500,
    shift: 'afternoon',
    date: '2024-12-13',
    timestamp: '2024-12-13T15:30:00Z',
  },
  {
    id: generateId(),
    workerId: 'worker-002',
    workerName: 'Sunita Devi',
    productName: 'Copper Wires 2mm',
    quantity: 120,
    shift: 'night',
    date: '2024-12-13',
    timestamp: '2024-12-13T22:00:00Z',
  },
];

// Dummy tasks
export const dummyTasks: Task[] = [
  {
    id: generateId(),
    productType: 'Steel Bolts M10',
    assignedWorkerId: 'worker-001',
    assignedWorkerName: 'Amit Singh',
    status: 'Completed',
    estimatedTime: 120,
    createdBy: 'supervisor-001',
    timestamp: '2024-12-14T07:00:00Z',
    completedAt: '2024-12-14T09:30:00Z',
  },
  {
    id: generateId(),
    productType: 'Brass Fittings Assembly',
    assignedWorkerId: 'worker-002',
    assignedWorkerName: 'Sunita Devi',
    status: 'In Progress',
    estimatedTime: 180,
    createdBy: 'supervisor-001',
    timestamp: '2024-12-14T08:00:00Z',
  },
  {
    id: generateId(),
    productType: 'Aluminum Pipes Cutting',
    assignedWorkerId: 'worker-003',
    assignedWorkerName: 'Ramesh Yadav',
    status: 'Quality Check',
    estimatedTime: 90,
    createdBy: 'supervisor-001',
    timestamp: '2024-12-14T10:00:00Z',
  },
  {
    id: generateId(),
    productType: 'Steel Nuts Packaging',
    assignedWorkerId: 'worker-001',
    assignedWorkerName: 'Amit Singh',
    status: 'Assigned',
    estimatedTime: 60,
    createdBy: 'supervisor-001',
    timestamp: '2024-12-14T11:00:00Z',
  },
];

// Dummy inventory
export const dummyInventory: InventoryItem[] = [
  {
    id: generateId(),
    itemName: 'Steel Rod 10mm',
    currentStock: 150,
    minStockLevel: 50,
    unit: 'kg',
    lastUpdated: '2024-12-14T10:00:00Z',
  },
  {
    id: generateId(),
    itemName: 'Brass Sheet 2mm',
    currentStock: 25,
    minStockLevel: 30,
    unit: 'sheets',
    lastUpdated: '2024-12-14T09:00:00Z',
  },
  {
    id: generateId(),
    itemName: 'Aluminum Ingots',
    currentStock: 80,
    minStockLevel: 40,
    unit: 'pieces',
    lastUpdated: '2024-12-13T16:00:00Z',
  },
  {
    id: generateId(),
    itemName: 'Copper Wire 2mm',
    currentStock: 12,
    minStockLevel: 20,
    unit: 'kg',
    lastUpdated: '2024-12-14T08:00:00Z',
  },
  {
    id: generateId(),
    itemName: 'Lubricant Oil',
    currentStock: 45,
    minStockLevel: 10,
    unit: 'liters',
    lastUpdated: '2024-12-12T14:00:00Z',
  },
  {
    id: generateId(),
    itemName: 'Packaging Boxes (Large)',
    currentStock: 200,
    minStockLevel: 100,
    unit: 'pieces',
    lastUpdated: '2024-12-14T07:00:00Z',
  },
];

// Dummy leaves
export const dummyLeaves: LeaveApplication[] = [
  {
    id: generateId(),
    workerId: 'worker-001',
    workerName: 'Amit Singh',
    department: 'Production A',
    supervisorId: 'supervisor-001',
    leaveType: 'Sick',
    startDate: '2024-12-20',
    endDate: '2024-12-21',
    reason: 'High fever and cold',
    status: 'Pending',
    appliedAt: '2024-12-18T10:00:00Z',
  },
  {
    id: generateId(),
    workerId: 'worker-002',
    workerName: 'Sunita Devi',
    department: 'Production A',
    supervisorId: 'supervisor-001',
    leaveType: 'Casual',
    startDate: '2024-12-25',
    endDate: '2024-12-26',
    reason: 'Family function',
    status: 'Approved',
    appliedAt: '2024-12-15T09:00:00Z',
    reviewedAt: '2024-12-16T11:00:00Z',
    reviewedBy: 'supervisor-001',
  },
];

// Dummy client orders
export const dummyClientOrders: ClientOrder[] = [
  {
    id: generateId(),
    clientId: 'client-001',
    clientName: 'Vikram Industries',
    materialName: 'Steel Rods High Grade',
    quantity: 500,
    unit: 'kg',
    requiredDate: '2024-12-25',
    department: 'Production A',
    notes: 'Urgent requirement for new project',
    status: 'Pending',
    createdAt: '2024-12-16T09:00:00Z',
  },
  {
    id: generateId(),
    clientId: 'client-001',
    clientName: 'Vikram Industries',
    materialName: 'Copper Wires',
    quantity: 200,
    unit: 'meters',
    requiredDate: '2024-12-30',
    department: 'Production A',
    status: 'Approved',
    assignedSupervisorId: 'supervisor-001',
    assignedSupervisorName: 'Priya Sharma',
    approvedBy: 'admin-001',
    approvedAt: '2024-12-16T10:00:00Z',
    createdAt: '2024-12-15T14:00:00Z',
  },
];

// Initialize dummy data in localStorage
export function initializeDummyData(): void {
  // Only initialize if data doesn't exist
  // Force update users to include department structure if old data exists
  const currentUsers = getStorageItem<User[]>(STORAGE_KEYS.USERS, []);
  if (currentUsers.length === 0 || !currentUsers[0].department) {
    setStorageItem(STORAGE_KEYS.USERS, dummyUsers);
  }

  if (getStorageItem(STORAGE_KEYS.PRODUCTION_ENTRIES, []).length === 0) {
    setStorageItem(STORAGE_KEYS.PRODUCTION_ENTRIES, dummyProductionEntries);
  }

  if (getStorageItem(STORAGE_KEYS.TASKS, []).length === 0) {
    setStorageItem(STORAGE_KEYS.TASKS, dummyTasks);
  }

  if (getStorageItem(STORAGE_KEYS.INVENTORY, []).length === 0) {
    setStorageItem(STORAGE_KEYS.INVENTORY, dummyInventory);
  }

  if (getStorageItem(STORAGE_KEYS.LEAVES, []).length === 0) {
    setStorageItem(STORAGE_KEYS.LEAVES, dummyLeaves);
  }

  if (getStorageItem(STORAGE_KEYS.CLIENT_ORDERS, []).length === 0) {
    setStorageItem(STORAGE_KEYS.CLIENT_ORDERS, dummyClientOrders);
  }
}
