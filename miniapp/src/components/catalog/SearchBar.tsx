import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  hasActiveFilters?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search the products...',
  onFilterClick,
  hasActiveFilters = false,
}) => {
  return (
    <div className="flex items-center gap-2.5 w-full">
      {/* iOS Liquid Glass Search Input */}
      <div className="relative flex-1 flex items-center h-[50px] rounded-full ios-glass-search">
        <Search className="absolute left-4 w-4 h-4 text-white/60 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-full bg-transparent text-white placeholder-white/45 pl-11 pr-10 rounded-full text-xs font-medium focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3.5 p-1 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* iOS Liquid Glass Filter Button */}
      <button
        type="button"
        onClick={onFilterClick}
        className={`relative w-[50px] h-[50px] rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
          hasActiveFilters
            ? 'ios-glass-active-tab text-white shadow-[0_0_16px_rgba(255,255,255,0.3)]'
            : 'ios-glass-btn text-white/85 hover:text-white'
        }`}
        title="Filter products"
      >
        <SlidersHorizontal className="w-4 h-4 stroke-[2]" />
        {hasActiveFilters && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#fff]" />
        )}
      </button>
    </div>
  );
};
