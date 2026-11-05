import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChefHat, Lock, Mail, ArrowRight, ShieldAlert, Sparkles, User, Store, UtensilsCrossed, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext.tsx';

export const AdminLoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('CozyBite Café');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { refreshAuth, setAuthSession } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      if (data.token) {
        localStorage.setItem('cozybite_admin_token', data.token);
      }
      if (data.user) {
        setAuthSession(data.token, data.user, data.restaurant);
      }

      await refreshAuth();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          email: regEmail.trim(),
          password: regPassword,
          restaurantName: restaurantName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin account');
      }

      if (data.token) {
        localStorage.setItem('cozybite_admin_token', data.token);
      }
      if (data.user) {
        setAuthSession(data.token, data.user, data.restaurant);
      }

      setSuccessMsg('Account created successfully! Redirecting to Dashboard...');
      await refreshAuth();
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to register account.');
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
    <div className="min-h-screen bg-[#140F0D] text-[#F5EFE6] flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative selection:bg-[#E07A5F]/30 selection:text-[#E07A5F]">
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
          <p className="mt-1.5 text-xs sm:text-sm text-[#BBAAA0]">
            Kitchen Order Ticket (KOT) & Restaurant Management System
          </p>
        </div>

        {/* Card */}
        <div className="mt-7 bg-[#1F1714] py-7 px-6 sm:px-9 shadow-2xl rounded-2xl border border-[#3A2D25]">
          {/* Tab Switcher: Sign In vs Create First Admin Account */}
          <div className="grid grid-cols-2 p-1 bg-[#16100E] rounded-xl mb-6 border border-[#30231D]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#C85A32] text-white shadow-sm'
                  : 'text-[#9C8A7F] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[#C85A32] text-white shadow-sm'
                  : 'text-[#9C8A7F] hover:text-white'
              }`}
            >
              Create Admin Account
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#D3C3B6] uppercase tracking-wider mb-1.5">
                  Admin Email
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#C85A32] hover:bg-[#B34E29] focus:outline-none focus:ring-2 focus:ring-[#C85A32] disabled:opacity-60 transition-all shadow-md shadow-[#C85A32]/20 mt-2"
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

              {/* Quick Demo Credentials Autofill Helper */}
              <div className="pt-4 border-t border-[#33261F] text-center">
                <span className="text-[11px] font-medium text-[#99867A] uppercase tracking-wider block mb-2">
                  Pre-Configured Demo Account
                </span>
                <button
                  type="button"
                  onClick={autofillDemo}
                  className="w-full py-2 px-3 rounded-lg bg-[#2B211C] hover:bg-[#342721] border border-[#44332B] text-xs text-[#E07A5F] font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Autofill: admin@cozybite.com / cozy123</span>
                </button>
              </div>
            </form>
          ) : (
            /* Register First Admin Account Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#D3C3B6] uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A766B]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Nishant Barman"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white placeholder-[#78665B] text-sm focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D3C3B6] uppercase tracking-wider mb-1">
                  Admin Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A766B]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="e.g. nishantbarman04k@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white placeholder-[#78665B] text-sm focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D3C3B6] uppercase tracking-wider mb-1">
                  Password (min 6 characters) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A766B]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Create your secure password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white placeholder-[#78665B] text-sm focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D3C3B6] uppercase tracking-wider mb-1">
                  Restaurant / Café Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A766B]">
                    <Store className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={e => setRestaurantName(e.target.value)}
                    placeholder="e.g. CozyBite Café"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white placeholder-[#78665B] text-sm focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#C85A32] hover:bg-[#B34E29] focus:outline-none focus:ring-2 focus:ring-[#C85A32] disabled:opacity-60 transition-all shadow-md shadow-[#C85A32]/20 mt-3"
              >
                {isSubmitting ? (
                  <span>Registering Admin Account...</span>
                ) : (
                  <>
                    <span>Create Admin Account & Enter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
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
