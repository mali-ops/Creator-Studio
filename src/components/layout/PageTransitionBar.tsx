import React from 'react';

interface PageTransitionBarProps {
  isNavigating: boolean;
}

export const PageTransitionBar: React.FC<PageTransitionBarProps> = ({ isNavigating }) => {
  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-1 bg-transparent overflow-hidden">
      <div className="h-full bg-gradient-to-r from-[#D9F36B] via-[#c6e255] to-[#92B76B] shadow-[0_0_12px_#D9F36B] top-progress-bar transition-all" />
      <div className="absolute right-4 top-3 px-2.5 py-1 rounded-full bg-[#101612]/90 border border-[#26372D] text-[10px] font-mono font-medium text-[#D9F36B] shadow-xl flex items-center gap-1.5 animate-fade-in pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D9F36B] animate-ping" />
        <span>Loading page...</span>
      </div>
    </div>
  );
};
