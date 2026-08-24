import React from 'react';
import { Category } from '../../types/product';
import { Sparkles } from 'lucide-react';

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
  // Only display active categories that have an image attached
  const displayCategories = categories.filter((c) => c.is_active && c.image_url);

  if (displayCategories.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 -mx-3.5 px-3.5">
      {displayCategories.map((category) => {
        const isSelected = selectedCategoryId === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(isSelected ? null : category.id)}
            className={`w-[72px] h-[72px] rounded-[24px] flex-shrink-0 flex items-center justify-center p-3 select-none transition-all duration-200 ${
              isSelected ? 'ios-glass-squircle-active' : 'ios-glass-squircle'
            }`}
            title={category.name}
          >
            {category.image_url ? (
              <img
                src={category.image_url}
                alt=""
                className="max-h-9 max-w-full object-contain filter brightness-110 drop-shadow select-none pointer-events-none"
                loading="eager"
              />
            ) : (
              <Sparkles className="w-5 h-5 text-white/50" />
            )}
          </button>
        );
      })}
    </div>
  );
};
