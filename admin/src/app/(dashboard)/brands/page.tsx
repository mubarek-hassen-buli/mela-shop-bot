'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';
import { categoryBrandService } from '../../../services/categoryBrandService';
import { Brand } from '../../../types/product';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

export default function BrandsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: categoryBrandService.getBrands,
  });

  const createMutation = useMutation({
    mutationFn: (newBrand: { name: string; slug: string }) =>
      categoryBrandService.createBrand(newBrand.name, newBrand.slug),
    onMutate: async (newBrand) => {
      setError(null);
      await queryClient.cancelQueries({ queryKey: ['admin-brands'] });

      const previousBrands = queryClient.getQueryData<Brand[]>(['admin-brands']) || [];

      // Optimistically add new brand to cache
      const optimisticBrand: Brand = {
        id: Date.now(),
        name: newBrand.name,
        slug: newBrand.slug,
        is_active: true,
      };

      queryClient.setQueryData<Brand[]>(['admin-brands'], (old = []) => [...old, optimisticBrand]);

      setName('');
      setSlug('');

      return { previousBrands };
    },
    onError: (err: any, _newBrand, context) => {
      if (context?.previousBrands) {
        queryClient.setQueryData(['admin-brands'], context.previousBrands);
      }
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.detail || 'Failed to create brand';
      setError(typeof msg === 'string' ? msg : 'Failed to create brand');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryBrandService.deleteBrand(id),
    onMutate: async (id) => {
      setError(null);
      await queryClient.cancelQueries({ queryKey: ['admin-brands'] });

      const previousBrands = queryClient.getQueryData<Brand[]>(['admin-brands']) || [];

      // Optimistically remove brand from cache
      queryClient.setQueryData<Brand[]>(['admin-brands'], (old = []) =>
        old.filter((b) => b.id !== id)
      );

      return { previousBrands };
    },
    onError: (err: any, _id, context) => {
      if (context?.previousBrands) {
        queryClient.setQueryData(['admin-brands'], context.previousBrands);
      }
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.detail || 'Failed to delete brand';
      setError(typeof msg === 'string' ? msg : 'Failed to delete brand');
    },
    onSettled: () => {
      setBrandToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
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
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Brands Management</h1>
        <p className="text-xs text-slate-400 mt-1">Manage brand labels and manufacturer profiles with realtime updates</p>
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
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Add New Brand</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            required
            placeholder="Brand Name"
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
          Add Brand
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Active Brands</h3>
        {isLoading && brands.length === 0 ? (
          <div className="text-xs text-slate-500 py-4">Loading brands...</div>
        ) : brands.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-slate-500">
            <Tag className="w-8 h-8 text-slate-600" />
            <span className="text-xs">No brands created yet</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {brands.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200">{b.name}</span>
                  <span className="text-[11px] text-slate-500">/{b.slug}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBrandToDelete(b)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete brand"
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
        isOpen={Boolean(brandToDelete)}
        title="Delete Brand"
        message={`Are you sure you want to delete brand "${brandToDelete?.name}"?`}
        confirmText="Delete Brand"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (brandToDelete) {
            deleteMutation.mutate(brandToDelete.id);
          }
        }}
        onClose={() => setBrandToDelete(null)}
      />
    </div>
  );
}
