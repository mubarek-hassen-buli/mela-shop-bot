import React from 'react';
import { Brand } from '../../types/product';

interface BrandListProps {
  brands: Brand[];
  selectedBrandId: number | null;
  onSelectBrand: (id: number | null) => void;
}

// Crisp inline SVGs / badges for popular brands matching the Figma design
const BRAND_ICONS: Record<string, React.ReactNode> = {
  hp: (
    <svg viewBox="0 0 100 100" className="w-10 h-10 fill-white" aria-label="HP">
      <circle cx="50" cy="50" r="44" stroke="white" strokeWidth="5.5" fill="none" />
      <text
        x="48"
        y="62"
        fontSize="38"
        fontFamily="sans-serif"
        fontStyle="italic"
        fontWeight="bold"
        textAnchor="middle"
        fill="white"
      >
        hp
      </text>
    </svg>
  ),
  dell: (
    <svg viewBox="0 0 100 100" className="w-10 h-10" aria-label="DELL">
      <circle cx="50" cy="50" r="44" stroke="white" strokeWidth="5" fill="none" />
      <text
        x="50"
        y="60"
        fontSize="24"
        fontFamily="sans-serif"
        fontWeight="900"
        letterSpacing="2"
        textAnchor="middle"
        fill="white"
      >
        DELL
      </text>
    </svg>
  ),
  acer: (
    <span className="font-bold text-lg tracking-tight text-white lowercase">
      acer
    </span>
  ),
  lenovo: (
    <div className="bg-white px-2 py-0.5 rounded-[3px]">
      <span className="font-extrabold text-[11px] tracking-tight text-[#0c1017] uppercase">
        Lenovo
      </span>
    </div>
  ),
  apple: (
    <svg viewBox="0 0 170 170" className="w-7 h-7 fill-white" aria-label="Apple">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.6-7.85-11.7-14.33-6.52-10.3-11.53-22.18-15.03-35.63-3.5-13.45-5.25-25.56-5.25-36.33 0-14.42 3.65-26.31 10.95-35.67 7.3-9.37 16.5-14.1 27.6-14.21 4.58 0 9.87 1.25 15.86 3.75 6 2.5 10.05 3.8 12.16 3.9 1.63 0 5.86-1.42 12.69-4.26 6.83-2.84 12.56-4.14 17.2-3.9 12.78.65 22.86 5.56 30.24 14.73-11.09 6.74-16.52 16.03-16.3 27.87.22 9.35 3.82 17.15 10.8 23.41 6.98 6.26 15.24 9.81 24.78 10.65-2.18 6.74-4.89 13.53-8.13 20.37zM119.22 33.15c0-6.96 2.5-13.38 7.5-19.26 5-5.88 11.25-9.69 18.75-11.43 1.09 5.88-.11 11.87-3.6 17.97-3.48 6.1-8.71 10.36-15.69 12.79-.54-.07-1.12-.07-1.74 0-2.83 0-4.24-.02-5.22-.07z" />
    </svg>
  ),
  asus: (
    <span className="font-extrabold text-sm tracking-wider text-white uppercase">
      ASUS
    </span>
  ),
};

// Fallback brands if none loaded from API
const DEFAULT_BRAND_LIST: Brand[] = [
  { id: 1, name: 'HP', slug: 'hp', logo_url: null, is_active: true },
  { id: 2, name: 'Dell', slug: 'dell', logo_url: null, is_active: true },
  { id: 3, name: 'Acer', slug: 'acer', logo_url: null, is_active: true },
  { id: 4, name: 'Lenovo', slug: 'lenovo', logo_url: null, is_active: true },
  { id: 5, name: 'Apple', slug: 'apple', logo_url: null, is_active: true },
  { id: 6, name: 'Asus', slug: 'asus', logo_url: null, is_active: true },
];

export const BrandList: React.FC<BrandListProps> = ({
  brands,
  selectedBrandId,
  onSelectBrand,
}) => {
  const displayBrands = brands.length > 0 ? brands : DEFAULT_BRAND_LIST;

  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 -mx-3.5 px-3.5">
      {displayBrands.map((brand) => {
        const isSelected = selectedBrandId === brand.id;
        const slugKey = (brand.slug || brand.name || '').toLowerCase();
        const brandIcon = BRAND_ICONS[slugKey];

        return (
          <button
            key={brand.id}
            onClick={() => onSelectBrand(isSelected ? null : brand.id)}
            className={`w-[72px] h-[72px] rounded-[24px] flex-shrink-0 flex items-center justify-center p-2 select-none ${
              isSelected ? 'ios-glass-squircle-active' : 'ios-glass-squircle'
            }`}
          >
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="max-h-8 max-w-full object-contain filter brightness-110 drop-shadow"
              />
            ) : brandIcon ? (
              brandIcon
            ) : (
              <span className="font-extrabold text-[12px] tracking-tight uppercase line-clamp-1 text-center text-white">
                {brand.name}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
