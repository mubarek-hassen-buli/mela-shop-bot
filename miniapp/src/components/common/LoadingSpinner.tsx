import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-9 h-9 border-3 border-sky-500/30 border-t-sky-400 rounded-full animate-spin"></div>
      <span className="text-xs text-slate-400 font-medium">Loading catalog...</span>
    </div>
  );
};
