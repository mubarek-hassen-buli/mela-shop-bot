'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, FolderTree, Loader2, UploadCloud, X, ImageIcon, Pencil, GripVertical } from 'lucide-react';
import { categoryBrandService } from '../../../services/categoryBrandService';
import { mediaService } from '../../../services/mediaService';
import { Category } from '../../../types/product';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EditCategoryModal } from '../../../components/ui/EditCategoryModal';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Drag-and-drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: categoryBrandService.getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format: strictly PNG or SVG
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

    if (!isPng && !isSvg) {
      setError('Only PNG and SVG image formats are supported for categories.');
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

  const createMutation = useMutation({
    mutationFn: (newCat: { name: string; slug: string; image_url?: string }) =>
      categoryBrandService.createCategory(newCat.name, newCat.slug, newCat.image_url),
    onMutate: async (newCat) => {
      setError(null);
      await queryClient.cancelQueries({ queryKey: ['admin-categories'] });

      const previousCategories = queryClient.getQueryData<Category[]>(['admin-categories']) || [];

      // Optimistically add new category with safe temporary ID
      const tempId = -Math.floor(Math.random() * 1000000);
      const optimisticCategory: Category = {
        id: tempId,
        name: newCat.name,
        slug: newCat.slug,
        image_url: newCat.image_url || null,
        is_active: true,
      };

      queryClient.setQueryData<Category[]>(['admin-categories'], (old = []) => [...old, optimisticCategory]);

      setName('');
      setImageUrl('');

      return { previousCategories, tempId };
    },
    onSuccess: (realCat, _vars, context) => {
      queryClient.setQueryData<Category[]>(['admin-categories'], (old = []) =>
        old.map((c) => (c.id === context?.tempId || c.slug === realCat.slug ? realCat : c))
      );
      queryClient.invalidateQueries({ queryKey: ['admin-categories'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'], refetchType: 'all' });
    },
    onError: (err: any, _newCat, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['admin-categories'], context.previousCategories);
      }
      const msg = err?.response?.data?.detail || 'Failed to create category.';
      setError(typeof msg === 'string' ? msg : 'Category creation failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryBrandService.deleteCategory(id),
    onMutate: async (id) => {
      setError(null);
      await queryClient.cancelQueries({ queryKey: ['admin-categories'] });

      const previousCategories = queryClient.getQueryData<Category[]>(['admin-categories']) || [];

      // Optimistically remove
      queryClient.setQueryData<Category[]>(['admin-categories'], (old = []) =>
        old.filter((c) => c.id !== id)
      );

      return { previousCategories };
    },
    onError: (err: any, _id, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['admin-categories'], context.previousCategories);
      }
      const msg = err?.response?.data?.detail || 'Failed to delete category.';
      setError(typeof msg === 'string' ? msg : 'Delete failed');
    },
    onSettled: () => {
      setCategoryToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'], refetchType: 'all' });
    },
  });

  // Reorder mutation for persisting drag-and-drop order
  const reorderMutation = useMutation({
    mutationFn: (reorderedIds: number[]) => categoryBrandService.reorderCategories(reorderedIds),
    onMutate: async (reorderedIds) => {
      await queryClient.cancelQueries({ queryKey: ['admin-categories'] });
      const previousCategories = queryClient.getQueryData<Category[]>(['admin-categories']) || [];

      // Map IDs to reordered list optimistically
      const catMap = new Map(previousCategories.map((c) => [c.id, c]));
      const newOptimisticList: Category[] = [];
      reorderedIds.forEach((id) => {
        const cat = catMap.get(id);
        if (cat) newOptimisticList.push(cat);
      });

      queryClient.setQueryData(['admin-categories'], newOptimisticList);
      return { previousCategories };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['admin-categories'], context.previousCategories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'all' });
    },
  });

  // Drag-and-drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedCategories = [...categories];
    const [movedItem] = updatedCategories.splice(draggedIndex, 1);
    updatedCategories.splice(targetIndex, 0, movedItem);

    // Optimistically update React Query state
    queryClient.setQueryData(['admin-categories'], updatedCategories);

    // Trigger backend reorder sync
    const reorderedIds = updatedCategories.map((c) => c.id);
    reorderMutation.mutate(reorderedIds);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `category-${Date.now()}`;

    createMutation.mutate({
      name: name.trim(),
      slug: generatedSlug,
      image_url: imageUrl.trim() || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl pb-16">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Categories Management</h1>
        <p className="text-xs text-white/50 mt-1">
          Add icons (PNG / SVG only) and drag containers to reorder categories in the Mini App
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Create Category Form Container */}
      <form
        onSubmit={handleCreateSubmit}
        className="admin-card rounded-3xl p-6 flex flex-col gap-5 shadow-2xl"
      >
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add New Category</h3>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-white/60">Category Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Laptops, Smartphones, Gaming, Accessories"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/[0.04] text-white placeholder-white/40 text-xs px-4 py-2.5 rounded-2xl border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* PNG / SVG Image Upload Field */}
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
            <div className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-2xl border border-white/[0.08] max-w-sm">
              <div className="w-12 h-12 rounded-xl bg-black/60 p-2 flex items-center justify-center border border-white/10 flex-shrink-0">
                <img src={imageUrl} alt="Category preview" className="max-w-full max-h-full object-contain filter brightness-110" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block truncate">Icon attached</span>
                <span className="text-[10px] text-emerald-400">Ready to save</span>
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
              className="flex items-center gap-2.5 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] text-white/80 rounded-2xl border border-dashed border-white/15 text-xs font-medium transition-all max-w-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                  <span>Uploading icon...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-white/60" />
                  <span>Upload PNG or SVG icon</span>
                </>
              )}
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending || isUploading}
          className="admin-btn-primary self-start px-6 py-2.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
        >
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[3]" />}
          Add Category
        </button>
      </form>

      {/* Category Containers List (Draggable Cards) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Category Hierarchy & Order
          </h3>
          <span className="text-[11px] text-white/40">
            Drag cards to reorder
          </span>
        </div>

        {isLoading && categories.length === 0 ? (
          <div className="text-xs text-white/40 py-6 admin-card rounded-3xl text-center">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 admin-card rounded-3xl text-white/40">
            <FolderTree className="w-8 h-8 text-white/20" />
            <span className="text-xs">No categories created yet</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {categories.map((c, index) => {
              const isDragged = draggedIndex === index;
              const isOver = dragOverIndex === index;

              return (
                <div
                  key={c.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`admin-card rounded-2xl p-4 flex items-center justify-between transition-all duration-200 select-none shadow-lg cursor-grab active:cursor-grabbing ${
                    isDragged
                      ? 'opacity-40 border-white/40 scale-[0.98]'
                      : isOver
                      ? 'border-white/50 bg-white/[0.06]'
                      : 'hover:border-white/20'
                  }`}
                >
                  {/* Left: Drag Handle, Number & Category Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-1 text-white/40 hover:text-white cursor-grab" title="Drag to reorder">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <span className="text-xs font-bold text-white/40 w-5 text-center">
                      #{index + 1}
                    </span>

                    {/* Icon Squircle Preview */}
                    <div className="w-12 h-12 rounded-xl bg-black/70 p-2 flex items-center justify-center border border-white/10 flex-shrink-0 shadow-inner">
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt={c.name}
                          className="max-w-full max-h-full object-contain filter brightness-110 pointer-events-none"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-white/30" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{c.name}</h4>
                    </div>
                  </div>

                  {/* Right: Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setCategoryToEdit(c)}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-colors shadow-sm"
                      title="Edit Category"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategoryToDelete(c)}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/10 text-white/40 hover:text-rose-400 border border-white/[0.08] transition-colors shadow-sm"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={Boolean(categoryToEdit)}
        category={categoryToEdit}
        onClose={() => setCategoryToEdit(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"? Products attached to this category may be affected.`}
        confirmText="Delete Category"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete.id);
          }
        }}
        onClose={() => setCategoryToDelete(null)}
      />
    </div>
  );
}
