import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBag, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { useCustomerOrder } from '../context/CustomerOrderContext.tsx';
import { soundManager } from '../utils/soundManager.ts';

export const CustomerLayout: React.FC = () => {
  const { cart, setIsCartOpen, verifiedTable, isMuted, toggleMute } = useCustomerOrder();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#34241B] flex flex-col font-sans selection:bg-[#E07A5F]/20 selection:text-[#C85A32]">
      {/* Customer Top Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD5] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3">
            <Link
              to="/menu/cozybite-cafe"
              className="flex items-center gap-2.5 text-left group focus:outline-none"
              aria-label="CozyBite Home"
            >
              <span className="w-9 h-9 rounded-xl bg-[#C85A32] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-[#34241B]">
                CozyBite
              </span>
            </Link>

            {/* Non-Editable Verified Table Identifier */}
            {verifiedTable ? (
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#EFE9E1] text-[#6A4D3B] text-xs font-semibold border border-[#E3D7CB]"
                title="Verified via Table QR Scan"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                <span>{verifiedTable.tableNumber}</span>
                {verifiedTable.location && (
                  <span className="hidden sm:inline text-[11px] text-[#8D6E5C] font-normal">
                    · {verifiedTable.location}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-[11px] font-medium text-[#8D6E5C] bg-[#FAF2EB] px-2.5 py-1 rounded-lg border border-[#F2DACD]">
                QR Scan Required
              </div>
            )}
          </div>

          {/* Customer Actions: Sound Chime & Order Tray (NO ADMIN BUTTONS) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={toggleMute}
              className="p-2 text-[#6A4D3B] hover:text-[#C85A32] hover:bg-[#EFE9E1] rounded-lg transition-colors"
              title={isMuted ? 'Unmute chime' : 'Mute chime'}
              aria-label={isMuted ? 'Unmute chime' : 'Mute chime'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Order Tray Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#B34E29] rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
              aria-label={`View order tray with ${totalItems} items`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden xs:inline">Order Tray</span>
              {totalItems > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[#C85A32] font-bold text-[11px] flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Customer Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Clean Café Footer */}
      <footer className="bg-white border-t border-[#E8DFD5] py-6 text-center text-xs text-[#8D6E5C]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-[#34241B]">CozyBite Café</span>
            <span>·</span>
            <span>Contactless Digital Dining</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#735A4B]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encrypted Server-Verified Table Session</span>
            </span>
            <span className="text-[#D0C2B5]">·</span>
            <Link
              to="/admin/login"
              className="text-[#968072] hover:text-[#C85A32] transition-colors"
              title="Restaurant Owner & Staff Login"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
