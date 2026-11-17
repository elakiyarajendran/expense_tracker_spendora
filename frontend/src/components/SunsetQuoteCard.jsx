import React from 'react';

export default function SunsetQuoteCard() {
  return (
    <div className="card-soft p-5 bg-gradient-to-r from-[#ffe4d6] via-[#ffd6cc] to-[#fce4dc] relative overflow-hidden flex flex-col justify-between border border-orange-200/60 shadow-sm min-h-[140px]">
      {/* Background Sunset & Silhouette Graphic */}
      <div className="absolute inset-0 pointer-events-none opacity-80 overflow-hidden">
        <svg viewBox="0 0 300 120" className="w-full h-full object-cover">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="80%" r="50%">
              <stop offset="0%" stopColor="#ffedd5" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#fca5a5" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#fed7aa" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Golden Sun & Glow */}
          <circle cx="150" cy="95" r="45" fill="url(#sunGlow)" />
          <circle cx="150" cy="85" r="16" fill="#fef08a" opacity="0.9" />

          {/* Flying birds silhouette */}
          <path d="M180,45 Q185,40 190,45 Q195,40 200,45" fill="none" stroke="#431407" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <path d="M198,35 Q202,31 206,35 Q210,31 214,35" fill="none" stroke="#431407" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
          <path d="M165,38 Q168,34 171,38 Q174,34 177,38" fill="none" stroke="#431407" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />

          {/* Mountain / Hill silhouette at bottom */}
          <path d="M0,120 L0,95 Q70,75 150,90 Q220,105 300,90 L300,120 Z" fill="#7c2d12" opacity="0.75" />

          {/* Meditating person silhouette */}
          <g transform="translate(142, 70) scale(0.65)" fill="#451a03">
            {/* Head */}
            <circle cx="12" cy="6" r="4.5" />
            {/* Body */}
            <path d="M12,11 C7,14 4,20 4,28 L20,28 C20,20 17,14 12,11 Z" />
            {/* Crossed legs */}
            <ellipse cx="12" cy="28" rx="14" ry="4" />
          </g>

          {/* Tropical leaves on sides */}
          <path d="M0,120 Q30,90 20,60 Q5,75 0,85 Z" fill="#292524" opacity="0.6" />
          <path d="M300,120 Q270,90 280,60 Q295,75 300,85 Z" fill="#292524" opacity="0.6" />
        </svg>
      </div>

      {/* Foreground Quote */}
      <div className="relative z-10 text-center px-4 pt-1">
        <span className="text-2xl text-amber-900/60 font-serif font-black block leading-none">“</span>
        <p className="handwritten text-xl font-bold text-[#451a03] leading-snug drop-shadow-sm">
          "Plan well, spend wisely, <br />
          and enjoy the little things."
        </p>
        <span className="text-xs text-rose-800/80 mt-1 inline-block">🤍</span>
      </div>
    </div>
  );
}
