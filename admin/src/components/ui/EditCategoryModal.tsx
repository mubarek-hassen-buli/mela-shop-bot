'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, UploadCloud, Save } from 'lucide-react';
import { categoryBrandService } from '../../services/categoryBrandService';
import { mediaService } from '../../services/mediaService';
import { Category } from '../../types/product';

interface EditCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  category,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setImageUrl(category.image_url || '');
      setError(null);
    }
  }, [category]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

    if (!isPng && !isSvg) {
      setError('Only PNG and SVG image formats are supported.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const res = await mediaService.uploadImage(file);
      setImageUrl(res.url);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to upload category image.';
      setError(typeof msg === 'string' ? msg : 'Image upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateMutation = useMutation({
    mutationFn: (payload: { name: string; slug: string; image_url?: string }) => {
      if (!category) throw new Error('No category selected');
      return categoryBrandService.updateCategory(category.id, payload);
    },
    onSuccess: (updatedCat) => {
      queryClient.setQueryData<Category[]>(['admin-categories'], (old = []) =>
        old.map((c) => (c.id === updatedCat.id ? updatedCat : c))
      );
      queryClient.invalidateQueries({ queryKey: ['admin-categories'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'all' });
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.detail || 'Failed to update category';
      setError(typeof msg === 'string' ? msg : 'Failed to update category');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category) return;
    const derivedSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || category.slug;

    updateMutation.mutate({
      name: name.trim(),
      slug: derivedSlug,
      image_url: imageUrl.trim() || undefined,
    });
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0E1015] border border-white/[0.08] rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <h3 className="text-base font-bold text-white">Edit Category</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-white/60">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.04] text-white placeholder-white/40 text-xs px-4 py-2.5 rounded-2xl border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Icon Image */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-white/60">
              Category Icon Image (PNG or SVG only)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.svg,image/png,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />

            {imageUrl ? (
              <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                <div className="w-12 h-12 rounded-xl bg-black/70 p-2 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <img src={imageUrl} alt="Category icon" className="max-w-full max-h-full object-contain filter brightness-110" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Icon attached</span>
                  <span className="text-[10px] text-emerald-400">Ready to update</span>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="p-1.5 text-white/40 hover:text-rose-400 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2.5 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] text-white/80 rounded-2xl border border-dashed border-white/15 text-xs font-medium transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                    <span>Uploading icon...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-white/60" />
                    <span>Upload new PNG or SVG icon</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-semibold text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || isUploading}
              className="admin-btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
