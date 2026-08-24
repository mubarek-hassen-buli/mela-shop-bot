import React from 'react';
import { Product } from '../../types/product';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCart } from '../../hooks/useCart';
import { useTelegram } from '../../hooks/useTelegram';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { isWishlisted, toggleWishlist } = useWishlistStore();
  const { addToCart, isAdding } = useCart();
  const { triggerHaptic } = useTelegram();

  const primaryImage =
    product.images.find((img) => img.is_primary)?.url || product.images[0]?.url;
  const activeVariant = product.variants.find((v) => v.is_active) || product.variants[0];

  const price = activeVariant ? Number(activeVariant.price) : 0;
  const wishlisted = isWishlisted(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    toggleWishlist(product);
  };

  const handleQuickAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeVariant) return;
    triggerHaptic('medium');
    try {
      await addToCart({ variantId: activeVariant.id, quantity: 1 });
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const formattedPrice = `${price.toLocaleString()} Birr`;

  return (
    <div
      onClick={onClick}
      className="group relative aspect-[3/4.2] w-full rounded-[26px] overflow-hidden bg-[#111114] border border-white/[0.08] shadow-xl cursor-pointer select-none transition-transform duration-200 active:scale-[0.98]"
    >
      {/* Product Image */}
      {primaryImage ? (
        <img
          src={primaryImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#141418] text-slate-500 text-xs">
          No Image
        </div>
      )}

      {/* Dark Scrim Overlay for Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/5 pointer-events-none" />

      {/* Top Floating Action: Favorite Heart Button */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="w-[34px] h-[34px] rounded-full ios-glass-btn flex items-center justify-center text-white"
          title="Add to Wishlist"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 transition-colors"
            fill={wishlisted ? 'white' : 'none'}
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      {/* Bottom Floating Info: Title, Price Capsule & Cart Button */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex flex-col gap-1.5">
        <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
          {product.title}
        </h3>

        <div className="flex items-center justify-between gap-1.5">
          {/* iOS Liquid Glass Price Capsule */}
          <div className="ios-glass-capsule text-white font-bold text-[11px] px-3.5 py-1.5 rounded-full tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {formattedPrice}
          </div>

          {/* iOS Liquid Glass Quick Cart Button */}
          <button
            type="button"
            onClick={handleQuickAddToCart}
            disabled={isAdding || (activeVariant && activeVariant.stock_quantity <= 0)}
            className="w-7 h-7 rounded-xl ios-glass-btn flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40"
            title="Quick add to cart"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
