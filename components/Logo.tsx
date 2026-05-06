import React from 'react';
import { MATBAKH_ALSHARQ_LOGO_DATA_URI } from './logoData';

export const Logo = ({ className = 'h-10 w-10' }: { className?: string }) => {
  return (
    <div className={`${className} rounded-full overflow-hidden bg-black shadow-lg shrink-0`} aria-label="مطابخ الشرق">
      <img
        src={MATBAKH_ALSHARQ_LOGO_DATA_URI}
        alt="مطابخ الشرق"
        className="h-full w-full object-contain block"
      />
    </div>
  );
};
