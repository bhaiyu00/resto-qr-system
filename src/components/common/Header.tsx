import React, { useState } from 'react';
import { ShoppingBag, Volume2, VolumeX, Shield, UtensilsCrossed, ChevronDown, Check, QrCode } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext.tsx';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    activeTable,
    setActiveTable,
    tables,
    cart,
    setIsCartOpen,
    isMuted,
    toggleMute,
    activeOrder,
    setIsQRScannerOpen,
  } = useRestaurant();

  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD5] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setViewMode('customer')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            aria-label="CozyBite Home"
          >
            <span className="w-9 h-9 rounded-xl bg-[#C85A32] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </span>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-[#34241B]">
                CozyBite
              </span>
            </div>
          </button>

          {/* Table Indicator & QR Scanner Button */}
          {viewMode === 'customer' && (
            <div className="flex items-center gap-1.5 ml-1 sm:ml-2">
              <button
                onClick={() => setIsQRScannerOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FAF2EB] text-[#C85A32] hover:bg-[#F2DACD] border border-[#F0D5C7] transition-all hover:scale-[1.02] active:scale-95 shadow-xs"
                title="Scan QR Code from Table"
                aria-label="Scan Table QR"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Scan QR</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#EFE9E1] text-[#6A4D3B] hover:bg-[#E5DDD2] transition-colors"
                  aria-expanded={isTableDropdownOpen}
                  aria-label="Select table"
                >
                  <span>{activeTable}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8D6E5C]" />
                </button>

              {isTableDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsTableDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-xl shadow-cozy border border-[#E8DFD5] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1 text-[11px] font-semibold text-[#8D6E5C] border-b border-[#F4EFEA] uppercase tracking-wider">
                      Simulate QR Table
                    </div>
                    {tables.map(table => (
                      <button
                        key={table.id}
                        onClick={() => {
                          setActiveTable(table.tableNumber);
                          setIsTableDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition-colors ${
                          activeTable === table.tableNumber
                            ? 'bg-[#F9EDE6] text-[#C85A32] font-semibold'
                            : 'text-[#4A3B32] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span>{table.tableNumber}</span>
                        {activeTable === table.tableNumber && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
              </div>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#6A4D3B]">
          <button
            onClick={() => setViewMode('customer')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#C85A32] ${
              viewMode === 'customer' && !activeOrder ? 'text-[#C85A32] font-semibold' : ''
            }`}
          >
            Digital Menu
          </button>
          
          {activeOrder && (
            <button
              onClick={() => setViewMode('customer')}
              className="flex items-center gap-1.5 text-[#C85A32] font-semibold whitespace-nowrap shrink-0 hover:opacity-80"
            >
              <span>Live Order {activeOrder.orderNumber}</span>
              <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-pulse" />
            </button>
          )}

          <a
            href="#story"
            onClick={(e) => {
              if (viewMode !== 'customer') {
                e.preventDefault();
                setViewMode('customer');
                setTimeout(() => {
                  document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#C85A32]"
          >
            Our Philosophy
          </a>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Audio Chime Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 text-[#6A4D3B] hover:text-[#C85A32] hover:bg-[#EFE9E1] rounded-lg transition-colors"
            title={isMuted ? 'Unmute kitchen chime' : 'Mute kitchen chime'}
            aria-label={isMuted ? 'Unmute chime' : 'Mute chime'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Switch View: Customer vs Admin */}
          {viewMode === 'customer' ? (
            <>
              <button
                onClick={() => setViewMode('admin')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#6A4D3B] bg-[#EFE9E1] hover:bg-[#E5DDD2] rounded-lg transition-colors whitespace-nowrap"
                aria-label="Switch to Owner Dashboard"
                title="Switch to Owner Dashboard"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Owner Portal</span>
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#B34E29] rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                aria-label={`View cart with ${totalCartCount} items`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden xs:inline">Order Tray</span>
                {totalCartCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-[#C85A32] font-bold text-[11px] flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setViewMode('customer')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#B34E29] rounded-xl shadow-sm transition-colors whitespace-nowrap"
              aria-label="Return to Customer Menu"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Back to Menu</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
