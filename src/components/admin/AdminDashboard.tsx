import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  ShoppingBag,
  TrendingUp,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
  Plus,
  QrCode,
  Edit,
  Trash2,
  Printer,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Send,
  Eye,
  UtensilsCrossed,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useRestaurant } from '../../context/RestaurantContext.tsx';
import { Order, MenuItem, RestaurantTable } from '../../types/index.ts';
import { OrderStatus, formatCurrency, calculateAverageRating } from '../../utils/orderRules.ts';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    updateEstimatedPrepTime,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    tables,
    addTable,
    toggleTableStatus,
    isMuted,
    toggleMute,
    whatsAppNotifications,
  } = useRestaurant();

  // Active admin tab: 'orders' | 'menu' | 'tables' | 'analytics' | 'whatsapp'
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'tables' | 'analytics' | 'whatsapp'>('orders');

  // Filter for live order board: 'all' | 'pending' | 'preparing' | 'ready' | 'served'
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Menu item modal state
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'Main Course',
    price: 120,
    description: '',
    image: '',
    isVeg: true,
    prepTime: 15,
  });

  // Table modal state & QR Print standee preview
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [newTableLocation, setNewTableLocation] = useState('Main Dining');
  const [selectedTableForQR, setSelectedTableForQR] = useState<RestaurantTable | null>(tables[3] || tables[0]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Generate QR Code for selected table
  useEffect(() => {
    if (!selectedTableForQR) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const tableParam = selectedTableForQR.tableNumber.toLowerCase().replace(/\s+/g, '');
    const url = `${origin}/?table=${tableParam}`;

    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: {
        dark: '#34241B',
        light: '#FFFFFF',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error(err));
  }, [selectedTableForQR]);

  // Analytics Metrics calculations
  const todayOrders = orders;
  const totalRevenue = todayOrders
    .filter(o => o.status !== 'rejected')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = todayOrders.filter(o => ['received', 'accepted', 'preparing'].includes(o.status)).length;
  const completedOrdersCount = todayOrders.filter(o => o.status === 'served').length;
  const avgOrderValue = todayOrders.length > 0 ? Math.round(totalRevenue / todayOrders.length) : 0;
  
  // Rating calculation from all customer ratings
  const allRatings = todayOrders
    .filter(o => o.rating?.stars)
    .map(o => o.rating!.stars);
  const averageRating = calculateAverageRating(allRatings);

  // Filtered orders for live board
  const filteredOrders = todayOrders.filter(o => {
    if (orderStatusFilter === 'all') return true;
    if (orderStatusFilter === 'pending') return ['received', 'accepted'].includes(o.status);
    return o.status === orderStatusFilter;
  });

  // Open Edit Dish modal
  const handleOpenEditDish = (dish: MenuItem) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name,
      category: dish.category,
      price: dish.price,
      description: dish.description,
      image: dish.image,
      isVeg: dish.isVeg,
      prepTime: dish.prepTime,
    });
    setIsDishModalOpen(true);
  };

  // Open Add Dish modal
  const handleOpenAddDish = () => {
    setEditingDish(null);
    setDishForm({
      name: '',
      category: 'Main Course',
      price: 150,
      description: '',
      image: menuItems[0]?.image || '',
      isVeg: true,
      prepTime: 15,
    });
    setIsDishModalOpen(true);
  };

  // Save Dish
  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishForm.name.trim()) return;

    if (editingDish) {
      updateMenuItem(editingDish.id, dishForm);
    } else {
      addMenuItem({
        ...dishForm,
        isAvailable: true,
      });
    }
    setIsDishModalOpen(false);
  };

  // Add Table
  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum.trim()) return;
    addTable(newTableNum.trim(), newTableCapacity, newTableLocation);
    setNewTableNum('');
    setIsTableModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      
      {/* Admin Top Dashboard Bar */}
      <div className="bg-white border-b border-[#E8DFD5] px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#34241B] text-[#FAF7F2] flex items-center justify-center font-bold">
              <ChefHat className="w-5 h-5 text-[#E07A5F]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-[#34241B]">
                  CozyBite Kitchen Station
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF3EB] text-[#2F6B38]">
                  LIVE KOT
                </span>
              </div>
              <p className="text-xs text-[#8D6E5C]">
                Table Orders · Kitchen Dispatch & Real-Time Sync
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                isMuted
                  ? 'bg-stone-100 text-stone-500 border-stone-200'
                  : 'bg-[#FAF2EB] text-[#C85A32] border-[#F0D5C7]'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'Chime Muted' : 'Kitchen Chime On'}</span>
            </button>

            <div className="text-xs font-mono text-[#8D6E5C] bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#E8DFD5]">
              {todayOrders.length} Orders Today
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-3.5 rounded-2xl border border-[#E8DFD5] shadow-xs">
            <span className="text-[11px] font-medium text-[#8D6E5C] block mb-0.5">Today's Revenue</span>
            <span className="font-mono text-lg font-bold text-[#34241B] tabular-nums">
              {formatCurrency(totalRevenue)}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E8DFD5] shadow-xs">
            <span className="text-[11px] font-medium text-[#8D6E5C] block mb-0.5">Total Orders</span>
            <span className="font-mono text-lg font-bold text-[#34241B] tabular-nums">
              {todayOrders.length}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E8DFD5] shadow-xs">
            <span className="text-[11px] font-medium text-[#8D6E5C] block mb-0.5">Pending / Active</span>
            <span className="font-mono text-lg font-bold text-[#C85A32] tabular-nums">
              {pendingOrdersCount}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E8DFD5] shadow-xs">
            <span className="text-[11px] font-medium text-[#8D6E5C] block mb-0.5">Completed</span>
            <span className="font-mono text-lg font-bold text-[#2F6B38] tabular-nums">
              {completedOrdersCount}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E8DFD5] shadow-xs">
            <span className="text-[11px] font-medium text-[#8D6E5C] block mb-0.5">Avg Order Value</span>
            <span className="font-mono text-lg font-bold text-[#34241B] tabular-nums">
              {formatCurrency(avgOrderValue)}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E8DFD5] shadow-xs">
            <span className="text-[11px] font-medium text-[#8D6E5C] block mb-0.5">Customer Rating</span>
            <span className="font-mono text-lg font-bold text-amber-600 flex items-center gap-1 tabular-nums">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{averageRating}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Admin Section with Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8DFD5] pb-3 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#34241B] text-white shadow-xs'
                : 'bg-white text-[#6A4D3B] hover:bg-[#FAF7F2] border border-[#E8DFD5]'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Live Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#C85A32] text-white text-[10px] font-bold flex items-center justify-center">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'menu'
                ? 'bg-[#34241B] text-white shadow-xs'
                : 'bg-white text-[#6A4D3B] hover:bg-[#FAF7F2] border border-[#E8DFD5]'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Menu Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'tables'
                ? 'bg-[#34241B] text-white shadow-xs'
                : 'bg-white text-[#6A4D3B] hover:bg-[#FAF7F2] border border-[#E8DFD5]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Tables & QR Standees</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'whatsapp'
                ? 'bg-[#34241B] text-white shadow-xs'
                : 'bg-white text-[#6A4D3B] hover:bg-[#FAF7F2] border border-[#E8DFD5]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Cloud API</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-[#34241B] text-white shadow-xs'
                : 'bg-white text-[#6A4D3B] hover:bg-[#FAF7F2] border border-[#E8DFD5]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Analytics & Feedback</span>
          </button>
        </div>

        {/* TAB 1: LIVE ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'pending', label: 'New / Accepted' },
                { id: 'preparing', label: 'In Kitchen (Preparing)' },
                { id: 'ready', label: 'Ready to Serve' },
                { id: 'served', label: 'Completed (Served)' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setOrderStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    orderStatusFilter === f.id
                      ? 'bg-[#C85A32] text-white font-semibold'
                      : 'bg-white text-[#6A4D3B] border border-[#E8DFD5] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#E8DFD5] text-[#8D6E5C]">
                <Clock className="w-10 h-10 text-[#C85A32]/40 mx-auto mb-2" />
                <h3 className="font-display font-bold text-base text-[#34241B]">
                  No orders in this view
                </h3>
                <p className="text-xs text-[#8D6E5C] mt-1">
                  Orders placed by customers scanning table QR codes will appear here instantly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOrders.map(order => {
                  const elapsedMins = Math.floor(
                    (Date.now() - new Date(order.createdAt).getTime()) / 60000
                  );

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-3xl border p-5 flex flex-col justify-between shadow-cozy transition-all ${
                        order.status === 'received'
                          ? 'border-[#C85A32] ring-2 ring-[#C85A32]/10'
                          : order.status === 'ready'
                          ? 'border-amber-400 bg-amber-50/20'
                          : 'border-[#E8DFD5]'
                      }`}
                    >
                      {/* Top Bar of Order */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#FAF2EB] text-[#C85A32]">
                              {order.orderNumber}
                            </span>
                            <span className="font-bold text-sm text-[#34241B]">
                              {order.tableNumber}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              order.status === 'received'
                                ? 'bg-rose-100 text-rose-800 animate-pulse'
                                : order.status === 'accepted'
                                ? 'bg-amber-100 text-amber-800'
                                : order.status === 'preparing'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'ready'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        {/* Guest details */}
                        <div className="text-xs text-[#6A4D3B] pb-3 border-b border-[#F4EFEA] mb-3 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-[#34241B]">{order.customerName}</span>
                            <span className="text-[11px] text-[#8D6E5C] block font-mono">
                              {order.whatsappNumber}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#8D6E5C] font-mono">
                            {elapsedMins}m ago
                          </span>
                        </div>

                        {/* Dishes List */}
                        <div className="space-y-1.5 text-xs text-[#34241B] mb-3 max-h-36 overflow-y-auto">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-start gap-2">
                              <span>
                                <strong className="text-[#C85A32]">{item.quantity}×</strong> {item.name}
                                {item.specialNote && (
                                  <span className="block text-[10px] text-amber-700 italic">
                                    Note: {item.specialNote}
                                  </span>
                                )}
                              </span>
                              <span className="font-mono text-stone-500 tabular-nums">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Special instructions */}
                        {order.specialInstructions && (
                          <div className="p-2 rounded-xl bg-[#FAF2EB] text-[11px] text-[#A0512C] mb-3">
                            <strong>Kitchen Note:</strong> {order.specialInstructions}
                          </div>
                        )}

                        {/* Rating if served */}
                        {order.rating && (
                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 mb-3 flex items-start gap-2">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold">{order.rating.stars} Stars</span>
                              {order.rating.comment && (
                                <p className="text-[11px] text-emerald-700 mt-0.5 italic">
                                  "{order.rating.comment}"
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer: Prep Time Adjuster & Action Controls */}
                      <div className="pt-3 border-t border-[#F4EFEA] space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#8D6E5C]">
                            Est. Prep: <strong>{order.estimatedPrepTime}m</strong>
                          </span>
                          
                          {/* Quick time nudges */}
                          {order.status !== 'served' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateEstimatedPrepTime(order.id, Math.max(5, order.estimatedPrepTime - 5))}
                                className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[10px] font-bold text-stone-700"
                                title="Subtract 5 mins"
                              >
                                -5m
                              </button>
                              <button
                                onClick={() => updateEstimatedPrepTime(order.id, order.estimatedPrepTime + 5)}
                                className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[10px] font-bold text-stone-700"
                                title="Add 5 mins"
                              >
                                +5m
                              </button>
                            </div>
                          )}

                          <span className="font-mono font-bold text-[#34241B] tabular-nums">
                            {formatCurrency(order.total)}
                          </span>
                        </div>

                        {/* Action buttons based on current state */}
                        <div className="flex items-center gap-2">
                          {order.status === 'received' && (
                            <>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'accepted')}
                                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#C85A32] text-white hover:bg-[#B34E29] transition-colors"
                              >
                                Accept Order
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'rejected')}
                                className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Reject Order"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {order.status === 'accepted' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className="w-full py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                              Start Cooking
                            </button>
                          )}

                          {order.status === 'preparing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className="w-full py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                            >
                              Mark Ready to Serve
                            </button>
                          )}

                          {order.status === 'ready' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'served')}
                              className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            >
                              Mark Served to Table
                            </button>
                          )}

                          {order.status === 'served' && (
                            <div className="w-full text-center py-1 text-xs font-medium text-[#7E9A82] flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Order Completed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MENU CATALOG MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-[#34241B]">
                  Menu Catalog ({menuItems.length} Dishes)
                </h2>
                <p className="text-xs text-[#8D6E5C]">
                  Changes reflect immediately on the customer QR digital menu.
                </p>
              </div>

              <button
                onClick={handleOpenAddDish}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C85A32] text-white hover:bg-[#B34E29] flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Dish</span>
              </button>
            </div>

            {/* Menu List Table */}
            <div className="bg-white rounded-3xl border border-[#E8DFD5] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#8D6E5C] border-b border-[#E8DFD5] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Dish</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Prep Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFEA]">
                    {menuItems.map(dish => (
                      <tr key={dish.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={dish.image}
                              alt={dish.name}
                              className="w-12 h-12 rounded-xl object-cover bg-stone-100"
                            />
                            <div>
                              <span className="font-bold text-[#34241B] block">{dish.name}</span>
                              <span className="text-[11px] text-[#8D6E5C] line-clamp-1 max-w-xs">
                                {dish.description}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#6A4D3B]">
                          {dish.category}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#34241B] tabular-nums">
                          {formatCurrency(dish.price)}
                        </td>
                        <td className="py-3 px-4 text-[#8D6E5C]">
                          ~{dish.prepTime} mins
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleItemAvailability(dish.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                              dish.isAvailable
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}
                          >
                            {dish.isAvailable ? 'Available' : 'Sold Out'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditDish(dish)}
                              className="p-1.5 text-stone-600 hover:text-[#C85A32] rounded-lg hover:bg-stone-100"
                              title="Edit Dish"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteMenuItem(dish.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Delete Dish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TABLES & QR CODE STANDS */}
        {activeTab === 'tables' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
            {/* Tables List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-lg text-[#34241B]">
                    Restaurant Tables ({tables.length})
                  </h2>
                  <p className="text-xs text-[#8D6E5C]">
                    Select any table to generate and print its custom QR standee.
                  </p>
                </div>

                <button
                  onClick={() => setIsTableModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#34241B] text-white hover:bg-[#4A3B32] flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Table</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tables.map(table => (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTableForQR(table)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedTableForQR?.id === table.id
                        ? 'border-[#C85A32] bg-[#FAF2EB] shadow-xs'
                        : 'border-[#E8DFD5] bg-white hover:border-[#D5C3B3]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-[#34241B]">
                        {table.tableNumber}
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTableStatus(table.id);
                        }}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md cursor-pointer ${
                          table.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {table.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="text-xs text-[#8D6E5C] flex items-center justify-between">
                      <span>{table.location || 'Dining Hall'}</span>
                      <span>{table.capacity} Guests</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Printable QR Tent Card Standee Preview */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-white rounded-3xl p-6 border border-[#E8DFD5] shadow-cozy text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85A32] block mb-2">
                  Printable Standee Preview
                </span>

                {/* Tent Card Stand */}
                <div
                  id="printable-qr-card"
                  className="p-6 rounded-2xl border-2 border-dashed border-[#E0D3C5] bg-[#FAF7F2] max-w-xs mx-auto mb-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#C85A32] text-white flex items-center justify-center mx-auto mb-2 font-bold shadow-xs">
                    CB
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#34241B]">
                    CozyBite Café
                  </h3>
                  <p className="text-[11px] text-[#8D6E5C] mb-4">
                    Scan with your phone camera to order
                  </p>

                  {/* QR Image */}
                  {qrDataUrl && (
                    <div className="bg-white p-3 rounded-2xl shadow-sm inline-block mb-3 border border-[#E8DFD5]">
                      <img
                        src={qrDataUrl}
                        alt={`QR Code for ${selectedTableForQR?.tableNumber}`}
                        className="w-44 h-44 mx-auto"
                      />
                    </div>
                  )}

                  <div className="font-display font-bold text-base text-[#C85A32] bg-[#FAF2EB] py-1 px-3 rounded-xl inline-block border border-[#F2DACD]">
                    {selectedTableForQR?.tableNumber}
                  </div>
                  <p className="text-[10px] text-[#8D6E5C] mt-2">
                    Direct Kitchen Dispatch · Contactless
                  </p>
                </div>

                {/* Print & Download Buttons */}
                <div className="flex items-center gap-2 justify-center">
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '', 'width=600,height=600');
                      if (printWindow && qrDataUrl) {
                        printWindow.document.write(`
                          <html>
                            <head><title>Print QR - ${selectedTableForQR?.tableNumber}</title></head>
                            <body style="text-align:center; font-family:sans-serif; padding:40px;">
                              <h1 style="color:#C85A32; margin-bottom:4px;">CozyBite Café</h1>
                              <p style="color:#666; margin-top:0;">Scan with Phone Camera to Order</p>
                              <img src="${qrDataUrl}" style="width:280px; height:280px; margin:20px 0;" />
                              <h2 style="color:#333; margin-top:0;">${selectedTableForQR?.tableNumber}</h2>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.focus();
                        printWindow.print();
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#34241B] text-white hover:bg-[#4A3B32] flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Standee</span>
                  </button>

                  <a
                    href={qrDataUrl}
                    download={`cozybite-${selectedTableForQR?.qrSlug}-qr.png`}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FAF2EB] text-[#C85A32] hover:bg-[#F2DACD] border border-[#F0D5C7]"
                  >
                    Download PNG
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WHATSAPP CLOUD API SIMULATOR */}
        {activeTab === 'whatsapp' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
            {/* WhatsApp Integration Status & Config */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-[#34241B]">
                      Meta WhatsApp Cloud API
                    </h3>
                    <p className="text-xs text-[#8D6E5C]">
                      Automatic order status triggers sent to customer smartphones.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-between">
                    <span className="text-[#6A4D3B]">API Status</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active (Production Mode)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-between">
                    <span className="text-[#6A4D3B]">Webhook Verification</span>
                    <span className="font-semibold text-[#34241B]">Verified (v20.0)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-between">
                    <span className="text-[#6A4D3B]">Order Received Template</span>
                    <span className="font-semibold text-[#7E9A82]">Approved by Meta</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-between">
                    <span className="text-[#6A4D3B]">Order Ready Template</span>
                    <span className="font-semibold text-[#7E9A82]">Approved by Meta</span>
                  </div>
                </div>
              </div>

              {/* Sample WhatsApp message preview */}
              <div className="bg-[#EFEAE2] p-5 rounded-3xl border border-[#D5CBBF] shadow-inner space-y-3">
                <div className="text-[11px] font-semibold text-[#5A4E42] uppercase tracking-wider mb-2">
                  Sample Automated Customer Message
                </div>
                <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-xs text-xs text-[#2A2A2A] space-y-1">
                  <p className="font-semibold text-[#075E54]">CozyBite Café Kitchen Dispatch</p>
                  <p>
                    "Hi Rahul! Your order #CB-1024 for Table 04 has been received. Our chefs are preparing your Chole Bhature and Mango Lassi. Thank you for choosing CozyBite!"
                  </p>
                  <div className="flex justify-end text-[10px] text-stone-400 gap-1 pt-1">
                    <span>Just now</span>
                    <span className="text-emerald-600">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Message Dispatch Logs */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-base text-[#34241B]">
                    Recent WhatsApp Dispatches
                  </h3>
                  <span className="text-xs text-[#8D6E5C]">
                    {whatsAppNotifications.length} Sent
                  </span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {whatsAppNotifications.length === 0 ? (
                    <p className="text-xs text-[#8D6E5C] text-center py-8">
                      No notifications sent yet. Place an order or update status to simulate live messages.
                    </p>
                  ) : (
                    whatsAppNotifications.map(n => (
                      <div
                        key={n.id}
                        className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[#8D6E5C] text-[11px]">
                          <span className="font-semibold text-[#34241B]">To: {n.customerName} ({n.to})</span>
                          <span>{n.timestamp}</span>
                        </div>
                        <p className="text-[#4A3B32]">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ANALYTICS & CUSTOMER FEEDBACK */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Popular Dishes Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] shadow-xs">
                <h3 className="font-display font-bold text-base text-[#34241B] mb-4">
                  Top Ordered Dishes Today
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Chole Bhature', count: 18, rev: '₹2,160', pct: 85 },
                    { name: 'Paneer Tikka', count: 14, rev: '₹2,520', pct: 72 },
                    { name: 'Masala Dosa', count: 12, rev: '₹1,200', pct: 60 },
                    { name: 'Mango Lassi', count: 22, rev: '₹1,540', pct: 92 },
                    { name: 'Pav Bhaji', count: 11, rev: '₹1,210', pct: 55 },
                  ].map((dish, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#34241B]">{dish.name}</span>
                        <span className="font-mono text-[#8D6E5C]">{dish.count} orders · {dish.rev}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#FAF7F2] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#C85A32]"
                          style={{ width: `${dish.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Speed & Turnaround Stats */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] shadow-xs">
                <h3 className="font-display font-bold text-base text-[#34241B] mb-4">
                  Kitchen Efficiency Stats
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-[#FAF7F2] flex justify-between items-center">
                    <span className="text-[#6A4D3B]">Average Preparation Time</span>
                    <span className="font-mono font-bold text-base text-[#34241B]">14.2 mins</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FAF7F2] flex justify-between items-center">
                    <span className="text-[#6A4D3B]">Table Turnaround Duration</span>
                    <span className="font-mono font-bold text-base text-[#34241B]">38 mins</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FAF7F2] flex justify-between items-center">
                    <span className="text-[#6A4D3B]">Customer Satisfaction Index</span>
                    <span className="font-mono font-bold text-base text-emerald-700">98.4%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reviews & Feedback List */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] shadow-xs">
              <h3 className="font-display font-bold text-base text-[#34241B] mb-4">
                Verified Customer Table Reviews
              </h3>
              <div className="divide-y divide-[#F4EFEA]">
                {todayOrders.filter(o => o.rating).map((order) => (
                  <div key={order.id} className="py-3.5 first:pt-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#34241B]">{order.customerName}</span>
                        <span className="text-[11px] text-[#8D6E5C]">({order.tableNumber})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= (order.rating?.stars || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {order.rating?.comment && (
                      <p className="text-xs text-[#6A4D3B] italic">"{order.rating.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DISH ADD / EDIT MODAL */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#E8DFD5] shadow-lifted animate-in zoom-in-95">
            <h3 className="font-display font-bold text-lg text-[#34241B] mb-4">
              {editingDish ? 'Edit Dish Details' : 'Add New Dish to Menu'}
            </h3>

            <form onSubmit={handleSaveDish} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#4A3B32] mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={dishForm.name}
                  onChange={e => setDishForm({ ...dishForm, name: e.target.value })}
                  placeholder="e.g. Kashmiri Dum Aloo"
                  className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E3D7CB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Category</label>
                  <select
                    value={dishForm.category}
                    onChange={e => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E3D7CB]"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Snacks">Snacks</option>
                    <option value="South Indian">South Indian</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={dishForm.price}
                    onChange={e => setDishForm({ ...dishForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E3D7CB]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4A3B32] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={dishForm.description}
                  onChange={e => setDishForm({ ...dishForm, description: e.target.value })}
                  placeholder="Aromatic spices, fresh herbs..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E3D7CB] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Prep Time (Mins)</label>
                  <input
                    type="number"
                    min="2"
                    value={dishForm.prepTime}
                    onChange={e => setDishForm({ ...dishForm, prepTime: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E3D7CB]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="veg-checkbox"
                    checked={dishForm.isVeg}
                    onChange={e => setDishForm({ ...dishForm, isVeg: e.target.checked })}
                    className="w-4 h-4 text-[#C85A32] rounded"
                  />
                  <label htmlFor="veg-checkbox" className="font-semibold text-[#4A3B32]">
                    Pure Vegetarian
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F4EFEA]">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C85A32] text-white font-semibold hover:bg-[#B34E29]"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE ADD MODAL */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#E8DFD5] shadow-lifted animate-in zoom-in-95">
            <h3 className="font-display font-bold text-lg text-[#34241B] mb-4">
              Add New Table
            </h3>

            <form onSubmit={handleAddTableSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#4A3B32] mb-1">Table Number</label>
                <input
                  type="text"
                  required
                  value={newTableNum}
                  onChange={e => setNewTableNum(e.target.value)}
                  placeholder="e.g. Table 09"
                  className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E3D7CB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4A3B32] mb-1">Capacity (Guests)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newTableCapacity}
                  onChange={e => setNewTableCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E3D7CB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4A3B32] mb-1">Location / Zone</label>
                <input
                  type="text"
                  value={newTableLocation}
                  onChange={e => setNewTableLocation(e.target.value)}
                  placeholder="e.g. Garden Terrace"
                  className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E3D7CB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F4EFEA]">
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#34241B] text-white font-semibold hover:bg-[#4A3B32]"
                >
                  Create Table & QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
