import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { LeaveApplication, User } from '@/types/dwoms';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/lib/storage';
import { useAuth } from './AuthContext';

interface LeaveContextType {
    leaves: LeaveApplication[];
    isLoading: boolean;
    applyForLeave: (data: Omit<LeaveApplication, 'id' | 'status' | 'appliedAt' | 'reviewdAt' | 'reviewedBy'>) => Promise<boolean>;
    updateLeaveStatus: (leaveId: string, status: 'Approved' | 'Rejected') => Promise<boolean>;
    getLeavesByWorker: (workerId: string) => LeaveApplication[];
    getLeavesBySupervisor: (supervisorId: string) => LeaveApplication[];
}

const LeaveContext = createContext<LeaveContextType | null>(null);

export function LeaveProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load leaves on mount
    useEffect(() => {
        const storedLeaves = getStorageItem<LeaveApplication[]>(STORAGE_KEYS.LEAVES, []);
        setLeaves(storedLeaves);
        setIsLoading(false);
    }, []);

    const applyForLeave = useCallback(async (data: Omit<LeaveApplication, 'id' | 'status' | 'appliedAt' | 'reviewdAt' | 'reviewedBy'>): Promise<boolean> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const newLeave: LeaveApplication = {
            ...data,
            id: `leave-${Date.now()}`,
            status: 'Pending',
            appliedAt: new Date().toISOString(),
        };

        const updatedLeaves = [newLeave, ...leaves];
        setLeaves(updatedLeaves);
        setStorageItem(STORAGE_KEYS.LEAVES, updatedLeaves);
        return true;
    }, [leaves]);

    const updateLeaveStatus = useCallback(async (leaveId: string, status: 'Approved' | 'Rejected'): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!user) return false;

        const updatedLeaves = leaves.map(leave => {
            if (leave.id === leaveId) {
                return {
                    ...leave,
                    status,
                    reviewedAt: new Date().toISOString(),
                    reviewedBy: user.id
                };
            }
            return leave;
        });

        setLeaves(updatedLeaves);
        setStorageItem(STORAGE_KEYS.LEAVES, updatedLeaves);
        return true;
    }, [leaves, user]);

    const getLeavesByWorker = useCallback((workerId: string) => {
        return leaves.filter(leave => leave.workerId === workerId);
    }, [leaves]);

    const getLeavesBySupervisor = useCallback((supervisorId: string) => {
        return leaves.filter(leave => leave.supervisorId === supervisorId);
    }, [leaves]);

    return (
        <LeaveContext.Provider value={{
            leaves,
            isLoading,
            applyForLeave,
            updateLeaveStatus,
            getLeavesByWorker,
            getLeavesBySupervisor
        }}>
            {children}
        </LeaveContext.Provider>
    );
}

export function useLeaves() {
    const context = useContext(LeaveContext);
    if (!context) {
        throw new Error('useLeaves must be used within a LeaveProvider');
    }
    return context;
}
