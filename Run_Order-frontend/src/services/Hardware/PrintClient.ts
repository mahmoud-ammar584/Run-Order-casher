import axios from 'axios';
import toast from 'react-hot-toast';

// Configuration for Local Print Agent
const AGENT_URL = 'http://localhost:5000/print';

export interface PrintPayload {
    printerName?: string;
    content: string; // HTML or Raw Text depending on agent capability
    type: 'html' | 'raw';
    cut?: boolean;
    kickDrawer?: boolean;
}

class PrintClient {
    /**
     * Sends a print job to the local agent. 
     * Falls back to window.print() if agent is unreachable.
     */
    async printReceipt(order: any, printerName?: string) {
        // 1. Try Local Agent (ESC/POS)
        try {
            await axios.post(AGENT_URL, {
                type: 'raw', // Assuming agent handles templating or we send raw ESC/POS commands constructed here
                content: this.generateEscPos(order), // Helper to generate raw bytes (mocked for now)
                printerName,
                cut: true,
                kickDrawer: order.payment_method === 'cash'
            }, { timeout: 2000 });

            toast.success('Receipt sent to printer');
        } catch (err) {
            console.warn('Print Agent unavailable, falling back to Browser Print', err);
            // 2. Fallback to Browser Print
            // In a real app, we might render a hidden iframe or route to a print view
            window.print();
        }
    }

    /**
     * Sends purely the drawer kick command.
     */
    async kickDrawer(printerName?: string) {
        try {
            const ESC_DRAWER_KICK = '\x1B\x70\x00\x19\xFA';
            await axios.post(AGENT_URL, {
                type: 'raw',
                content: ESC_DRAWER_KICK,
                printerName
            }, { timeout: 1000 });
        } catch (err) {
            console.error('Failed to kick drawer via agent', err);
            toast('Drawer kick failed: Agent unavailable', { icon: '⚠️' });
        }
    }

    // Mock ESC/POS Generator
    private generateEscPos(order: any): string {
        // Real implementation would use a library like 'escpos-xml' or build strings manually
        // This is just a placeholder for the concept
        return `
        \x1B\x40   // INIT
        \x1B\x61\x01 // CENTER
        RUN ORDER POS\n
        \x1B\x61\x00 // LEFT
        Order: ${order.order_number}\n
        --------------------------------\n
        Total: ${order.total}\n
        \x1D\x56\x00 // CUT
        `;
    }
}

export const printClient = new PrintClient();
