import React, { useState } from 'react';

export const Logo = ({ className = 'h-10 w-10' }: { className?: string }) => {
  const [failed, setFailed] = useState(false);
  const logoSrc = `${import.meta.env.BASE_URL}logo.png`;

  if (!failed) {
    return (
      <div className={`${className} rounded-full overflow-hidden bg-black shadow-lg shrink-0`} aria-label="مطابخ الشرق">
        <img
          src={logoSrc}
          alt="مطابخ الشرق"
          className="h-full w-full object-contain block"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded-full bg-black text-amber-400 border-2 border-amber-400 flex items-center justify-center font-black text-center leading-none shrink-0`}
      aria-label="مطابخ الشرق"
      title="مطابخ الشرق"
    >
      <span className="text-[0.42em]">مطابخ<br />الشرق</span>
    </div>
  );
};
