import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskStatus } from '@/types/dwoms';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/lib/storage';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from localStorage
  useEffect(() => {
    const stored = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
    setTasks(stored);
    setIsLoading(false);
  }, []);

  // Create a new task
  const createTask = useCallback((task: Omit<Task, 'id' | 'status' | 'timestamp'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      status: 'Assigned',
      timestamp: new Date().toISOString(),
    };
    
    const updated = [...tasks, newTask];
    setTasks(updated);
    setStorageItem(STORAGE_KEYS.TASKS, updated);
    
    return newTask;
  }, [tasks]);

  // Update task status (following the allowed flow)
  const updateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    const updated = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'Completed' ? new Date().toISOString() : task.completedAt,
        };
      }
      return task;
    });
    
    setTasks(updated);
    setStorageItem(STORAGE_KEYS.TASKS, updated);
  }, [tasks]);

  // Get valid next status options
  const getNextStatusOptions = useCallback((currentStatus: TaskStatus): TaskStatus[] => {
    switch (currentStatus) {
      case 'Assigned':
        return ['In Progress'];
      case 'In Progress':
        return ['Quality Check'];
      case 'Quality Check':
        return ['Completed'];
      case 'Completed':
        return [];
      default:
        return [];
    }
  }, []);

  // Get tasks by worker
  const getTasksByWorker = useCallback((workerId: string) => {
    return tasks.filter(t => t.assignedWorkerId === workerId);
  }, [tasks]);

  // Get task counts by status
  const getTaskCounts = useCallback(() => {
    return {
      assigned: tasks.filter(t => t.status === 'Assigned').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      qualityCheck: tasks.filter(t => t.status === 'Quality Check').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      total: tasks.length,
    };
  }, [tasks]);

  return {
    tasks,
    isLoading,
    createTask,
    updateTaskStatus,
    getNextStatusOptions,
    getTasksByWorker,
    getTaskCounts,
  };
}
