import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpDown, DollarSign, RotateCcw, Check, Sparkles } from 'lucide-react';
import { useTelegram } from '../../hooks/useTelegram';

export interface FilterState {
  sortBy: 'price_asc' | 'price_desc' | 'newest' | null;
  minPrice: string;
  maxPrice: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

const PRESET_RANGES = [
  { label: '< 50k', min: '', max: '50000' },
  { label: '50k - 150k', min: '50000', max: '150000' },
  { label: '150k - 300k', min: '150000', max: '300000' },
  { label: '> 300k', min: '300000', max: '' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApply,
}) => {
  const { triggerHaptic } = useTelegram();
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  const handleReset = () => {
    triggerHaptic('light');
    const resetState: FilterState = {
      sortBy: null,
      minPrice: '',
      maxPrice: '',
    };
    setLocalFilters(resetState);
    onApply(resetState);
    onClose();
  };

  const handleApply = () => {
    triggerHaptic('medium');
    onApply(localFilters);
    onClose();
  };

  const isApplied =
    Boolean(localFilters.sortBy) || Boolean(localFilters.minPrice) || Boolean(localFilters.maxPrice);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* iOS Liquid Glass Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-[430px] max-h-[85vh] rounded-t-[32px] p-6 pt-4 pb-8 z-10 flex flex-col gap-4 overflow-hidden shadow-2xl ios-glass-dock border-t border-white/20"
          >
            {/* Grab Handle */}
            <div className="w-10 h-1 rounded-full bg-white/25 mx-auto -mt-1 mb-1 flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Filter & Sort</h3>
                <p className="text-[11px] text-white/50">Refine catalog by price and sorting</p>
              </div>

              <div className="flex items-center gap-2">
                {isApplied && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full ios-glass-btn flex items-center justify-center text-white/70 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-5 py-1">
              {/* Section 1: Sorting Order */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white/80 uppercase tracking-wider">
                  <ArrowUpDown className="w-3.5 h-3.5 text-white/60" />
                  <span>Sort by</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: null, label: 'Featured / Default' },
                    { id: 'price_asc', label: 'Price: Low to High' },
                    { id: 'price_desc', label: 'Price: High to Low' },
                  ].map((option) => {
                    const isSelected = localFilters.sortBy === option.id;
                    return (
                      <button
                        key={String(option.id)}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setLocalFilters((prev) => ({
                            ...prev,
                            sortBy: option.id as any,
                          }));
                        }}
                        className={`px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold transition-all ${
                          isSelected
                            ? 'ios-glass-active-tab text-white font-bold'
                            : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Price Range */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white/80 uppercase tracking-wider">
                  <DollarSign className="w-3.5 h-3.5 text-white/60" />
                  <span>Price Range (Birr)</span>
                </div>

                {/* Min & Max Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/50 font-medium">Minimum Price</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={localFilters.minPrice}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                      }
                      className="w-full bg-white/5 text-white placeholder-white/30 text-xs px-3.5 py-2.5 rounded-xl border border-white/15 focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/50 font-medium">Maximum Price</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="No limit"
                      value={localFilters.maxPrice}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                      }
                      className="w-full bg-white/5 text-white placeholder-white/30 text-xs px-3.5 py-2.5 rounded-xl border border-white/15 focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                {/* Preset Range Chips */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {PRESET_RANGES.map((preset) => {
                    const isMatch =
                      localFilters.minPrice === preset.min && localFilters.maxPrice === preset.max;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setLocalFilters((prev) => ({
                            ...prev,
                            minPrice: preset.min,
                            maxPrice: preset.max,
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
                          isMatch
                            ? 'bg-white text-black font-bold border-white'
                            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Prominent High-Visibility Sticky Apply Button */}
            <div className="pt-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleApply}
                className="w-full py-4 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs tracking-wide shadow-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Apply Filters</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
