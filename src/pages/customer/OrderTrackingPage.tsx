import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Utensils,
  ChefHat,
  Clock,
  BellRing,
  CheckCircle2,
  Star,
  Sparkles,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { getSocket } from '../../utils/socket.ts';
import { formatCurrency, OrderStatus } from '../../utils/orderRules.ts';
import { soundManager } from '../../utils/soundManager.ts';

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rating & Feedback
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Fetch initial order data
  useEffect(() => {
    if (!orderId) return;

    let isMounted = true;
    async function loadOrder() {
      try {
        const res = await fetch(`/api/public/orders/${orderId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Order not found.');
        if (isMounted) {
          setOrder(data.order);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load order.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // Connect Socket.IO for live real-time status updates
  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();
    socket.emit('join_order', orderId);

    const handleStatusUpdate = (updatedOrder: any) => {
      if (updatedOrder.id === orderId) {
        setOrder(updatedOrder);
        soundManager.playStatusUpdateChime();
      }
    };

    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [orderId]);

  // Countdown clock
  useEffect(() => {
    if (!order) return;

    if (order.status === 'served') {
      setSecondsRemaining(0);
      return;
    }

    const created = new Date(order.createdAt).getTime();
    const totalDurationSeconds = (order.estimatedPrepTime || 15) * 60;
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - created) / 1000));
    const remaining = Math.max(0, totalDurationSeconds - elapsedSeconds);

    setSecondsRemaining(remaining);

    const interval = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.createdAt, order?.estimatedPrepTime, order?.status]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    try {
      const res = await fetch(`/api/public/orders/${orderId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: reviewComment }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-[#C85A32] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#8D6E5C]">Connecting to Kitchen Live Stream...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="font-display text-xl font-bold text-[#34241B] mb-2">Order Not Found</h2>
        <p className="text-xs text-[#8D6E5C] mb-6">{error || 'Unable to locate order records.'}</p>
        <Link
          to="/menu/cozybite-cafe"
          className="px-5 py-2.5 bg-[#C85A32] text-white rounded-xl text-xs font-semibold"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  const stages: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'received', label: 'Order Received', desc: 'Sent to the kitchen display system.', icon: <Utensils className="w-4 h-4" /> },
    { key: 'accepted', label: 'Order Accepted', desc: 'Chef acknowledged and allocated ingredients.', icon: <ChefHat className="w-4 h-4" /> },
    { key: 'preparing', label: 'Preparing', desc: 'Freshly cooking on our stovetop and tandoor.', icon: <Clock className="w-4 h-4" /> },
    { key: 'ready', label: 'Ready to Serve', desc: 'Plated hot and waiting for server pickup.', icon: <BellRing className="w-4 h-4" /> },
    { key: 'served', label: 'Served', desc: 'Enjoy your meal at your table!', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const statusOrderIndex: Record<string, number> = {
    received: 0,
    accepted: 1,
    preparing: 2,
    ready: 3,
    served: 4,
    rejected: -1,
  };

  const currentIndex = statusOrderIndex[order.status] ?? 0;
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-cozy mb-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-[#C85A32] bg-[#FAF2EB] px-2.5 py-0.5 rounded-lg border border-[#F2DACD]">
                {order.orderNumber}
              </span>
              <span className="text-xs text-[#8D6E5C]">· {order.tableNumber}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#34241B]">
              {order.status === 'served' ? 'Bon Appétit! 🎉' : 'Preparing Your Order'}
            </h1>
            <p className="text-xs text-[#735A4B] mt-1">
              Guest: <span className="font-semibold text-[#34241B]">{order.customerName}</span> · Real-time kitchen sync active
            </p>
          </div>

          {order.status !== 'served' && (
            <div className="bg-[#FAF7F2] border border-[#E8DFD5] rounded-2xl p-4 text-center shrink-0 min-w-36">
              <span className="text-[11px] font-semibold text-[#8D6E5C] uppercase tracking-wider block mb-1">
                Estimated Time
              </span>
              <span className="font-mono text-2xl font-bold text-[#C85A32] tabular-nums block">
                {timeFormatted}
              </span>
              <span className="text-[10px] text-[#7E9A82] font-medium flex items-center justify-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> Live Countdown
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Status message */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DF] mb-6 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32] animate-ping shrink-0" />
          <p className="text-xs text-[#5C4537] font-medium">
            {order.status === 'received' && 'Your order has been received by the kitchen. The chef will accept it shortly.'}
            {order.status === 'accepted' && 'Order accepted by chef! Fresh prep has begun.'}
            {order.status === 'preparing' && `Your food is currently sizzling on the stovetop. Ready in ~${minutes} minutes.`}
            {order.status === 'ready' && 'Your food is plated hot and ready! Our server is bringing it to your table.'}
            {order.status === 'served' && 'Your meal has been served! We hope you love every bite.'}
          </p>
        </div>

        {/* Progression Timeline */}
        <div className="relative pt-2 pb-4">
          <div className="space-y-6">
            {stages.map((stage, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={stage.key} className="flex items-start gap-4 relative">
                  {idx < stages.length - 1 && (
                    <div
                      className={`absolute left-4.5 top-9 w-0.5 h-10 -ml-px transition-colors duration-500 ${
                        idx < currentIndex ? 'bg-[#7E9A82]' : 'bg-[#E8DFD5]'
                      }`}
                    />
                  )}

                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                      isPast
                        ? 'bg-[#7E9A82] text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#C85A32] text-white ring-4 ring-[#C85A32]/20 shadow-md scale-105'
                        : 'bg-[#EFE9E1] text-[#A68F80]'
                    }`}
                  >
                    {stage.icon}
                  </div>

                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-semibold ${
                          isCurrent ? 'text-[#C85A32] font-bold' : isPast ? 'text-[#34241B]' : 'text-[#9E8272]'
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

      {/* RATING & FEEDBACK (Only unlocked once Served) */}
      {order.status === 'served' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-cozy mb-6 animate-in slide-in-from-bottom duration-300">
          <div className="text-center max-w-md mx-auto">
            <span className="w-12 h-12 rounded-2xl bg-[#FDF4DC] text-[#C85A32] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Sparkles className="w-6 h-6 text-[#E07A5F]" />
            </span>
            <h3 className="font-display text-xl font-bold text-[#34241B] mb-1">
              How was your meal?
            </h3>
            <p className="text-xs text-[#8D6E5C] mb-5">
              Your feedback is shared directly with the kitchen team.
            </p>

            {feedbackSubmitted || order.rating ? (
              <div className="p-4 rounded-2xl bg-[#EAF3EB] border border-[#C5DEC9] text-[#2F6B38] space-y-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= (order.rating?.stars || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold">Thank you for dining with CozyBite!</p>
                <p className="text-[11px] text-[#4A7A52]">
                  {order.rating?.comment ? `"${order.rating.comment}"` : 'Your review has been saved.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
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
                  Submit Table Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Item summary */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] shadow-cozy mb-6">
        <h3 className="font-display font-bold text-base text-[#34241B] mb-3">
          Your Ordered Dishes
        </h3>
        <div className="divide-y divide-[#F4EFEA] text-xs">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="py-2.5 flex items-center justify-between">
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
          <span>Total Amount</span>
          <span className="font-mono text-[#C85A32] tabular-nums">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      <div className="text-center">
        <Link
          to={`/menu/cozybite-cafe`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6A4D3B] hover:text-[#C85A32]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Menu</span>
        </Link>
      </div>
    </div>
  );
};
