import React from 'react';
import { Target, Edit3, ArrowRight } from 'lucide-react';

export default function SavingsGoalCard({ goal, onContribute, onEdit }) {
  const target = goal?.target_amount || 50000;
  const current = goal?.progress?.current_amount || 35000;
  const percentage = goal?.progress?.percentage || 70;
  const title = goal?.title || 'Your Savings Goal';

  return (
    <div className="card-soft p-5 bg-gradient-to-b from-white to-[#fbf9f4] relative overflow-hidden flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-gray-700 tracking-tight">{title}</h4>
          </div>
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              title="Edit Goal"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Goal Amount & Progress Bar */}
        <div className="mb-2">
          <div className="text-2xl font-black text-gray-900 tracking-tight">
            ₹{Number(target).toLocaleString('en-IN')}
          </div>

          {/* Progress Bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 bg-gray-200/80 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, percentage)}%` }}
              ></div>
            </div>
            <span className="text-xs font-extrabold text-emerald-900">{percentage}%</span>
          </div>

          <div className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
            <span>You're on track!</span>
            <span>🎉</span>
          </div>
        </div>
      </div>

      {/* Middle Visual: 3D Jar Illustration with Gold Coins */}
      <div className="my-2 py-1 flex items-center justify-center relative">
        <svg viewBox="0 0 200 130" className="w-44 h-28 drop-shadow-md">
          {/* Decorative leaves behind jar */}
          <path d="M40,110 Q25,80 50,60 Q70,75 55,105 Z" fill="#86efac" opacity="0.6" />
          <path d="M160,110 Q175,80 150,60 Q130,75 145,105 Z" fill="#86efac" opacity="0.6" />
          <path d="M30,95 Q15,65 38,50 Q55,60 40,90 Z" fill="#22c55e" opacity="0.4" />
          <path d="M170,95 Q185,65 162,50 Q145,60 160,90 Z" fill="#22c55e" opacity="0.4" />

          {/* Glass Jar Body */}
          <defs>
            <linearGradient id="jarGlass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#e0f2fe" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="coinGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <radialGradient id="jarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Glow inside jar */}
          <circle cx="100" cy="85" r="35" fill="url(#jarGlow)" />

          {/* Pile of gold coins inside */}
          {/* Base coins */}
          <ellipse cx="80" cy="98" rx="14" ry="7" fill="url(#coinGold)" stroke="#a16207" strokeWidth="0.8" />
          <ellipse cx="120" cy="98" rx="14" ry="7" fill="url(#coinGold)" stroke="#a16207" strokeWidth="0.8" />
          <ellipse cx="100" cy="100" rx="16" ry="8" fill="url(#coinGold)" stroke="#a16207" strokeWidth="0.8" />
          {/* Mid layer coins */}
          <ellipse cx="88" cy="90" rx="14" ry="7" fill="url(#coinGold)" stroke="#a16207" strokeWidth="0.8" />
          <ellipse cx="112" cy="90" rx="14" ry="7" fill="url(#coinGold)" stroke="#a16207" strokeWidth="0.8" />
          <ellipse cx="100" cy="82" rx="15" ry="7.5" fill="url(#coinGold)" stroke="#a16207" strokeWidth="0.8" />
          {/* Top coins */}
          <ellipse cx="94" cy="74" rx="13" ry="6.5" fill="url(#coinGold)" stroke="#a16207" strokeWidth="0.8" />
          <ellipse cx="108" cy="72" rx="12" ry="6" fill="url(#coinGold)" stroke="#a16207" strokeWidth="0.8" />
          <ellipse cx="100" cy="65" rx="11" ry="5.5" fill="url(#coinGold)" stroke="#a16207" strokeWidth="0.8" />
          {/* Sparkles */}
          <path d="M125,55 L127,51 L129,55 L133,57 L129,59 L127,63 L125,59 L121,57 Z" fill="#fef08a" />
          <path d="M72,60 L73,57 L74,60 L77,61 L74,62 L73,65 L72,62 L69,61 Z" fill="#fef08a" />

          {/* Outer Glass Jar Outline */}
          <path 
            d="M75,32 L125,32 L128,42 C142,50 144,70 144,95 C144,115 130,120 100,120 C70,120 56,115 56,95 C56,70 58,50 72,42 Z" 
            fill="url(#jarGlass)" 
            stroke="#7dd3fc" 
            strokeWidth="2" 
          />
          {/* Jar Rim & Wooden Cork Lid */}
          <rect x="70" y="24" width="60" height="10" rx="4" fill="#d97706" stroke="#92400e" strokeWidth="1" />
          <ellipse cx="100" cy="24" rx="30" ry="4" fill="#f59e0b" />
          {/* Glass Reflection Highlight */}
          <path d="M64,65 Q62,95 72,110" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        </svg>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onContribute && onContribute(goal)}
        className="w-full py-2 px-4 bg-[#14281e] hover:bg-[#1a3829] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 group"
      >
        <span>Keep Going</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}
