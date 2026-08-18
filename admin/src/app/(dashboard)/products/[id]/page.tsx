'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, Check, Loader2, Save } from 'lucide-react';
import { productService } from '../../../../services/productService';
import { categoryBrandService } from '../../../../services/categoryBrandService';
import { CloudinaryUploader } from '../../../../components/media/CloudinaryUploader';
import { UploadMediaResponse } from '../../../../services/mediaService';
import { CreateColorModal } from '../../../../components/ui/CreateColorModal';
import { Color } from '../../../../types/product';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const productId = Number(params?.id);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [brandId, setBrandId] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);

  // Dynamic Lists
  const [variants, setVariants] = useState<
    { sku: string; size: string; price: number; stock_quantity: number; color_id?: number }[]
  >([]);

  const [images, setImages] = useState<UploadMediaResponse[]>([]);

  const [specs, setSpecs] = useState<{ spec_key: string; spec_value: string }[]>([]);

  // Color modal state
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [activeVariantIdxForColor, setActiveVariantIdxForColor] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  const { data: product, isLoading: isFetchingProduct } = useQuery({
    queryKey: ['admin-product', productId],
    queryFn: () => productService.getProduct(productId),
    enabled: Boolean(productId),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: categoryBrandService.getCategories,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: categoryBrandService.getBrands,
  });

  const { data: colors = [] } = useQuery({
    queryKey: ['admin-colors'],
    queryFn: productService.getColors,
  });

  // Pre-fill form when product data is fetched
  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setSlug(product.slug || '');
      setDescription(product.description || '');
      setCategoryId(product.category_id || '');
      setBrandId(product.brand_id || '');
      setIsActive(product.is_active ?? true);

      if (product.variants && product.variants.length > 0) {
        setVariants(
          product.variants.map((v) => ({
            sku: v.sku,
            size: v.size || '',
            price: Number(v.price),
            stock_quantity: v.stock_quantity,
            color_id: v.color_id || undefined,
          }))
        );
      }

      if (product.images && product.images.length > 0) {
        setImages(
          product.images.map((img) => ({
            cloudinary_public_id: img.cloudinary_public_id,
            url: img.url,
          }))
        );
      }

      if (product.specifications && product.specifications.length > 0) {
        setSpecs(
          product.specifications.map((s) => ({
            spec_key: s.spec_key,
            spec_value: s.spec_value,
          }))
        );
      }
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => productService.updateProduct(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['admin-product', productId], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'], refetchType: 'all' });
      router.push('/products');
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to update product.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });

  // Variant Helpers
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        size: 'L',
        price: 39.99,
        stock_quantity: 5,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setVariants((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleOpenColorModalForVariant = (idx: number) => {
    setActiveVariantIdxForColor(idx);
    setIsColorModalOpen(true);
  };

  const handleColorCreated = (newColor: Color) => {
    if (activeVariantIdxForColor !== null && variants[activeVariantIdxForColor]) {
      const copy = [...variants];
      copy[activeVariantIdxForColor].color_id = newColor.id;
      setVariants(copy);
    }
  };

  // Spec Helpers
  const addSpec = () => {
    setSpecs((prev) => [...prev, { spec_key: '', spec_value: '' }]);
  };

  const removeSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateSpec = (index: number, field: 'spec_key' | 'spec_value', value: string) => {
    setSpecs((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !categoryId) {
      setError('Please fill in required fields (Title, Slug, Category).');
      return;
    }

    if (variants.length === 0) {
      setError('Please add at least one product variant (SKU, Size, Price, Stock).');
      return;
    }

    setError(null);
    updateMutation.mutate({
      title,
      slug,
      description,
      category_id: Number(categoryId),
      brand_id: brandId ? Number(brandId) : undefined,
      is_active: isActive,
      variants,
      images: images.map((img, idx) => ({
        cloudinary_public_id: img.cloudinary_public_id,
        url: img.url,
        display_order: idx,
        is_primary: idx === 0,
      })),
      specifications: specs.filter((s) => s.spec_key.trim() && s.spec_value.trim()),
    });
  };

  if (isFetchingProduct) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
        <span className="text-xs">Loading product details...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-5xl pb-16">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Edit Product</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Update catalog details, color variants, specifications, and media
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Basic Info Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Basic Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Product Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Category *</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value) || '')}
              className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Brand</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(Number(e.target.value) || '')}
              className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500"
            >
              <option value="">No Brand (Generic)</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 justify-center">
            <label className="text-[11px] font-semibold text-slate-400">Mini App Visibility</label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Check className={`w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
              {isActive ? 'Visible in Mini App' : 'Hidden from Mini App'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-slate-400">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500 resize-none"
          />
        </div>
      </div>

      {/* Cloudinary Media Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
          Product Images (Cloudinary)
        </h3>
        <CloudinaryUploader onUploadSuccess={(img) => setImages((prev) => [...prev, img])} />

        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mt-2">
            {images.map((img, idx) => (
              <div
                key={img.cloudinary_public_id || idx}
                className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950"
              >
                <img src={img.url} alt="Product image" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 p-1 bg-slate-900/80 text-rose-400 rounded-md hover:bg-slate-900 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants & Colors Builder */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Variants, Colors & Stock Configuration
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Add multiple color variants, sizes, and inventory levels
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-sky-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Variant
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {variants.map((v, idx) => {
            const selectedColor = colors.find((c) => c.id === v.color_id);

            return (
              <div
                key={idx}
                className="grid grid-cols-6 gap-3 items-center bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60"
              >
                {/* SKU */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold">SKU *</label>
                  <input
                    type="text"
                    required
                    value={v.sku}
                    onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:border-sky-500"
                  />
                </div>

                {/* Color Selector */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-400 font-semibold">Color</label>
                    <button
                      type="button"
                      onClick={() => handleOpenColorModalForVariant(idx)}
                      className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" /> New
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    {selectedColor && (
                      <span
                        className="absolute left-2.5 w-3 h-3 rounded-full border border-slate-600 pointer-events-none z-10"
                        style={{ backgroundColor: selectedColor.hex_code }}
                      />
                    )}
                    <select
                      value={v.color_id || ''}
                      onChange={(e) =>
                        updateVariant(
                          idx,
                          'color_id',
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className={`w-full bg-slate-900 text-slate-100 text-xs py-1.5 rounded-lg border border-slate-700 focus:border-sky-500 ${
                        selectedColor ? 'pl-7 pr-2' : 'px-2.5'
                      }`}
                    >
                      <option value="">No Color</option>
                      {colors.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name} ({col.hex_code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Size */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold">Size / Spec</label>
                  <input
                    type="text"
                    placeholder="e.g. M, 256GB"
                    value={v.size}
                    onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:border-sky-500"
                  />
                </div>

                {/* Price */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={v.price}
                    onChange={(e) =>
                      updateVariant(idx, 'price', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:border-sky-500"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold">Stock Qty *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={v.stock_quantity}
                    onChange={(e) =>
                      updateVariant(idx, 'stock_quantity', parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:border-sky-500"
                  />
                </div>

                {/* Delete Button */}
                <div className="flex items-center justify-center pt-4">
                  {variants.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Remove Variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-semibold">Primary</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Technical Specifications
          </h3>
          <button
            type="button"
            onClick={addSpec}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-sky-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Attribute
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {specs.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Key (e.g. Battery, Material)"
                value={s.spec_key}
                onChange={(e) => updateSpec(idx, 'spec_key', e.target.value)}
                className="w-1/3 bg-slate-800 text-slate-100 text-xs px-3.5 py-2 rounded-xl border border-slate-700 focus:border-sky-500"
              />
              <input
                type="text"
                placeholder="Value (e.g. 5000mAh, Cotton)"
                value={s.spec_value}
                onChange={(e) => updateSpec(idx, 'spec_value', e.target.value)}
                className="flex-1 bg-slate-800 text-slate-100 text-xs px-3.5 py-2 rounded-xl border border-slate-700 focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => removeSpec(idx)}
                className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Color Creation Modal */}
      <CreateColorModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        onColorCreated={handleColorCreated}
      />
    </form>
  );
}
