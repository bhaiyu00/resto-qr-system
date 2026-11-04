import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  Tags,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  BellOff,
  Radio,
  Menu as MenuIcon,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext.tsx';
import { getSocket } from '../utils/socket.ts';
import { soundManager } from '../utils/soundManager.ts';

export const AdminLayout: React.FC = () => {
  const { user, restaurant, logout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [liveOrdersCount, setLiveOrdersCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const navigate = useNavigate();

  // Socket connection to listen for incoming kitchen orders
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    if (user?.restaurantId) {
      socket.emit('join_restaurant', user.restaurantId);
    }

    const onNewOrder = (order: any) => {
      setLiveOrdersCount(prev => prev + 1);
      if (!isSoundMuted) {
        soundManager.playNewOrderBell();
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_order_placed', onNewOrder);

    // Initial fetch of active orders count
    fetch('/api/admin/orders', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.orders) {
          const active = data.orders.filter((o: any) =>
            ['received', 'accepted', 'preparing'].includes(o.status)
          ).length;
          setLiveOrdersCount(active);
        }
      })
      .catch(() => {});

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_order_placed', onNewOrder);
    };
  }, [user?.restaurantId, isSoundMuted]);

  const toggleSound = () => {
    setIsSoundMuted(prev => !prev);
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    {
      name: 'Live KOT Orders',
      path: '/admin/orders',
      icon: ChefHat,
      badge: liveOrdersCount > 0 ? liveOrdersCount : undefined,
    },
    { name: 'Menu Items', path: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Table Standees & QR', path: '/admin/tables', icon: QrCode },
    { name: 'Analytics & Reviews', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#1A1412] text-[#F3EEEA] flex font-sans antialiased selection:bg-[#E07A5F]/30 selection:text-[#E07A5F]">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Independent Admin Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#231B17] border-r border-[#362B25] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-[#362B25] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C85A32] flex items-center justify-center text-white shadow-md">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-white tracking-tight leading-tight">
                {restaurant?.name || 'CozyBite'}
              </h1>
              <p className="text-[11px] font-medium text-[#A99385] tracking-wide uppercase">
                Owner & KOT Portal
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-[#A99385] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Pill */}
        <div className="px-5 py-3 bg-[#1C1512] border-b border-[#362B25]/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-[#C6B6AB] text-[11px] font-medium">
              {isConnected ? 'Kitchen Stream Live' : 'Reconnecting...'}
            </span>
          </div>
          <span className="text-[10px] font-mono bg-[#2C211C] text-[#D88D73] px-2 py-0.5 rounded-full border border-[#44332B]">
            v2.4
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#C85A32] text-white shadow-md font-semibold'
                      : 'text-[#C5B5A5] hover:bg-[#2F241F] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF7F2] text-[#C85A32]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Customer Menu Quick Preview Link */}
        <div className="px-3 pb-3">
          <a
            href={`/menu/${restaurant?.slug || 'cozybite-cafe'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#A99385] hover:text-[#E07A5F] hover:bg-[#2A201A] border border-[#3A2D25] transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Menu Link</span>
            </span>
            <span className="text-[10px] bg-[#362B25] px-1.5 py-0.5 rounded text-[#D2C2B5]">Preview</span>
          </a>
        </div>

        {/* Authenticated User & Logout Footer */}
        <div className="p-4 border-t border-[#362B25] bg-[#1F1714]">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-[#A99385] truncate capitalize">Role: {user?.role || 'Staff'}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out of Kitchen Portal"
              className="p-2 text-[#A99385] hover:text-[#E07A5F] hover:bg-[#2F241F] rounded-lg transition-colors ml-2"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Admin Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#201815]/95 backdrop-blur-md border-b border-[#362B25] px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-[#C5B5A5] hover:text-white hover:bg-[#2E231D] rounded-lg"
              aria-label="Open Admin Menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#2C211C] text-[#E07A5F] border border-[#44332B]">
                COZYBITE BACKOFFICE
              </span>
              <span className="text-xs text-[#8D7B70] hidden sm:inline">
                · {restaurant?.address || 'Dining Management Console'}
              </span>
            </div>
          </div>

          {/* Top Bar Controls: Order Sound Chime, Direct Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isSoundMuted
                  ? 'bg-[#2A201A] border-[#44332B] text-stone-400 hover:text-stone-200'
                  : 'bg-[#C85A32]/10 border-[#C85A32]/40 text-[#E07A5F] hover:bg-[#C85A32]/20'
              }`}
              title={isSoundMuted ? 'Order chime muted' : 'Order chime active'}
            >
              {isSoundMuted ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5 text-[#E07A5F]" />}
              <span className="hidden md:inline">{isSoundMuted ? 'Muted' : 'Audio Alert On'}</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#C5B5A5] hover:text-white hover:bg-[#2F241F] border border-[#3A2D25] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Outlet for Admin Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#181310] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
