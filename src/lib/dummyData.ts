import type { User, ProductionEntry, Task, InventoryItem } from '@/types/dwoms';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Dummy users with different roles
export const dummyUsers: User[] = [
  {
    id: 'admin-001',
    name: 'Rajesh Kumar',
    email: 'admin@dwoms.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'supervisor-001',
    name: 'Priya Sharma',
    email: 'supervisor@dwoms.com',
    role: 'supervisor',
    createdBy: 'admin-001',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'worker-001',
    name: 'Amit Singh',
    email: 'worker1@dwoms.com',
    role: 'worker',
    createdBy: 'admin-001',
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 'worker-002',
    name: 'Sunita Devi',
    email: 'worker2@dwoms.com',
    role: 'worker',
    createdBy: 'admin-001',
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 'worker-003',
    name: 'Ramesh Yadav',
    email: 'worker3@dwoms.com',
    role: 'worker',
    createdBy: 'admin-001',
    createdAt: '2024-01-04T00:00:00Z',
  },
  {
    id: 'client-001',
    name: 'Vikram Industries',
    email: 'client@dwoms.com',
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

// Initialize dummy data in localStorage
export function initializeDummyData(): void {
  const { STORAGE_KEYS, getStorageItem, setStorageItem } = require('./storage');
  
  // Only initialize if data doesn't exist
  if (getStorageItem(STORAGE_KEYS.USERS, []).length === 0) {
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
}
