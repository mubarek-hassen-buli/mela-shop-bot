'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, Check, Loader2, Palette } from 'lucide-react';
import { productService } from '../../../../services/productService';
import { categoryBrandService } from '../../../../services/categoryBrandService';
import { CloudinaryUploader } from '../../../../components/media/CloudinaryUploader';
import { UploadMediaResponse } from '../../../../services/mediaService';
import { CreateColorModal } from '../../../../components/ui/CreateColorModal';
import { Color } from '../../../../types/product';

export default function CreateProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [brandId, setBrandId] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);

  // Dynamic Lists
  const [variants, setVariants] = useState<
    { sku: string; size: string; price: number; stock_quantity: number; color_id?: number }[]
  >([{ sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`, size: 'M', price: 29.99, stock_quantity: 10 }]);

  const [images, setImages] = useState<UploadMediaResponse[]>([]);

  const [specs, setSpecs] = useState<{ spec_key: string; spec_value: string }[]>([
    { spec_key: 'Material', spec_value: '100% Cotton' },
  ]);

  // Color modal state
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [activeVariantIdxForColor, setActiveVariantIdxForColor] = useState<number | null>(null);

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

  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'], refetchType: 'all' });
      router.push('/products');
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to create product. Please check your inputs.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        size: 'L',
        price: 29.99,
        stock_quantity: 5,
      },
    ]);
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleAddSpec = () => {
    setSpecs([...specs, { spec_key: '', spec_value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Please select a Category.');
      return;
    }

    if (variants.length === 0) {
      setError('Please add at least one product variant.');
      return;
    }

    createMutation.mutate({
      title,
      slug,
      description,
      category_id: Number(categoryId),
      brand_id: brandId ? Number(brandId) : undefined,
      is_active: isActive,
      variants: variants.map((v) => ({
        sku: v.sku,
        size: v.size,
        price: Number(v.price),
        stock_quantity: Number(v.stock_quantity),
        color_id: v.color_id ? Number(v.color_id) : undefined,
        is_active: true,
      })),
      images: images.map((img, idx) => ({
        cloudinary_public_id: img.cloudinary_public_id,
        url: img.url,
        display_order: idx,
        is_primary: idx === 0,
      })),
      specifications: specs.filter((s) => s.spec_key.trim() && s.spec_value.trim()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Create Product</h1>
            <p className="text-xs text-slate-400 mt-0.5">Add a new item to your store catalog</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {createMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" /> Save Product
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Main Details */}
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
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Premium Wireless Headphones"
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
              placeholder="premium-wireless-headphones"
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
              onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : '')}
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
            placeholder="Detailed description of product features..."
            className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500 resize-none"
          />
        </div>
      </div>

      {/* Cloudinary Media Uploader */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Product Images (Cloudinary)
        </h3>
        <CloudinaryUploader onUploadSuccess={(img) => setImages([...images, img])} />

        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mt-2">
            {images.map((img, idx) => (
              <div
                key={img.cloudinary_public_id || idx}
                className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950"
              >
                <img src={img.url} alt="Uploaded product" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
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
              Variants, Colors & Pricing
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Add multiple color variants, sizes, and stock quantities
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="px-3.5 py-1.5 bg-slate-800 text-sky-400 text-xs font-semibold rounded-lg hover:bg-slate-750 border border-slate-700 flex items-center gap-1.5 transition-colors"
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
                    placeholder="SKU"
                    value={v.sku}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx].sku = e.target.value;
                      setVariants(copy);
                    }}
                    className="bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:border-sky-500"
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
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].color_id = e.target.value ? Number(e.target.value) : undefined;
                        setVariants(copy);
                      }}
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
                    placeholder="e.g. S, M, 256GB"
                    value={v.size}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx].size = e.target.value;
                      setVariants(copy);
                    }}
                    className="bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:border-sky-500"
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
                    placeholder="29.99"
                    value={v.price}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx].price = parseFloat(e.target.value) || 0;
                      setVariants(copy);
                    }}
                    className="bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:border-sky-500"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold">Stock Qty *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="10"
                    value={v.stock_quantity}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx].stock_quantity = parseInt(e.target.value, 10) || 0;
                      setVariants(copy);
                    }}
                    className="bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:border-sky-500"
                  />
                </div>

                {/* Delete Button */}
                <div className="flex items-center justify-center pt-4">
                  {variants.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
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

      {/* Technical Specifications */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Technical Specifications
          </h3>
          <button
            type="button"
            onClick={handleAddSpec}
            className="px-3.5 py-1.5 bg-slate-800 text-sky-400 text-xs font-semibold rounded-lg hover:bg-slate-750 border border-slate-700 flex items-center gap-1.5 transition-colors"
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
                onChange={(e) => {
                  const copy = [...specs];
                  copy[idx].spec_key = e.target.value;
                  setSpecs(copy);
                }}
                className="w-1/3 bg-slate-800 text-slate-100 text-xs px-3.5 py-2 rounded-xl border border-slate-700 focus:border-sky-500"
              />
              <input
                type="text"
                placeholder="Value (e.g. 5000mAh, 100% Cotton)"
                value={s.spec_value}
                onChange={(e) => {
                  const copy = [...specs];
                  copy[idx].spec_value = e.target.value;
                  setSpecs(copy);
                }}
                className="flex-1 bg-slate-800 text-slate-100 text-xs px-3.5 py-2 rounded-xl border border-slate-700 focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => handleRemoveSpec(idx)}
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
