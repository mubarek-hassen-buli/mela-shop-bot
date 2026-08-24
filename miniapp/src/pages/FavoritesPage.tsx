import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { ProductCard } from '../components/catalog/ProductCard';
import { Product } from '../types/product';

interface FavoritesPageProps {
  onSelectProduct: (product: Product) => void;
  onExplore: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  onSelectProduct,
  onExplore,
}) => {
  const wishlist = useWishlistStore((state) => state.wishlist);

  return (
    <div className="flex flex-col gap-4 pb-28 px-3.5 pt-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">My Wishlist</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#141922]/80 border border-white/10 flex items-center justify-center text-slate-400 mb-4 shadow-xl">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">Your wishlist is empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            Tap the heart icon on any product to save it here for later.
          </p>
          <button
            onClick={onExplore}
            className="mt-6 px-6 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white text-xs font-bold shadow-lg active:scale-95 transition-all"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-2">
          {wishlist.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onSelectProduct(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
