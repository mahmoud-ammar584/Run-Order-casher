import { create } from 'zustand';

export const usePOSStore = create((set) => ({
    categories: [],
    items: [],
    setCategories: (categories: any) => set({ categories }),
    setItems: (items: any) => set({ items }),
}));
