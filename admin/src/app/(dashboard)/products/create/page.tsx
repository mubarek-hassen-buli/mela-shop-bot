'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, Check, Loader2, UploadCloud, X, ImageIcon } from 'lucide-react';
import { productService } from '../../../../services/productService';
import { categoryBrandService } from '../../../../services/categoryBrandService';
import { mediaService, UploadMediaResponse } from '../../../../services/mediaService';

export default function CreateProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<string>('530000');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // 3 Dedicated Image Slots: Main, Angle 2 (Optional), Angle 3 (Optional)
  const [image1, setImage1] = useState<UploadMediaResponse | null>(null);
  const [image2, setImage2] = useState<UploadMediaResponse | null>(null);
  const [image3, setImage3] = useState<UploadMediaResponse | null>(null);

  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // Key Features list
  const [features, setFeatures] = useState<string[]>([
    'Powerful Processing',
    'High speed SSD storage',
    'Retina display with crisp colors',
  ]);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: categoryBrandService.getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File, slot: number) => {
    setError(null);
    setUploadingSlot(slot);
    try {
      const res = await mediaService.uploadImage(file);
      if (slot === 1) setImage1(res);
      else if (slot === 2) setImage2(res);
      else if (slot === 3) setImage3(res);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to upload image.';
      setError(typeof msg === 'string' ? msg : 'Upload failed');
    } finally {
      setUploadingSlot(null);
    }
  };

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
        'Failed to create product.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!image1) {
      setError('Please upload at least the Main Photo for the product.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid positive price.');
      return;
    }

    // Auto-generate slug from title
    const generatedSlug =
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || `product-${Date.now()}`;

    // Collect all uploaded images
    const imagesPayload = [
      { media_id: image1.id, is_primary: true, display_order: 1 },
      ...(image2 ? [{ media_id: image2.id, is_primary: false, display_order: 2 }] : []),
      ...(image3 ? [{ media_id: image3.id, is_primary: false, display_order: 3 }] : []),
    ];

    // Collect features
    const cleanedFeatures = features.map((f) => f.trim()).filter(Boolean);
    const specsPayload = cleanedFeatures.map((f, idx) => ({
      key: `Feature ${idx + 1}`,
      value: f,
    }));

    createMutation.mutate({
      title: title.trim(),
      slug: generatedSlug,
      category_id: Number(categoryId),
      description: description.trim() || undefined,
      is_active: isActive,
      images: imagesPayload,
      specifications: specsPayload,
      variants: [
        {
          sku: `SKU-${Date.now().toString().slice(-6)}`,
          price: priceNum,
          stock: 50,
          is_active: true,
        },
      ],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl pb-16">
      {/* Top Bar with Back Link and Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Product</h1>
            <p className="text-xs text-white/50 mt-0.5">Add a new item to your online catalog</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending || uploadingSlot !== null}
          className="admin-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
        >
          {createMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4 stroke-[3]" />
          )}
          Publish Product
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Main Details Card */}
      <div className="admin-card rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Product Information</h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-white/60">Product Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. MacBook Pro M3 Max, iPhone 15 Pro, Gaming Headphones"
            className="w-full bg-white/[0.04] text-white placeholder-white/40 text-xs px-4 py-2.5 rounded-2xl border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-white/60">Category *</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value) || '')}
              className="w-full bg-[#14171E] text-white text-xs px-4 py-2.5 rounded-2xl border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors"
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
            <label className="text-[11px] font-semibold text-white/60">Price (Birr) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 530000"
              className="w-full bg-white/[0.04] text-white text-xs px-4 py-2.5 rounded-2xl border border-white/[0.08] focus:outline-none focus:border-white/30 font-bold"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-white/60">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the product..."
            className="w-full bg-white/[0.04] text-white placeholder-white/40 text-xs px-4 py-2.5 rounded-2xl border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors resize-none"
          />
        </div>
      </div>

      {/* 3 Dedicated Product Image Angle Slots */}
      <div className="admin-card rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Product Photos (3 Angles)
          </h3>
          <p className="text-[11px] text-white/50 mt-0.5">
            Main photo is required. Add 2 optional angle photos to enable customer carousel.
          </p>
        </div>

        <input
          ref={fileInputRef1}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 1)}
          className="hidden"
        />
        <input
          ref={fileInputRef2}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 2)}
          className="hidden"
        />
        <input
          ref={fileInputRef3}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 3)}
          className="hidden"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Slot 1: Main Photo */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white">1. Main Photo *</span>
              {image1 && <span className="text-[10px] text-emerald-400 font-medium">Uploaded</span>}
            </div>

            {image1 ? (
              <div className="relative aspect-video rounded-2xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center p-2">
                <img src={image1.url} alt="Main view" className="max-w-full max-h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setImage1(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-xl bg-rose-500/80 text-white hover:bg-rose-600 transition-colors shadow-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadingSlot !== null}
                onClick={() => fileInputRef1.current?.click()}
                className="aspect-video rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/60 hover:text-white transition-all cursor-pointer"
              >
                {uploadingSlot === 1 ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 text-white/70" />
                    <span className="text-[11px] font-semibold text-white/80">Upload Main Photo</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Slot 2: Angle 2 (Optional) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-white/50">2. Angle 2 (Optional)</span>
              {image2 && <span className="text-[10px] text-emerald-400 font-medium">Uploaded</span>}
            </div>

            {image2 ? (
              <div className="relative aspect-video rounded-2xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center p-2">
                <img src={image2.url} alt="Angle 2" className="max-w-full max-h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setImage2(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-xl bg-rose-500/80 text-white hover:bg-rose-600 transition-colors shadow-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadingSlot !== null}
                onClick={() => fileInputRef2.current?.click()}
                className="aspect-video rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-white/80 transition-all cursor-pointer"
              >
                {uploadingSlot === 2 ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5 text-white/30" />
                    <span className="text-[11px] font-medium text-white/50">+ Add Angle 2</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Slot 3: Angle 3 (Optional) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-white/50">3. Angle 3 (Optional)</span>
              {image3 && <span className="text-[10px] text-emerald-400 font-medium">Uploaded</span>}
            </div>

            {image3 ? (
              <div className="relative aspect-video rounded-2xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center p-2">
                <img src={image3.url} alt="Angle 3" className="max-w-full max-h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setImage3(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-xl bg-rose-500/80 text-white hover:bg-rose-600 transition-colors shadow-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadingSlot !== null}
                onClick={() => fileInputRef3.current?.click()}
                className="aspect-video rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-white/80 transition-all cursor-pointer"
              >
                {uploadingSlot === 3 ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5 text-white/30" />
                    <span className="text-[11px] font-medium text-white/50">+ Add Angle 3</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="admin-card rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Key Features</h3>
            <p className="text-[11px] text-white/50 mt-0.5">
              Bullet points displayed directly on the product detail page
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddFeature}
            className="px-3.5 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-semibold rounded-xl border border-white/10 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Another
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={feat}
                onChange={(e) => handleFeatureChange(idx, e.target.value)}
                placeholder="e.g. 512GB SSD for quick access and secure storage"
                className="flex-1 bg-white/[0.04] text-white placeholder-white/40 text-xs px-4 py-2.5 rounded-2xl border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => handleRemoveFeature(idx)}
                className="p-2.5 rounded-2xl bg-white/[0.03] text-white/40 hover:text-rose-400 hover:bg-rose-500/10 border border-white/[0.06] transition-colors"
                title="Remove Feature"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Status Toggle */}
      <div className="admin-card rounded-3xl p-6 flex items-center justify-between shadow-xl">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Product Status</h3>
          <p className="text-[11px] text-white/50 mt-0.5">Publish product immediately to catalog</p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>
    </form>
  );
}
