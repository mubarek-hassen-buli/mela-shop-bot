'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import { productService } from '../../../../services/productService';
import { categoryBrandService } from '../../../../services/categoryBrandService';
import { CloudinaryUploader } from '../../../../components/media/CloudinaryUploader';
import { UploadMediaResponse } from '../../../../services/mediaService';

export default function CreateProductPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [brandId, setBrandId] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);

  // Dynamic Lists
  const [variants, setVariants] = useState<
    { sku: string; size: string; price: number; stock_quantity: number; color_id?: number }[]
  >([{ sku: 'SKU-001', size: 'M', price: 29.99, stock_quantity: 10 }]);

  const [images, setImages] = useState<UploadMediaResponse[]>([]);

  const [specs, setSpecs] = useState<{ spec_key: string; spec_value: string }[]>([
    { spec_key: 'Material', spec_value: '100% Cotton' },
  ]);

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

  const createMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      router.push('/products');
    },
  });

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { sku: `SKU-00${variants.length + 1}`, size: 'L', price: 29.99, stock_quantity: 5 },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;

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
      specifications: specs.filter((s) => s.spec_key && s.spec_value),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-4xl pb-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100"
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
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all"
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

      {/* Basic Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Basic Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400">Product Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Premium Cotton T-Shirt"
              className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400">URL Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="premium-cotton-t-shirt"
              className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400">Category</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
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

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400">Brand (Optional)</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : '')}
              className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500"
            >
              <option value="">No Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of product features..."
            className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Cloudinary Media Uploader */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Product Images (Cloudinary)</h3>
        <CloudinaryUploader onUploadSuccess={(img) => setImages([...images, img])} />

        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mt-2">
            {images.map((img, idx) => (
              <div key={img.cloudinary_public_id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <img src={img.url} alt="Uploaded product" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 p-1 bg-slate-900/80 text-rose-400 rounded-md hover:bg-slate-900"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants Builder */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Product Variants</h3>
          <button
            type="button"
            onClick={handleAddVariant}
            className="px-3 py-1.5 bg-slate-800 text-sky-400 text-xs font-semibold rounded-lg hover:bg-slate-750 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Variant
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {variants.map((v, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-3 items-center bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <input
                type="text"
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => {
                  const copy = [...variants];
                  copy[idx].sku = e.target.value;
                  setVariants(copy);
                }}
                className="bg-slate-800 text-slate-100 text-xs px-3 py-2 rounded-lg border border-slate-700/60"
              />
              <input
                type="text"
                placeholder="Size"
                value={v.size}
                onChange={(e) => {
                  const copy = [...variants];
                  copy[idx].size = e.target.value;
                  setVariants(copy);
                }}
                className="bg-slate-800 text-slate-100 text-xs px-3 py-2 rounded-lg border border-slate-700/60"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={v.price}
                onChange={(e) => {
                  const copy = [...variants];
                  copy[idx].price = Number(e.target.value);
                  setVariants(copy);
                }}
                className="bg-slate-800 text-slate-100 text-xs px-3 py-2 rounded-lg border border-slate-700/60"
              />
              <input
                type="number"
                placeholder="Stock Qty"
                value={v.stock_quantity}
                onChange={(e) => {
                  const copy = [...variants];
                  copy[idx].stock_quantity = Number(e.target.value);
                  setVariants(copy);
                }}
                className="bg-slate-800 text-slate-100 text-xs px-3 py-2 rounded-lg border border-slate-700/60"
              />
              <button
                type="button"
                onClick={() => handleRemoveVariant(idx)}
                className="p-2 text-slate-500 hover:text-rose-400 justify-self-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
