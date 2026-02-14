import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ClientOrder, UserRole } from '@/types/dwoms';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/lib/storage';
import { useAuth } from './AuthContext';

interface ClientOrderContextType {
    orders: ClientOrder[];
    placeOrder: (orderData: Omit<ClientOrder, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
    updateOrderStatus: (
        id: string,
        status: ClientOrder['status'],
        extraData?: Partial<ClientOrder>
    ) => Promise<boolean>;
    isLoading: boolean;
    refreshOrders: () => void;
}

const ClientOrderContext = createContext<ClientOrderContextType | undefined>(undefined);

export function ClientOrderProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [orders, setOrders] = useState<ClientOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshOrders = () => {
        const allOrders = getStorageItem<ClientOrder[]>(STORAGE_KEYS.CLIENT_ORDERS, []);
        setOrders(allOrders);
        setIsLoading(false);
    };

    useEffect(() => {
        refreshOrders();
    }, []);

    const placeOrder = async (orderData: Omit<ClientOrder, 'id' | 'status' | 'createdAt'>) => {
        try {
            const newOrder: ClientOrder = {
                ...orderData,
                id: Math.random().toString(36).substring(2, 15),
                status: 'Pending',
                createdAt: new Date().toISOString(),
            };

            const currentOrders = getStorageItem<ClientOrder[]>(STORAGE_KEYS.CLIENT_ORDERS, []);
            const updatedOrders = [newOrder, ...currentOrders];

            setStorageItem(STORAGE_KEYS.CLIENT_ORDERS, updatedOrders);
            setOrders(updatedOrders);
            return true;
        } catch (error) {
            console.error('Failed to place order:', error);
            return false;
        }
    };

    const updateOrderStatus = async (
        id: string,
        status: ClientOrder['status'],
        extraData?: Partial<ClientOrder>
    ) => {
        try {
            const currentOrders = getStorageItem<ClientOrder[]>(STORAGE_KEYS.CLIENT_ORDERS, []);
            const updatedOrders = currentOrders.map(order =>
                order.id === id
                    ? { ...order, status, ...extraData }
                    : order
            );

            setStorageItem(STORAGE_KEYS.CLIENT_ORDERS, updatedOrders);
            setOrders(updatedOrders);
            return true;
        } catch (error) {
            console.error('Failed to update order:', error);
            return false;
        }
    };

    return (
        <ClientOrderContext.Provider value={{ orders, placeOrder, updateOrderStatus, isLoading, refreshOrders }}>
            {children}
        </ClientOrderContext.Provider>
    );
}

export function useClientOrders() {
    const context = useContext(ClientOrderContext);
    if (context === undefined) {
        throw new Error('useClientOrders must be used within a ClientOrderProvider');
    }
    return context;
}
