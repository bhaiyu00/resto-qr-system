import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tags, UtensilsCrossed, ArrowRight, Plus, Check } from 'lucide-react';
import { adminFetch } from '../../utils/adminApi.ts';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<{ name: string; count: number; description: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/menu')
      .then(res => res.json())
      .then(data => {
        const items = data.items || [];
        const counts: Record<string, number> = {};
        items.forEach((i: any) => {
          counts[i.category] = (counts[i.category] || 0) + 1;
        });

        const catData = [
          {
            name: 'Breakfast',
            count: counts['Breakfast'] || 0,
            description: 'Morning comforts, fluffy pancakes, fresh idlis, and toast boards.',
          },
          {
            name: 'Main Course',
            count: counts['Main Course'] || 0,
            description: 'Hearty, slow-simmered curries, biryanis, and chef bowls.',
          },
          {
            name: 'Snacks',
            count: counts['Snacks'] || 0,
            description: 'Crisp savory bites, potato delights, and street food favorites.',
          },
          {
            name: 'South Indian',
            count: counts['South Indian'] || 0,
            description: 'Crispy ghee podi dosas, medu vadas, and homemade chutneys.',
          },
          {
            name: 'Beverages',
            count: counts['Beverages'] || 0,
            description: 'Artisan roasted coffees, cold brews, and seasonal herbal coolers.',
          },
        ];
        setCategories(catData);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
          <Tags className="w-6 h-6 text-[#E07A5F]" />
          <span>Menu Categories</span>
        </h2>
        <p className="text-xs text-[#A8988D] mt-0.5">
          Organize your café dishes into clear dining sections for easy customer smartphone browsing.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="bg-[#201815] rounded-2xl border border-[#362B25] p-5 flex flex-col justify-between hover:border-[#4B3B32] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-xl bg-[#C85A32]/20 text-[#E07A5F] flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#2E231D] text-[#E07A5F] border border-[#44332B]">
                  {cat.count} Dishes
                </span>
              </div>
              <h3 className="font-display font-bold text-white text-lg">{cat.name}</h3>
              <p className="text-xs text-[#A8988D] mt-1 leading-relaxed">{cat.description}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-[#2C211B]">
              <Link
                to="/admin/menu"
                className="text-xs text-[#E07A5F] hover:text-[#F39C82] flex items-center justify-between font-semibold group"
              >
                <span>View Dishes in {cat.name}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
