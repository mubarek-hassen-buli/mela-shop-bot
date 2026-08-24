import React, { useState } from 'react';
import { ArrowLeft, Check, Heart, Loader2 } from 'lucide-react';
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
  const { addToCart, isAdding } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlistStore();

  const [selectedVariant] = useState<ProductVariant | null>(
    product.variants?.find((v) => v.is_active) || product.variants?.[0] || null
  );

  const [addedSuccess, setAddedSuccess] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    triggerHaptic('medium');
    try {
      await addToCart({ variantId: selectedVariant.id, quantity: 1 });
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (e) {
      console.error('Failed to add to cart', e);
    }
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
          className="w-10 h-10 rounded-full ios-glass-circle flex items-center justify-center text-white"
          aria-label="Back to catalog"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            toggleWishlist(product);
          }}
          className="w-10 h-10 rounded-full ios-glass-circle flex items-center justify-center text-white"
          aria-label="Toggle wishlist"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              wishlisted ? 'fill-white text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)]' : 'fill-white text-white'
            }`}
          />
        </button>
      </div>

      {/* Full Bleed Image Showcase with Smooth Transitions & Gradient Fade */}
      <ImageCarousel images={product.images} title={product.title} />

      {/* Product Title */}
      <h1 className="text-base sm:text-lg font-bold text-white leading-snug tracking-tight mt-4 px-0.5">
        {product.title}
      </h1>

      {/* Product Description */}
      {product.description && (
        <p className="text-xs text-white/60 font-normal leading-relaxed mt-2 px-0.5">
          {product.description}
        </p>
      )}

      {/* Key Features Bullet List with Solid White Circle Checkmarks */}
      {features.length > 0 && (
        <div className="flex flex-col gap-3 mt-5 px-0.5">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Check className="w-3 h-3 text-black stroke-[3.5]" />
              </div>
              <span className="text-xs text-white/90 font-medium leading-relaxed">
                {feature}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Liquid Glass Bottom Action Bar with Top Fade-Out (No Stroke) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40 pointer-events-none">
        {/* Smooth top fade out gradient */}
        <div className="h-6 bg-gradient-to-t from-[#0E0E10]/80 to-transparent w-full pointer-events-none" />

        {/* Liquid glass container */}
        <div className="ios-glass-bottom-bar px-5 py-4 flex items-center justify-between pointer-events-auto">
          {/* Left: Price Display in Birr */}
          <div className="text-xl font-bold text-white tracking-tight">
            {activePrice.toLocaleString()} Birr
          </div>

          {/* Right: Liquid Glass Add to Cart Button */}
          <button
            type="button"
            disabled={!selectedVariant || selectedVariant.stock_quantity <= 0 || isAdding}
            onClick={handleAddToCart}
            className={`px-7 py-3 rounded-full text-xs font-semibold text-white tracking-wide flex items-center justify-center gap-2 transition-all ${
              addedSuccess
                ? 'bg-white text-slate-950 font-bold shadow-lg scale-95'
                : 'ios-glass-dark-btn disabled:opacity-50'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" /> Added
              </>
            ) : isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Adding...
              </>
            ) : (
              'Add to cart'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
