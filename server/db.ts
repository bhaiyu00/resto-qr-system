import bcrypt from 'bcryptjs';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  address: string;
  contact: string;
  settings: {
    gstRate: number;
    defaultPrepTime: number;
    isAcceptingOrders: boolean;
  };
}

export interface AdminUser {
  id: string;
  restaurantId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'owner' | 'manager' | 'chef';
}

export interface TableItem {
  id: string;
  restaurantId: string;
  tableNumber: string; // e.g. "Table 06"
  tableToken: string;  // e.g. "tok-tbl-06-8d1a"
  capacity: number;
  location: string;
  isActive: boolean;
  createdAt: string;
}

export interface DbMenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  prepTime: number;
  badge?: string;
  calories?: string;
  spiciness?: number;
  portionSize?: string;
}

export interface DbOrder {
  id: string;
  orderNumber: string;
  restaurantId: string;
  tableId: string;
  tableNumber: string;
  customerName: string;
  whatsappNumber: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    isVeg: boolean;
    specialNote?: string;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'received' | 'accepted' | 'preparing' | 'ready' | 'served' | 'rejected';
  estimatedPrepTime: number;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  servedAt?: string;
  rating?: {
    stars: number;
    comment?: string;
    createdAt: string;
  };
}

// In-Memory Database store with pre-seeded data
class Database {
  public restaurants: Restaurant[] = [
    {
      id: 'res-cozybite',
      name: 'CozyBite Café & Eatery',
      slug: 'cozybite-cafe',
      tagline: 'Warm food, freshly cooked at your rhythm.',
      address: '12 Maple Garden Walk, Bandra West, Mumbai',
      contact: '+91 98200 12345',
      settings: {
        gstRate: 0.05,
        defaultPrepTime: 15,
        isAcceptingOrders: true,
      },
    },
  ];

  public admins: AdminUser[] = [];

  public tables: TableItem[] = [
    { id: 'tbl-1', restaurantId: 'res-cozybite', tableNumber: 'Table 01', tableToken: 'tok-tbl-01-a8f9', capacity: 2, location: 'Window Side', isActive: true, createdAt: new Date().toISOString() },
    { id: 'tbl-2', restaurantId: 'res-cozybite', tableNumber: 'Table 02', tableToken: 'tok-tbl-02-c4d1', capacity: 2, location: 'Garden Patio', isActive: true, createdAt: new Date().toISOString() },
    { id: 'tbl-3', restaurantId: 'res-cozybite', tableNumber: 'Table 03', tableToken: 'tok-tbl-03-e7a2', capacity: 4, location: 'Main Dining', isActive: true, createdAt: new Date().toISOString() },
    { id: 'tbl-4', restaurantId: 'res-cozybite', tableNumber: 'Table 04', tableToken: 'tok-tbl-04-f9b8', capacity: 4, location: 'Cozy Booth', isActive: true, createdAt: new Date().toISOString() },
    { id: 'tbl-5', restaurantId: 'res-cozybite', tableNumber: 'Table 05', tableToken: 'tok-tbl-05-3e2c', capacity: 6, location: 'Family Lounge', isActive: true, createdAt: new Date().toISOString() },
    { id: 'tbl-6', restaurantId: 'res-cozybite', tableNumber: 'Table 06', tableToken: 'tok-tbl-06-8d1a', capacity: 4, location: 'Terrace View', isActive: true, createdAt: new Date().toISOString() },
    { id: 'tbl-7', restaurantId: 'res-cozybite', tableNumber: 'Table 07', tableToken: 'tok-tbl-07-5b4e', capacity: 2, location: 'Coffee Nook', isActive: true, createdAt: new Date().toISOString() },
    { id: 'tbl-8', restaurantId: 'res-cozybite', tableNumber: 'Table 08', tableToken: 'tok-tbl-08-9f0d', capacity: 8, location: 'Private Corner', isActive: true, createdAt: new Date().toISOString() },
  ];

