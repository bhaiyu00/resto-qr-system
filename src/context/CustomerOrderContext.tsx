import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, calculateOrderTotals } from '../utils/orderRules.ts';
import { soundManager } from '../utils/soundManager.ts';

export interface VerifiedTableInfo {
  id: string;
  tableNumber: string;
  location?: string;
  capacity?: number;
}

export interface CustomerOrderContextType {
  restaurantSlug: string;
  setRestaurantSlug: (slug: string) => void;
  tableToken: string | null;
  setTableToken: (token: string | null) => void;
  verifiedTable: VerifiedTableInfo | null;
  setVerifiedTable: (table: VerifiedTableInfo | null) => void;
  cart: CartItem[];
  addToCart: (item: { id: string; name: string; price: number; isVeg: boolean; image?: string }, quantity?: number, specialNote?: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  placeOrder: (customerName: string, whatsappNumber: string, specialInstructions?: string) => Promise<any>;
  isMuted: boolean;
  toggleMute: () => void;
}

const CustomerOrderContext = createContext<CustomerOrderContextType | null>(null);

export const CustomerOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurantSlug, setRestaurantSlug] = useState('cozybite-cafe');
  const [tableToken, setTableToken] = useState<string | null>(null);
  const [verifiedTable, setVerifiedTable] = useState<VerifiedTableInfo | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('cozybite_customer_cart');
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundManager.getMuted());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cozybite_customer_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = useCallback((
    item: { id: string; name: string; price: number; isVeg: boolean; image?: string },
    quantity = 1,
    specialNote?: string
  ) => {
    setCart(prev => {
      const idx = prev.findIndex(ci => ci.id === item.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        if (specialNote) updated[idx].specialNote = specialNote;
        return updated;
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity,
          isVeg: item.isVeg,
          image: item.image,
          specialNote,
        },
      ];
    });
  }, []);

  const updateCartQuantity = useCallback((itemId: string, quantity: number) => {
    setCart(prev => {
      if (quantity <= 0) return prev.filter(i => i.id !== itemId);
      return prev.map(i => (i.id === itemId ? { ...i, quantity } : i));
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleMute = useCallback(() => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  }, []);

  const placeOrder = useCallback(async (
    customerName: string,
    whatsappNumber: string,
    specialInstructions?: string
  ) => {
    if (!tableToken) {
      throw new Error('Table verification token missing. Please re-scan table QR.');
    }

    const payload = {
      restaurantSlug,
      tableToken,
      customerName,
      whatsappNumber,
      specialInstructions,
      items: cart.map(i => ({
        id: i.id,
        quantity: i.quantity,
        specialNote: i.specialNote,
      })),
    };

    const res = await fetch('/api/public/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit order to kitchen.');
    }

    soundManager.playOrderSuccessChime();
    clearCart();
    setIsCartOpen(false);

    return data.order;
  }, [tableToken, restaurantSlug, cart, clearCart]);

  return (
    <CustomerOrderContext.Provider
      value={{
        restaurantSlug,
        setRestaurantSlug,
        tableToken,
        setTableToken,
        verifiedTable,
        setVerifiedTable,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        placeOrder,
        isMuted,
        toggleMute,
      }}
    >
      {children}
    </CustomerOrderContext.Provider>
  );
};

export const useCustomerOrder = () => {
  const context = useContext(CustomerOrderContext);
  if (!context) {
    throw new Error('useCustomerOrder must be used within CustomerOrderProvider');
  }
  return context;
};
