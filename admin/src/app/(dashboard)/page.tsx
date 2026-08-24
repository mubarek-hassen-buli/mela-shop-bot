'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  FolderTree,
  Users,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Sparkles,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryBrandService } from '../../services/categoryBrandService';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function DashboardOverviewPage() {
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: productService.getStats,
    staleTime: 1000 * 60 * 5,
  });

  const { data: recentProducts = [] } = useQuery({
    queryKey: ['admin-products', { page: 1, page_size: 5 }],
    queryFn: () => productService.getProducts({ page: 1, page_size: 5 }),
    staleTime: 1000 * 60 * 5,
    select: (data) => data.items || [],
  });

  const metrics = [
    {
      title: 'Total Products',
      value: stats?.total_products ?? 0,
      icon: Package,
      href: '/products',
      change: '+12% this month',
      accent: 'from-blue-500/20 to-sky-500/5',
      iconColor: 'text-sky-400',
    },
    {
      title: 'Active Categories',
      value: stats?.total_categories ?? 0,
      icon: FolderTree,
      href: '/categories',
      change: 'Synced with Mini App',
      accent: 'from-purple-500/20 to-indigo-500/5',
      iconColor: 'text-purple-400',
    },
    {
      title: 'Telegram Customers',
      value: stats?.total_customers ?? 0,
      icon: Users,
      href: '/customers',
      change: 'Connected accounts',
      accent: 'from-emerald-500/20 to-teal-500/5',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Stock Health',
      value: stats?.low_stock_variants ?? 0,
      icon: AlertTriangle,
      href: '/products',
      change: stats?.low_stock_variants ? 'Low inventory alert' : 'All items in stock',
      accent: 'from-amber-500/20 to-orange-500/5',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 max-w-6xl pb-16"
    >
      {/* Header Banner */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Store Overview</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Real-time catalog metrics and Mini App synchronization
          </p>
        </div>

        {/* Quick Create Action Button */}
        <Link
          href="/products/create"
          prefetch={true}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-black font-bold text-xs shadow-lg shadow-white/10 hover:bg-white/90 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Product
        </Link>
      </motion.div>

      {/* Metrics 4-Grid Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              prefetch={true}
              className="group relative admin-pill-item rounded-3xl p-5 flex flex-col justify-between overflow-hidden shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60 group-hover:text-white/80 transition-colors">
                  {card.title}
                </span>
                <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>

              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {isStatsLoading ? '...' : card.value}
                </span>
                <p className="text-[10px] text-white/45 mt-1 font-medium">{card.change}</p>
              </div>

              {/* Hover indicator */}
              <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition-all text-white/40">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </motion.div>

      {/* Main Content: Quick Actions & Live Store Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Products */}
        <motion.div variants={itemVariants} className="lg:col-span-2 admin-pill-item rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Recent Products</h3>
              <p className="text-[11px] text-white/45">Quick view of items published in store</p>
            </div>

            <Link
              href="/products"
              prefetch={true}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-white/40 gap-2">
              <Package className="w-8 h-8 text-white/20" />
              <span className="text-xs">No products added yet</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentProducts.map((p) => {
                const primaryImage = p.images?.find((img) => img.is_primary)?.url || p.images?.[0]?.url;
                const primaryPrice = p.variants?.[0]?.price ? Number(p.variants[0].price) : 0;

                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    prefetch={true}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                        {primaryImage ? (
                          <img src={primaryImage} alt={p.title} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <Package className="w-4 h-4 text-white/30" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors truncate">
                          {p.title}
                        </span>
                        <span className="text-[10px] text-white/40">{p.category?.name || 'General'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-bold text-white/90">
                        {primaryPrice.toLocaleString()} Birr
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/80 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Right 1 Col: Store Ecosystem & Shortcuts */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          {/* Telegram Bot Live Pulse */}
          <div className="admin-pill-item rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Telegram Ecosystem</h4>
                <p className="text-[10px] text-white/50">Mini App & Bot Status</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2 border-t border-white/[0.06] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Mini App Webhook</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Live Updates</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SSE Synced
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Database</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="admin-pill-item rounded-3xl p-6 flex flex-col gap-3 shadow-xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-white/70">
              Quick Shortcuts
            </h4>

            <Link
              href="/categories"
              prefetch={true}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-all text-xs text-white/80 font-medium"
            >
              <span>Reorder Categories</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/40" />
            </Link>

            <Link
              href="/products/create"
              prefetch={true}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-all text-xs text-white/80 font-medium"
            >
              <span>Upload Product Images</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/40" />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
