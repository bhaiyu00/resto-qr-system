import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCustomerOrder } from '../../context/CustomerOrderContext.tsx';
import { calculateOrderTotals, formatCurrency, validateCheckoutForm } from '../../utils/orderRules.ts';

interface CustomerCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export const CustomerCheckoutModal: React.FC<CustomerCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { cart, verifiedTable, placeOrder } = useCustomerOrder();

  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totals = calculateOrderTotals(cart);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validation = validateCheckoutForm({
      customerName,
      whatsappNumber,
      tableNumber: verifiedTable?.tableNumber || '',
      specialInstructions,
    });

    if (!validation.isValid) {
      setErrors(validation.errors as Record<string, string>);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const order = await placeOrder(customerName, whatsappNumber, specialInstructions);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C85A32', '#7E9A82', '#F9E7B9', '#E07A5F'],
        });
      } catch {
        // Fallback
      }

      onSuccess(order.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error sending order to kitchen.';
      setErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-lifted border border-[#E8DFD5] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E8DFD5] flex items-center justify-between bg-white/80">
          <div>
            <h2 className="font-display font-bold text-xl text-[#34241B]">
              Confirm Your Order
            </h2>
            <p className="text-xs text-[#8D6E5C]">
              Direct dispatch to chefs at CozyBite
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6A4D3B] hover:bg-[#EFE9E1]"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Non-Editable Verified Table Informational Label */}
          <div className="p-3.5 rounded-2xl bg-[#EFE9E1] border border-[#E3D7CB]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#8D6E5C] uppercase tracking-wider block">
                  Table Number
                </span>
                <span className="font-display font-bold text-base text-[#34241B]">
                  {verifiedTable?.tableNumber?.toUpperCase() || 'TABLE 01'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Automatically Detected
                </span>
                {verifiedTable?.location && (
                  <span className="text-[10px] text-[#8D6E5C] block mt-0.5">
                    {verifiedTable.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-[#4A3B32] mb-1">
              Customer Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border ${
                errors.customerName ? 'border-rose-400 focus:ring-rose-200' : 'border-[#E3D7CB] focus:ring-[#C85A32]/20'
              } focus:outline-none focus:ring-2`}
            />
            {errors.customerName && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.customerName}</p>
            )}
          </div>

          {/* WhatsApp Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-[#4A3B32] mb-1">
              WhatsApp Mobile Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border ${
                errors.whatsappNumber ? 'border-rose-400 focus:ring-rose-200' : 'border-[#E3D7CB] focus:ring-[#C85A32]/20'
              } focus:outline-none focus:ring-2`}
            />
            {errors.whatsappNumber ? (
              <p className="text-[11px] text-rose-600 mt-1">{errors.whatsappNumber}</p>
            ) : (
              <p className="text-[11px] text-[#8D6E5C] mt-1">
                You will receive cooking status updates and your digital bill on WhatsApp.
              </p>
            )}
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-semibold text-[#4A3B32] mb-1">
              Special Instructions or Food Preferences (Optional)
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less spicy, extra lemon, bring drinks first..."
              className="w-full px-3.5 py-2 text-xs bg-white rounded-xl border border-[#E3D7CB] focus:outline-none focus:ring-2 focus:ring-[#C85A32]/20 resize-none"
            />
          </div>

          {/* Order Summary */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#EFE8DF] space-y-2">
            <span className="text-[11px] font-semibold text-[#8D6E5C] uppercase tracking-wider block">
              Tray Summary ({totals.itemCount} items)
            </span>
            <div className="max-h-28 overflow-y-auto divide-y divide-[#F4EFEA] text-xs">
              {cart.map((item) => (
                <div key={item.id} className="py-1.5 flex justify-between text-[#4A3B32]">
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#F2ECE5] space-y-1 text-xs">
              <div className="flex justify-between text-[#8D6E5C]">
                <span>5% GST</span>
                <span className="font-mono tabular-nums">{formatCurrency(totals.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#34241B]">
                <span>Total Amount</span>
                <span className="font-mono text-[#C85A32] tabular-nums">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#735A4B]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pay directly at your table upon service (Cash, UPI or Card).</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white shadow-md transition-all active:scale-98 ${
              isSubmitting
                ? 'bg-stone-400 cursor-not-allowed'
                : 'bg-[#C85A32] hover:bg-[#B34E29]'
            }`}
          >
            {isSubmitting ? 'Verifying & Sending to Kitchen...' : `Place Order · ${formatCurrency(totals.total)}`}
          </button>
        </form>
      </div>
    </div>
  );
};
