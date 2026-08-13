'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit, Package } from 'lucide-react';
import { productService } from '../../../services/productService';

export default function ProductsListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => productService.getProducts({ page, search }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const products = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">Manage items, variants, pricing, and stock levels</p>
        </div>

        <Link
          href="/products/create"
          className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Product
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or slug..."
            className="w-full bg-slate-800 text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading product catalog...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2 text-slate-500">
            <Package className="w-8 h-8 text-slate-600" />
            <span className="text-xs">No products found</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4">Variants</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100 text-sm">{p.title}</span>
                        <span className="text-[11px] text-slate-500">{p.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{p.category?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4">{p.brand?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-bold text-[11px]">
                        {p.variants.length} Variants
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.is_active ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 text-[10px] font-bold">
                          INACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteMutation.mutate(p.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
