import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, DbOrder } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

const JWT_SECRET = process.env.JWT_SECRET || 'cozybite_jwt_secret_key_restaurant_2026';
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Socket.IO Room Management
io.on('connection', (socket) => {
  socket.on('join_restaurant', (restaurantId: string) => {
    socket.join(`res_${restaurantId}`);
  });

  socket.on('join_order', (orderId: string) => {
    socket.join(`order_${orderId}`);
  });
});

// Authentication Middleware
interface AuthRequest extends Request {
  user?: {
    adminId: string;
    restaurantId: string;
    role: string;
    email: string;
    name: string;
  };
}

const requireAdminAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.cozybite_admin_token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication token required.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired admin session.' });
  }
};

/* ==========================================================================
   PUBLIC CUSTOMER APIS
   ========================================================================== */

/**
 * Verify unique table token from QR scan
 */
app.get('/api/public/verify-table/:restaurantSlug/:tableToken', (req: Request, res: Response) => {
  const { restaurantSlug, tableToken } = req.params;
  const verified = db.verifyTableToken(restaurantSlug, tableToken);

  if (!verified) {
    res.status(404).json({
      valid: false,
      error: 'Invalid or inactive table QR code. Please scan a valid table standee.',
    });
    return;
  }

  res.json({
    valid: true,
    restaurant: {
      id: verified.restaurant.id,
      name: verified.restaurant.name,
      slug: verified.restaurant.slug,
      tagline: verified.restaurant.tagline,
      address: verified.restaurant.address,
    },
    table: {
      id: verified.table.id,
      tableNumber: verified.table.tableNumber,
      location: verified.table.location,
      capacity: verified.table.capacity,
    },
  });
});

/**
 * Public customer menu
 */
app.get('/api/public/menu/:restaurantSlug', (req: Request, res: Response) => {
  const { restaurantSlug } = req.params;
  const restaurant = db.getRestaurantBySlug(restaurantSlug);

  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found.' });
    return;
  }

  const items = db.getMenuForRestaurant(restaurant.id, false);
  const categories = Array.from(new Set(items.map(i => i.category)));

  res.json({
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      tagline: restaurant.tagline,
      address: restaurant.address,
    },
    items,
    categories: ['All Items', ...categories],
  });
});

/**
 * Customer order submission (Requires verified table token)
 */
app.post('/api/public/orders', (req: Request, res: Response) => {
  const {
    restaurantSlug,
    tableToken,
    customerName,
    whatsappNumber,
    items,
    specialInstructions,
  } = req.body;

  if (!restaurantSlug || !tableToken) {
    res.status(400).json({ error: 'Missing verified restaurant or table token.' });
    return;
  }

  const verified = db.verifyTableToken(restaurantSlug, tableToken);
  if (!verified) {
    res.status(403).json({ error: 'Forbidden: Table token is invalid, expired or disabled.' });
    return;
  }

  if (!customerName || customerName.trim().length < 2) {
    res.status(400).json({ error: 'Please enter a valid customer name.' });
    return;
  }

  if (!whatsappNumber || whatsappNumber.replace(/\D/g, '').length < 10) {
    res.status(400).json({ error: 'Please enter a valid 10-digit WhatsApp number.' });
    return;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Cannot place an empty order tray.' });
    return;
  }

  try {
    const order = db.createOrder(
      verified.restaurant.id,
      verified.table.id,
      customerName.trim(),
      whatsappNumber.trim(),
      items,
      specialInstructions?.trim()
    );

    // Real-Time Notification to Admin via Socket.IO
    io.to(`res_${verified.restaurant.id}`).emit('new_order', order);

    res.status(201).json({
      success: true,
      order,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error processing order.';
    res.status(400).json({ error: msg });
  }
});

/**
 * Public order tracking endpoint
 */
app.get('/api/public/orders/:orderId', (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = db.getOrderById(orderId);

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  res.json({ order });
});

/**
 * Customer rating & review submission
 */
app.post('/api/public/orders/:orderId/feedback', (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
    return;
  }

  const updatedOrder = db.addOrderFeedback(orderId, Number(rating), comment);
  if (!updatedOrder) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  io.to(`res_${updatedOrder.restaurantId}`).emit('order_feedback_received', {
    orderId: updatedOrder.id,
    rating: updatedOrder.rating,
  });

  res.json({ success: true, order: updatedOrder });
});

/* ==========================================================================
   ADMIN AUTHENTICATION & MANAGEMENT APIS
   ========================================================================== */

/**
 * Admin Login
 */
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const admin = db.admins.find(a => a.email.toLowerCase() === email.toLowerCase().trim());
  if (!admin) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const isMatch = bcrypt.compareSync(password, admin.passwordHash);
  if (!isMatch) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = jwt.sign(
    {
      adminId: admin.id,
      restaurantId: admin.restaurantId,
      role: admin.role,
      email: admin.email,
      name: admin.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Set HTTP-Only Cookie
  res.cookie('cozybite_admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    user: {
      id: admin.id,
      restaurantId: admin.restaurantId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
});

/**
 * Admin Logout
 */
app.post('/api/admin/logout', (req: Request, res: Response) => {
  res.clearCookie('cozybite_admin_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * Admin Current Session
 */
app.get('/api/admin/me', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const restaurant = db.getRestaurantById(req.user!.restaurantId);
  res.json({
    user: req.user,
    restaurant,
  });
});

/**
 * Admin Orders List
 */
app.get('/api/admin/orders', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const orders = db.getOrdersForRestaurant(req.user!.restaurantId);
  res.json({ orders });
});

/**
 * Update Order Status
 */
app.patch('/api/admin/orders/:orderId/status', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses: DbOrder['status'][] = ['received', 'accepted', 'preparing', 'ready', 'served', 'rejected'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid order status transition.' });
    return;
  }

  const updated = db.updateOrderStatus(orderId, req.user!.restaurantId, status);
  if (!updated) {
    res.status(404).json({ error: 'Order not found or unauthorized.' });
    return;
  }

  // Real-Time Socket Event to Customer and Kitchen
  io.to(`order_${updated.id}`).emit('order_status_updated', updated);
  io.to(`res_${req.user!.restaurantId}`).emit('order_status_updated', updated);

  res.json({ success: true, order: updated });
});

/**
 * Update Prep Time
 */
app.patch('/api/admin/orders/:orderId/prep-time', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { minutes } = req.body;

  const updated = db.updatePrepTime(orderId, req.user!.restaurantId, Number(minutes));
  if (!updated) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  io.to(`order_${updated.id}`).emit('order_status_updated', updated);
  res.json({ success: true, order: updated });
});

/**
 * Admin Menu Management
 */
app.get('/api/admin/menu', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const items = db.getMenuForRestaurant(req.user!.restaurantId);
  res.json({ items });
});

