import React from 'react';
import { ProductSpecification } from '../../types/product';

interface SpecTableProps {
  specifications: ProductSpecification[];
}

export const SpecTable: React.FC<SpecTableProps> = ({ specifications }) => {
  if (!specifications.length) return null;

  return (
    <div className="flex flex-col gap-3 mt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Specifications</h4>
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden text-xs">
        {specifications.map((spec, idx) => (
          <div
            key={spec.id}
            className={`flex items-center justify-between px-4 py-2.5 ${
              idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/70'
            }`}
          >
            <span className="text-slate-400 font-medium">{spec.spec_key}</span>
            <span className="text-slate-200 font-semibold">{spec.spec_value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
