import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { SearchBar } from '../components/catalog/SearchBar';
import { CategoryList } from '../components/catalog/CategoryList';
import { ProductCard } from '../components/catalog/ProductCard';
import { FilterModal, FilterState } from '../components/catalog/FilterModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useCategories, useProducts } from '../hooks/useProducts';
import { Product } from '../types/product';

interface HomePageProps {
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectProduct }) => {
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    sortBy: null,
    minPrice: '',
    maxPrice: '',
  });

  const { data: categories = [] } = useCategories();

  const minPriceNum = filters.minPrice ? parseFloat(filters.minPrice) : undefined;
  const maxPriceNum = filters.maxPrice ? parseFloat(filters.maxPrice) : undefined;

  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    search: search || undefined,
    category_id: selectedCategoryId || undefined,
    min_price: isNaN(minPriceNum!) ? undefined : minPriceNum,
    max_price: isNaN(maxPriceNum!) ? undefined : maxPriceNum,
    sort_by: filters.sortBy || undefined,
  });

  const products = productsData?.items || [];
  const hasActiveFilters =
    Boolean(filters.sortBy) || Boolean(filters.minPrice) || Boolean(filters.maxPrice);

  const handleResetAll = () => {
    setSearch('');
    setSelectedCategoryId(null);
    setFilters({ sortBy: null, minPrice: '', maxPrice: '' });
  };

  return (
    <div className="flex flex-col gap-3.5 pb-28 px-3.5 pt-3">
      {/* Search Bar with Filter Button */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search the products..."
        onFilterClick={() => setIsFilterModalOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Top Categories Section (Images Only, Squircles) */}
      <CategoryList
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Product Cards Grid / Professional Empty State */}
      {isLoadingProducts && !productsData ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center select-none animate-in fade-in duration-200">
          {/* Professional iOS Frosted Search Glass Icon */}
          <div className="w-16 h-16 rounded-full ios-glass-circle flex items-center justify-center mb-4 text-white/80 shadow-lg">
            <Search className="w-7 h-7 stroke-[1.75] text-white/90" />
          </div>

          <h3 className="text-sm font-bold text-white tracking-tight">No products found</h3>
          <p className="text-xs text-white/50 mt-1 max-w-[240px] leading-relaxed">
            {search || hasActiveFilters || selectedCategoryId
              ? 'Try adjusting your filters, price range, or search query.'
              : 'No products are currently available in this catalog.'}
          </p>

          {(search || hasActiveFilters || selectedCategoryId) && (
            <button
              type="button"
              onClick={handleResetAll}
              className="mt-4 px-4 py-2 rounded-full ios-glass-btn text-white/90 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onSelectProduct(product)}
            />
          ))}
        </div>
      )}

      {/* iOS Liquid Glass Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApply={setFilters}
      />
    </div>
  );
};
