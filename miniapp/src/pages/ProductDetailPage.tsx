import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Check } from 'lucide-react';
import { ImageCarousel } from '../components/product/ImageCarousel';
import { VariantSelector } from '../components/product/VariantSelector';
import { SpecTable } from '../components/product/SpecTable';
import { Product, ProductVariant } from '../types/product';
import { useCart } from '../hooks/useCart';
import { useTelegram } from '../hooks/useTelegram';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack }) => {
  const { triggerHaptic } = useTelegram();
  const { addToCart, isAdding } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.find((v) => v.is_active) || product.variants[0] || null
  );

  const [addedSuccess, setAddedSuccess] = useState(false);

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

  const activePrice = selectedVariant ? selectedVariant.price : 0;
  const compareAtPrice = selectedVariant?.compare_at_price;

  return (
    <div className="flex flex-col gap-4 pb-28 px-4 pt-3">
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 text-xs font-medium border border-slate-700/60 hover:bg-slate-800 transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Back to catalog
      </button>

      <ImageCarousel images={product.images} title={product.title} />

      <div className="flex flex-col gap-2">
        {product.brand && (
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            {product.brand.name}
          </span>
        )}
        <h2 className="text-xl font-bold text-slate-100 leading-tight">{product.title}</h2>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-sky-400">
            ${Number(activePrice).toFixed(2)}
          </span>
          {compareAtPrice && compareAtPrice > activePrice && (
            <span className="text-sm text-slate-500 line-through">
              ${Number(compareAtPrice).toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {product.description && (
        <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-300 leading-relaxed">{product.description}</p>
        </div>
      )}

      {product.variants.length > 0 && (
        <VariantSelector
          variants={product.variants}
          selectedVariantId={selectedVariant?.id || null}
          onSelectVariant={setSelectedVariant}
        />
      )}

      <SpecTable specifications={product.specifications} />

      {/* Sticky Bottom Action Button */}
      <div className="fixed bottom-14 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 z-40">
        <button
          disabled={!selectedVariant || selectedVariant.stock_quantity <= 0 || isAdding}
          onClick={handleAddToCart}
          className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
            addedSuccess
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20 active:scale-[0.98]'
          }`}
        >
          {addedSuccess ? (
            <>
              <Check className="w-5 h-5" /> Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
