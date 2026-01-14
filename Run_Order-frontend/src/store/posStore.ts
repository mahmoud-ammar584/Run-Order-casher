import { create } from 'zustand';
import { CartItem, Item, ModifierOption, OrderType } from '../types/definitions';

interface POSStore {
    // حالة السلة
    cartItems: CartItem[];
    orderType: OrderType;
    tableNumber: string;
    customerName: string;
    customerPhone: string;
    notes: string;

    // حسابات
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;

    // إضافة صنف للسلة
    addToCart: (item: Item, selectedModifiers: { [groupId: string]: ModifierOption[] }) => void;

    // تحديث كمية صنف
    updateQuantity: (index: number, quantity: number) => void;

    // إزالة صنف
    removeFromCart: (index: number) => void;

    // تحديث الملاحظات الخاصة بصنف
    updateItemInstructions: (index: number, instructions: string) => void;

    // تحديث نوع الطلب
    setOrderType: (type: OrderType) => void;

    // تحديث بيانات العميل
    setCustomerInfo: (field: 'tableNumber' | 'customerName' | 'customerPhone' | 'notes', value: string) => void;

    // تطبيق خصم
    applyDiscount: (amount: number) => void;

    // حساب الإجمالي
    calculateTotals: () => void;

    // إعادة تعيين السلة
    resetCart: () => void;
}

export const usePOSStore = create<POSStore>((set, get) => ({
    cartItems: [],
    orderType: OrderType.DINE_IN,
    tableNumber: '',
    customerName: '',
    customerPhone: '',
    notes: '',
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,

    addToCart: (item, selectedModifiers) => {
        try {
            // Validate item has required fields
            if (!item) {
                console.error('Invalid item:', item);
                return;
            }

            // Ensure base_price is a number
            const basePrice = typeof item.base_price === 'string' ? parseFloat(item.base_price) : item.base_price;

            if (isNaN(basePrice)) {
                console.error('Invalid price for item:', item);
                return;
            }

            const { cartItems } = get();

            // حساب سعر الإضافات
            let modifiersTotal = 0;
            Object.values(selectedModifiers).forEach((options) => {
                options.forEach((option) => {
                    modifiersTotal += option.price_adjustment || 0;
                });
            });

            // السعر الإجمالي للصنف الواحد
            const itemTotalPrice = basePrice + modifiersTotal;

            // البحث عن صنف مشابه في السلة
            const existingItemIndex = cartItems.findIndex((cartItem) => {
                if (cartItem.item.id !== item.id) return false;

                // مقارنة الإضافات المختارة
                const existingModifiersStr = JSON.stringify(cartItem.selected_modifiers);
                const newModifiersStr = JSON.stringify(selectedModifiers);

                return existingModifiersStr === newModifiersStr;
            });

            if (existingItemIndex !== -1) {
                // إذا كان الصنف موجود بنفس الإضافات، نزيد الكمية
                const updatedCart = [...cartItems];
                updatedCart[existingItemIndex].quantity += 1;
                updatedCart[existingItemIndex].total_price =
                    itemTotalPrice * updatedCart[existingItemIndex].quantity;

                set({ cartItems: updatedCart });
            } else {
                // إضافة صنف جديد
                const newCartItem: CartItem = {
                    item,
                    quantity: 1,
                    selected_modifiers: selectedModifiers,
                    total_price: itemTotalPrice,
                };

                set({ cartItems: [...cartItems, newCartItem] });
            }

            get().calculateTotals();
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    },

    updateQuantity: (index, quantity) => {
        const { cartItems } = get();

        if (quantity <= 0) {
            get().removeFromCart(index);
            return;
        }

        const updatedCart = [...cartItems];
        const item = updatedCart[index];

        // حساب السعر الأساسي + الإضافات
        let modifiersTotal = 0;
        Object.values(item.selected_modifiers).forEach((options) => {
            options.forEach((option) => {
                modifiersTotal += option.price_adjustment;
            });
        });

        const currentBasePrice = typeof item.item.base_price === 'string' ? parseFloat(item.item.base_price as any) : item.item.base_price;
        const unitPrice = currentBasePrice + modifiersTotal;
        updatedCart[index].quantity = quantity;
        updatedCart[index].total_price = unitPrice * quantity;

        set({ cartItems: updatedCart });
        get().calculateTotals();
    },

    removeFromCart: (index) => {
        const { cartItems } = get();
        const updatedCart = cartItems.filter((_, i) => i !== index);
        set({ cartItems: updatedCart });
        get().calculateTotals();
    },

    updateItemInstructions: (index, instructions) => {
        const { cartItems } = get();
        const updatedCart = [...cartItems];
        updatedCart[index].special_instructions = instructions;
        set({ cartItems: updatedCart });
    },

    setOrderType: (type) => {
        set({ orderType: type });
    },

    setCustomerInfo: (field, value) => {
        set({ [field]: value });
    },

    applyDiscount: (amount) => {
        set({ discountAmount: amount });
        get().calculateTotals();
    },

    calculateTotals: () => {
        const { cartItems, discountAmount } = get();

        // حساب المجموع الفرعي
        const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);

        // حساب الضريبة (افتراضياً 14%)
        const taxRate = 0.14;
        const taxAmount = subtotal * taxRate;

        // حساب الإجمالي النهائي
        const total = subtotal + taxAmount - discountAmount;

        set({
            subtotal: Math.round(subtotal * 100) / 100,
            taxAmount: Math.round(taxAmount * 100) / 100,
            total: Math.round(total * 100) / 100,
        });
    },

    resetCart: () => {
        set({
            cartItems: [],
            orderType: OrderType.DINE_IN,
            tableNumber: '',
            customerName: '',
            customerPhone: '',
            notes: '',
            subtotal: 0,
            taxAmount: 0,
            discountAmount: 0,
            total: 0,
        });
    },
}));
