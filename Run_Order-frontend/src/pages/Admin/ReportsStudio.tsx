import React, { useState } from 'react';
import Card from '../../components/Common/Card';
import StatCard from '../../components/Common/StatCard';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import { DollarSign, Ticket, TrendingUp, Users, Download, Filter, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import toast from 'react-hot-toast';

// Mock Data
const MOCK_SALES_DATA = [
    { time: '08:00', sales: 120 }, { time: '10:00', sales: 450 }, { time: '12:00', sales: 1200 },
    { time: '14:00', sales: 980 }, { time: '16:00', sales: 600 }, { time: '18:00', sales: 850 },
    { time: '20:00', sales: 1100 }, { time: '22:00', sales: 300 }
];

const MOCK_CASHIER_DATA = [
    { name: 'Ahmed', sales: 2400, transactions: 45 },
    { name: 'Sarah', sales: 1800, transactions: 32 },
    { name: 'Mohamed', sales: 3100, transactions: 60 },
];

const ReportsStudio: React.FC = () => {
    const [dateRange, setDateRange] = useState('Today');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        // Simulate Async Job Trigger
        setTimeout(() => {
            setIsExporting(false);
            toast.success('Export Job Started. You will be notified when ready.', { icon: '📄' });
        }, 1500);
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Reports Studio</h1>
                    <p className="text-gray-500">Analyze sales, performance, and inventory</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                    <Button variant="secondary" leftIcon={<Calendar size={16} />}>
                        {dateRange}
                    </Button>
                    <Button variant="secondary" leftIcon={<Filter size={16} />}>
                        Filter Branch
                    </Button>
                    <Button
                        variant="primary"
                        leftIcon={<Download size={16} />}
                        onClick={handleExport}
                        isLoading={isExporting}
                    >
                        Export
                    </Button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Net Sales"
                    value="$12,450.00"
                    icon={<DollarSign size={20} />}
                    delta={{ value: '+12%', trend: 'up' }}
                />
                <StatCard
                    title="Transactions"
                    value="432"
                    icon={<Ticket size={20} />}
                    delta={{ value: '+5%', trend: 'up' }}
                />
                <StatCard
                    title="Avg. Ticket"
                    value="$28.80"
                    icon={<TrendingUp size={20} />}
                    delta={{ value: '-2%', trend: 'down' }}
                />
                <StatCard
                    title="Active Cashiers"
                    value="5"
                    icon={<Users size={20} />}
                    subtext="Across 2 branches"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Hourly Sales Trend">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_SALES_DATA}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="time" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#22D3EE"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Cashier Performance">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_CASHIER_DATA} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={13} tickLine={false} axisLine={false} width={80} />
                                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey="sales" fill="#0B1220" radius={[0, 4, 4, 0]} name="Net Sales ($)" barSize={20} />
                                <Bar dataKey="transactions" fill="#22D3EE" radius={[0, 4, 4, 0]} name="Tickets" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 gap-6">
                <Card title="Top Selling Products" action={<Button variant="ghost" size="sm">View All</Button>}>
                    <Table headers={['Product Name', 'Category', 'Qty Sold', 'Revenue', 'Trend']}>
                        <tr>
                            <td className="font-medium">Chicken Burger Combo</td>
                            <td className="text-gray-500">Food</td>
                            <td>120</td>
                            <td>$1,800.00</td>
                            <td className="text-green-600">+8%</td>
                        </tr>
                        <tr>
                            <td className="font-medium">Vanilla Milkshake</td>
                            <td className="text-gray-500">Beverages</td>
                            <td>85</td>
                            <td>$510.00</td>
                            <td className="text-green-600">+12%</td>
                        </tr>
                        <tr>
                            <td className="font-medium">French Fries (L)</td>
                            <td className="text-gray-500">Sides</td>
                            <td>200</td>
                            <td>$800.00</td>
                            <td className="text-gray-500">0%</td>
                        </tr>
                    </Table>
                </Card>
            </div>
        </div>
    );
};

export default ReportsStudio;
