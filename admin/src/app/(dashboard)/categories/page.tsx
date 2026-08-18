'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, FolderTree, Loader2 } from 'lucide-react';
import { categoryBrandService } from '../../../services/categoryBrandService';
import { Category } from '../../../types/product';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: categoryBrandService.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: (newCat: { name: string; slug: string }) =>
      categoryBrandService.createCategory(newCat.name, newCat.slug),
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
        is_active: true,
      };

      queryClient.setQueryData<Category[]>(['admin-categories'], (old = []) => [...old, optimisticCategory]);

      setName('');
      setSlug('');

      return { previousCategories, tempId };
    },
    onSuccess: (realCat, _vars, context) => {
      // Replace optimistic category with real server entity
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
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.detail || 'Failed to create category';
      setError(typeof msg === 'string' ? msg : 'Failed to create category');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'], refetchType: 'all' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryBrandService.deleteCategory(id),
    onMutate: async (id) => {
      setError(null);
      await queryClient.cancelQueries({ queryKey: ['admin-categories'] });

      const previousCategories = queryClient.getQueryData<Category[]>(['admin-categories']) || [];

      // Optimistically remove category from cache
      queryClient.setQueryData<Category[]>(['admin-categories'], (old = []) =>
        old.filter((c) => c.id !== id)
      );

      return { previousCategories };
    },
    onError: (err: any, _id, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['admin-categories'], context.previousCategories);
      }
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.detail || 'Failed to delete category';
      setError(typeof msg === 'string' ? msg : 'Failed to delete category');
    },
    onSettled: () => {
      setCategoryToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    createMutation.mutate({ name: name.trim(), slug: slug.trim() });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Categories Management</h1>
        <p className="text-xs text-slate-400 mt-1">Organize catalog hierarchy and navigation trees with realtime updates</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreateSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl"
      >
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Add New Category</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            required
            placeholder="Category Name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500 transition-colors"
          />
          <input
            type="text"
            required
            placeholder="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="self-start px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
        >
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Category
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Active Categories</h3>
        {isLoading && categories.length === 0 ? (
          <div className="text-xs text-slate-500 py-4">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-slate-500">
            <FolderTree className="w-8 h-8 text-slate-600" />
            <span className="text-xs">No categories created yet</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {categories.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200">{c.name}</span>
                  <span className="text-[11px] text-slate-500">/{c.slug}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(c)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
