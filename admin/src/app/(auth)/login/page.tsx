'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { authService } from '../../../services/authService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-sky-500/20">
            M
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Admin Portal</h1>
          <p className="text-xs text-slate-400">Sign in to manage the Mela Shop platform</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@melashop.com"
                className="w-full bg-slate-800 text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
