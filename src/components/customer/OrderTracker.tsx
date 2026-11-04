import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Utensils,
  ChefHat,
  BellRing,
  Sparkles,
  MessageSquare,
  Star,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext.tsx';
import { formatCurrency, OrderStatus } from '../../utils/orderRules.ts';

interface OrderTrackerProps {
  onBackToMenu: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ onBackToMenu }) => {
  const {
    activeOrder,
    setActiveOrderId,
    whatsAppNotifications,
    submitOrderFeedback,
  } = useRestaurant();

  // Feedback form state for when order is served
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showWhatsAppDrawer, setShowWhatsAppDrawer] = useState(false);

  // Dynamic countdown timer based on estimatedPrepTime
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    if (!activeOrder) return;

    if (activeOrder.status === 'served') {
      setSecondsRemaining(0);
      return;
    }

    // Calculate elapsed time since createdAt
    const created = new Date(activeOrder.createdAt).getTime();
    const totalDurationSeconds = (activeOrder.estimatedPrepTime || 20) * 60;
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - created) / 1000));
    const remaining = Math.max(0, totalDurationSeconds - elapsedSeconds);

    setSecondsRemaining(remaining);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrder?.createdAt, activeOrder?.estimatedPrepTime, activeOrder?.status]);

  if (!activeOrder) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h2 className="font-display text-2xl font-bold text-[#34241B] mb-2">No Active Order Found</h2>
        <p className="text-xs text-[#8D6E5C] mb-6">You don't have any ongoing order to track at this table.</p>
        <button
          onClick={onBackToMenu}
          className="px-5 py-2.5 bg-[#C85A32] text-white rounded-xl text-xs font-semibold hover:bg-[#B34E29]"
        >
          Explore Menu
        </button>
      </div>
    );
  }

  const stages: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'received',
      label: 'Order Received',
      desc: 'Sent to the kitchen display system.',
      icon: <Utensils className="w-4 h-4" />,
    },
    {
      key: 'accepted',
      label: 'Order Accepted',
      desc: 'Chef acknowledged and allocated ingredients.',
      icon: <ChefHat className="w-4 h-4" />,
    },
    {
      key: 'preparing',
      label: 'Preparing',
      desc: 'Freshly cooking on our stovetop and tandoor.',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      key: 'ready',
      label: 'Ready to Serve',
      desc: 'Plated hot and waiting for server pickup.',
      icon: <BellRing className="w-4 h-4" />,
    },
    {
      key: 'served',
      label: 'Served',
      desc: 'Enjoy your meal at your table!',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  ];

  const statusOrderIndex: Record<OrderStatus, number> = {
    received: 0,
    accepted: 1,
    preparing: 2,
    ready: 3,
    served: 4,
    rejected: -1,
  };

  const currentIndex = statusOrderIndex[activeOrder.status] ?? 0;

  // Format minutes & seconds
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

  // Filter WhatsApp messages for this order
  const orderWhatsAppLogs = whatsAppNotifications.filter(
    (n) => n.customerName === activeOrder.customerName || n.to === activeOrder.whatsappNumber
  );

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOrderFeedback(activeOrder.id, rating, reviewComment);
    setFeedbackSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 animate-in fade-in duration-200">
      
      {/* Top Banner & Status Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-cozy mb-6 relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#F9EDE6] to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-sm font-bold text-[#C85A32] bg-[#FAF2EB] px-2.5 py-0.5 rounded-lg border border-[#F2DACD]">
                {activeOrder.orderNumber}
              </span>
              <span className="text-xs text-[#8D6E5C]">· {activeOrder.tableNumber}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#34241B]">
              {activeOrder.status === 'served' ? 'Bon Appétit! 🎉' : 'Preparing Your Order'}
            </h1>
            <p className="text-xs text-[#735A4B] mt-1">
              Guest: <span className="font-semibold text-[#34241B]">{activeOrder.customerName}</span> · WhatsApp updates active
            </p>
          </div>

          {/* Dynamic Prep Time Badge */}
          {activeOrder.status !== 'served' && (
            <div className="bg-[#FAF7F2] border border-[#E8DFD5] rounded-2xl p-4 text-center shrink-0 min-w-36">
              <span className="text-[11px] font-semibold text-[#8D6E5C] uppercase tracking-wider block mb-1">
                Estimated Time
              </span>
              <span className="font-mono text-2xl font-bold text-[#C85A32] tabular-nums block">
                {timeFormatted}
              </span>
              <span className="text-[10px] text-[#7E9A82] font-medium flex items-center justify-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> Kitchen target
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Friendly Message based on status */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DF] mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32] animate-ping shrink-0" />
            <p className="text-xs text-[#5C4537] font-medium">
              {activeOrder.status === 'received' && 'Your order has been received by the kitchen. The chef will accept it shortly.'}
              {activeOrder.status === 'accepted' && 'Order confirmed by the chef! Preparation is about to begin.'}
              {activeOrder.status === 'preparing' && `Your food is currently being cooked fresh. Estimated ready in ~${minutes} minutes.`}
              {activeOrder.status === 'ready' && 'Your food is ready and plated! Our server is bringing it to your table.'}
              {activeOrder.status === 'served' && 'Your dishes have been served. We hope you enjoy every bite!'}
            </p>
          </div>

          <button
            onClick={() => setShowWhatsAppDrawer(true)}
            className="text-[11px] font-semibold text-[#25D366] hover:text-[#1EBE5B] whitespace-nowrap flex items-center gap-1 shrink-0 p-1 rounded-md"
            title="View WhatsApp updates"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp Logs</span>
          </button>
        </div>

        {/* 5-Stage Live Progression Timeline */}
        <div className="relative pt-2 pb-4">
          <div className="space-y-6">
            {stages.map((stage, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isPending = idx > currentIndex;

              return (
                <div key={stage.key} className="flex items-start gap-4 relative">
                  {/* Vertical connecting line */}
                  {idx < stages.length - 1 && (
                    <div
                      className={`absolute left-4.5 top-9 w-0.5 h-10 -ml-px transition-colors duration-500 ${
                        idx < currentIndex ? 'bg-[#7E9A82]' : 'bg-[#E8DFD5]'
                      }`}
                    />
                  )}

                  {/* Icon Circle */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 z-10 ${
                      isPast
                        ? 'bg-[#7E9A82] text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#C85A32] text-white ring-4 ring-[#C85A32]/20 shadow-md scale-105'
                        : 'bg-[#EFE9E1] text-[#A68F80]'
                    }`}
                  >
                    {stage.icon}
                  </div>

                  {/* Stage Details */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-semibold transition-colors ${
                          isCurrent
                            ? 'text-[#C85A32] font-bold'
                            : isPast
                            ? 'text-[#34241B]'
                            : 'text-[#9E8272]'
                        }`}
                      >
                        {stage.label}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF2EB] text-[#C85A32] border border-[#F0D5C7]">
                          In Progress
                        </span>
                      )}
                      {isPast && (
                        <span className="text-[10px] font-medium text-[#7E9A82] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#735A4B] mt-0.5">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5-STAR RATING & FEEDBACK SECTION (Only shown when order is Marked Served) */}
      {activeOrder.status === 'served' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-cozy mb-6 animate-in slide-in-from-bottom duration-300">
          <div className="text-center max-w-md mx-auto">
            <span className="w-12 h-12 rounded-2xl bg-[#FDF4DC] text-[#C85A32] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Sparkles className="w-6 h-6 text-[#E07A5F]" />
            </span>
            <h3 className="font-display text-xl font-bold text-[#34241B] mb-1">
              How was your experience?
            </h3>
            <p className="text-xs text-[#8D6E5C] mb-5">
              Your feedback helps our café chefs maintain the freshest flavors and best service.
            </p>

            {feedbackSubmitted || activeOrder.rating ? (
              <div className="p-4 rounded-2xl bg-[#EAF3EB] border border-[#C5DEC9] text-[#2F6B38] space-y-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= (activeOrder.rating?.stars || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold">Thank you for dining with CozyBite!</p>
                <p className="text-[11px] text-[#4A7A52]">
                  {activeOrder.rating?.comment ? `"${activeOrder.rating.comment}"` : 'Your review has been recorded.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {/* Star Picker */}
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-120 focus:outline-none"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-[#E3D7CB]'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="text-xs font-semibold text-[#8D6E5C]">
                  {rating === 5 && '🌟 Extraordinary! Loved every bite.'}
                  {rating === 4 && '😊 Great taste and ambiance.'}
                  {rating === 3 && '👍 Good, meets expectations.'}
                  {rating <= 2 && '🙏 We appreciate your honest feedback.'}
                </div>

                {/* Optional Written Review */}
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us what you liked most (e.g. fluffy bhature, quick service)..."
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] rounded-xl border border-[#E3D7CB] focus:outline-none focus:ring-2 focus:ring-[#C85A32]/20 resize-none text-[#34241B]"
                />

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-[#C85A32] hover:bg-[#B34E29] text-white shadow-sm transition-all active:scale-98"
                >
                  Submit Café Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Ordered Items Summary */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] shadow-cozy mb-6">
        <h3 className="font-display font-bold text-base text-[#34241B] mb-3">
          Your Ordered Items
        </h3>
        <div className="divide-y divide-[#F4EFEA] text-xs">
          {activeOrder.items.map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#34241B]">
                  {item.quantity}× {item.name}
                </span>
                {item.specialNote && (
                  <p className="text-[11px] text-[#A67153] italic">"{item.specialNote}"</p>
                )}
              </div>
              <span className="font-mono font-medium text-[#34241B] tabular-nums">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 mt-2 border-t border-[#F2ECE5] flex justify-between font-bold text-sm text-[#34241B]">
          <span>Total Paid / Payable</span>
          <span className="font-mono text-[#C85A32] tabular-nums">
            {formatCurrency(activeOrder.total)}
          </span>
        </div>
      </div>

      {/* Navigation actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onBackToMenu}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#EFE9E1] hover:bg-[#E5DDD2] text-[#4A3B32] transition-colors"
        >
          Order More Dishes
        </button>

        {activeOrder.status === 'served' && (
          <button
            onClick={() => setActiveOrderId(null)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#C85A32] text-white hover:bg-[#B34E29] transition-colors shadow-xs"
          >
            Start New Order
          </button>
        )}
      </div>

      {/* WhatsApp Message Logs Modal / Drawer */}
      {showWhatsAppDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-lifted border border-[#E8DFD5] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-[#075E54] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">WhatsApp Notifications</h4>
                  <span className="text-[11px] text-emerald-100">Live Meta Cloud API feed</span>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppDrawer(false)}
                className="text-white/80 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#EFEAE2] min-h-60 max-h-96 overflow-y-auto space-y-3">
              {orderWhatsAppLogs.length === 0 ? (
                <p className="text-center text-xs text-stone-500 py-6">
                  No notifications recorded yet.
                </p>
              ) : (
                orderWhatsAppLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white p-3 rounded-xl rounded-tl-none shadow-xs text-xs text-[#2A2A2A] max-w-[92%]"
                  >
                    <p className="leading-relaxed">{log.message}</p>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-stone-400 mt-1.5">
                      <span>{log.timestamp}</span>
                      <span className="text-emerald-600 font-semibold">✓✓</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-[#FAF7F2] border-t border-[#E8DFD5] text-center text-[11px] text-[#8D6E5C]">
              Simulating Meta WhatsApp Business API webhook delivery.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
