import React, { useState } from 'react';
import { X, PiggyBank, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export default function ContributionModal({ 
  isOpen, 
  onClose, 
  milestone, 
  onSuccess 
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayStr);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [celebration, setCelebration] = useState(false);

  if (!isOpen || !milestone) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post(`/milestones/${milestone.id}/contribute/`, {
        amount: num,
        date,
        note,
      });

      if (res.data.is_newly_achieved) {
        setCelebration(true);
        // Trigger celebratory confetti (FR-MIL-10)
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          console.warn('Confetti error:', e);
        }
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data.milestone);
          onClose();
        }, 2200);
      } else {
        if (onSuccess) onSuccess(res.data.milestone);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.amount || err.response?.data?.detail || 'Failed to record contribution.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {celebration ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-emerald-900">Goal Achieved! 🎉</h3>
            <p className="text-xs text-gray-600 mt-2 px-4">
              Congratulations! You have reached your savings target for <br />
              <span className="font-bold text-gray-900">"{milestone.title}"</span>!
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <PiggyBank className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-black text-gray-900">Add Savings Contribution</h3>
              </div>
              <p className="text-xs text-gray-500">
                Deposit money towards <span className="font-bold text-gray-800">"{milestone.title}"</span>.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contribution Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full py-2.5 pl-7 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600"
                    autoFocus
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Note / Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly transfer from salary"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600"
                />
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Savings'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
