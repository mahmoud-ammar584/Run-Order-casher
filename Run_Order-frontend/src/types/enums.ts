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