app.post('/api/admin/menu', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const { name, category, price, description, image, isVeg, prepTime } = req.body;

  if (!name || !price) {
    res.status(400).json({ error: 'Name and price are required.' });
    return;
  }

  const item = db.addMenuItem({
    restaurantId: req.user!.restaurantId,
    categoryId: 'cat-' + (category || 'main').toLowerCase().replace(/\s+/g, '-'),
    category: category || 'Main Course',
    name: name.trim(),
    description: description?.trim() || '',
    price: Number(price),
    image: image || '/src/assets/images/chole_bhature_1793770178266.jpg',
    isVeg: Boolean(isVeg),
    isAvailable: true,
    prepTime: Number(prepTime) || 15,
  });

  res.status(201).json({ success: true, item });
});

app.put('/api/admin/menu/:id', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updated = db.updateMenuItem(id, req.user!.restaurantId, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Dish not found.' });
    return;
  }
  res.json({ success: true, item: updated });
});

app.delete('/api/admin/menu/:id', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteMenuItem(id, req.user!.restaurantId);
  if (!deleted) {
    res.status(404).json({ error: 'Dish not found.' });
    return;
  }
  res.json({ success: true });
});

app.patch('/api/admin/menu/:id/toggle-availability', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const item = db.menuItems.find(m => m.id === id && m.restaurantId === req.user!.restaurantId);
  if (!item) {
    res.status(404).json({ error: 'Dish not found.' });
    return;
  }
  item.isAvailable = !item.isAvailable;
  res.json({ success: true, item });
});

/**
 * Admin Tables & QR Management
 */
app.get('/api/admin/tables', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const tables = db.getTablesForRestaurant(req.user!.restaurantId);
  const restaurant = db.getRestaurantById(req.user!.restaurantId);

  const tablesWithQRUrls = tables.map(t => ({
    ...t,
    qrUrl: `/menu/${restaurant?.slug || 'cozybite-cafe'}/table/${t.tableToken}`,
  }));

  res.json({ tables: tablesWithQRUrls });
});

app.post('/api/admin/tables', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const { tableNumber, capacity, location } = req.body;
  if (!tableNumber) {
    res.status(400).json({ error: 'Table number is required.' });
    return;
  }

  const table = db.addTable(req.user!.restaurantId, tableNumber.trim(), Number(capacity) || 4, location?.trim());
  res.status(201).json({ success: true, table });
});

app.patch('/api/admin/tables/:id/toggle-status', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const table = db.toggleTableActive(id, req.user!.restaurantId);
  if (!table) {
    res.status(404).json({ error: 'Table not found.' });
    return;
  }
  res.json({ success: true, table });
});

/**
 * Admin Analytics & Ratings
 */
app.get('/api/admin/analytics', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const orders = db.getOrdersForRestaurant(req.user!.restaurantId);
  const totalRevenue = orders.filter(o => o.status !== 'rejected').reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => ['received', 'accepted', 'preparing'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'served').length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const ratings = orders.filter(o => o.rating).map(o => o.rating!.stars);
  const avgRating = ratings.length > 0 ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : 4.9;

  res.json({
    totalRevenue,
    totalOrders: orders.length,
    pendingOrders,
    completedOrders,
    avgOrderValue,
    avgRating,
    recentFeedback: orders.filter(o => o.rating).slice(0, 10).map(o => ({
      customerName: o.customerName,
      tableNumber: o.tableNumber,
      stars: o.rating!.stars,
      comment: o.rating!.comment,
      createdAt: o.rating!.createdAt,
    })),
  });
});

/**
 * Admin Update Settings
 */
app.patch('/api/admin/settings', requireAdminAuth, (req: AuthRequest, res: Response) => {
  const restaurant = db.getRestaurantById(req.user!.restaurantId);
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found.' });
    return;
  }
  const { name, tagline, address, contact, gstRate, defaultPrepTime, isAcceptingOrders } = req.body;
  if (name !== undefined) restaurant.name = name;
  if (tagline !== undefined) restaurant.tagline = tagline;
  if (address !== undefined) restaurant.address = address;
  if (contact !== undefined) restaurant.contact = contact;
  if (gstRate !== undefined) restaurant.settings.gstRate = Number(gstRate);
  if (defaultPrepTime !== undefined) restaurant.settings.defaultPrepTime = Number(defaultPrepTime);
  if (isAcceptingOrders !== undefined) restaurant.settings.isAcceptingOrders = Boolean(isAcceptingOrders);
  
  res.json({ success: true, restaurant });
});

/* ==========================================================================
   VITE DEV MIDDLEWARE / STATIC ASSETS
   ========================================================================== */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`CozyBite full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
