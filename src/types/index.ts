import { type CartItem, type OrderStatus } from '../utils/orderRules.ts';

export type Category = 'All' | 'Breakfast' | 'Main Course' | 'Snacks' | 'South Indian' | 'Beverages';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  prepTime: number; // in minutes
  badge?: string;
  calories?: string;
  spiciness?: number; // 1 (mild) to 3 (spicy)
  portionSize?: string;
}

export interface RestaurantTable {
  id: string;
  tableNumber: string;
  qrSlug: string;
  capacity: number;
  isActive: boolean;
  location?: string; // 'Window side', 'Terrace', 'Main Dining'
}

export interface WhatsAppNotification {
  id: string;
  timestamp: string;
  to: string;
  customerName: string;
  type: 'received' | 'accepted' | 'preparing' | 'ready' | 'served';
  message: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "#CB-1024"
  customerName: string;
  whatsappNumber: string;
  tableNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  estimatedPrepTime: number; // in minutes
  specialInstructions?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  servedAt?: string;
  rating?: {
    stars: number;
    comment?: string;
    createdAt: string;
  };
}

export interface WhatsAppConfig {
  phoneNumberId: string;
  businessAccountId: string;
  isEnabled: boolean;
  templatesActive: boolean;
}
