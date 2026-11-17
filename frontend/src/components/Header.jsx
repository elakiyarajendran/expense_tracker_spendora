import React, { useState } from 'react';
import { Search, Bell, Moon, Sun, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ alerts = [], onSearch }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDark, setIsDark] = useState(false);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Elakiya';

  return (
    <header className="mb-6 relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Search Bar & Greeting */}
        <div className="flex-1">
          {/* Top Search & Actions Bar */}
          <div className="flex items-center gap-3 mb-5 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-white/90 border border-gray-200/90 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 shadow-sm transition-all"
              />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-center text-gray-600 hover:text-emerald-800 shadow-sm transition-all relative active:scale-95"
              >
                <Bell className="w-4 h-4" />
                {alerts && alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-800">Alerts & Notifications</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {alerts && alerts.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {alerts.map((alert, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded-xl text-xs flex gap-2.5 items-start ${
                            alert.level === 'danger'
                              ? 'bg-rose-50 border border-rose-200 text-rose-800'
                              : alert.level === 'warning'
                              ? 'bg-amber-50 border border-amber-200 text-amber-800'
                              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          }`}
                        >
                          {alert.level === 'danger' || alert.level === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-bold">{alert.title}</p>
                            <p className="text-[11px] opacity-90">{alert.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-4">No new alerts right now. Keep it up! 🌟</p>
                  )}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-center text-gray-600 hover:text-emerald-800 shadow-sm transition-all active:scale-95"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Greeting Title */}
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Hello, <span className="text-[#1b3d2b]">{firstName}!</span>
              <span className="inline-block animate-bounce">👋</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium tracking-wide mt-1 flex items-center gap-1.5">
              <span>Small steps today, big dreams tomorrow</span>
              <span className="text-amber-500">✨</span>
            </p>
          </div>
        </div>

        {/* Right: Sleeping Cat, Coffee Cup & Handwritten Quote */}
        <div className="flex items-center gap-5 bg-gradient-to-r from-amber-50/50 to-emerald-50/40 p-3 rounded-2xl border border-amber-100/60 shadow-sm self-start lg:self-auto">
          {/* Cute SVG Illustration of sleeping kitten & books & cup */}
          <div className="relative flex items-center">
            {/* Illustration Graphic */}
            <div className="w-28 h-20 relative flex items-center justify-center">
              <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-sm">
                {/* Plant pot in corner */}
                <ellipse cx="28" cy="88" rx="14" ry="4" fill="#a7f3d0" />
                <path d="M28,88 Q20,70 12,65 Q25,60 28,75 Q32,55 42,60 Q34,70 28,88" fill="#10b981" opacity="0.85" />

                {/* Stack of pastel books */}
                <rect x="50" y="76" width="60" height="10" rx="3" fill="#fdba74" />
                <rect x="52" y="65" width="56" height="10" rx="3" fill="#93c5fd" />
                <rect x="54" y="55" width="52" height="9" rx="3" fill="#c4b5fd" />

                {/* Cup with Dream Plan Save */}
                <rect x="114" y="62" width="22" height="24" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                <path d="M136,68 Q144,74 136,80" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                <text x="125" y="73" fontSize="5" textAnchor="middle" fill="#64748b" fontWeight="bold">Dream</text>
                <text x="125" y="78" fontSize="4.5" textAnchor="middle" fill="#64748b">Plan</text>
                <text x="125" y="83" fontSize="4.5" textAnchor="middle" fill="#ef4444">Save ♡</text>

                {/* Sleeping Kitten curled up on the books */}
                {/* Body */}
                <ellipse cx="80" cy="50" rx="20" ry="12" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1" />
                {/* Head */}
                <circle cx="94" cy="45" r="10" fill="#ffffff" />
                {/* Ears */}
                <polygon points="90,38 93,32 96,38" fill="#fecdd3" stroke="#cbd5e1" strokeWidth="0.5" />
                <polygon points="97,38 100,32 103,38" fill="#fecdd3" stroke="#cbd5e1" strokeWidth="0.5" />
                {/* Sleeping closed eyes curved */}
                <path d="M91,46 Q93,48 95,46" fill="none" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
                <path d="M97,46 Q99,48 101,46" fill="none" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
                {/* Pink Nose */}
                <circle cx="96" cy="48" r="0.8" fill="#f43f5e" />
                {/* Tail curled */}
                <path d="M62,55 Q56,48 64,44" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>

            {/* Handwritten Quote */}
            <div className="pr-2">
              <p className="handwritten text-2xl font-bold text-gray-700 leading-tight">
                "You're doing great!"
              </p>
              <div className="flex items-center gap-1 text-xs text-rose-400 mt-0.5 justify-end">
                <span>🤍</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
