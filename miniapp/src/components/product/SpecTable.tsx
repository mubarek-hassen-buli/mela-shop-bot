import React from 'react';
import { ProductSpecification } from '../../types/product';

interface SpecTableProps {
  specifications: ProductSpecification[];
}

export const SpecTable: React.FC<SpecTableProps> = ({ specifications }) => {
  if (!specifications.length) return null;

  return (
    <div className="flex flex-col gap-2.5 mt-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Specifications</h4>
      <div className="bg-[#121722]/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden text-xs shadow-lg">
        {specifications.map((spec, idx) => (
          <div
            key={spec.id || idx}
            className={`flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 ${
              idx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.05]'
            }`}
          >
            <span className="text-slate-400 font-medium">{spec.spec_key}</span>
            <span className="text-white font-semibold">{spec.spec_value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
