import Dexie, { Table } from 'dexie';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { API_BASE } from '../config';

// --- Database Schema ---
interface OfflineRequest {
    id: string; // UUID
    type: 'SALE_CREATE' | 'TABLE_ORDER_SUBMIT' | 'TABLE_ORDER_PAY';
    url: string;
    method: 'POST' | 'PUT' | 'PATCH';
    payload: any;
    idempotencyKey: string;
    createdAt: number;
    status: 'pending' | 'sent' | 'failed';
    retryCount: number;
}

class RunOrderDB extends Dexie {
    offlineQueue!: Table<OfflineRequest>;

    constructor() {
        super('RunOrderDB');
        this.version(1).stores({
            offlineQueue: 'id, status, createdAt' // indexes
        });
    }
}

export const db = new RunOrderDB();

// --- Service ---
class OfflineQueueService {
    private isSyncing = false;

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.sync());
            // Optional: Periodic sync attempt
            setInterval(() => {
                if (navigator.onLine && !this.isSyncing) this.sync();
            }, 60000);
        }
    }

    /**
     * Adds a request to the queue.
     * Use this when the network request fails or when we are known offline.
     */
    async enqueueRequest(type: OfflineRequest['type'], url: string, payload: any, method: OfflineRequest['method'] = 'POST') {
        const req: OfflineRequest = {
            id: uuidv4(),
            type,
            url,
            method,
            payload,
            idempotencyKey: uuidv4(), // Generate unique key for backend
            createdAt: Date.now(),
            status: 'pending',
            retryCount: 0
        };

        await db.offlineQueue.add(req);
        toast('Available offline. Will sync when online.', { icon: '☁️' });
    }

    /**
     * Replays queued requests FIFO
     */
    async sync() {
        if (this.isSyncing || !navigator.onLine) return;

        const pendingCount = await db.offlineQueue.where('status').equals('pending').count();
        if (pendingCount === 0) return;

        this.isSyncing = true;
        const toastId = toast.loading(`Syncing ${pendingCount} offline orders...`);

        try {
            // Fetch FIFO
            const requests = await db.offlineQueue.where('status').equals('pending').sortBy('createdAt');

            for (const req of requests) {
                try {
                    await axios({
                        method: req.method,
                        url: `${API_BASE}${req.url}`, // Ensure full URL
                        data: req.payload,
                        headers: {
                            'Idempotency-Key': req.idempotencyKey
                        }
                    });

                    // On success, delete or mark done
                    await db.offlineQueue.delete(req.id);
                } catch (err) {
                    console.error('Sync failed for req:', req.id, err);
                    // Update retry count logic could go here
                    // If 4xx error (bad request), maybe alert admin? For now, keep in queue or move to failedDLQ.
                }
            }
            toast.success('Sync Complete', { id: toastId });
        } catch (err) {
            toast.error('Sync Failed', { id: toastId });
        } finally {
            this.isSyncing = false;
        }
    }
}

export const offlineQueue = new OfflineQueueService();
