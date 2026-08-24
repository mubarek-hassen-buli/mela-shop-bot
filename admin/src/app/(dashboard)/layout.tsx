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
      <div className="min-h-screen bg-[#0A0B0E] flex items-center justify-center text-white/40 text-xs">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0B0E]">
      {/* Fixed Stationary Sidebar */}
      <Sidebar />

      {/* Independently Scrollable Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#0A0B0E]">
        <Header />
        <main className="p-8 flex-1 bg-[#0A0B0E]">{children}</main>
      </div>
    </div>
  );
}
