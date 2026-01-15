import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

// Define types strictly as per request
export type RegisterStatus = 'active' | 'locked_by_admin' | 'shift_closed' | 'offline';

export interface RegisterState {
    id: string;
    name: string;
    branch_id?: string;
    status: RegisterStatus;
    last_seen_at?: string;
    current_cashier?: string;
    shift_duration?: string; // e.g. "4h 20m"
    today_sales_total?: number;
}

export interface SalePreview {
    id: string;
    total: number;
    items_count: number;
    created_at: string;
    branch_id: string;
    register_id: string;
    cashier_name?: string;
}

interface SocketContextType {
    socket: Socket | null;
    connectionStatus: 'connected' | 'disconnected' | 'connecting';
    registers: Record<string, RegisterState>;
    salesFeed: SalePreview[];
    lastEventTs: number;
    isConnected: boolean;
    // Actions
    refreshRegisters: () => void; // Force refresh if needed
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
    const [registers, setRegisters] = useState<Record<string, RegisterState>>({});
    const [salesFeed, setSalesFeed] = useState<SalePreview[]>([]);
    const [lastEventTs, setLastEventTs] = useState<number>(Date.now());

    // Ref to avoid stale closures in listeners if needed, though state setters are safe
    const salesFeedRef = useRef(salesFeed);
    salesFeedRef.current = salesFeed;

    useEffect(() => {
        // TODO: Use env var for URL
        const socketInstance = io('http://localhost:3000', {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('Socket Connected:', socketInstance.id);
            setConnectionStatus('connected');
            toast.success('Realtime Connected');

            // Join admin room
            socketInstance.emit('join', { room: 'admin' });
            // Also join tenant room if we had the tenant ID context, assuming server handles auth handshake or we send token
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket Disconnected');
            setConnectionStatus('disconnected');
            // Toast suppressed to avoid annoyance on reload, or keep it but subtle
            // toast.error('Realtime Disconnected', { id: 'socket-disco' });
        });

        socketInstance.on('connect_error', (err) => {
            console.error('Socket Connection Error:', err);
            setConnectionStatus('disconnected');
        });

        // --- Business Events ---

        // Generic Register Update (covers lock, unlock, offline, active)
        socketInstance.on('register.updated', (payload: RegisterState) => {
            setRegisters((prev) => ({
                ...prev,
                [payload.id]: { ...prev[payload.id], ...payload }
            }));
            setLastEventTs(Date.now());

            // Optional: Toast for critical status changes
            if (payload.status === 'locked_by_admin') {
                toast(`${payload.name} was Locked`, { icon: '🔒' });
            }
        });

        // Sale Completed
        socketInstance.on('sale.completed', (payload: SalePreview) => {
            setSalesFeed((prev) => {
                const newFeed = [payload, ...prev].slice(0, 50); // Keep last 50
                return newFeed;
            });
            setLastEventTs(Date.now());

            // Update register stats optimistically if payload has data, 
            // otherwise we might wait for register.updated or fetch
            if (payload.register_id) {
                setRegisters(prev => {
                    const reg = prev[payload.register_id];
                    if (!reg) return prev;
                    return {
                        ...prev,
                        [payload.register_id]: {
                            ...reg,
                            today_sales_total: (reg.today_sales_total || 0) + Number(payload.total)
                        }
                    };
                });
            }
        });

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const refreshRegisters = useCallback(() => {
        // Logic to re-fetch initial state via REST API would go here
        // For now, we assume initial load logic is handled by the consumer page
        console.log('Refreshing registers...');
    }, []);

    return (
        <SocketContext.Provider
            value={{
                socket,
                connectionStatus,
                isConnected: connectionStatus === 'connected',
                registers,
                salesFeed,
                lastEventTs,
                refreshRegisters,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};
