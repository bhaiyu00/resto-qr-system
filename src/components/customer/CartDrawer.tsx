import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext.tsx';
import { calculateOrderTotals, formatCurrency } from '../../utils/orderRules.ts';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    activeTable,
  } = useRestaurant();

  if (!isCartOpen) return null;

  const totals = calculateOrderTotals(cart);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] border-l border-[#E8DFD5] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E8DFD5] flex items-center justify-between bg-white/70 backdrop-blur-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#FAF2EB] text-[#C85A32] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-display font-bold text-lg text-[#34241B]">
                  Your Order Tray
                </h2>
                <span className="text-xs text-[#8D6E5C]">
                  {activeTable} · {totals.itemCount} items
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="px-2.5 py-1 text-xs text-[#9E8272] hover:text-rose-600 transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6A4D3B] hover:bg-[#EFE9E1] transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-[#F3EDE6]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8D6E5C]">
                <div className="w-16 h-16 rounded-2xl bg-[#EFE9E1] flex items-center justify-center text-[#B59C8B] mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-base text-[#4A3B32] mb-1">
                  Your tray is hungry!
                </h3>
                <p className="text-xs text-[#8D6E5C] max-w-xs leading-relaxed mb-4">
                  Explore our cozy dishes and add your favorites to place your order right from your table.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C85A32] text-white hover:bg-[#B34E29] transition-colors"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="pt-3.5 first:pt-0 flex items-start gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#EFE9E1] border border-[#E8DFD5]"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display font-semibold text-sm text-[#34241B] truncate">
                        {item.name}
                      </h4>
                      <span className="font-mono text-sm font-bold text-[#34241B] tabular-nums shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#8D6E5C] block mb-1">
                      {formatCurrency(item.price)} each
                    </span>

                    {item.specialNote && (
                      <p className="text-[11px] text-[#A67153] italic mb-2">
                        "{item.specialNote}"
                      </p>
                    )}

                    {/* Stepper & Trash */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-white rounded-lg border border-[#E3D7CB] p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-[#6A4D3B] hover:bg-[#FAF7F2]"
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-bold text-[#34241B]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-[#6A4D3B] hover:bg-[#FAF7F2]"
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md transition-colors"
                        aria-label={`Remove ${item.name} from tray`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Summary & Action Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E8DFD5] bg-white/80 backdrop-blur-xs space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#6A4D3B]">
                  <span>Item Subtotal</span>
                  <span className="font-mono tabular-nums">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#6A4D3B]">
                  <span>Restaurant GST (5%)</span>
                  <span className="font-mono tabular-nums">{formatCurrency(totals.tax)}</span>
                </div>
                <div className="pt-2 border-t border-[#F2ECE5] flex justify-between text-base font-bold text-[#34241B]">
                  <span className="font-display">Total Amount</span>
                  <span className="font-mono text-[#C85A32] tabular-nums">
                    {formatCurrency(totals.total)}
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenCheckout}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-[#C85A32] hover:bg-[#B34E29] text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
