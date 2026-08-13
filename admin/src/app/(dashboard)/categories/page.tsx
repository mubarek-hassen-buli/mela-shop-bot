'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, FolderTree } from 'lucide-react';
import { categoryBrandService } from '../../../services/categoryBrandService';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: categoryBrandService.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: () => categoryBrandService.createCategory(name, slug),
    onSuccess: () => {
      setName('');
      setSlug('');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryBrandService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Categories Management</h1>
        <p className="text-xs text-slate-400 mt-1">Organize catalog hierarchy and navigation trees</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name && slug) createMutation.mutate();
        }}
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
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Active Categories</h3>
        {isLoading ? (
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
                  onClick={() => deleteMutation.mutate(c.id)}
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
