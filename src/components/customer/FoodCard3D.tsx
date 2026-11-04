import React, { useState, useRef } from 'react';
import { Plus, Clock, Sparkles } from 'lucide-react';
import { MenuItem } from '../../types/index.ts';
import { formatCurrency } from '../../utils/orderRules.ts';

interface FoodCard3DProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem, e: React.MouseEvent) => void;
  cartQuantity: number;
}

export const FoodCard3D: React.FC<FoodCard3DProps> = ({
  item,
  onSelect,
  onQuickAdd,
  cartQuantity,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // 3D Tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7; // max -7 to 7 deg
    const rotateY = ((x - centerX) / centerX) * 7;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(item)}
      className="perspective-1000 group cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
      aria-label={`View details for ${item.name}, ${formatCurrency(item.price)}`}
    >
      <div
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(${isHovered ? 12 : 0}px)`,
          transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`relative bg-white rounded-2xl border border-[#EDE5DC] p-3.5 sm:p-4 flex flex-col justify-between h-full transition-shadow duration-300 ${
          isHovered ? 'shadow-cozy-hover' : 'shadow-cozy'
        } ${!item.isAvailable ? 'opacity-65' : ''}`}
      >
        {/* Top Image Container with 3D Elevation & Soft Shadow */}
        <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-[#F3EDE6] mb-3.5 shadow-sm">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-106"
          />

          {/* Scrim overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Badge & Veg Indicator */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            {/* Vegetarian Indicator (Indian Standard Green Border & Dot) */}
            <div
              className="w-5 h-5 rounded bg-white/95 backdrop-blur-xs flex items-center justify-center border border-emerald-600 shadow-xs"
              title={item.isVeg ? '100% Vegetarian' : 'Non-Vegetarian'}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </div>

            {/* Special Badge if exists */}
            {item.badge && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F2]/95 text-[#C85A32] shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D97736]" />
                <span>{item.badge}</span>
              </span>
            )}
          </div>

          {/* Preparation Time Tag */}
          <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-[11px] font-medium text-white/90 drop-shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>{item.prepTime} mins</span>
          </div>

          {/* Availability Overlay */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <span className="text-white text-xs font-semibold px-2.5 py-1 bg-black/40 rounded-lg">
                Sold Out for Today
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-display font-bold text-base sm:text-lg text-[#34241B] group-hover:text-[#C85A32] transition-colors leading-snug">
                {item.name}
              </h3>
            </div>

            <p className="text-xs text-[#735A4B] line-clamp-2 leading-relaxed mb-3">
              {item.description}
            </p>
          </div>

          {/* Card Footer: Price & Quick Action */}
          <div className="pt-2 border-t border-[#F5EFE9] flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-[#9E8272] uppercase tracking-wider">
                Price
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-[#34241B] tabular-nums">
                {formatCurrency(item.price)}
              </span>
            </div>

            {item.isAvailable ? (
              <button
                onClick={(e) => onQuickAdd(item, e)}
                className={`relative px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                  cartQuantity > 0
                    ? 'bg-[#EAF3EB] text-[#2F6B38] border border-[#C5DEC9]'
                    : 'bg-[#FAF2EB] text-[#C85A32] hover:bg-[#C85A32] hover:text-white border border-[#F0D5C7]'
                }`}
                aria-label={`Add ${item.name} to order`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{cartQuantity > 0 ? `Added (${cartQuantity})` : 'Add'}</span>
              </button>
            ) : (
              <span className="text-xs text-stone-400 font-medium">Unavailable</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
