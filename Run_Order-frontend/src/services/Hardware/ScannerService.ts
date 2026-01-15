import { useEffect } from 'react';

// Configuration
const SCAN_BUFFER_TIMEOUT = 50; // ms between keystrokes to consider it a scan
const MIN_SCAN_LENGTH = 3;

type ScanCallback = (barcode: string) => void;

class ScannerService {
    private buffer: string = '';
    private lastKeyTime: number = 0;
    private listeners: ScanCallback[] = [];

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.handleKeyDown);
        }
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        // Ignore if focus is in an input/textarea (unless we want to override specific inputs)
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            // Optional: Check if it's a specific "scanner-trap" input. 
            // For now, adhere to requirement: "Ignore typing in normal input fields"
            return;
        }

        const now = Date.now();
        const char = e.key;

        // Reset buffer if typing is too slow (human typing)
        if (now - this.lastKeyTime > SCAN_BUFFER_TIMEOUT) {
            this.buffer = '';
        }

        this.lastKeyTime = now;

        if (char === 'Enter') {
            if (this.buffer.length >= MIN_SCAN_LENGTH) {
                this.notifyListeners(this.buffer);
            }
            this.buffer = '';
            // Prevent default Enter behavior if it was a scan
            e.preventDefault();
        } else if (char.length === 1) {
            // Only printable characters
            this.buffer += char;
        }
    };

    public subscribe(callback: ScanCallback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    private notifyListeners(barcode: string) {
        console.log('Scanned:', barcode);
        this.listeners.forEach(cb => cb(barcode));
    }
}

export const scannerService = new ScannerService();

// Hook for easy usage
export const useScanner = (onScan: (barcode: string) => void) => {
    useEffect(() => {
        const unsubscribe = scannerService.subscribe(onScan);
        return unsubscribe;
    }, [onScan]);
};