  public menuItems: DbMenuItem[] = [
    {
      id: 'item-1',
      restaurantId: 'res-cozybite',
      categoryId: 'cat-breakfast',
      category: 'Breakfast',
      name: 'Chole Bhature',
      price: 120,
      description: 'Fluffy golden bhature served with rich slow-cooked spiced chickpea curry, pickled onions, and mint chutney.',
      image: '/src/assets/images/chole_bhature_1793770178266.jpg',
      isVeg: true,
      isAvailable: true,
      prepTime: 15,
      badge: "Chef's Special",
      calories: '480 kcal',
      spiciness: 2,
      portionSize: '2 Bhature + Bowl Chole',
    },
    {
      id: 'item-2',
      restaurantId: 'res-cozybite',
      categoryId: 'cat-snacks',
      category: 'Snacks',
      name: 'Pav Bhaji',
      price: 110,
      description: 'Iconic Mumbai style spiced mashed vegetables topped with melting Amul butter, served with two toasted soft pavs.',
      image: '/src/assets/images/pav_bhaji_1793770179282.jpg',
      isVeg: true,
      isAvailable: true,
      prepTime: 12,
      badge: 'Popular',
      calories: '420 kcal',
      spiciness: 2,
      portionSize: '2 Pavs + 200ml Bhaji',
    },
    {
      id: 'item-3',
      restaurantId: 'res-cozybite',
      categoryId: 'cat-south-indian',
      category: 'South Indian',
      name: 'Masala Dosa',
      price: 100,
      description: 'Crisp golden crepe made from fermented rice-lentil batter, filled with spiced mashed potatoes, fresh chutneys & piping hot sambar.',
      image: '/src/assets/images/masala_dosa_1793770179770.jpg',
      isVeg: true,
      isAvailable: true,
      prepTime: 14,
      badge: 'Bestseller',
      calories: '350 kcal',
      spiciness: 1,
      portionSize: '1 Large Dosa + 3 Dips',
    },
    {
      id: 'item-4',
      restaurantId: 'res-cozybite',
      categoryId: 'cat-main-course',
      category: 'Main Course',
      name: 'Paneer Tikka',
      price: 180,
      description: 'Fresh malai paneer cubes marinated in spiced hung curd, char-grilled in tandoor with crunchy bell peppers and red onions.',
      image: '/src/assets/images/paneer_tikka_1793770180364.jpg',
      isVeg: true,
      isAvailable: true,
      prepTime: 18,
      badge: 'Tandoor Special',
      calories: '390 kcal',
      spiciness: 2,
      portionSize: '6 Skewered Pieces',
    },
    {
      id: 'item-5',
      restaurantId: 'res-cozybite',
      categoryId: 'cat-main-course',
      category: 'Main Course',
      name: 'Veg Hakka Noodles',
      price: 140,
      description: 'Wok-tossed noodles with shredded cabbage, crunchy carrots, bell peppers, spring garlic, and toasted sesame aromatics.',
      image: '/src/assets/images/veg_hakka_noodles_1793770180734.jpg',
      isVeg: true,
      isAvailable: true,
      prepTime: 15,
      calories: '380 kcal',
      spiciness: 1,
      portionSize: 'Serves 1-2',
    },
    {
      id: 'item-6',
      restaurantId: 'res-cozybite',
      categoryId: 'cat-beverages',
      category: 'Beverages',
      name: 'Mango Lassi',
      price: 70,
      description: 'Creamy yogurt smoothie blended with ripe Alphonso mangoes, topped with slivered pistachios and fragrant saffron strands.',
      image: '/src/assets/images/mango_lassi_1793770181338.jpg',
      isVeg: true,
      isAvailable: true,
      prepTime: 5,
      badge: 'Refreshing',
      calories: '220 kcal',
      spiciness: 0,
      portionSize: '300 ml Kulhad',
    },
  ];

