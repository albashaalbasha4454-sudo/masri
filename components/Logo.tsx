import React from 'react';

export const Logo = ({ className = 'h-10 w-10' }: { className?: string }) => {
  return (
    <div
      className={`${className} relative shrink-0 overflow-hidden rounded-full bg-black shadow-2xl border-4 border-yellow-400 flex items-center justify-center`}
      aria-label="مطابخ الشرق"
      title="مطابخ الشرق"
    >
      <div className="absolute inset-1 rounded-full border border-yellow-600" />
      <div className="absolute inset-3 rounded-full border border-yellow-700/70" />
      <div className="absolute top-[18%] text-yellow-300 text-[0.42em] font-black leading-none">
        مطابخ الشرق
      </div>
      <div className="absolute top-[34%] h-[0.08em] w-[58%] rounded-full bg-yellow-600" />
      <div className="relative z-10 mt-[0.16em] flex flex-col items-center justify-center leading-none">
        <div className="text-yellow-400 text-[0.9em] font-black tracking-tight drop-shadow-sm">
          الشرق
        </div>
        <div className="mt-[0.28em] text-yellow-200 text-[0.28em] font-bold tracking-wide">
          مطبخ
        </div>
      </div>
      <div className="absolute bottom-[14%] text-yellow-500 text-[0.22em] font-bold whitespace-nowrap">
        شرقي • غربي • مشويات
      </div>
    </div>
  );
};
