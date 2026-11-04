import React, { useState } from 'react';
import { X, Plus, Minus, Clock, Flame, ShoppingBag, Check } from 'lucide-react';
import { MenuItem } from '../../types/index.ts';
import { formatCurrency } from '../../utils/orderRules.ts';

interface FoodDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, specialNote?: string) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState('');
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  if (!item) return null;

  const handleAdd = () => {
    setIsAddedAnimation(true);
    onAddToCart(item, quantity, specialNote);
    setTimeout(() => {
      setIsAddedAnimation(false);
      onClose();
    }, 450);
  };

  const itemTotal = item.price * quantity;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-lifted border border-[#E8DFD5] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md text-[#34241B] hover:bg-white flex items-center justify-center shadow-sm transition-transform active:scale-95"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Elevated Hero Image Container */}
        <div className="relative w-full aspect-16/10 bg-[#EFE9E1] overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Floated Pill on Image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded bg-white flex items-center justify-center border border-emerald-600 shadow-sm"
                title="100% Vegetarian"
              >
                <div className="w-3 h-3 rounded-full bg-emerald-600" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md">
                {item.category}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md">
              <Clock className="w-3.5 h-3.5" />
              <span>~{item.prepTime} mins</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#34241B]">
                {item.name}
              </h2>
              {item.portionSize && (
                <span className="text-xs text-[#8D6E5C] font-medium">
                  {item.portionSize} {item.calories ? `· ${item.calories}` : ''}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-mono text-[#C85A32]">
                {formatCurrency(item.price)}
              </span>
            </div>
          </div>

          <p className="text-sm text-[#664F40] leading-relaxed mb-5">
            {item.description}
          </p>

          {/* Meta specs (Spice level & tags) */}
          <div className="grid grid-cols-2 gap-3 mb-5 p-3 rounded-2xl bg-white border border-[#EFE8DF]">
            <div className="flex items-center gap-2 text-xs text-[#6A4D3B]">
              <Flame className="w-4 h-4 text-[#D95D39]" />
              <span className="font-medium">Spiciness:</span>
              <span className="font-semibold">
                {item.spiciness === 0 ? 'Mild' : item.spiciness === 1 ? 'Medium' : 'Spicy'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6A4D3B]">
              <Clock className="w-4 h-4 text-[#7E9A82]" />
              <span className="font-medium">Kitchen Time:</span>
              <span className="font-semibold">{item.prepTime} mins</span>
            </div>
          </div>

          {/* Custom instructions input */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-[#6A4D3B] mb-1.5">
              Special Request or Dietary Note (Optional)
            </label>
            <input
              type="text"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="e.g. Less spicy, no coriander, extra hot..."
              className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-[#E3D7CB] focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32] transition-all"
            />
          </div>

          {/* Footer Controls: Quantity Stepper & Animated Add Button */}
          <div className="flex items-center gap-4 pt-4 border-t border-[#EFE8DF]">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-white rounded-xl border border-[#E3D7CB] p-1 shadow-xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6A4D3B] hover:bg-[#FAF7F2] transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-9 text-center font-bold font-mono text-sm text-[#34241B]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6A4D3B] hover:bg-[#FAF7F2] transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Animated Add to Order Button */}
            <button
              onClick={handleAdd}
              disabled={isAddedAnimation}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                isAddedAnimation
                  ? 'bg-emerald-600 text-white scale-98'
                  : 'bg-[#C85A32] hover:bg-[#B34E29] text-white hover:shadow-lg'
              }`}
            >
              {isAddedAnimation ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Order Tray!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Order · {formatCurrency(itemTotal)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