  public orders: DbOrder[] = [];

  constructor() {
    this.seedAdmin();
    this.seedSampleOrders();
  }

  private seedAdmin() {
    // Generate real bcrypt hash for demo password "cozy123"
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('cozy123', salt);

    this.admins.push({
      id: 'admin-1',
      restaurantId: 'res-cozybite',
      name: 'Master Chef Rahul',
      email: 'admin@cozybite.com',
      passwordHash: hash,
      role: 'owner',
    });
  }

  private seedSampleOrders() {
    const now = Date.now();
    this.orders.push(
      {
        id: 'ord-1021',
        orderNumber: '#CB-1021',
        restaurantId: 'res-cozybite',
        tableId: 'tbl-2',
        tableNumber: 'Table 02',
        customerName: 'Priya Sharma',
        whatsappNumber: '+91 98201 54321',
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
        createdAt: new Date(now - 12 * 60000).toISOString(),
        updatedAt: new Date(now - 12 * 60000).toISOString(),
      },
      {
        id: 'ord-1020',
        orderNumber: '#CB-1020',
        restaurantId: 'res-cozybite',
        tableId: 'tbl-5',
        tableNumber: 'Table 05',
        customerName: 'Vikram Mehta',
        whatsappNumber: '+91 99100 88776',
        items: [
          { id: 'item-4', name: 'Paneer Tikka', price: 180, quantity: 1, isVeg: true },
          { id: 'item-2', name: 'Pav Bhaji', price: 110, quantity: 2, isVeg: true },
        ],
        subtotal: 400,
        tax: 20,
        total: 420,
        status: 'served',
        estimatedPrepTime: 18,
        createdAt: new Date(now - 45 * 60000).toISOString(),
        updatedAt: new Date(now - 20 * 60000).toISOString(),
        servedAt: new Date(now - 20 * 60000).toISOString(),
        rating: {
          stars: 5,
          comment: 'Outstanding Pav Bhaji and Paneer Tikka! Tender and perfectly spiced.',
          createdAt: new Date(now - 18 * 60000).toISOString(),
        },
      }
    );
  }

  // Restaurant helpers
  public getRestaurantBySlug(slug: string): Restaurant | null {
    return this.restaurants.find(r => r.slug === slug) || null;
  }

  public getRestaurantById(id: string): Restaurant | null {
    return this.restaurants.find(r => r.id === id) || null;
  }

  // Table helpers
  public verifyTableToken(restaurantSlug: string, tableToken: string): { restaurant: Restaurant; table: TableItem } | null {
    const restaurant = this.getRestaurantBySlug(restaurantSlug);
    if (!restaurant) return null;

    const table = this.tables.find(
      t => t.restaurantId === restaurant.id && t.tableToken === tableToken && t.isActive
    );
    if (!table) return null;

    return { restaurant, table };
  }

  public getTablesForRestaurant(restaurantId: string): TableItem[] {
    return this.tables.filter(t => t.restaurantId === restaurantId);
  }

