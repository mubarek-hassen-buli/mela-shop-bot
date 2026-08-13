'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, FolderTree, Tag, Users, AlertTriangle } from 'lucide-react';
import { productService } from '../../services/productService';

export default function DashboardOverviewPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: productService.getStats,
  });

  const cards = [
    { title: 'Total Products', value: stats?.total_products ?? 0, icon: Package, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { title: 'Active Categories', value: stats?.total_categories ?? 0, icon: FolderTree, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Active Brands', value: stats?.total_brands ?? 0, icon: Tag, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Telegram Customers', value: stats?.total_customers ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Low Stock Variants', value: stats?.low_stock_variants ?? 0, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Store Metrics Overview</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time catalog analytics and inventory status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-xl"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-400">{card.title}</span>
                <span className="text-3xl font-bold text-slate-100 mt-1">
                  {isLoading ? '...' : card.value}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl ${card.bg}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
