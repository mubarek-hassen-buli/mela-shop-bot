'use client';

import React from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export const Header: React.FC = () => {
  const { admin } = useAdminAuth(false);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
          FastAPI Live Gateway
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400 text-xs">
          {admin?.full_name ? admin.full_name[0].toUpperCase() : 'A'}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-200">{admin?.full_name || 'Admin Store Manager'}</span>
          <span className="text-[10px] text-slate-400">{admin?.email || 'admin@melashop.com'}</span>
        </div>
      </div>
    </header>
  );
};
