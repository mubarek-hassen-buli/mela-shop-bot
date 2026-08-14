'use client';

import React from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, admin } = useAdminAuth(true);
  useRealtimeSync();

  if (isLoading && !admin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
