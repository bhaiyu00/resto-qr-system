import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { MenuItem, Order, RestaurantTable, WhatsAppNotification } from '../types/index.ts';
import { INITIAL_MENU_ITEMS, INITIAL_TABLES } from '../data/initialMenu.ts';
import { CartItem, OrderStatus, calculateOrderTotals } from '../utils/orderRules.ts';
import { soundManager } from '../utils/soundManager.ts';

interface RestaurantContextType {
  // Navigation & View
  viewMode: 'customer' | 'admin';
  setViewMode: (mode: 'customer' | 'admin') => void;
  activeTable: string;
  setActiveTable: (tableNumber: string) => void;

  // Menu State
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;

  // Tables State
  tables: RestaurantTable[];
  addTable: (tableNumber: string, capacity?: number, location?: string) => void;
  toggleTableStatus: (id: string) => void;

  // Customer Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, specialNote?: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isQRScannerOpen: boolean;
  setIsQRScannerOpen: (open: boolean) => void;

  // Active Customer Order & Tracking
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  activeOrder: Order | null;
  placeOrder: (customerName: string, whatsappNumber: string, specialInstructions?: string) => Promise<Order>;

  // Orders State (Admin & Customer)
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateEstimatedPrepTime: (orderId: string, minutes: number) => void;
  submitOrderFeedback: (orderId: string, rating: number, comment?: string) => void;

  // WhatsApp Simulation Feed
  whatsAppNotifications: WhatsAppNotification[];
  clearNotifications: () => void;

