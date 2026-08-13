'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Tag } from 'lucide-react';
import { categoryBrandService } from '../../../services/categoryBrandService';

export default function BrandsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: categoryBrandService.getBrands,
  });

  const createMutation = useMutation({
    mutationFn: () => categoryBrandService.createBrand(name, slug),
    onSuccess: () => {
      setName('');
      setSlug('');
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryBrandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
    },
  });

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Brands Management</h1>
        <p className="text-xs text-slate-400 mt-1">Manage brand labels and manufacturer profiles</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name && slug) createMutation.mutate();
        }}
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
            className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500"
          />
          <input
            type="text"
            required
            placeholder="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500"
          />
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="self-start px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Active Brands</h3>
        {isLoading ? (
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
                  onClick={() => deleteMutation.mutate(b.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
