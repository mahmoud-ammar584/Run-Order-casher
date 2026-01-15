import React, { useState } from 'react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { Shield, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Security Policies Updated', { icon: '🛡️' });
        }, 1000);
    };

    return (
        <div className="p-6 max-w-[1000px] mx-auto space-y-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Settings & Security</h1>
                    <p className="text-gray-500">Configure POS policies and permissions</p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    isLoading={isSaving}
                    leftIcon={<Save size={18} />}
                >
                    Save Changes
                </Button>
            </div>

            <Card title="Refund & Void Policies" subtitle="Control risky actions at the POS">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-medium">Require Manager Approval for Refunds</h4>
                            <p className="text-sm text-gray-500">Cashiers cannot process refunds without a PIN.</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-5 w-5 text-accent rounded" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-medium">Require Reason for Voids</h4>
                            <p className="text-sm text-gray-500">Must select a predefined reason code.</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-5 w-5 text-accent rounded" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-medium">Daily Void Limit / Register</h4>
                            <p className="text-sm text-gray-500">Auto-lock register if voids exceed this amount.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">$</span>
                            <input type="number" defaultValue={50} className="w-20 p-1 border rounded text-right" />
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Discount Controls">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-medium">Max Manual Discount %</h4>
                            <p className="text-sm text-gray-500">Limit the percentage a cashier can manually apply.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="number" defaultValue={15} className="w-16 p-1 border rounded text-right" />
                            <span className="text-sm font-bold">%</span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Danger Zone" className="border-red-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-full">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-red-700">Force Global Logout</h4>
                        <p className="text-sm text-red-600">Sign out all active sessions across all branches immediately.</p>
                    </div>
                    <Button variant="danger">Execute</Button>
                </div>
            </Card>
        </div>
    );
};

export default SettingsPage;
