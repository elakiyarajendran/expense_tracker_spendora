import React from 'react';
import { Settings, Shield, User, Database, Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-2 rounded-2xl bg-gray-100 text-gray-800">
            <Settings className="w-5 h-5" />
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">System & Account Settings</h2>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Preferences, currency configuration, and application specifications.
        </p>
      </div>

      <div className="space-y-6">
        {/* User Profile Info */}
        <div className="card-soft p-6">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
            <User className="w-5 h-5 text-emerald-800" />
            <h3 className="text-sm font-bold text-gray-800">Profile Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400 font-medium">Full Name</span>
              <p className="text-sm font-extrabold text-gray-800 mt-0.5">{user?.name || 'Elakiya R'}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Registered Email</span>
              <p className="text-sm font-extrabold text-gray-800 mt-0.5">{user?.email || 'elakiya@spendora.app'}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Account Tier</span>
              <p className="text-sm font-extrabold text-amber-600 mt-0.5">Premium Plan 👑</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Default Currency</span>
              <p className="text-sm font-extrabold text-emerald-800 mt-0.5">₹ Indian Rupee (INR)</p>
            </div>
          </div>
        </div>

        {/* SRS Project Metadata */}
        <div className="card-soft p-6">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
            <Info className="w-5 h-5 text-blue-700" />
            <h3 className="text-sm font-bold text-gray-800">Project & Specification Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400 font-medium">Application</span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">Spendora – Smart Expense Tracker</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Author / Register No.</span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">Elakiya (25BCA019)</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Institution</span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">Sri Krishna Arts and Science College (SKASC)</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Department</span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">Department of Computer Applications (BCA II Year)</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">SRS Version & Date</span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">Version 1.0 • 17 November 2026</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Architecture</span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">3-Tier: React SPA + Django REST API + SQLite</p>
            </div>
          </div>
        </div>

        {/* Security & Token Info */}
        <div className="card-soft p-6">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
            <Shield className="w-5 h-5 text-purple-700" />
            <h3 className="text-sm font-bold text-gray-800">Security & Privacy</h3>
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>JWT Stateless Authentication with auto token renewal (FR-LOG-04)</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Strict Account Lockout Protection (15 min lock after 5 consecutive failed logins per FR-LOG-08)</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Isolated User Scopes: Every query and transaction is partitioned by authenticated user ID (NFR-03)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
