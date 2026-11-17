import React, { useState, useEffect } from 'react';
import { X, Trophy, Target, ShieldAlert } from 'lucide-react';
import api from '../services/api';

export default function MilestoneModal({ 
  isOpen, 
  onClose, 
  milestoneToEdit = null, 
  onSuccess 
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    type: 'SAVINGS',
    target_amount: '',
    start_date: todayStr,
    end_date: nextMonthStr,
    category: '',
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (milestoneToEdit) {
        setFormData({
          title: milestoneToEdit.title || '',
          type: milestoneToEdit.type || 'SAVINGS',
          target_amount: milestoneToEdit.target_amount || '',
          start_date: milestoneToEdit.start_date || todayStr,
          end_date: milestoneToEdit.end_date || nextMonthStr,
          category: milestoneToEdit.category || '',
        });
      } else {
        setFormData({
          title: '',
          type: 'SAVINGS',
          target_amount: '',
          start_date: todayStr,
          end_date: nextMonthStr,
          category: '',
        });
      }
      setFieldErrors({});
      setGeneralError('');
    }
  }, [isOpen, milestoneToEdit]);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (e) {
      console.warn('Failed to fetch categories:', e);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title || !formData.title.trim()) {
      errs.title = 'Title is required.';
    }
    const amt = parseFloat(formData.target_amount);
    if (!formData.target_amount || isNaN(amt) || amt <= 0) {
      errs.target_amount = 'Target amount must be greater than zero.';
    }
    if (!formData.start_date) {
      errs.start_date = 'Start date is required.';
    }
    if (!formData.end_date) {
      errs.end_date = 'End date is required.';
    } else if (formData.end_date <= formData.start_date) {
      errs.end_date = 'End date must be strictly after the start date.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setGeneralError('');

    const payload = {
      ...formData,
      category: formData.type === 'LIMIT' && formData.category ? formData.category : null,
    };

    try {
      let res;
      if (milestoneToEdit) {
        res = await api.put(`/milestones/${milestoneToEdit.id}/`, payload);
      } else {
        res = await api.post('/milestones/', payload);
      }
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      if (err.response?.data) {
        setFieldErrors(err.response.data);
      } else {
        setGeneralError('Failed to save milestone.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Trophy className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-black text-gray-900">
              {milestoneToEdit ? 'Edit Milestone' : 'Create Financial Milestone'}
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Define a savings goal to accumulate wealth or a spending limit to stay within budget.
          </p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
            {generalError}
          </div>
        )}

        {/* Milestone Type Selector */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'SAVINGS' })}
            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
              formData.type === 'SAVINGS'
                ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Target className={`w-6 h-6 mb-1 ${formData.type === 'SAVINGS' ? 'text-purple-700' : 'text-gray-400'}`} />
            <span className="text-xs font-bold text-gray-900">Savings Goal</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Accumulate towards a dream</span>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'LIMIT' })}
            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
              formData.type === 'LIMIT'
                ? 'border-rose-500 bg-rose-50/50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <ShieldAlert className={`w-6 h-6 mb-1 ${formData.type === 'LIMIT' ? 'text-rose-600' : 'text-gray-400'}`} />
            <span className="text-xs font-bold text-gray-900">Spending Limit</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Cap expenses in a period</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={formData.type === 'SAVINGS' ? 'e.g. New Laptop Fund, Goa Trip' : 'e.g. Monthly Dining Cap'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-600"
            />
            {fieldErrors.title && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.title}</p>}
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Target Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">₹</span>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 50000"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                className="w-full py-2.5 pl-7 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-600"
              />
            </div>
            {fieldErrors.target_amount && (
              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.target_amount}</p>
            )}
          </div>

          {/* Category (if Spending Limit) */}
          {formData.type === 'LIMIT' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category (Optional - leave empty for all spending)
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="">All Categories (Overall Budget)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              />
              {fieldErrors.start_date && (
                <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              />
              {fieldErrors.end_date && (
                <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.end_date}</p>
              )}
            </div>
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
              className="px-6 py-2 bg-[#1b3d2b] hover:bg-[#142e20] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Saving...' : milestoneToEdit ? 'Update Milestone' : 'Create Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
