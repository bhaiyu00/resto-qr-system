import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Store, Percent, Clock, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext.tsx';
import { adminFetch } from '../../utils/adminApi.ts';

export const AdminSettingsPage: React.FC = () => {
  const { restaurant, refreshAuth } = useAdminAuth();
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    address: '',
    contact: '',
    gstRate: 0.05,
    defaultPrepTime: 15,
    isAcceptingOrders: true,
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name || '',
        tagline: restaurant.tagline || '',
        address: restaurant.address || '',
        contact: restaurant.contact || '',
        gstRate: restaurant.settings?.gstRate || 0.05,
        defaultPrepTime: restaurant.settings?.defaultPrepTime || 15,
        isAcceptingOrders: restaurant.settings?.isAcceptingOrders ?? true,
      });
    }
  }, [restaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await refreshAuth();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#E07A5F]" />
          <span>Restaurant & Dining Settings</span>
        </h2>
        <p className="text-xs text-[#A8988D] mt-0.5">
          Configure restaurant branding, billing taxes, and kitchen preparation standards.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Settings saved successfully and updated across dining channels.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#201815] rounded-2xl border border-[#362B25] p-6 space-y-6">
        {/* Restaurant Identity */}
        <div>
          <h3 className="font-display font-semibold text-white text-base mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-[#E07A5F]" />
            <span>Café Identity & Location</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                Tagline / Subheading
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={e => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                Contact Phone / WhatsApp Support
              </label>
              <input
                type="text"
                value={form.contact}
                onChange={e => setForm({ ...form, contact: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                Dining Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>
        </div>

        {/* Billing & Kitchen Operations */}
        <div className="pt-6 border-t border-[#31251F]">
          <h3 className="font-display font-semibold text-white text-base mb-4 flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#E07A5F]" />
            <span>Taxes & Kitchen Defaults</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                GST Tax Rate (e.g. 0.05 for 5%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="0.30"
                value={form.gstRate}
                onChange={e => setForm({ ...form, gstRate: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
              />
              <span className="text-[10px] text-[#8E7E74] mt-1 block">
                Calculated on checkout subtotal
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                Default Kitchen Prep Time (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={form.defaultPrepTime}
                onChange={e => setForm({ ...form, defaultPrepTime: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
              />
              <span className="text-[10px] text-[#8E7E74] mt-1 block">
                Estimated time shown to guests upon scanning
              </span>
            </div>
          </div>
        </div>

        {/* Order Acceptance Toggle */}
        <div className="pt-6 border-t border-[#31251F]">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#261E1A] border border-[#3A2D25]">
            <div>
              <h4 className="text-sm font-semibold text-white">Accepting QR Orders</h4>
              <p className="text-xs text-[#A8988D] mt-0.5">
                Toggle to temporarily pause incoming table orders (e.g., during kitchen prep rush).
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAcceptingOrders}
                onChange={e => setForm({ ...form, isAcceptingOrders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#382B24] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#382B24] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C85A32]"></div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#31251F] flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B34E29] text-white text-xs font-semibold shadow-md disabled:opacity-60 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
