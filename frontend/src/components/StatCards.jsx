import React from 'react';
import { Wallet, ShoppingCart, PiggyBank, ArrowUpRight } from 'lucide-react';

export default function StatCards({ summary }) {
  const balance = summary?.total_balance ?? 24750;
  const spent = summary?.total_spent ?? 15250;
  const saved = summary?.total_saved ?? 9500;

  const cards = [
    {
      title: 'Total Balance',
      amount: `₹${balance.toLocaleString('en-IN')}`,
      trend: `+${summary?.balance_change_pct ?? 12}% from last month`,
      isUp: true,
      icon: Wallet,
      bgColor: 'bg-gradient-to-br from-[#eaf6ee] to-[#d6efdf]',
      textColor: 'text-[#18442c]',
      trendColor: 'text-emerald-700',
      iconBg: 'bg-[#1e4a33] text-white',
      strokeColor: '#10b981',
      wavePath: 'M0,25 C40,10 80,35 120,20 C160,5 200,28 240,15',
    },
    {
      title: 'Total Spent',
      amount: `₹${spent.toLocaleString('en-IN')}`,
      trend: `+${summary?.spent_change_pct ?? 8}% from last month`,
      isUp: true,
      icon: ShoppingCart,
      bgColor: 'bg-gradient-to-br from-[#fdf0eb] to-[#fadfd5]',
      textColor: 'text-[#5c2417]',
      trendColor: 'text-rose-600',
      iconBg: 'bg-[#b84d38] text-white',
      strokeColor: '#f43f5e',
      wavePath: 'M0,20 C50,30 90,10 140,25 C190,40 210,12 240,18',
    },
    {
      title: 'Total Saved',
      amount: `₹${saved.toLocaleString('en-IN')}`,
      trend: `+${summary?.saved_change_pct ?? 20}% from last month`,
      isUp: true,
      icon: PiggyBank,
      bgColor: 'bg-gradient-to-br from-[#f6eefc] to-[#eedef7]',
      textColor: 'text-[#481c5c]',
      trendColor: 'text-purple-700',
      iconBg: 'bg-[#7c3aed] text-white',
      strokeColor: '#8b5cf6',
      wavePath: 'M0,30 C30,15 70,25 110,10 C150,-5 190,20 240,5',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`${c.bgColor} rounded-3xl p-5 border border-white/60 shadow-sm relative overflow-hidden flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-md`}
          >
            {/* Top row: Icon and Title */}
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl ${c.iconBg} flex items-center justify-center shadow-md`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{c.title}</span>
                <h3 className={`text-2xl font-extrabold ${c.textColor} tracking-tight`}>
                  {c.amount}
                </h3>
              </div>
            </div>

            {/* Bottom row: Trend and Wave */}
            <div className="mt-4 flex items-end justify-between relative">
              <div className="flex items-center gap-1 text-xs font-semibold">
                <span className={`flex items-center font-bold ${c.trendColor}`}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {c.trend}
                </span>
              </div>

              {/* Sparkline wave */}
              <div className="w-28 h-8 opacity-70">
                <svg viewBox="0 0 240 40" className="w-full h-full overflow-visible">
                  <path
                    d={c.wavePath}
                    fill="none"
                    stroke={c.strokeColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
