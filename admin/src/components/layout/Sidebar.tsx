'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, FolderTree, Tag, Users, LogOut } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useAdminAuth(false);

  const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/categories', label: 'Categories', icon: FolderTree },
    { href: '/brands', label: 'Brands', icon: Tag },
    { href: '/customers', label: 'Customers', icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between min-h-screen">
      <div>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
            M
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base leading-tight">Mela Admin</h1>
            <span className="text-[11px] text-slate-400 font-medium">Store Management</span>
          </div>
        </div>

        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
