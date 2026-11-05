import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  Star,
  ChefHat,
  ArrowRight,
  UtensilsCrossed,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext.tsx';
import { getSocket } from '../../utils/socket.ts';
import { formatCurrency } from '../../utils/orderRules.ts';
import { adminFetch } from '../../utils/adminApi.ts';

export const AdminDashboardPage: React.FC = () => {
  const { user, restaurant } = useAdminAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        adminFetch('/api/admin/analytics'),
        adminFetch('/api/admin/orders'),
      ]);

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setAnalytics(aData);
      }

      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setRecentOrders(oData.orders?.slice(0, 5) || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const socket = getSocket();
    const handleNewOrder = () => loadData();
    const handleStatusUpdate = () => loadData();

    socket.on('new_order_placed', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('new_order_placed', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">New Order</span>;
      case 'accepted':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">Accepted</span>;
      case 'preparing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">Cooking</span>;
      case 'ready':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">Ready</span>;
      case 'served':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Served</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-500/20 text-stone-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#281D17] to-[#1F1713] p-6 sm:p-8 rounded-2xl border border-[#3A2D25] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[#E07A5F] uppercase">
            Service Console
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
            Welcome back, {user?.name || 'Chef'}!
          </h2>
          <p className="text-xs sm:text-sm text-[#AFA196] mt-1 max-w-xl">
            {restaurant?.name} is live. Customers are scanning table QR codes and receiving real-time preparation updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/admin/orders"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B34E29] text-white text-xs font-semibold shadow-md transition-all hover:scale-[1.02]"
          >
            <ChefHat className="w-4 h-4" />
            <span>Open KOT Kitchen Board</span>
          </Link>
          <a
            href={`/menu/${restaurant?.slug || 'cozybite-cafe'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C211C] hover:bg-[#382B24] border border-[#44332B] text-white text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Customer View</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#211915] p-5 rounded-2xl border border-[#362B25] shadow-sm">
          <div className="flex items-center justify-between text-[#8E7E74] mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Today's Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatCurrency(analytics?.totalRevenue || 0)}
          </div>
          <p className="text-[11px] text-[#A69588] mt-1">From active dining orders</p>
        </div>

        <div className="bg-[#211915] p-5 rounded-2xl border border-[#362B25] shadow-sm">
          <div className="flex items-center justify-between text-[#8E7E74] mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Active In Kitchen</span>
            <ChefHat className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {analytics?.pendingOrders ?? 0}
          </div>
          <p className="text-[11px] text-[#A69588] mt-1">Pending & preparing</p>
        </div>

        <div className="bg-[#211915] p-5 rounded-2xl border border-[#362B25] shadow-sm">
          <div className="flex items-center justify-between text-[#8E7E74] mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Completed Orders</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {analytics?.completedOrders ?? 0}
          </div>
          <p className="text-[11px] text-[#A69588] mt-1">Served to tables today</p>
        </div>

        <div className="bg-[#211915] p-5 rounded-2xl border border-[#362B25] shadow-sm">
          <div className="flex items-center justify-between text-[#8E7E74] mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Customer Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono flex items-center gap-1.5">
            <span>{analytics?.avgRating || '4.9'}</span>
            <span className="text-xs text-[#8E7E74] font-normal">/ 5.0</span>
          </div>
          <p className="text-[11px] text-[#A69588] mt-1">From verified dining reviews</p>
        </div>
      </div>

      {/* Main Grid: Recent KOT Activity + Quick Management Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Kitchen Orders Column */}
        <div className="lg:col-span-2 bg-[#211915] rounded-2xl border border-[#362B25] overflow-hidden">
          <div className="p-5 border-b border-[#362B25] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#E07A5F]" />
              <h3 className="font-display font-semibold text-white text-base">
                Recent Dining Orders
              </h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs text-[#E07A5F] hover:text-[#F29C83] flex items-center gap-1 font-medium"
            >
              <span>View All KOTs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#2E241E]">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8E7E74]">
                No orders placed yet today. Orders will appear here as soon as guests scan table QR codes.
              </div>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="p-4 hover:bg-[#281E19] transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-white">
                        {order.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#362B25] text-[#E07A5F]">
                        {order.tableNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-[#A8988D] truncate">
                      {order.customerName} · {order.items?.length || 0} items ({order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')})
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-white">
                      {formatCurrency(order.total)}
                    </div>
                    <div className="text-[10px] text-[#8E7E74] flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{order.estimatedPrepTime}m prep</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shortcuts & Quick Actions Column */}
        <div className="space-y-4">
          <div className="bg-[#211915] p-5 rounded-2xl border border-[#362B25]">
            <h3 className="font-display font-semibold text-white text-sm mb-3">
              Management Hub
            </h3>
            <div className="space-y-2.5">
              <Link
                to="/admin/menu"
                className="flex items-center justify-between p-3 rounded-xl bg-[#291F1A] hover:bg-[#332720] border border-[#3C2E25] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C85A32]/20 text-[#E07A5F] flex items-center justify-center">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-[#E07A5F] transition-colors">
                      Menu Catalog
                    </h4>
                    <p className="text-[10px] text-[#8E7E74]">Edit dishes, prices & veg badges</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8E7E74] group-hover:text-white transition-colors" />
              </Link>

              <Link
                to="/admin/tables"
                className="flex items-center justify-between p-3 rounded-xl bg-[#291F1A] hover:bg-[#332720] border border-[#3C2E25] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      Table QR Standees
                    </h4>
                    <p className="text-[10px] text-[#8E7E74]">Generate & print table QR codes</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8E7E74] group-hover:text-white transition-colors" />
              </Link>

              <Link
                to="/admin/analytics"
                className="flex items-center justify-between p-3 rounded-xl bg-[#291F1A] hover:bg-[#332720] border border-[#3C2E25] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                      Customer Reviews
                    </h4>
                    <p className="text-[10px] text-[#8E7E74]">Ratings & post-meal feedback</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8E7E74] group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-[#261E1A] p-4 rounded-xl border border-[#3D3027] text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Zero Customer Manual Table Selection</p>
                <p className="text-[#A09084] text-[11px] mt-0.5">
                  Tables are automatically identified through the unique QR token embedded in the table URL.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
