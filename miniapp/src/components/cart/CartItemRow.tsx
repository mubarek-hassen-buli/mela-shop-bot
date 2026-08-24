import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem } from '../../types/cart';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (itemId: number, newQty: number) => void;
  onRemoveItem: (itemId: number) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const primaryImage =
    item.product?.images.find((img) => img.is_primary)?.url || item.product?.images[0]?.url;
  const variantLabel =
    [item.variant?.color?.name, item.variant?.size].filter(Boolean).join(' / ') ||
    item.variant?.sku;

  return (
    <div className="flex items-center gap-3.5 p-3.5 bg-[#121722]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg">
      <div className="w-16 h-16 bg-[#090c12] rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={item.product?.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
            No Img
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-white truncate">{item.product?.title || 'Product'}</h4>
        <p className="text-[11px] text-slate-400 mt-0.5">{variantLabel}</p>
        <span className="text-xs font-extrabold text-white mt-1 block">
          {Number(item.item_subtotal).toLocaleString()} Birr
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/15">
          <button
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            className="p-1 text-white/70 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1 text-white/70 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => onRemoveItem(item.id)}
          className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
