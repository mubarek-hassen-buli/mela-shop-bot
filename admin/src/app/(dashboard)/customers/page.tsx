'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search } from 'lucide-react';
import { categoryBrandService } from '../../../services/categoryBrandService';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: () => categoryBrandService.getCustomers({ page, search }),
    staleTime: 1000 * 60 * 5,
  });

  const customers = data?.items || [];

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Telegram Customer Directory</h1>
        <p className="text-xs text-white/50 mt-1">View authenticated Telegram users and profile logs</p>
      </div>

      <div className="admin-card rounded-3xl p-4 flex items-center justify-between shadow-xl">
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full bg-white/[0.04] text-white placeholder-white/40 text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>
      </div>

      <div className="admin-card rounded-3xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-white/40">Loading customer directory...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2 text-white/40">
            <Users className="w-8 h-8 text-white/20" />
            <span className="text-xs">No registered customers yet</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="bg-black/40 text-white/50 uppercase font-semibold text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Telegram ID</th>
                  <th className="px-6 py-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] font-medium">
                {customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                          {c.first_name ? c.first_name[0].toUpperCase() : 'U'}
                        </div>
                        <span className="font-bold text-white">{c.first_name} {c.last_name || ''}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.username ? <span className="text-white/90 font-semibold">@{c.username}</span> : '-'}
                    </td>
                    <td className="px-6 py-4 font-mono text-white/50">{c.telegram_id || c.id}</td>
                    <td className="px-6 py-4 text-white/50">
                      {new Date(c.created_at).toLocaleDateString()}
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
