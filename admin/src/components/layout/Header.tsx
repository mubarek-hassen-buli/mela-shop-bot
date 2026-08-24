'use client';

import React from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export const Header: React.FC = () => {
  const { admin } = useAdminAuth(false);

  return (
    <header className="h-16 bg-[#0E1015]/80 backdrop-blur-xl border-b border-white/[0.06] px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/[0.04] text-white/80 border border-white/[0.08] shadow-sm">
          FastAPI Live Gateway
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center font-bold text-white text-xs shadow-inner">
          {admin?.full_name ? admin.full_name[0].toUpperCase() : 'A'}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white leading-tight">
            {admin?.full_name || 'Store Admin'}
          </span>
          <span className="text-[10px] text-white/40">{admin?.email || 'admin@melashop.com'}</span>
        </div>
      </div>
    </header>
  );
};
