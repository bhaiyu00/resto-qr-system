import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Sparkles,
  Coffee,
  AlertTriangle,
  QrCode,
  ArrowDown,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { useCustomerOrder } from '../../context/CustomerOrderContext.tsx';
import { FoodCard3D } from '../../components/customer/FoodCard3D.tsx';
import { FoodDetailModal } from '../../components/customer/FoodDetailModal.tsx';
import { Hero3DCanvas } from '../../components/3d/Hero3DCanvas.tsx';
import { QRScannerModal } from '../../components/customer/QRScannerModal.tsx';
import { CustomerCartDrawer } from '../../components/customer/CustomerCartDrawer.tsx';
import { CustomerCheckoutModal } from '../../components/customer/CustomerCheckoutModal.tsx';
import { formatCurrency } from '../../utils/orderRules.ts';

export const CustomerMenuPage: React.FC = () => {
  const { restaurantSlug = 'cozybite-cafe', tableToken } = useParams<{ restaurantSlug: string; tableToken?: string }>();
  const navigate = useNavigate();

  const {
    setRestaurantSlug,
    setTableToken,
    verifiedTable,
    setVerifiedTable,
    cart,
    addToCart,
    setIsCartOpen,
  } = useCustomerOrder();

  const [isLoading, setIsLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All Items']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVeg, setOnlyVeg] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<any | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    setRestaurantSlug(restaurantSlug);
  }, [restaurantSlug, setRestaurantSlug]);

  // Verify Table Token on mount
  useEffect(() => {
    let isMounted = true;

    async function verifyAndLoad() {
      setIsLoading(true);
      setTokenError(null);

      try {
        // 1. If tableToken is provided, verify it with the server
        if (tableToken) {
          const verifyRes = await fetch(`/api/public/verify-table/${restaurantSlug}/${tableToken}`);
          const verifyData = await verifyRes.json();

          if (!verifyRes.ok || !verifyData.valid) {
            if (isMounted) {
              setTokenError(verifyData.error || 'Invalid or inactive table QR code.');
              setVerifiedTable(null);
              setTableToken(null);
            }
          } else {
            if (isMounted) {
              setVerifiedTable(verifyData.table);
              setTableToken(tableToken);
            }
          }
        } else {
          // No table token in URL
          if (isMounted) {
            setVerifiedTable(null);
            setTableToken(null);
          }
        }

        // 2. Fetch Menu
        const menuRes = await fetch(`/api/public/menu/${restaurantSlug}`);
        const menuData = await menuRes.json();
        if (menuRes.ok && isMounted) {
          setMenuItems(menuData.items || []);
          if (menuData.categories) {
            setCategories(menuData.categories);
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setTokenError('Unable to connect to restaurant server.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    verifyAndLoad();

    return () => {
      isMounted = false;
    };
  }, [restaurantSlug, tableToken, setVerifiedTable, setTableToken]);

  // Cart quantity map
  const cartQuantities = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach(ci => {
      map[ci.id] = (map[ci.id] || 0) + ci.quantity;
    });
    return map;
  }, [cart]);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Filtered menu
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (selectedCategory !== 'All Items' && item.category !== selectedCategory) {
        return false;
      }
      if (onlyVeg && !item.isVeg) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [menuItems, selectedCategory, onlyVeg, searchQuery]);

  // Handle scanned table redirect
  const handleScannedTable = (detected: string) => {
    let token = detected;
    if (!detected.startsWith('tok-')) {
      const tableTokenMap: Record<string, string> = {
        'table 01': 'tok-tbl-01-a8f9',
        'table 02': 'tok-tbl-02-c4d1',
        'table 03': 'tok-tbl-03-e7a2',
        'table 04': 'tok-tbl-04-f9b8',
        'table 05': 'tok-tbl-05-3e2c',
        'table 06': 'tok-tbl-06-8d1a',
        'table 07': 'tok-tbl-07-5b4e',
        'table 08': 'tok-tbl-08-9f0d',
      };
      token = tableTokenMap[detected.toLowerCase()] || detected;
    }
    navigate(`/menu/${restaurantSlug}/table/${token}`);
  };

  const handleOrderSuccess = (orderId: string) => {
    setIsCheckoutOpen(false);
    navigate(`/track/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-[#C85A32] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#8D6E5C]">
          Loading Verified Food Menu...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 md:pb-16">
      
      {/* Non-Blocking Informational Banner if table token needs attention */}
      {tokenError && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{tokenError} Browse our full menu below, or scan your table's QR standee to connect directly to your table.</span>
            </div>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C85A32] text-white font-semibold hover:bg-[#B34E29] transition-colors whitespace-nowrap"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Active Table QR</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Greeting Banner / Scan QR Prompt */}
      {!tableToken && !tokenError && (
        <div className="bg-[#FAF2EB] border-b border-[#E8DFD5] py-2.5 px-4 text-center">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-[#7A5641]">
            <span>Sitting at a table? Scan your table's QR standee for automatic ordering:</span>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#C85A32] text-white font-semibold hover:bg-[#B34E29] transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR Code</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-radial from-[#FDF9F5] to-[#FAF7F2] border-b border-[#E8DFD5] pt-6 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              {/* Automatically Detected Table Tag */}
              {verifiedTable ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3EB] text-[#2F6B38] text-xs font-semibold border border-[#C5DEC9] shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified: You're ordering from {verifiedTable.tableNumber}</span>
                  {verifiedTable.location && <span>({verifiedTable.location})</span>}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9E1] text-[#7A5641] text-xs font-semibold shadow-xs">
                  <Coffee className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Welcome to CozyBite Café</span>
                </div>
              )}

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#34241B] text-balance leading-[1.15]">
                Warm food, freshly cooked at your rhythm.
              </h1>

              <p className="text-sm sm:text-base text-[#6E5545] max-w-xl leading-relaxed">
                Scan, tap, and enjoy. Browse our slow-cooked specials, crisp snacks, and artisanal beverages. 
                Your order streams straight to our kitchen chefs without calling a waiter.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="#menu-section"
                  className="px-5 py-3 rounded-xl bg-[#C85A32] hover:bg-[#B34E29] text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                >
                  <span>Explore Menu</span>
                  <ArrowDown className="w-4 h-4" />
                </a>

                {!verifiedTable && (
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="px-5 py-3 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#34241B] border border-[#E8DFD5] text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4 text-[#C85A32]" />
                    <span>Scan Table QR</span>
                  </button>
                )}

                <div className="flex items-center gap-2 text-xs text-[#8D6E5C] pl-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Kitchen accepting orders</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm sm:max-w-md h-72 sm:h-80">
                <Hero3DCanvas className="w-full h-full" />
                <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#E8DFD5] shadow-cozy flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#FAF2EB] text-[#C85A32] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <div className="text-left">
                    <span className="block text-[11px] font-bold text-[#34241B]">Freshly Cooked</span>
                    <span className="block text-[10px] text-[#8D6E5C]">Pure spices · Desi ghee</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Menu Grid */}
      <section id="menu-section" className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E5C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Dosa, Tikka, Lassi)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-[#E8DFD5] focus:outline-none focus:ring-2 focus:ring-[#C85A32]/20 focus:border-[#C85A32] shadow-xs text-[#34241B]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyVeg(!onlyVeg)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
                onlyVeg
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-[#6A4D3B] border-[#E8DFD5] hover:bg-[#FAF7F2]'
              }`}
              aria-pressed={onlyVeg}
            >
              <div className="w-3.5 h-3.5 rounded border border-emerald-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              </div>
              <span>Pure Veg Only</span>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="relative mb-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#34241B] text-[#FAF7F2] shadow-sm'
                      : 'bg-white text-[#6A4D3B] border border-[#E8DFD5] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Food Items */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#E8DFD5] p-8 shadow-xs">
            <h3 className="font-display font-bold text-lg text-[#34241B] mb-1">
              No dishes found
            </h3>
            <p className="text-xs text-[#8D6E5C] max-w-sm mx-auto mb-4">
              Try adjusting your search or category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Items');
                setOnlyVeg(false);
              }}
              className="px-4 py-2 bg-[#C85A32] text-white rounded-xl text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredItems.map((item) => (
              <FoodCard3D
                key={item.id}
                item={item}
                onSelect={setSelectedItemForDetail}
                onQuickAdd={(item, e) => {
                  e.stopPropagation();
                  addToCart(item, 1);
                }}
                cartQuantity={cartQuantities[item.id] || 0}
              />
            ))}
          </div>
        )}
      </section>

      {/* Floating Bottom Cart Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom duration-250">
          <div className="bg-[#34241B] text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl flex items-center justify-between gap-3 border border-[#4E392E]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C85A32] flex items-center justify-center text-white shrink-0 shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold block">
                  {cartItemCount} {cartItemCount === 1 ? 'dish' : 'dishes'} in tray
                </span>
                <span className="text-[11px] text-[#D7C4B7] font-mono tabular-nums">
                  {formatCurrency(cartSubtotal)} + taxes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#4A3B32] hover:bg-[#5A483E] text-[#FAF7F2] transition-colors"
              >
                Review
              </button>
              <button
                onClick={() => {
                  if (!tableToken) {
                    setIsScannerOpen(true);
                  } else {
                    setIsCheckoutOpen(true);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C85A32] hover:bg-[#B34E29] text-white shadow-xs transition-colors"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dish Detail Modal */}
      <FoodDetailModal
        item={selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        onAddToCart={addToCart}
      />

      {/* Customer Cart Drawer */}
      <CustomerCartDrawer
        onOpenCheckout={() => {
          if (!tableToken) {
            setIsScannerOpen(true);
          } else {
            setIsCheckoutOpen(true);
          }
        }}
      />

      {/* Customer Checkout Modal */}
      <CustomerCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleOrderSuccess}
      />

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onTableScanned={handleScannedTable}
      />
    </div>
  );
};
