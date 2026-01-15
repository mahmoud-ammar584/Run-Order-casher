import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { Monitor, Smartphone, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PairingPage: React.FC = () => {
    const [pairingCode, setPairingCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handlePair = async () => {
        if (pairingCode.length !== 6) {
            toast.error('Code must be 6 digits');
            return;
        }

        setIsLoading(true);
        try {
            // Mock API Call - Replace with actual fetch to /pos/pair
            const res = await new Promise<any>((resolve, reject) => {
                setTimeout(() => {
                    if (pairingCode === '123456') resolve({ device_token: 'mock-token' }); // Testing mock
                    else reject(new Error('Invalid Code'));
                }, 1000);
            });

            // Store token securely
            localStorage.setItem('pos_device_token', res.device_token);

            toast.success('Device Paired Successfully');
            navigate('/pos');
        } catch (error) {
            toast.error('Pairing Failed: Invalid Code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center text-accent">
                    <Monitor size={32} />
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Setup POS Terminal</h1>
                    <p className="text-gray-500 mt-2">Enter the 6-digit code displayed in Mission Control to pair this device.</p>
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        maxLength={6}
                        value={pairingCode}
                        onChange={(e) => setPairingCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center text-4xl font-mono tracking-[0.5em] py-4 border-b-2 border-gray-200 focus:border-accent outline-none transition-colors"
                        placeholder="000000"
                    />

                    <Button
                        variant="primary"
                        size="lg"
                        w="full"
                        onClick={handlePair}
                        isLoading={isLoading}
                        className="w-full"
                    >
                        Connect Device
                    </Button>
                </div>

                <p className="text-xs text-gray-400">
                    Device ID: {window.navigator.userAgent.slice(0, 20)}...
                </p>
            </Card>
        </div>
    );
};

export default PairingPage;
