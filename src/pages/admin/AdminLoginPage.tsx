import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChefHat, Lock, Mail, ArrowRight, ShieldAlert, Sparkles, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext.tsx';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { refreshAuth } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      await refreshAuth();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillDemo = () => {
    setEmail('admin@cozybite.com');
    setPassword('cozy123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#140F0D] text-[#F5EFE6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-[#E07A5F]/30 selection:text-[#E07A5F]">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#C85A32]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#E07A5F]/10 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Icon & Heading */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C85A32] to-[#A33C19] flex items-center justify-center text-white shadow-xl shadow-[#C85A32]/20 mb-4 border border-[#E07A5F]/30">
            <ChefHat className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            CozyBite Admin Portal
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#BBAAA0]">
            Kitchen Order Ticket (KOT) & Restaurant Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-[#1F1714] py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-[#3A2D25]">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-[#D3C3B6] uppercase tracking-wider mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A766B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@cozybite.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white placeholder-[#78665B] text-sm focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#D3C3B6] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A766B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white placeholder-[#78665B] text-sm focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#C85A32] hover:bg-[#B34E29] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1F1714] focus:ring-[#C85A32] disabled:opacity-60 transition-all shadow-md shadow-[#C85A32]/20"
            >
              {isSubmitting ? (
                <span>Authenticating Staff...</span>
              ) : (
                <>
                  <span>Sign In to Kitchen Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill Helper */}
          <div className="mt-6 pt-5 border-t border-[#33261F]">
            <div className="text-center mb-2.5">
              <span className="text-[11px] font-medium text-[#99867A] uppercase tracking-wider">
                Demo Credentials
              </span>
            </div>
            <button
              type="button"
              onClick={autofillDemo}
              className="w-full py-2 px-3 rounded-lg bg-[#2B211C] hover:bg-[#342721] border border-[#44332B] text-xs text-[#E07A5F] font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Autofill: admin@cozybite.com / cozy123</span>
            </button>
          </div>
        </div>

        {/* Back to Customer Interface Link */}
        <div className="mt-6 text-center">
          <Link
            to="/menu/cozybite-cafe"
            className="text-xs text-[#A89487] hover:text-[#E07A5F] flex items-center justify-center gap-1.5 transition-colors"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Switch to Customer Food Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
