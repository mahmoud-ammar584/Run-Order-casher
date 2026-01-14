export enum OrderType {
    DINE_IN = 'dine_in',
    TAKEOUT = 'takeout',
    DELIVERY = 'delivery'
}

export enum OrderStatus {
    PENDING = 'pending',
    PREPARING = 'preparing',
    READY = 'ready',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export enum PaymentMethod {
    CASH = 'cash',
    CARD = 'card',
    SPLIT = 'split'
}

export interface Category {
    id: string;
    name_ar: string;
    name_en: string;
    description_ar?: string;
    description_en?: string;
    is_active: boolean;
    display_order: number;
    image_url?: string;
    parent_id?: string;
}

export interface Item {
    id: string;
    name_ar: string;
    name_en: string;
    description_ar?: string;
    description_en?: string;
    base_price: number;
    sku: string;
    barcode?: string;
    image_url?: string;
    is_active: boolean;
    is_available: boolean;
    display_order: number;
    category_id: string;
    tax_class_id?: string;
    modifier_groups?: ModifierGroup[];
}

export interface ModifierGroup {
    id: string;
    name_ar: string;
    name_en: string;
    min_selection: number;
    max_selection: number;
    is_required: boolean;
    display_order: number;
    options: ModifierOption[];
}

export interface ModifierOption {
    id: string;
    name_ar: string;
    name_en: string;
    price_adjustment: number;
    is_active: boolean;
    display_order: number;
    modifier_group_id: string;
}

export interface CartItem {
    item: Item;
    quantity: number;
    selected_modifiers: { [groupId: string]: ModifierOption[] };
    total_price: number;
    special_instructions?: string;
}

export interface Order {
    id: string;
    order_number: string;
    order_type: OrderType;
    status: OrderStatus;
    table_number?: string;
    customer_name?: string;
    customer_phone?: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total: number;
    payment_method: PaymentMethod;
    cash_received?: number;
    change_amount?: number;
    notes?: string;
    cashier_id: string;
    items: CartItem[];
    created_at: Date;
    completed_at?: Date;
}
