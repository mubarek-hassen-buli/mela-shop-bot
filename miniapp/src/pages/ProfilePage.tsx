import React from 'react';
import { User, ShieldCheck, ShoppingBag, PhoneCall } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

export const ProfilePage: React.FC = () => {
  const { user } = useTelegram();

  return (
    <div className="flex flex-col gap-4 pb-28 px-4 pt-3">
      <h2 className="text-sm font-bold text-slate-200">Customer Profile</h2>

      <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
          {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
        </div>
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-slate-100">
            {user?.first_name} {user?.last_name || ''}
          </h3>
          {user?.username && (
            <span className="text-xs text-sky-400">@{user.username}</span>
          )}
          <span className="text-[11px] text-slate-500 mt-0.5">
            Telegram ID: {user?.id || 'Unknown'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Details</h4>
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 divide-y divide-slate-800 text-xs">
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Telegram Verification</span>
            </div>
            <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Verified
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-300">
              <ShoppingBag className="w-4 h-4 text-sky-400" />
              <span>Order History</span>
            </div>
            <span className="text-slate-500 text-[11px]">V2 Feature</span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-300">
              <PhoneCall className="w-4 h-4 text-purple-400" />
              <span>Customer Support</span>
            </div>
            <span className="text-slate-400 font-medium">@MelaShopSupport</span>
          </div>
        </div>
      </div>
    </div>
  );
};
