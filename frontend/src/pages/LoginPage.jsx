import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setErrorMessage(res.error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Email is required.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await register(name.trim(), email.trim(), password, confirmPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/'), 1200);
    } else {
      setErrorMessage(res.error);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    const res = await quickDemoLogin();
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMessage(res.error || 'Demo login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f2eb] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Circles & Leaves */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
        {/* Left Side: Brand & Visual Banner */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#14291f] via-[#1a382a] to-[#112319] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle botanical pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8fa89b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <div>
            {/* Logo */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#dfab3d] to-[#4ade80] flex items-center justify-center shadow-lg mb-4 border border-amber-200/30">
              <Leaf className="w-8 h-8 text-[#14281e]" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Spendora</h1>
            <p className="text-xs text-emerald-200/90 font-medium tracking-wide mt-1">
              Track Smart. Spend Wise. Live Better.
            </p>
          </div>

          {/* Inspirational Quote Card */}
          <div className="my-8 p-4 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md">
            <span className="text-2xl text-amber-300 font-serif block leading-none">“</span>
            <p className="handwritten text-2xl font-bold text-amber-100 leading-snug">
              "Small steps today, <br />
              big dreams tomorrow."
            </p>
            <div className="text-[11px] text-emerald-200/80 font-semibold mt-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart personal financial management</span>
            </div>
          </div>

          {/* Institution Credit Footer */}
          <div className="text-[10px] text-emerald-300/60 space-y-0.5 border-t border-white/10 pt-3">
            <p className="font-semibold text-emerald-200/90">Sri Krishna Arts and Science College (SKASC)</p>
            <p>Department of Computer Applications • BCA II Year</p>
          </div>
        </div>

        {/* Right Side: Form (Login or Register) */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 mb-6 pb-2">
            <button
              onClick={() => { setIsRegister(false); setErrorMessage(''); }}
              className={`pb-2 px-4 text-sm font-extrabold transition-all border-b-2 -mb-2.5 ${
                !isRegister
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsRegister(true); setErrorMessage(''); }}
              className={`pb-2 px-4 text-sm font-extrabold transition-all border-b-2 -mb-2.5 ${
                isRegister
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Elakiya R"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-700"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="elakiya@spendora.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-700"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link will be sent to your registered email.')}
                    className="text-[11px] text-emerald-800 font-bold hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#14281e] hover:bg-[#1a382a] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Please wait...' : isRegister ? 'Register Account' : 'Log In to Spendora'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access (1-Click) */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-500 mb-2">Want to explore right away with demo data?</p>
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-50 to-emerald-50 hover:from-amber-100 hover:to-emerald-100 text-[#14281e] border border-amber-300/80 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <span>⚡ 1-Click Demo Login as Elakiya R</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
