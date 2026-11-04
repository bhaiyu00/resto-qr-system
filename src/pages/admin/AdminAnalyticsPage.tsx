import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Star,
  ShoppingBag,
  Clock,
  MessageSquare,
  Sparkles,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '../../utils/orderRules.ts';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics', { credentials: 'include' })
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-[#E07A5F]" />
          <span>Restaurant Analytics & Guest Feedback</span>
        </h2>
        <p className="text-xs text-[#A8988D] mt-0.5">
          Performance metrics, revenue summary, and post-meal customer reviews.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#211915] p-5 rounded-2xl border border-[#362B25]">
          <div className="flex items-center justify-between text-[#8E7E74] mb-2">
            <span className="text-xs font-semibold uppercase">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatCurrency(data?.totalRevenue || 0)}
          </div>
          <p className="text-[11px] text-[#A69588] mt-1">From all accepted orders</p>
        </div>

        <div className="bg-[#211915] p-5 rounded-2xl border border-[#362B25]">
          <div className="flex items-center justify-between text-[#8E7E74] mb-2">
            <span className="text-xs font-semibold uppercase">Average Order</span>
            <ShoppingBag className="w-4 h-4 text-[#E07A5F]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatCurrency(data?.avgOrderValue || 0)}
          </div>
          <p className="text-[11px] text-[#A69588] mt-1">Per table party</p>
        </div>

        <div className="bg-[#211915] p-5 rounded-2xl border border-[#362B25]">
          <div className="flex items-center justify-between text-[#8E7E74] mb-2">
            <span className="text-xs font-semibold uppercase">Order Volume</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {data?.totalOrders || 0}
          </div>
          <p className="text-[11px] text-[#A69588] mt-1">
            {data?.completedOrders || 0} successfully served
          </p>
        </div>

        <div className="bg-[#211915] p-5 rounded-2xl border border-[#362B25]">
          <div className="flex items-center justify-between text-[#8E7E74] mb-2">
            <span className="text-xs font-semibold uppercase">Guest Satisfaction</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono flex items-center gap-1.5">
            <span>{data?.avgRating || 4.9}</span>
            <span className="text-xs text-[#8E7E74] font-normal">/ 5.0</span>
          </div>
          <p className="text-[11px] text-[#A69588] mt-1">Post-meal dining rating</p>
        </div>
      </div>

      {/* Guest Reviews Stream */}
      <div className="bg-[#201815] rounded-2xl border border-[#362B25] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#E07A5F]" />
            <h3 className="font-display font-bold text-white text-base">
              Customer Ratings & Reviews
            </h3>
          </div>
          <span className="text-xs text-[#A8988D]">
            {data?.recentFeedback?.length || 0} Reviews recorded
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#8E7E74]">Loading reviews...</div>
        ) : !data?.recentFeedback || data.recentFeedback.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8E7E74]">
            No reviews submitted yet. When customers complete orders, their feedback appears here in real time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recentFeedback.map((feedback: any, idx: number) => (
              <div
                key={idx}
                className="bg-[#271E19] p-4 rounded-xl border border-[#382B24] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {feedback.customerName}
                    </span>
                    <span className="text-[10px] bg-[#362B25] text-[#E07A5F] px-1.5 py-0.5 rounded font-mono">
                      {feedback.tableNumber}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= feedback.stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-[#44332B]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {feedback.comment && (
                  <p className="text-xs text-[#C5B5A5] italic">
                    "{feedback.comment}"
                  </p>
                )}

                <p className="text-[10px] text-[#8E7E74]">
                  {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : 'Today'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
