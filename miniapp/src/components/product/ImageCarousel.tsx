import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage } from '../../types/product';

interface ImageCarouselProps {
  images: ProductImage[];
  title: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Filter valid images
  const displayImages = (images || []).filter((img) => Boolean(img?.url));
  const hasMultiple = displayImages.length > 1;

  const paginate = (newDirection: number) => {
    if (!hasMultiple) return;
    setDirection(newDirection);
    setSelectedIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = displayImages.length - 1;
      if (next >= displayImages.length) next = 0;
      return next;
    });
  };

  const handleSelectIndex = (idx: number) => {
    if (idx === selectedIndex) return;
    setDirection(idx > selectedIndex ? 1 : -1);
    setSelectedIndex(idx);
  };

  return (
    <div className="-mx-4 -mt-3 relative w-[calc(100%+2rem)] aspect-[4/3.8] sm:aspect-[4/3.2] overflow-hidden select-none bg-transparent">
      {/* Animated Image Slider with Smooth Motion */}
      <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
        {displayImages.length > 0 ? (
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.img
              key={selectedIndex}
              src={displayImages[selectedIndex]?.url}
              alt={`${title} - view ${selectedIndex + 1}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.28 },
              }}
              drag={hasMultiple ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -100 || offset.x < -60) {
                  paginate(1);
                } else if (swipe > 100 || offset.x > 60) {
                  paginate(-1);
                }
              }}
              className="w-full h-full object-cover sm:object-contain sm:object-center pointer-events-none select-none absolute inset-0"
              loading="eager"
            />
          </AnimatePresence>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
            No image available
          </div>
        )}
      </div>

      {/* Subtle Gradient Fading up at the bottom of the photo into #0E0E10 */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0E0E10] via-[#0E0E10]/75 to-transparent pointer-events-none z-10" />

      {/* Navigation Arrows (Only shown when multiple photos are uploaded) */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              paginate(-1);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-white z-20 active:scale-90 transition-all shadow-lg"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              paginate(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-white z-20 active:scale-90 transition-all shadow-lg"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </>
      )}

      {/* Capsule Indicator Bars (ONLY rendered when multiple images exist) */}
      {hasMultiple && (
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 z-20 px-8">
          {displayImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectIndex(idx)}
              className={`h-1 flex-1 max-w-[64px] rounded-full transition-all duration-300 ${
                selectedIndex === idx
                  ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
