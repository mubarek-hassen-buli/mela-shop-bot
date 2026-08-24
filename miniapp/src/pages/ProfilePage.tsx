import React from 'react';
import { ShieldCheck, ShoppingBag, PhoneCall } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

export const ProfilePage: React.FC = () => {
  const { user } = useTelegram();

  return (
    <div className="flex flex-col gap-4 pb-28 px-3.5 pt-3">
      <h2 className="text-sm font-bold text-white">Customer Profile</h2>

      <div className="bg-[#121722]/80 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex items-center gap-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-200 to-white flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-white/10">
          {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
        </div>
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-white">
            {user?.first_name} {user?.last_name || ''}
          </h3>
          {user?.username && (
            <span className="text-xs text-slate-300 font-semibold">@{user.username}</span>
          )}
          <span className="text-[11px] text-slate-400 mt-0.5">
            Telegram ID: {user?.id || '999999999'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Details</h4>
        <div className="bg-[#121722]/80 backdrop-blur-xl rounded-3xl border border-white/10 divide-y divide-white/5 text-xs shadow-lg">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Telegram Verification</span>
            </div>
            <span className="text-white font-bold bg-white/15 border border-white/20 px-2.5 py-0.5 rounded-full text-[10px]">
              Verified
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-200 font-medium">
              <ShoppingBag className="w-4 h-4 text-slate-300" />
              <span>Order History</span>
            </div>
            <span className="text-slate-400 text-[11px]">Syncing</span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-200 font-medium">
              <PhoneCall className="w-4 h-4 text-slate-300" />
              <span>Customer Support</span>
            </div>
            <span className="text-white font-semibold">@MelaShopSupport</span>
          </div>
        </div>
      </div>
    </div>
  );
};
