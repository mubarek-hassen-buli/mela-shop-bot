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
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Select Option</h4>
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
              className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                isSelected
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                  : isOutOfStock
                  ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed line-through'
                  : 'bg-slate-800/80 text-slate-200 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              {v.color?.hex_code && (
                <span
                  className="w-3 h-3 rounded-full border border-black/20"
                  style={{ backgroundColor: v.color.hex_code }}
                />
              )}
              <span>{label}</span>
              <span className="opacity-80">(${Number(v.price).toFixed(2)})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
