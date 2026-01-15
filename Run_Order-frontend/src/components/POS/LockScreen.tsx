import React from 'react';
import { Lock } from 'lucide-react';
import Button from '../../components/Common/Button';

interface LockScreenProps {
    reason?: string;
    onUnlockRequest?: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ reason = 'Register Locked by Admin', onUnlockRequest }) => {
    return (
        <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
            <div className="bg-red-500/10 p-6 rounded-full mb-6 animate-pulse">
                <Lock size={64} className="text-red-500" />
            </div>

            <h1 className="text-3xl font-bold mb-2">POS Locked</h1>
            <p className="text-gray-400 mb-8 max-w-md text-center">{reason}</p>

            <div className="flex gap-4">
                <Button variant="outline" className="text-white border-white hover:bg-white/10" onClick={onUnlockRequest}>
                    Request Unlock
                </Button>
            </div>
        </div>
    );
};

export default LockScreen;
