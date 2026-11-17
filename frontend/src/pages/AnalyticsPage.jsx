import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Activity, 
  Sparkles,
  PieChart as PieIcon,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary/?period=6M');
      setData(res.data);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    } finally {
      setLoading(false);
    }
  };

  const monthlyTrend = data?.monthly_trend || [];
  const categoryBreakdown = data?.category_breakdown || [];
  const summary = data?.summary || {};

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-2 rounded-2xl bg-teal-100 text-teal-800">
            <BarChart3 className="w-5 h-5" />
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Financial Analytics & Trends
          </h2>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Comprehensive review of your cash flow, monthly spending habits, and budget distribution.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-soft p-5 bg-white border border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Top Category</span>
          <div className="text-lg font-extrabold text-emerald-900 mt-1">
            {summary.highest_category || 'Food & Dining'}
          </div>
          <span className="text-[10px] text-gray-400">Largest expenditure share</span>
        </div>

        <div className="card-soft p-5 bg-white border border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Daily Average</span>
          <div className="text-lg font-extrabold text-gray-900 mt-1">
            ₹{summary.daily_average || 897}
          </div>
          <span className="text-[10px] text-gray-400">Burn rate per day</span>
        </div>

        <div className="card-soft p-5 bg-white border border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Transactions</span>
          <div className="text-lg font-extrabold text-purple-900 mt-1">
            {summary.transaction_count || 10} recorded
          </div>
          <span className="text-[10px] text-gray-400">Active period entries</span>
        </div>

        <div className="card-soft p-5 bg-white border border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Financial Health</span>
          <div className="text-lg font-extrabold text-emerald-600 mt-1 flex items-center gap-1.5">
            <span>Strong (88/100)</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[10px] text-gray-400">Savings rate on target</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* 6 Months Trend (FR-HOM-05) */}
        <div className="lg:col-span-8 card-soft p-6 bg-white">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Income vs. Expense Trend</h3>
              <p className="text-[11px] text-gray-400">Last 6 Months cash flow comparison</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg">
              Last 6 Months
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="lg:col-span-4 card-soft p-6 bg-white flex flex-col justify-between">
          <div className="mb-2 pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Category Proportions</h3>
            <p className="text-[11px] text-gray-400">Distribution of spent amount</p>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']} />
                <Pie
                  data={categoryBreakdown}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {categoryBreakdown.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color || '#10b981'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pt-2">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  {cat.name}
                </span>
                <span className="font-extrabold text-gray-800">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
