import React from 'react';

export const Logo = ({ className = 'h-10 w-10' }: { className?: string }) => {
  return <div className={`${className} rounded-full bg-black text-yellow-400 flex items-center justify-center font-bold`}>ش</div>;
};
