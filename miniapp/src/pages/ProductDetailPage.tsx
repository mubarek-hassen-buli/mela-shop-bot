import React, { useState } from 'react';
import { ArrowLeft, Check, Heart, ShoppingBag } from 'lucide-react';
import { ImageCarousel } from '../components/product/ImageCarousel';
import { Product, ProductVariant } from '../types/product';
import { useCart } from '../hooks/useCart';
import { useTelegram } from '../hooks/useTelegram';
import { useWishlistStore } from '../store/wishlistStore';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack }) => {
  const { triggerHaptic } = useTelegram();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlistStore();

  const [selectedVariant] = useState<ProductVariant | null>(
    product.variants?.find((v) => v.is_active) || product.variants?.[0] || null
  );

  const [addedSuccess, setAddedSuccess] = useState(false);
  const wishlisted = isWishlisted(product.id);

  // 100% Instant Optimistic Add to Cart (0ms UI feedback)
  const handleAddToCart = () => {
    if (!selectedVariant) return;
    triggerHaptic('medium');
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2200);

    addToCart({
      product,
      variant: selectedVariant,
      variantId: selectedVariant.id,
      quantity: 1,
    }).catch((e) => {
      console.error('Failed to sync add to cart with backend:', e);
      setAddedSuccess(false);
    });
  };

  const activePrice = selectedVariant ? Number(selectedVariant.price) : 0;

  // Extract key features from specifications / description
  const features: string[] = [];

  if (product.specifications && product.specifications.length > 0) {
    product.specifications.forEach((spec) => {
      if (spec.spec_value && spec.spec_value.trim()) {
        features.push(spec.spec_value.trim());
      }
    });
  }

  // Fallback if no specs provided in legacy products
  if (features.length === 0 && product.description) {
    const lines = product.description
      .split('\n')
      .map((l) => l.replace(/^[•\-\*]\s*/, '').trim())
      .filter((l) => l.length > 3);
    if (lines.length > 1) {
      features.push(...lines.slice(0, 6));
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-32 px-4 pt-3 relative">
      {/* Top Floating Circular Action Buttons (Clean iOS standard glass) */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-auto">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full ios-glass-circle flex items-center justify-center text-white active:scale-90 transition-transform"
          aria-label="Back to catalog"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Favorite Button (Instant 0ms toggle) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            toggleWishlist(product);
          }}
          className="w-10 h-10 rounded-full ios-glass-circle flex items-center justify-center text-white active:scale-90 transition-transform"
          aria-label="Toggle wishlist"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              wishlisted ? 'fill-white text-white' : 'text-white stroke-[2]'
            }`}
          />
        </button>
      </div>

      {/* Image Carousel */}
      <div className="mt-2 -mx-4">
        <ImageCarousel images={product.images} title={product.title} />
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col gap-4 mt-5">
        {/* Category & Status Badges */}
        <div className="flex items-center gap-2">
          {product.category && (
            <span className="text-[11px] font-semibold text-white/60 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-md">
              {product.category.name}
            </span>
          )}
          <span className="text-[11px] font-semibold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
            In Stock
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">
          {product.title}
        </h1>

        {/* Price Tag */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tracking-tight">
            {activePrice.toLocaleString()} <span className="text-sm font-bold text-white/70">Birr</span>
          </span>
        </div>

        {/* Key Features List (Clean Minimalist Cards) */}
        {features.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <h2 className="text-xs font-bold text-white/50 uppercase tracking-wider">
              Key Features
            </h2>
            <div className="flex flex-col gap-2">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-md"
                >
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-medium text-white/90 leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description Text */}
        {product.description && features.length === 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <h2 className="text-xs font-bold text-white/50 uppercase tracking-wider">
              Description
            </h2>
            <p className="text-xs text-white/70 leading-relaxed whitespace-pre-line p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              {product.description}
            </p>
          </div>
        )}
      </div>

      {/* Floating Bottom Add to Cart CTA */}
      <div className="fixed bottom-6 left-4 right-4 max-w-[398px] mx-auto z-40">
        <button
          type="button"
          onClick={handleAddToCart}
          className={`w-full py-4 px-6 rounded-[22px] font-bold text-sm flex items-center justify-center gap-2.5 shadow-2xl transition-all duration-300 active:scale-[0.98] ${
            addedSuccess
              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
              : 'bg-white text-black hover:bg-white/95 shadow-white/20'
          }`}
        >
          {addedSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>Add to Cart • {activePrice.toLocaleString()} Birr</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
