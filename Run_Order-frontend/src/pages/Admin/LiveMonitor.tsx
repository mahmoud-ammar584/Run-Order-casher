import React, { useEffect } from 'react';
import { useSocket, RegisterState, RegisterStatus } from '../../contexts/SocketContext';
import Card from '../../components/Common/Card';
import Badge from '../../components/Common/Badge';
import Button from '../../components/Common/Button';
import EmptyState from '../../components/Common/EmptyState';
import { Lock, Unlock, LogOut, RefreshCw, AlertCircle, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock initial data fetch (should be API)
const fetchInitialRegisters = async () => {
    // In real app: return await api.get('/registers')
    return [
        { id: '1', name: 'Main Register', status: 'active', branch_id: 'b1', today_sales_total: 1250, current_cashier: 'Ahmed' },
        { id: '2', name: 'Patio POS', status: 'shift_closed', branch_id: 'b1', today_sales_total: 0 },
        { id: '3', name: 'Drive-Thru', status: 'locked_by_admin', branch_id: 'b1', today_sales_total: 4200, current_cashier: 'Sarah' },
    ] as RegisterState[];
};

const RegisterCard: React.FC<{ register: RegisterState }> = ({ register }) => {
    const { socket } = useSocket();

    const getStatusVariant = (status: RegisterStatus) => {
        switch (status) {
            case 'active': return 'success';
            case 'locked_by_admin': return 'danger';
            case 'offline': return 'neutral';
            case 'shift_closed': return 'warning'; // or default
            default: return 'neutral';
        }
    };

    const handleLock = () => {
        // Optimistic UI could happen here, or wait for realtime
        // socket.emit('admin.lock_register', { registerId: register.id });
        // Using REST API is safer for admin actions:
        // api.post(`/registers/${register.id}/lock`)
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 500)), // Mock API
            {
                loading: 'Locking...',
                success: 'Lock command sent',
                error: 'Failed to lock',
            }
        );
    };

    const handleUnlock = () => {
        toast.success('Unlock command sent');
    };

    return (
        <Card className="h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="tex-lg font-bold text-gray-800">{register.name}</h3>
                    <span className="text-sm text-gray-500">Sales: ${register.today_sales_total?.toFixed(2) || '0.00'}</span>
                </div>
                <Badge variant={getStatusVariant(register.status)}>{register.status.replace(/_/g, ' ')}</Badge>
            </div>

            <div className="mb-4 text-sm text-gray-600">
                {register.current_cashier ? (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{register.current_cashier}</span>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">On Shift</span>
                    </div>
                ) : (
                    <span className="text-gray-400 italic">No Active Shift</span>
                )}
            </div>

            <div className="mt-auto flex gap-2 pt-4 border-t border-gray-100">
                {register.status === 'locked_by_admin' ? (
                    <Button size="sm" variant="secondary" onClick={handleUnlock} leftIcon={<Unlock size={14} />} className="flex-1">
                        Unlock
                    </Button>
                ) : (
                    <Button size="sm" variant="danger" onClick={handleLock} leftIcon={<Lock size={14} />} className="flex-1">
                        Lock
                    </Button>
                )}

                <Button size="sm" variant="ghost" title="Force Logout">
                    <LogOut size={16} />
                </Button>
            </div>
        </Card>
    );
};

const LiveMonitor: React.FC = () => {
    const { registers, salesFeed, isConnected } = useSocket();

    // Merge socket state with initial logic (simplified for demo)
    // In reality: Load initial from API -> populate Context -> Context updates via socket
    // For this snippet, we will rely on Context registers. If empty, maybe show skeletons or fetch.

    // Temporary: Populate mock data into registers if empty (simulate API load)
    // The Context should ideally expose a `setRegisters` for initial load, 
    // but here we might just map over a combined list.

    const registerList = Object.values(registers);

    if (!isConnected) {
        return (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle size={18} />
                <span>Connecting to Realtime Server...</span>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Mission Control</h1>
                    <p className="text-gray-500">Live view of all registers and transactions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" leftIcon={<RefreshCw size={16} />}>Refresh Status</Button>
                    <Badge variant="success" className="px-3 py-1">System Online</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left: Registers Grid */}
                <div className="lg:col-span-3">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Registers ({registerList.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {registerList.length === 0 ? (
                            <EmptyState
                                className="col-span-full py-12"
                                title="No Registers Online"
                                description="Waiting for devices to connect..."
                            />
                        ) : (
                            registerList.map(reg => (
                                <RegisterCard key={reg.id} register={reg} />
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Sales Feed */}
                <div className="lg:col-span-1">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Live Feed</h2>
                    <Card className="h-[calc(100vh-200px)] overflow-hidden" noPadding>
                        <div className="h-full overflow-y-auto p-0">
                            {salesFeed.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    No recent sales
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {salesFeed.map((sale, idx) => (
                                        <div key={`${sale.id}-${idx}`} className="p-3 hover:bg-gray-50 transition-colors flex gap-3 text-sm">
                                            <div className="bg-green-50 text-green-600 p-2 rounded-lg h-fit">
                                                <ShoppingCart size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between font-medium">
                                                    <span>Sales #{sale.id.slice(0, 6)}</span>
                                                    <span className="text-primary">${Number(sale.total).toFixed(2)}</span>
                                                </div>
                                                <div className="text-gray-500 text-xs mt-1">
                                                    {sale.cashier_name || 'Unknown'} • {new Date(sale.created_at).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LiveMonitor;
