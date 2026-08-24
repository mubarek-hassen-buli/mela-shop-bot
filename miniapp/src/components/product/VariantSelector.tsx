import React from 'react';
import { ProductVariant } from '../../types/product';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: number | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariantId,
  onSelectVariant,
}) => {
  return (
    <div className="flex flex-col gap-2.5">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Option</h4>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = selectedVariantId === v.id;
          const label = [v.color?.name, v.size].filter(Boolean).join(' / ') || v.sku;
          const isOutOfStock = v.stock_quantity <= 0;

          return (
            <button
              key={v.id}
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(v)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold border flex items-center gap-2 transition-all backdrop-blur-xl ${
                isSelected
                  ? 'bg-white/30 text-white border-white/50 shadow-lg shadow-black/60 scale-[1.02]'
                  : isOutOfStock
                  ? 'bg-[#10141d]/50 text-white/30 border-white/5 cursor-not-allowed line-through'
                  : 'bg-[#141924]/80 text-slate-200 border-white/10 hover:bg-[#1a2130]'
              }`}
            >
              {v.color?.hex_code && (
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm"
                  style={{ backgroundColor: v.color.hex_code }}
                />
              )}
              <span>{label}</span>
              <span className="opacity-70 text-[11px]">
                ({Number(v.price).toLocaleString()} Birr)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
