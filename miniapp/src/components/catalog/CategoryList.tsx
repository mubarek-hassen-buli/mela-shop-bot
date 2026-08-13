import React from 'react';
import { Category } from '../../types/product';

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
          selectedCategoryId === null
            ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
            : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800'
        }`}
      >
        All
      </button>

      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              isSelected
                ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
};
