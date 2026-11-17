import React from 'react';
import { Trophy, CheckCircle, Sprout, Star, Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MilestoneBadgesCard() {
  const navigate = useNavigate();

  const badges = [
    {
      title: 'First Expense Tracked',
      icon: Sprout,
      iconColor: 'text-emerald-700',
      bgColor: 'bg-[#eaf6ee]',
      achieved: true,
    },
    {
      title: 'Saved ₹5,000',
      icon: Star,
      iconColor: 'text-amber-500 fill-amber-400',
      bgColor: 'bg-[#fef8e7]',
      achieved: true,
    },
    {
      title: 'Reached 50% of Goal',
      icon: Crown,
      iconColor: 'text-amber-600',
      bgColor: 'bg-[#fdf4e3]',
      achieved: true,
    },
  ];

  return (
    <div className="card-soft p-5 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Trophy className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-gray-800">Milestones</h4>
        </div>
        <button
          onClick={() => navigate('/milestones')}
          className="text-xs font-bold text-gray-400 hover:text-emerald-800 flex items-center gap-1 transition-colors"
        >
          <span>See All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-3 gap-3">
        {badges.map((b, i) => {
          const Icon = b.icon;
          return (
            <div
              key={i}
              className={`${b.bgColor} rounded-2xl p-3 flex flex-col items-center text-center justify-between border border-black/5 hover:scale-105 transition-all shadow-sm`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1.5">
                <Icon className={`w-5 h-5 ${b.iconColor}`} />
              </div>
              <span className="text-[10px] font-bold text-gray-700 leading-tight mb-2">
                {b.title}
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
