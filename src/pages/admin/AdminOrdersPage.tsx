import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Printer,
  Search,
  Filter,
  Volume2,
  RefreshCw,
  Phone,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { getSocket } from '../../utils/socket.ts';
import { formatCurrency } from '../../utils/orderRules.ts';
import { soundManager } from '../../utils/soundManager.ts';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = getSocket();

    const handleNewOrder = (newOrder: any) => {
      setOrders(prev => [newOrder, ...prev]);
    };

    const handleStatusUpdate = (updatedOrder: any) => {
      setOrders(prev =>
        prev.map(o => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
      );
    };

    socket.on('new_order_placed', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('new_order_placed', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: data.order.status } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAdjustPrepTime = async (orderId: string, currentMinutes: number, delta: number) => {
    const newMinutes = Math.max(5, currentMinutes + delta);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/prep-time`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ minutes: newMinutes }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, estimatedPrepTime: data.order.estimatedPrepTime } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update prep time:', err);
    }
  };

  const printKOT = (order: any) => {
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KOT - ${order.orderNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; font-size: 14px; line-height: 1.4; color: #000; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 12px; }
            .title { font-size: 20px; font-weight: bold; margin: 0; }
            .table-box { font-size: 24px; font-weight: bold; margin: 10px 0; background: #eee; padding: 6px; text-align: center; }
            .meta { font-size: 12px; margin-bottom: 12px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 6px; font-weight: bold; }
            .note { font-size: 11px; font-style: italic; margin-left: 12px; color: #555; }
            .divider { border-bottom: 1px dashed #000; margin: 12px 0; }
            .footer { text-align: center; font-size: 11px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">COZYBITE KITCHEN TICKET</h1>
            <div class="table-box">${order.tableNumber}</div>
            <div class="meta">Order: ${order.orderNumber} | Time: ${new Date(order.createdAt).toLocaleTimeString()}</div>
            <div class="meta">Guest: ${order.customerName}</div>
          </div>
          <div>
            ${order.items.map((i: any) => `
              <div class="item">
                <span>[ ] ${i.quantity}x ${i.name}</span>
                <span>${i.isVeg ? '(VEG)' : '(NV)'}</span>
              </div>
              ${i.specialNote ? `<div class="note">Note: ${i.specialNote}</div>` : ''}
            `).join('')}
          </div>
          ${order.specialInstructions ? `
            <div class="divider"></div>
            <div><strong>Instructions:</strong> ${order.specialInstructions}</div>
          ` : ''}
          <div class="divider"></div>
          <div class="footer">
            Kitchen Preparation Ticket · Automatic Table Scan
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' ? true : order.status === filter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">Received (New)</span>;
      case 'accepted':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">Accepted</span>;
      case 'preparing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">In Kitchen</span>;
      case 'ready':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">Ready for Pickup</span>;
      case 'served':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Served</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-500/20 text-stone-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <ChefHat className="w-6 h-6 text-[#E07A5F]" />
            <span>Kitchen Order Ticket (KOT) Board</span>
          </h2>
          <p className="text-xs text-[#A8988D] mt-0.5">
            Real-time incoming orders with automatic table recognition and instant status synchronization.
          </p>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7E74]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search table, order, guest..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#241C18] border border-[#3A2D25] text-xs text-white placeholder-[#78665B] focus:outline-none focus:border-[#C85A32]"
            />
          </div>
          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-[#281F1A] hover:bg-[#342721] border border-[#3E3028] text-[#C5B5A5] hover:text-white transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: 'all', label: 'All Orders', count: orders.length },
          { key: 'received', label: 'New Received', count: orders.filter(o => o.status === 'received').length },
          { key: 'accepted', label: 'Accepted', count: orders.filter(o => o.status === 'accepted').length },
          { key: 'preparing', label: 'Cooking', count: orders.filter(o => o.status === 'preparing').length },
          { key: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
          { key: 'served', label: 'Served', count: orders.filter(o => o.status === 'served').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              filter === tab.key
                ? 'bg-[#C85A32] text-white shadow-md'
                : 'bg-[#221A16] text-[#A69588] hover:text-white hover:bg-[#2C211C] border border-[#342721]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filter === tab.key ? 'bg-white/20 text-white' : 'bg-[#31251F] text-[#8E7E74]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#8E7E74]">
          Loading active kitchen tickets...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-[#211915] rounded-2xl border border-[#362B25]">
          <ChefHat className="w-10 h-10 text-[#6B5A50] mx-auto mb-2" />
          <h4 className="font-display font-semibold text-white text-sm">No Orders Found</h4>
          <p className="text-xs text-[#8E7E74] mt-1">
            {filter === 'all'
              ? 'Waiting for customers to order from table QR codes.'
              : `No orders in "${filter}" status right now.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-lg ${
                order.status === 'received'
                  ? 'bg-[#271C17] border-amber-600/50 ring-1 ring-amber-500/30'
                  : order.status === 'preparing'
                  ? 'bg-[#251A15] border-orange-600/40'
                  : 'bg-[#201815] border-[#362B25]'
              }`}
            >
              {/* Order Card Header */}
              <div className="p-4 border-b border-[#362B25] bg-[#1C1512]/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-[#362B25] px-2 py-0.5 rounded">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-[#A69588]">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Table Highlight Banner */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#31251F]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-display font-bold text-lg text-white tracking-wide">
                      {order.tableNumber}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-[#D5C5B8]">{order.customerName}</p>
                    {order.whatsappNumber && (
                      <p className="text-[11px] text-[#8E7E74] font-mono flex items-center gap-1 justify-end">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{order.whatsappNumber}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 space-y-2.5 flex-1">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start justify-between text-xs gap-3">
                    <div className="flex items-start gap-2">
                      <span className={`w-3.5 h-3.5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                        item.isVeg ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400' : 'border-amber-700 bg-amber-950/40 text-amber-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-400' : 'bg-amber-500'}`} />
                      </span>
                      <div>
                        <span className="font-bold text-white mr-1.5">{item.quantity}x</span>
                        <span className="text-[#E2D4C8]">{item.name}</span>
                        {item.specialNote && (
                          <p className="text-[11px] text-[#D88D73] italic mt-0.5">
                            Note: {item.specialNote}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-[#A69588] shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                {/* Customer Special Instructions */}
                {order.specialInstructions && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#2F211A] border border-[#443026] text-[11px] text-[#E07A5F]">
                    <span className="font-bold uppercase tracking-wider block text-[10px] text-[#A69588] mb-0.5">
                      Chef Instructions:
                    </span>
                    {order.specialInstructions}
                  </div>
                )}
              </div>

              {/* Order Footer Controls */}
              <div className="p-4 border-t border-[#362B25] bg-[#1B1411] space-y-3">
                {/* Total & Prep Time Adjuster */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#8E7E74] block uppercase">Total Bill</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  {/* Kitchen Prep Time Buttons */}
                  <div className="flex items-center gap-1.5 bg-[#251C17] px-2.5 py-1 rounded-xl border border-[#382B24]">
                    <Clock className="w-3.5 h-3.5 text-[#E07A5F]" />
                    <span className="text-[11px] font-mono text-[#D5C5B8] font-bold">
                      {order.estimatedPrepTime}m
                    </span>
                    <button
                      onClick={() => handleAdjustPrepTime(order.id, order.estimatedPrepTime, -5)}
                      className="w-5 h-5 rounded bg-[#33251F] hover:bg-[#3D2C25] text-white flex items-center justify-center text-xs ml-1"
                      title="-5 min"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleAdjustPrepTime(order.id, order.estimatedPrepTime, 5)}
                      className="w-5 h-5 rounded bg-[#33251F] hover:bg-[#3D2C25] text-white flex items-center justify-center text-xs"
                      title="+5 min"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Print Slip */}
                  <button
                    onClick={() => printKOT(order)}
                    className="p-2 rounded-xl bg-[#281F1A] hover:bg-[#342721] text-[#C5B5A5] hover:text-white transition-colors border border-[#3E3028]"
                    title="Print KOT Slip"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Status Transition Action Buttons */}
                <div className="pt-1">
                  {order.status === 'received' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStatusChange(order.id, 'accepted')}
                        disabled={updatingId === order.id}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'rejected')}
                        disabled={updatingId === order.id}
                        className="w-full py-2 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'accepted' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                      disabled={updatingId === order.id}
                      className="w-full py-2 px-3 rounded-xl bg-[#C85A32] hover:bg-[#B34E29] text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-colors"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Start Cooking in Kitchen</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'ready')}
                      disabled={updatingId === order.id}
                      className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Ready for Pickup</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'served')}
                      disabled={updatingId === order.id}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Served to Table</span>
                    </button>
                  )}

                  {order.status === 'served' && (
                    <div className="text-center py-1 text-xs text-emerald-400 font-medium flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Order Completed & Served</span>
                    </div>
                  )}

                  {order.status === 'rejected' && (
                    <div className="text-center py-1 text-xs text-red-400 font-medium">
                      Order Declined
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
