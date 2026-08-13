import React, { useState } from 'react';
import { ProductImage } from '../../types/product';

interface ImageCarouselProps {
  images: ProductImage[];
  title: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="w-full aspect-square bg-slate-900 rounded-3xl flex items-center justify-center text-slate-600 text-sm">
        No Images Available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-square bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
        <img
          src={images[selectedIndex]?.url}
          alt={`${title} - image ${selectedIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-300"
        />
      </div>

      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(idx)}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                selectedIndex === idx
                  ? 'border-sky-400 scale-105 shadow-md shadow-sky-500/20'
                  : 'border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