  // Sound / Audio
  isMuted: boolean;
  toggleMute: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

// Broadcast Channel for live multi-tab & multi-window sync
const BROADCAST_CHANNEL_NAME = 'cozybite_realtime_bus';

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial View & Table detection from URL query parameters (e.g. ?table=05 or #admin)
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');
  const [activeTable, setActiveTable] = useState<string>('Table 04');

  // Detect URL parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tableParam = urlParams.get('table');
      if (tableParam) {
        // e.g., table=05 -> Table 05
        const formatted = tableParam.toLowerCase().startsWith('table')
          ? tableParam
          : `Table ${tableParam.padStart(2, '0')}`;
        setActiveTable(formatted);
      }

      if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
        setViewMode('admin');
      }
    }
  }, []);

  // Menu items state with local persistence
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cozybite_menu');
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return INITIAL_MENU_ITEMS;
  });

  // Tables state
  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cozybite_tables');
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return INITIAL_TABLES;
  });

  // Initial Demo orders
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cozybite_orders');
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    const now = new Date();
    const tenMinsAgo = new Date(now.getTime() - 10 * 60000).toISOString();
    return [
      {
        id: 'cb-1021',
        orderNumber: '#CB-1021',
        customerName: 'Priya Sharma',
        whatsappNumber: '+91 98201 54321',
        tableNumber: 'Table 02',
        items: [
          { id: 'item-3', name: 'Masala Dosa', price: 100, quantity: 2, isVeg: true },
          { id: 'item-6', name: 'Mango Lassi', price: 70, quantity: 2, isVeg: true },
        ],
        subtotal: 340,
        tax: 17,
        total: 357,
        status: 'preparing',
        estimatedPrepTime: 15,
        specialInstructions: 'Crispy dosa with extra coconut chutney please!',
        createdAt: tenMinsAgo,
        updatedAt: tenMinsAgo,
      },
      {
        id: 'cb-1020',
        orderNumber: '#CB-1020',
        customerName: 'Vikram Mehta',
        whatsappNumber: '+91 99100 88776',
        tableNumber: 'Table 05',
        items: [
          { id: 'item-4', name: 'Paneer Tikka', price: 180, quantity: 1, isVeg: true },
          { id: 'item-2', name: 'Pav Bhaji', price: 110, quantity: 2, isVeg: true },
        ],
        subtotal: 400,
        tax: 20,
        total: 420,
        status: 'served',
        estimatedPrepTime: 18,
        createdAt: new Date(now.getTime() - 45 * 60000).toISOString(),
        updatedAt: new Date(now.getTime() - 20 * 60000).toISOString(),
        servedAt: new Date(now.getTime() - 20 * 60000).toISOString(),
        rating: {
          stars: 5,
          comment: 'Outstanding Pav Bhaji and Paneer Tikka! Tender and perfectly spiced.',
          createdAt: new Date(now.getTime() - 18 * 60000).toISOString(),
        },
      },
    ];
  });

  // Active customer tracking order
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cozybite_active_order_id') || null;
    }
    return null;
  });

  // Customer cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cozybite_cart');
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  // WhatsApp simulation notifications
  const [whatsAppNotifications, setWhatsAppNotifications] = useState<WhatsAppNotification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cozybite_whatsapp_logs');
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return [];
  });

  const [isMuted, setIsMuted] = useState(() => soundManager.getMuted());

  // Save states to LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cozybite_orders', JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cozybite_menu', JSON.stringify(menuItems));
    }
  }, [menuItems]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cozybite_tables', JSON.stringify(tables));
    }
  }, [tables]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cozybite_cart', JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (activeOrderId) {
        localStorage.setItem('cozybite_active_order_id', activeOrderId);
      } else {
        localStorage.removeItem('cozybite_active_order_id');
      }
    }
  }, [activeOrderId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cozybite_whatsapp_logs', JSON.stringify(whatsAppNotifications));
    }
  }, [whatsAppNotifications]);

  // Set up Broadcast Channel for real-time inter-tab sync
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

    channel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'SYNC_ORDERS') {
        setOrders(payload);
      } else if (type === 'SYNC_MENU') {
        setMenuItems(payload);
      } else if (type === 'SYNC_NOTIFICATION') {
        setWhatsAppNotifications(prev => [payload, ...prev]);
        soundManager.playNewOrderBell();
      } else if (type === 'ORDER_STATUS_CHANGED') {
        soundManager.playStatusUpdateChime();
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  const broadcast = useCallback((type: string, payload: unknown) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage({ type, payload });
        channel.close();
      } catch {
        // Fallback
      }
    }
  }, []);

  // WhatsApp helper
  const sendWhatsAppUpdate = useCallback((order: Order, type: WhatsAppNotification['type']) => {
    let msgText = '';
    switch (type) {
      case 'received':
        msgText = `👋 Hi ${order.customerName}! Your order ${order.orderNumber} for ${order.tableNumber} has been received. Our chefs are reviewing it! Estimated prep time: ~${order.estimatedPrepTime} mins.`;
        break;
      case 'accepted':
        msgText = `👨‍🍳 Great news ${order.customerName}! Order ${order.orderNumber} has been accepted by the kitchen. Preparation starts right now!`;
        break;
      case 'preparing':
        msgText = `🔥 Sizzling update! Your dishes are now cooking on the stove. Fresh & piping hot in approximately ~${order.estimatedPrepTime} mins.`;
        break;
      case 'ready':
        msgText = `🔔 Ding ding! Order ${order.orderNumber} is ready to serve. Our team is heading to ${order.tableNumber} with your food!`;
        break;
      case 'served':
        msgText = `✨ Delicious meal served! Enjoy your food at ${order.tableNumber}. When finished, please tap your screen to share your rating with us!`;
        break;
    }

    const newNotification: WhatsAppNotification = {
      id: 'wa-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      to: order.whatsappNumber,
      customerName: order.customerName,
      type,
      message: msgText,
      status: 'delivered',
    };

    setWhatsAppNotifications(prev => [newNotification, ...prev]);
    broadcast('SYNC_NOTIFICATION', newNotification);
  }, [broadcast]);

  // Active Order Memo
  const activeOrder = useMemo(() => {
    if (!activeOrderId) return null;
    return orders.find(o => o.id === activeOrderId) || null;
  }, [activeOrderId, orders]);

  // Cart operations
  const addToCart = useCallback((item: MenuItem, quantity: number = 1, specialNote?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(ci => ci.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (specialNote) updated[existingIndex].specialNote = specialNote;
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
      if (quantity <= 0) {
        return prev.filter(item => item.id !== itemId);
      }
      return prev.map(item => (item.id === itemId ? { ...item, quantity } : item));
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Place order from customer checkout
  const placeOrder = useCallback(async (
    customerName: string,
    whatsappNumber: string,
    specialInstructions?: string
  ): Promise<Order> => {
    const totals = calculateOrderTotals(cart);
    const orderNum = `#CB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrderId = 'ord-' + Date.now();
    const nowIso = new Date().toISOString();

    const newOrder: Order = {
      id: newOrderId,
      orderNumber: orderNum,
      customerName: customerName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      tableNumber: activeTable,
      items: [...cart],
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      status: 'received',
      estimatedPrepTime: 20,
      specialInstructions: specialInstructions?.trim() || undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    setActiveOrderId(newOrderId);
    clearCart();
    setIsCartOpen(false);

    // Audio chime
    soundManager.playOrderSuccessChime();

    // Trigger WhatsApp notification simulation
    sendWhatsAppUpdate(newOrder, 'received');

    // Broadcast to Admin board in real-time
    broadcast('SYNC_ORDERS', updatedOrders);

    return newOrder;
  }, [cart, activeTable, orders, clearCart, sendWhatsAppUpdate, broadcast]);

  // Admin order status update
  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => {
      const target = prev.find(o => o.id === orderId);
      if (!target) return prev;

      const updated = prev.map(o => {
        if (o.id === orderId) {
          const nowIso = new Date().toISOString();
          return {
            ...o,
            status,
            updatedAt: nowIso,
            servedAt: status === 'served' ? nowIso : o.servedAt,
          };
        }
        return o;
      });

      // WhatsApp update
      if (status !== 'rejected') {
        sendWhatsAppUpdate({ ...target, status }, status as WhatsAppNotification['type']);
      }

      broadcast('SYNC_ORDERS', updated);
      broadcast('ORDER_STATUS_CHANGED', { orderId, status });
      return updated;
    });

    soundManager.playStatusUpdateChime();
  }, [broadcast, sendWhatsAppUpdate]);

  // Update prep time
  const updateEstimatedPrepTime = useCallback((orderId: string, minutes: number) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId) {
          return { ...o, estimatedPrepTime: minutes, updatedAt: new Date().toISOString() };
        }
        return o;
      });
      broadcast('SYNC_ORDERS', updated);
      return updated;
    });
  }, [broadcast]);

  // Customer feedback
  const submitOrderFeedback = useCallback((orderId: string, rating: number, comment?: string) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            rating: {
              stars: rating,
              comment: comment?.trim() || undefined,
              createdAt: new Date().toISOString(),
            },
          };
        }
        return o;
      });
      broadcast('SYNC_ORDERS', updated);
      return updated;
    });
  }, [broadcast]);

  // Menu management
  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: 'dish-' + Date.now(),
    };
    setMenuItems(prev => {
      const updated = [newItem, ...prev];
      broadcast('SYNC_MENU', updated);
      return updated;
    });
  }, [broadcast]);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => {
      const updated = prev.map(dish => (dish.id === id ? { ...dish, ...updates } : dish));
      broadcast('SYNC_MENU', updated);
      return updated;
    });
  }, [broadcast]);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems(prev => {
      const updated = prev.filter(dish => dish.id !== id);
      broadcast('SYNC_MENU', updated);
      return updated;
    });
  }, [broadcast]);

  const toggleItemAvailability = useCallback((id: string) => {
    setMenuItems(prev => {
      const updated = prev.map(dish => (dish.id === id ? { ...dish, isAvailable: !dish.isAvailable } : dish));
      broadcast('SYNC_MENU', updated);
      return updated;
    });
  }, [broadcast]);

  // Tables management
  const addTable = useCallback((tableNumber: string, capacity = 4, location = 'Main Dining') => {
    const newTbl: RestaurantTable = {
      id: 'tbl-' + Date.now(),
      tableNumber,
      qrSlug: tableNumber.toLowerCase().replace(/\s+/g, '-'),
      capacity,
      isActive: true,
      location,
    };
    setTables(prev => [...prev, newTbl]);
  }, []);

  const toggleTableStatus = useCallback((id: string) => {
    setTables(prev => prev.map(t => (t.id === id ? { ...t, isActive: !t.isActive } : t)));
  }, []);

  const toggleMute = useCallback(() => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  }, []);

  const clearNotifications = useCallback(() => {
    setWhatsAppNotifications([]);
  }, []);

  return (
    <RestaurantContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeTable,
        setActiveTable,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        tables,
        addTable,
        toggleTableStatus,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isQRScannerOpen,
        setIsQRScannerOpen,
        activeOrderId,
        setActiveOrderId,
        activeOrder,
        placeOrder,
        orders,
        updateOrderStatus,
        updateEstimatedPrepTime,
        submitOrderFeedback,
        whatsAppNotifications,
        clearNotifications,
        isMuted,
        toggleMute,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
