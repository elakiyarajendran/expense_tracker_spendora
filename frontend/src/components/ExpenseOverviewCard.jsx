import React from 'react';
import { 
  BarChart2, 
  Utensils, 
  ShoppingBag, 
  Car, 
  Zap, 
  Film, 
  HeartPulse, 
  BookOpen, 
  MoreHorizontal, 
  Tag 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ExpenseOverviewCard({ 
  categoryBreakdown = [], 
  totalSpent = 15250, 
  period = '1M', 
  onPeriodChange 
}) {
  const periods = [
    { key: '1M', label: '1M' },
    { key: '3M', label: '3M' },
    { key: '6M', label: '6M' },
    { key: '1Y', label: '1Y' },
  ];

  const getCategoryIcon = (iconName, name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('food') || lower.includes('dining')) return Utensils;
    if (lower.includes('shop')) return ShoppingBag;
    if (lower.includes('travel') || lower.includes('transit') || lower.includes('ola')) return Car;
    if (lower.includes('bill') || lower.includes('electric')) return Zap;
    if (lower.includes('entertain')) return Film;
    if (lower.includes('health')) return HeartPulse;
    if (lower.includes('edu')) return BookOpen;
    return MoreHorizontal;
  };

  const defaultData = [
    { name: 'Food & Dining', amount: 5340, percentage: 34, color: '#f43f5e' },
    { name: 'Shopping', amount: 4270, percentage: 28, color: '#6366f1' },
    { name: 'Travel', amount: 2740, percentage: 18, color: '#f59e0b' },
    { name: 'Bills', amount: 1830, percentage: 12, color: '#06b6d4' },
    { name: 'Others', amount: 1070, percentage: 8, color: '#8b5cf6' },
  ];

  const displayData = categoryBreakdown.length > 0 ? categoryBreakdown : defaultData;

  return (
    <div className="card-soft p-6 flex-1 flex flex-col justify-between">
      {/* Card Header with Period Tabs */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <BarChart2 className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-gray-800">Expense Overview</h3>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => onPeriodChange && onPeriodChange(p.key)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                period === p.key
                  ? 'bg-[#1b3829] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Donut Chart + Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Donut Chart */}
        <div className="md:col-span-6 relative flex items-center justify-center h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']}
              />
              <Pie
                data={displayData}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={92}
                paddingAngle={4}
                stroke="#ffffff"
                strokeWidth={3}
              >
                {displayData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || '#10b981'} 
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              ₹{totalSpent.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Total Spent
            </span>
            <span className="text-sm mt-0.5">🍃</span>
          </div>
        </div>

        {/* Right: Category List */}
        <div className="md:col-span-6 space-y-3">
          {displayData.map((cat, idx) => {
            const Icon = getCategoryIcon(cat.icon, cat.name);
            return (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: cat.color || '#10b981' }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{cat.name}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-gray-400 w-8 text-right">
                    {cat.percentage}%
                  </span>
                  <span className="text-xs font-extrabold text-gray-900 w-16 text-right">
                    ₹{cat.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