  public addTable(restaurantId: string, tableNumber: string, capacity = 4, location = 'Main Dining'): TableItem {
    const randomHex = Math.random().toString(36).substring(2, 7);
    const numClean = tableNumber.replace(/\D/g, '').padStart(2, '0');
    const tableToken = `tok-tbl-${numClean}-${randomHex}`;

    const newTable: TableItem = {
      id: 'tbl-' + Date.now(),
      restaurantId,
      tableNumber,
      tableToken,
      capacity,
      location,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.tables.push(newTable);
    return newTable;
  }

  public toggleTableActive(id: string, restaurantId: string): TableItem | null {
    const table = this.tables.find(t => t.id === id && t.restaurantId === restaurantId);
    if (!table) return null;
    table.isActive = !table.isActive;
    return table;
  }

  // Menu helpers
  public getMenuForRestaurant(restaurantId: string, onlyAvailable = false): DbMenuItem[] {
    return this.menuItems.filter(
      item => item.restaurantId === restaurantId && (!onlyAvailable || item.isAvailable)
    );
  }

  public addMenuItem(item: Omit<DbMenuItem, 'id'>): DbMenuItem {
    const newItem: DbMenuItem = {
      ...item,
      id: 'dish-' + Date.now(),
    };
    this.menuItems.unshift(newItem);
    return newItem;
  }

  public updateMenuItem(id: string, restaurantId: string, updates: Partial<DbMenuItem>): DbMenuItem | null {
    const idx = this.menuItems.findIndex(m => m.id === id && m.restaurantId === restaurantId);
    if (idx === -1) return null;
    this.menuItems[idx] = { ...this.menuItems[idx], ...updates };
    return this.menuItems[idx];
  }

  public deleteMenuItem(id: string, restaurantId: string): boolean {
    const initialLen = this.menuItems.length;
    this.menuItems = this.menuItems.filter(m => !(m.id === id && m.restaurantId === restaurantId));
    return this.menuItems.length < initialLen;
  }

  // Orders helpers
  public getOrdersForRestaurant(restaurantId: string): DbOrder[] {
    return this.orders
      .filter(o => o.restaurantId === restaurantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(orderId: string): DbOrder | null {
    return this.orders.find(o => o.id === orderId) || null;
  }

  public createOrder(
    restaurantId: string,
    tableId: string,
    customerName: string,
    whatsappNumber: string,
    items: { id: string; quantity: number; specialNote?: string }[],
    specialInstructions?: string
  ): DbOrder {
    const restaurant = this.getRestaurantById(restaurantId);
    const table = this.tables.find(t => t.id === tableId && t.restaurantId === restaurantId);
    if (!restaurant || !table) {
      throw new Error('Invalid restaurant or table identification.');
    }

    // Server-side price calculation
    let subtotal = 0;
    const verifiedItems = items.map(inputItem => {
      const dbDish = this.menuItems.find(m => m.id === inputItem.id && m.restaurantId === restaurantId);
      if (!dbDish) throw new Error(`Dish "${inputItem.id}" not found on menu.`);
      if (!dbDish.isAvailable) throw new Error(`Dish "${dbDish.name}" is currently sold out.`);

      const linePrice = dbDish.price * inputItem.quantity;
      subtotal += linePrice;

      return {
        id: dbDish.id,
        name: dbDish.name,
        price: dbDish.price,
        quantity: inputItem.quantity,
        isVeg: dbDish.isVeg,
        specialNote: inputItem.specialNote,
      };
    });

    const taxRate = restaurant.settings.gstRate || 0.05;
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax;
    const orderNumber = `#CB-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const newOrder: DbOrder = {
      id: 'ord-' + Date.now(),
      orderNumber,
      restaurantId,
      tableId: table.id,
      tableNumber: table.tableNumber,
      customerName,
      whatsappNumber,
      items: verifiedItems,
      subtotal,
      tax,
      total,
      status: 'received',
      estimatedPrepTime: restaurant.settings.defaultPrepTime || 15,
      specialInstructions,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  public updateOrderStatus(orderId: string, restaurantId: string, status: DbOrder['status']): DbOrder | null {
    const order = this.orders.find(o => o.id === orderId && o.restaurantId === restaurantId);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'served') {
      order.servedAt = new Date().toISOString();
    }
    return order;
  }

  public updatePrepTime(orderId: string, restaurantId: string, minutes: number): DbOrder | null {
    const order = this.orders.find(o => o.id === orderId && o.restaurantId === restaurantId);
    if (!order) return null;
    order.estimatedPrepTime = minutes;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  public addOrderFeedback(orderId: string, stars: number, comment?: string): DbOrder | null {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.rating = {
      stars,
      comment,
      createdAt: new Date().toISOString(),
    };
    return order;
  }
}

export const db = new Database();
