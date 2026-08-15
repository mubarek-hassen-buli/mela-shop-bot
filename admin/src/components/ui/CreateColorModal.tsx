'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Palette, Loader2 } from 'lucide-react';
import { productService } from '../../services/productService';
import { Color } from '../../types/product';

interface CreateColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorCreated: (color: Color) => void;
}

export const CreateColorModal: React.FC<CreateColorModalProps> = ({
  isOpen,
  onClose,
  onColorCreated,
}) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('#3b82f6');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setHexCode('#3b82f6');
      setError(null);
    }
  }, [isOpen]);

  const createColorMutation = useMutation({
    mutationFn: () => productService.createColor(name.trim(), hexCode.trim()),
    onSuccess: (newColor) => {
      queryClient.invalidateQueries({ queryKey: ['admin-colors'] });
      onColorCreated(newColor);
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail?.message ||
        err?.response?.data?.detail ||
        'Failed to create color.';
      setError(typeof msg === 'string' ? msg : 'Failed to create color.');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hexCode.trim()) {
      setError('Color name and hex code are required.');
      return;
    }
    createColorMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <Palette className="w-4 h-4 text-sky-400" />
            <span>Add New Variant Color</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Color Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Midnight Blue, Desert Titanium"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Color Hex Code *</label>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <input
                  type="color"
                  value={hexCode}
                  onChange={(e) => setHexCode(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent p-0"
                />
              </div>
              <input
                type="text"
                required
                value={hexCode}
                onChange={(e) => setHexCode(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1 bg-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-sky-500 uppercase font-mono transition-colors"
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <span
              className="w-7 h-7 rounded-full shadow-inner border border-slate-700 flex-shrink-0"
              style={{ backgroundColor: hexCode }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">{name || 'Preview Color'}</span>
              <span className="text-[10px] text-slate-500 font-mono">{hexCode}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={createColorMutation.isPending}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 hover:bg-slate-750 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createColorMutation.isPending}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              {createColorMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Save Color
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
