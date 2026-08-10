import React from 'react';

export default function SoutarahLogo({ className = "h-12 w-auto" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official SG Monogram */}
      <svg viewBox="0 0 100 100" className="h-full w-auto text-primary" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M60 25 H35 C23.9543 25 15 33.9543 15 45 C15 56.0457 23.9543 65 35 65 H55 C66.0457 65 75 73.9543 75 85 H50"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 75 H65 C76.0457 75 85 66.0457 85 55 C85 43.9543 76.0457 35 65 35 H45 C33.9543 35 25 26.0457 25 15 H50"
          stroke="#69c33b"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Typography */}
      <div className="flex flex-col leading-none">
        <span className="font-display font-extrabold text-xl sm:text-2xl text-[#1a1c1c] tracking-tight">
          SOUTARAH
        </span>
        <span className="font-display font-bold text-xs sm:text-sm text-[#1a1c1c] tracking-[0.25em] uppercase">
          GROUP
        </span>
      </div>
    </div>
  );
}
