import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import axios from 'axios';
import { API_BASE } from '../../config';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Users, Clock } from 'lucide-react';

interface Table {
    id: string;
    table_number: string;
    capacity: number;
    status: 'AVAILABLE' | 'ORDERING' | 'OCCUPIED' | 'DIRTY';
    current_order_id?: string;
    updated_at: string;
}

const TablesPage: React.FC = () => {
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { socket } = useSocket();
    const navigate = useNavigate();

    // Fetch Tables
    const fetchTables = async () => {
        try {
            const res = await axios.get(`${API_BASE}/tables`);
            setTables(res.data);
            setIsLoading(false);
        } catch (err) {
            toast.error('Failed to load tables');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();

        // Realtime Listener
        if (socket) {
            socket.on('table.updated', () => {
                fetchTables(); // optimize to update specific table in future
            });
            return () => {
                socket.off('table.updated');
            };
        }
    }, [socket]);

    const handleTableClick = async (table: Table) => {
        if (table.status === 'AVAILABLE') {
            // Create New Order
            try {
                const res = await axios.post(`${API_BASE}/tables/${table.id}/open-order`);
                navigate(`/pos/table/${table.id}/order/${res.data.id}`);
            } catch (err) {
                toast.error('Failed to open table');
            }
        } else if (table.status === 'ORDERING' || table.status === 'OCCUPIED') {
            if (table.current_order_id) {
                navigate(`/pos/table/${table.id}/order/${table.current_order_id}`);
            }
        } else {
            toast('Table is Dirty. Please clean it first.', { icon: '🧹' });
            // Implement Clean Action
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
            case 'ORDERING': return 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200';
            case 'OCCUPIED': return 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200';
            case 'DIRTY': return 'bg-gray-200 border-gray-400 text-gray-600 hover:bg-gray-300';
            default: return 'bg-white';
        }
    };

    return (
        <div className="p-6 h-screen flex flex-col bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Restaurant Tables</h1>
                <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Available</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Ordering</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-full"></div> Occupied</span>
                </div>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">Loading...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto pb-20">
                    {tables.map(table => (
                        <div
                            key={table.id}
                            onClick={() => handleTableClick(table)}
                            className={clsx(
                                "aspect-square rounded-xl border-2 p-4 flex flex-col justify-between cursor-pointer transition-all shadow-sm active:scale-95",
                                getStatusColor(table.status)
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-xl font-bold">{table.table_number}</span>
                                <div className="flex items-center gap-1 text-xs opacity-70">
                                    <Users size={12} /> {table.capacity}
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="text-sm font-semibold mb-1">{table.status}</div>
                                {table.status !== 'AVAILABLE' && (
                                    <div className="flex items-center gap-1 text-xs opacity-60">
                                        <Clock size={12} />
                                        {/* Mock time since update */}
                                        12m
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TablesPage;
