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
    staleTime: 1000 * 60 * 5,
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
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Products Catalog</h1>
          <p className="text-xs text-white/50 mt-1">Manage items, pricing, visibility, and stock levels</p>
        </div>

        <Link
          href="/products/create"
          prefetch={true}
          className="admin-btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create Product
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Search Header */}
      <div className="admin-card rounded-3xl p-4 flex items-center justify-between shadow-xl">
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title or category..."
            className="w-full bg-white/[0.04] text-white placeholder-white/40 text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="admin-card rounded-3xl overflow-hidden shadow-2xl">
        {isLoading && products.length === 0 ? (
          <div className="p-12 text-center text-xs text-white/40">Loading product catalog...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2 text-white/40">
            <Package className="w-8 h-8 text-white/20" />
            <span className="text-xs">No products found</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="bg-black/40 text-white/50 uppercase font-semibold text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Visibility</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] font-medium">
                {products.map((p) => {
                  const primaryPrice = p.variants?.[0]?.price ? Number(p.variants[0].price) : 0;
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-white text-sm block">{p.title}</span>
                      </td>
                      <td className="px-6 py-4 text-white/80">{p.category?.name || 'Uncategorized'}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-white">
                          {primaryPrice.toLocaleString()} Birr
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            VISIBLE IN APP
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.05] text-white/40 border border-white/10 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                            HIDDEN
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Hide / Show Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleStatusMutation.mutate(p.id)}
                            className={`p-2 rounded-xl transition-all ${
                              p.is_active
                                ? 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                                : 'text-white/40 hover:bg-white/[0.06] hover:text-white'
                            }`}
                            title={p.is_active ? 'Click to Hide from Mini App' : 'Click to Show in Mini App'}
                          >
                            {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>

                          {/* Edit Product */}
                          <Link
                            href={`/products/${p.id}`}
                            prefetch={true}
                            className="p-2 text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
                            title="Edit product details & images"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          {/* Delete Product */}
                          <button
                            type="button"
                            onClick={() => setProductToDelete(p)}
                            className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
