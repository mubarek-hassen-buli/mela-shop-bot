'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Package,
  FolderTree,
  Users,
  LogOut,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useAdminAuth(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/categories', label: 'Categories', icon: FolderTree },
    { href: '/customers', label: 'Customers', icon: Users },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 260 : 78 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="h-screen sticky top-0 bg-[#0E1015] border-r border-white/[0.06] flex flex-col justify-between flex-shrink-0 z-40 select-none overflow-hidden p-4"
    >
      {/* Top Header & Navigation Section */}
      <div className="flex flex-col gap-6 flex-1 min-h-0">
        {/* Header: Logo & Collapse Button */}
        <div className="flex items-center justify-between px-1 pt-1">
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-5 h-5 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">Mela Shop</span>
            </motion.div>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center text-white mx-auto">
              <Sparkles className="w-4 h-4 text-white fill-white" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-7 h-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
            title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isExpanded ? (
              <PanelLeftClose className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Minimalist Navigation List */}
        <nav className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isExactHome = item.href === '/' && pathname === '/';
            const isSubRoute = item.href !== '/' && pathname.startsWith(item.href);
            const isActive = isExactHome || isSubRoute;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`relative group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'nav-pill-active text-white'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/[0.03]'
                } ${!isExpanded ? 'justify-center px-0' : ''}`}
                title={!isExpanded ? item.label : undefined}
              >
                {/* Icon */}
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-white stroke-[2.2]' : 'text-white/50 group-hover:text-white/90 stroke-[1.7]'
                  }`}
                />

                {/* Label (Expanded Mode) */}
                {isExpanded && (
                  <span
                    className={`text-xs tracking-tight truncate flex-1 ${
                      isActive ? 'text-white font-bold' : 'font-medium text-white/60 group-hover:text-white/90'
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Sign Out Section */}
      <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.05] flex-shrink-0">
        <button
          type="button"
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-medium text-white/50 hover:text-rose-400 hover:bg-rose-500/[0.08] transition-all cursor-pointer ${
            !isExpanded ? 'justify-center px-0 w-9 h-9 mx-auto' : 'w-full'
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {isExpanded && <span className="truncate">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};
