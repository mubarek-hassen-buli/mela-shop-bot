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
  });

  const customers = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Telegram Customer Directory</h1>
        <p className="text-xs text-slate-400 mt-1">View authenticated Telegram users and profile logs</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full bg-slate-800 text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading customer directory...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2 text-slate-500">
            <Users className="w-8 h-8 text-slate-600" />
            <span className="text-xs">No registered customers yet</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Telegram ID</th>
                  <th className="px-6 py-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
                          {c.first_name ? c.first_name[0].toUpperCase() : 'U'}
                        </div>
                        <span className="font-semibold text-slate-100">{c.first_name} {c.last_name || ''}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.username ? <span className="text-sky-400 font-semibold">@{c.username}</span> : '-'}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{c.telegram_id || c.id}</td>
                    <td className="px-6 py-4 text-slate-400">
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
