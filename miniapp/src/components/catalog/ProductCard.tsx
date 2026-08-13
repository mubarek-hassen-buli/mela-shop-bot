import React from 'react';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const primaryImage = product.images.find((img) => img.is_primary)?.url || product.images[0]?.url;
  const activeVariant = product.variants.find((v) => v.is_active) || product.variants[0];

  const price = activeVariant ? activeVariant.price : 0;
  const compareAtPrice = activeVariant?.compare_at_price;

  return (
    <div
      onClick={onClick}
      className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-md"
    >
      <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
            No Image
          </div>
        )}

        {compareAtPrice && compareAtPrice > price && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            SALE
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          {product.brand && (
            <span className="text-[10px] uppercase font-semibold tracking-wider text-sky-400 block mb-0.5">
              {product.brand.name}
            </span>
          )}
          <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 group-hover:text-sky-300 transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-sky-400">
            ${Number(price).toFixed(2)}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-[11px] text-slate-500 line-through">
              ${Number(compareAtPrice).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
