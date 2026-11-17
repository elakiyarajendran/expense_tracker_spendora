import React from 'react';
import { Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BottomBanner() {
  const navigate = useNavigate();

  return (
    <div className="mt-6 bg-gradient-to-r from-[#13271c] via-[#1a3828] to-[#12241b] rounded-3xl p-5 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-800/40">
      {/* Background Subtle Stars & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(223,171,61,0.15),transparent_50%)] pointer-events-none"></div>

      {/* Left: Trophy and Motivational Copy */}
      <div className="flex items-center gap-4 relative z-10 text-center sm:text-left">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-amber-950 shadow-lg shadow-amber-900/40 shrink-0">
          <Trophy className="w-8 h-8 drop-shadow" />
        </div>
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5">
            <h4 className="text-lg font-black tracking-tight text-white">
              Stay Consistent!
            </h4>
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <p className="text-xs text-emerald-200/80 font-medium mt-0.5 flex items-center gap-1 justify-center sm:justify-start">
            <span>You're on the right path to a financially free you!</span>
            <span>💚</span>
          </p>
        </div>
      </div>

      {/* Right: Action Button */}
      <div className="relative z-10 w-full sm:w-auto">
        <button
          onClick={() => navigate('/milestones')}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#fef3c7] via-[#fde68a] to-[#fcd34d] hover:from-white hover:to-amber-300 text-amber-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-950/30 flex items-center justify-center gap-2 transition-all active:scale-95 group"
        >
          <span>View Progress</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
