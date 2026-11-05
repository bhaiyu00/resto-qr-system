import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Sparkles,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/orderRules.ts';
import { adminFetch } from '../../utils/adminApi.ts';

export const AdminMenuPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: 'Breakfast',
    price: 150,
    description: '',
    image: '',
    isVeg: true,
    prepTime: 15,
  });

  const fetchMenu = async () => {
    try {
      const res = await adminFetch('/api/admin/menu');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      name: '',
      category: 'Breakfast',
      price: 150,
      description: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      isVeg: true,
      prepTime: 15,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      image: item.image,
      isVeg: item.isVeg,
      prepTime: item.prepTime,
    });
    setIsModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await adminFetch(`/api/admin/menu/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const data = await res.json();
          setItems(prev => prev.map(i => (i.id === editingItem.id ? data.item : i)));
          setIsModalOpen(false);
        }
      } else {
        const res = await adminFetch('/api/admin/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const data = await res.json();
          setItems(prev => [data.item, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Failed to save menu dish:', err);
    }
  };

  const toggleAvailability = async (id: string) => {
    try {
      const res = await adminFetch(`/api/admin/menu/${id}/toggle-availability`, {
        method: 'PATCH',
      });
      if (res.ok) {
        const data = await res.json();
        setItems(prev => prev.map(i => (i.id === id ? data.item : i)));
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
      const res = await adminFetch(`/api/admin/menu/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete dish:', err);
    }
  };

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(item => {
    const matchesCategory = categoryFilter === 'All' ? true : item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 text-[#E07A5F]" />
            <span>Digital Menu Management</span>
          </h2>
          <p className="text-xs text-[#A8988D] mt-0.5">
            Manage your café food catalog, prices, dietary preferences, and instant stock availability.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B34E29] text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-[#C85A32] text-white'
                  : 'bg-[#221A16] text-[#A69588] hover:text-white hover:bg-[#2C211C] border border-[#342721]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7E74]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search menu catalog..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#241C18] border border-[#3A2D25] text-xs text-white placeholder-[#78665B] focus:outline-none focus:border-[#C85A32]"
          />
        </div>
      </div>

      {/* Dishes Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#8E7E74]">Loading menu catalog...</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-[#211915] rounded-2xl border border-[#362B25]">
          <UtensilsCrossed className="w-10 h-10 text-[#6B5A50] mx-auto mb-2" />
          <h4 className="font-display font-semibold text-white text-sm">No Dishes Found</h4>
          <p className="text-xs text-[#8E7E74] mt-1">Try another category or click "Add New Dish".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(dish => (
            <div
              key={dish.id}
              className={`bg-[#201815] rounded-2xl border border-[#362B25] overflow-hidden flex flex-col justify-between transition-all hover:border-[#4B3B32] ${
                !dish.isAvailable ? 'opacity-70 grayscale-[20%]' : ''
              }`}
            >
              <div>
                {/* Dish Image Banner */}
                <div className="relative h-44 w-full bg-[#18120F] overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {/* Veg / Non-Veg Indicator */}
                    <span
                      className={`w-6 h-6 rounded-md bg-black/70 backdrop-blur-md border flex items-center justify-center ${
                        dish.isVeg ? 'border-emerald-500' : 'border-amber-600'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          dish.isVeg ? 'bg-emerald-400' : 'bg-amber-500'
                        }`}
                      />
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white border border-white/10">
                      {dish.category}
                    </span>
                  </div>

                  {/* Stock Availability Pill */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => toggleAvailability(dish.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold shadow-md transition-colors ${
                        dish.isAvailable
                          ? 'bg-emerald-600/90 text-white hover:bg-emerald-500'
                          : 'bg-red-900/90 text-red-200 hover:bg-red-800'
                      }`}
                    >
                      {dish.isAvailable ? 'In Stock' : 'Sold Out'}
                    </button>
                  </div>
                </div>

                {/* Dish Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-display font-bold text-white text-base leading-tight">
                      {dish.name}
                    </h3>
                    <span className="font-mono font-bold text-[#E07A5F] text-base shrink-0">
                      {formatCurrency(dish.price)}
                    </span>
                  </div>
                  <p className="text-xs text-[#A8988D] line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#2C211B] text-[11px] text-[#8E7E74]">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#E07A5F]" />
                      <span>{dish.prepTime} min</span>
                    </span>
                    {dish.calories && <span>· {dish.calories}</span>}
                    {dish.portionSize && <span>· {dish.portionSize}</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 border-t border-[#2C211B] bg-[#1C1512] flex items-center justify-between">
                <button
                  onClick={() => toggleAvailability(dish.id)}
                  className="text-xs text-[#A8988D] hover:text-white flex items-center gap-1.5"
                >
                  {dish.isAvailable ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{dish.isAvailable ? 'Mark Sold Out' : 'Mark Available'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(dish)}
                    className="p-1.5 rounded-lg bg-[#281F1A] hover:bg-[#342721] text-[#D5C5B8] hover:text-white transition-colors"
                    title="Edit Dish"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteItem(dish.id)}
                    className="p-1.5 rounded-lg bg-[#281F1A] hover:bg-red-950 text-[#D5C5B8] hover:text-red-400 transition-colors"
                    title="Delete Dish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#211915] rounded-2xl border border-[#3A2D25] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#362B25] flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-lg">
                {editingItem ? 'Edit Dish' : 'Add New Dish to Menu'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#8E7E74] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Masala Dosa with Chutneys"
                  className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Snacks">Snacks</option>
                    <option value="South Indian">South Indian</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                    Preparation Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={form.prepTime}
                    onChange={e => setForm({ ...form, prepTime: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                    Dietary Type
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-1.5 text-xs text-white cursor-pointer">
                      <input
                        type="radio"
                        checked={form.isVeg}
                        onChange={() => setForm({ ...form, isVeg: true })}
                        className="text-[#C85A32]"
                      />
                      <span>Vegetarian</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-white cursor-pointer">
                      <input
                        type="radio"
                        checked={!form.isVeg}
                        onChange={() => setForm({ ...form, isVeg: false })}
                        className="text-[#C85A32]"
                      />
                      <span>Non-Veg</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Ingredients, flavors, presentation..."
                  className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D3C3B6] mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-[#281F1A] border border-[#3E3028] text-white text-xs focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="pt-4 border-t border-[#362B25] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#281F1A] text-xs font-medium text-[#A8988D] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B34E29] text-white text-xs font-semibold shadow-md"
                >
                  {editingItem ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
