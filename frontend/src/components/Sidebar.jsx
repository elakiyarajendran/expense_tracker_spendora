import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  BarChart3, 
  Target, 
  Trophy, 
  Settings, 
  Crown, 
  LogOut, 
  Leaf,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ onOpenAddExpense }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { label: 'Budgets', path: '/budgets', icon: PieChart },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Goals', path: '/goals', icon: Target },
    { label: 'Milestones', path: '/milestones', icon: Trophy },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 min-w-[16rem] bg-gradient-to-b from-[#152a20] via-[#1a3427] to-[#12241b] text-white flex flex-col justify-between p-6 rounded-r-[2.5rem] shadow-2xl relative overflow-hidden z-20 min-h-screen">
      {/* Background Subtle Leaf Motifs */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#8fa89b_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-emerald-800/20 rounded-full blur-2xl pointer-events-none"></div>

      <div>
        {/* Brand Logo & Tagline */}
        <div className="flex flex-col items-center text-center mb-8 relative z-10 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#dfab3d] to-[#4ade80] flex items-center justify-center shadow-lg shadow-emerald-950/40 mb-3 border border-amber-200/30">
            <Leaf className="w-8 h-8 text-[#14281e]" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1">
            Spendora
          </h1>
          <p className="text-[11px] text-emerald-200/80 tracking-wide mt-1 font-medium leading-relaxed">
            Track Smart. <br />
            Spend Wise. Live Better.
          </p>
        </div>

        {/* Quick Add Expense Action in Sidebar */}
        {onOpenAddExpense && (
          <button
            onClick={onOpenAddExpense}
            className="w-full mb-6 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#0d2116] font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Expense</span>
          </button>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1.5 relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#d8eedf] text-[#142d20] shadow-md shadow-emerald-950/20 scale-[1.02]'
                      : 'text-emerald-100/75 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#142d20]' : 'text-emerald-300/80'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Premium Promo & User Profile */}
      <div className="space-y-4 relative z-10 pt-4">
        {/* Go Premium Card */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/15 rounded-2xl p-4 text-center backdrop-blur-sm relative overflow-hidden group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-200 flex items-center justify-center mx-auto mb-2 text-amber-950 shadow-md">
            <Crown className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">Go Premium</h4>
          <p className="text-[10px] text-emerald-100/70 mt-0.5 leading-snug">
            Unlock more features and achieve more!
          </p>
          <button 
            onClick={() => navigate('/milestones')}
            className="mt-2.5 w-full py-1.5 px-3 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-amber-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md transition-all group-hover:shadow-amber-400/20"
          >
            Upgrade &rarr;
          </button>
        </div>

        {/* User Badge */}
        <div className="flex items-center justify-between p-2.5 bg-black/20 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-400/60 overflow-hidden bg-emerald-800 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {user?.name ? user.name.charAt(0) : 'E'}
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight truncate max-w-[90px]">
                {user?.name || 'Elakiya R'}
              </div>
              <div className="text-[10px] text-amber-300 font-medium flex items-center gap-1">
                <span>Premium User</span> <span>👑</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-200/80 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
