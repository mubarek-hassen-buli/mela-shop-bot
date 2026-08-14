'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit2, Eye, EyeOff, Package } from 'lucide-react';
import { productService } from '../../../services/productService';
import { Product } from '../../../types/product';
import { PaginatedResponse } from '../../../types/api';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

export default function ProductsListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const queryKey = ['admin-products', page, search];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => productService.getProducts({ page, search }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => productService.toggleProductStatus(id),
    onMutate: async (id) => {
      setError(null);
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<PaginatedResponse<Product>>(queryKey);

      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Product>>(queryKey, {
          ...previousData,
          items: previousData.items.map((p) =>
            p.id === id ? { ...p, is_active: !p.is_active } : p
          ),
        });
      }

      return { previousData };
    },
    onError: (err: any, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.detail || 'Failed to toggle product status';
      setError(typeof msg === 'string' ? msg : 'Failed to toggle product status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onMutate: async (id) => {
      setError(null);
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<PaginatedResponse<Product>>(queryKey);

      // Optimistically remove product from current page list
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Product>>(queryKey, {
          ...previousData,
          items: previousData.items.filter((p) => p.id !== id),
          total: Math.max(0, previousData.total - 1),
        });
      }

      return { previousData };
    },
    onError: (err: any, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.detail || 'Failed to delete product';
      setError(typeof msg === 'string' ? msg : 'Failed to delete product');
    },
    onSettled: () => {
      setProductToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const products = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">Manage items, variants, pricing, visibility, and stock levels</p>
        </div>

        <Link
          href="/products/create"
          className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Create Product
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title or slug..."
            className="w-full bg-slate-800 text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading && products.length === 0 ? (
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
                  <th className="px-6 py-4">Visibility</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100 text-sm">{p.title}</span>
                        <span className="text-[11px] text-slate-500">/{p.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{p.category?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4">{p.brand?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-bold text-[11px]">
                        {p.variants?.length || 0} Variants
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          VISIBLE IN APP
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          HIDDEN
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Hide / Show Eye Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleStatusMutation.mutate(p.id)}
                          className={`p-2 rounded-xl transition-all ${
                            p.is_active
                              ? 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                              : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                          }`}
                          title={p.is_active ? 'Click to Hide from Mini App' : 'Click to Show in Mini App'}
                        >
                          {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {/* Edit Product */}
                        <Link
                          href={`/products/${p.id}`}
                          className="p-2 text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors"
                          title="Edit product details & images"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {/* Delete Product */}
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        title="Delete Product"
        message={`Are you sure you want to delete product "${productToDelete?.title}"? All variants, images, and specifications will be permanently removed.`}
        confirmText="Delete Product"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (productToDelete) {
            deleteMutation.mutate(productToDelete.id);
          }
        }}
        onClose={() => setProductToDelete(null)}
      />
    </div>
  );
}
