import React, { useState } from 'react';
import { SearchBar } from '../components/catalog/SearchBar';
import { CategoryList } from '../components/catalog/CategoryList';
import { ProductCard } from '../components/catalog/ProductCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useCategories, useProducts } from '../hooks/useProducts';
import { Product } from '../types/product';

interface HomePageProps {
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectProduct }) => {
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    search: search || undefined,
    category_id: selectedCategoryId || undefined,
  });

  const products = productsData?.items || [];

  return (
    <div className="flex flex-col gap-4 pb-24 px-4 pt-3">
      <SearchBar value={search} onChange={setSearch} placeholder="Search shop catalog..." />

      {!isLoadingCategories && categories.length > 0 && (
        <CategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      )}

      {isLoadingProducts ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
            🔍
          </div>
          <h3 className="text-sm font-semibold text-slate-300">No products found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Try adjusting your search query or selecting a different category.
          </p>
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
    </div>
  );
};
