import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  AlertTriangle, 
  Check, 
  Calendar, 
  CreditCard, 
  FileText, 
  Tag, 
  IndianRupee 
} from 'lucide-react';
import api from '../services/api';

export default function ExpenseModal({ 
  isOpen, 
  onClose, 
  expenseToEdit = null, 
  onSuccess 
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE',
    category: '',
    date: todayStr,
    payment_method: 'UPI',
    notes: '',
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  
  // Custom Category Creation Inline (FR-EXP-05)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#10b981');

  // Milestone Warning (FR-EXP-10)
  const [milestoneWarning, setMilestoneWarning] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (expenseToEdit) {
        setFormData({
          title: expenseToEdit.title || '',
          amount: expenseToEdit.amount || '',
          type: expenseToEdit.type || 'EXPENSE',
          category: expenseToEdit.category || '',
          date: expenseToEdit.date || todayStr,
          payment_method: expenseToEdit.payment_method || 'UPI',
          notes: expenseToEdit.notes || '',
        });
      } else {
        setFormData({
          title: '',
          amount: '',
          type: 'EXPENSE',
          category: '',
          date: todayStr,
          payment_method: 'UPI',
          notes: '',
        });
      }
      setFieldErrors({});
      setGeneralError('');
      setMilestoneWarning(null);
    }
  }, [isOpen, expenseToEdit]);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
      if (!formData.category && res.data.length > 0 && !expenseToEdit) {
        setFormData(prev => ({ ...prev, category: res.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleCreateCustomCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await api.post('/categories/', {
        name: newCatName.trim(),
        color: newCatColor,
        icon: 'Tag',
      });
      const created = res.data;
      setCategories(prev => [...prev, created]);
      setFormData(prev => ({ ...prev, category: created.id }));
      setNewCatName('');
      setIsCreatingCategory(false);
    } catch (err) {
      setGeneralError(err.response?.data?.name || 'Failed to create category.');
    }
  };

  const validateClient = () => {
    const errors = {};
    if (!formData.title || formData.title.trim().length < 2) {
      errors.title = 'Title must be between 2 and 100 characters.';
    }
    const numAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(numAmount) || numAmount <= 0) {
      errors.amount = 'Amount must be greater than zero.';
    } else if (numAmount > 99999999.99) {
      errors.amount = 'Amount cannot exceed ₹99,999,999.99.';
    }
    if (!formData.category) {
      errors.category = 'Please select a category.';
    }
    if (!formData.date) {
      errors.date = 'Date is required.';
    } else if (formData.date > todayStr) {
      errors.date = 'Future dates are not allowed.';
    }
    if (formData.notes && formData.notes.length > 250) {
      errors.notes = 'Notes cannot exceed 250 characters.';
    }
    return errors;
  };

  const handleSubmit = async (saveAndAddAnother = false) => {
    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }
    setFieldErrors({});
    setGeneralError('');
    setLoading(true);

    try {
      let res;
      if (expenseToEdit) {
        res = await api.put(`/expenses/${expenseToEdit.id}/`, formData);
      } else {
        res = await api.post('/expenses/', formData);
      }

      // Check for milestone warnings (FR-EXP-10)
      if (res.data.warnings && res.data.warnings.length > 0) {
        setMilestoneWarning(res.data.warnings[0]);
      }

      if (onSuccess) onSuccess(res.data);

      if (saveAndAddAnother) {
        // Reset form for next entry
        setFormData({
          title: '',
          amount: '',
          type: 'EXPENSE',
          category: categories[0]?.id || '',
          date: todayStr,
          payment_method: 'UPI',
          notes: '',
        });
      } else {
        if (!res.data.warnings || res.data.warnings.length === 0) {
          onClose();
        }
      }
    } catch (err) {
      if (err.response?.data) {
        setFieldErrors(err.response.data);
      } else {
        setGeneralError('Failed to save transaction. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <IndianRupee className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-extrabold text-gray-900">
              {expenseToEdit ? 'Edit Transaction' : 'Record Transaction'}
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            {expenseToEdit
              ? 'Update the transaction details below.'
              : 'Add an expense or income to track your cash flow in Spendora.'}
          </p>
        </div>

        {/* Milestone Warning Banner (FR-EXP-10) */}
        {milestoneWarning && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">{milestoneWarning.message}</p>
              <button
                onClick={onClose}
                className="mt-2 px-3 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold"
              >
                Got it, Continue
              </button>
            </div>
          </div>
        )}

        {/* General Error */}
        {generalError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {generalError}
          </div>
        )}

        {/* Type Toggle: Expense vs Income */}
        <div className="flex p-1 bg-gray-100 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              formData.type === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            - Expense
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'INCOME' })}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              formData.type === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            + Income
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Title / Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Food - Zomato, Groceries, Salary Credit"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full p-2.5 text-xs bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.title
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-gray-200 focus:ring-emerald-200 focus:border-emerald-700'
              }`}
            />
            {fieldErrors.title && (
              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.title}</p>
            )}
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full py-2.5 pl-7 pr-3 text-xs bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 font-bold ${
                    fieldErrors.amount
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-gray-200 focus:ring-emerald-200 focus:border-emerald-700'
                  }`}
                />
              </div>
              {fieldErrors.amount && (
                <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.amount}</p>
              )}
            </div>

            {/* Category Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">
                  Category <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                  className="text-[10px] text-emerald-700 font-bold hover:underline"
                >
                  + New Category
                </button>
              </div>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-700 font-medium"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.is_default ? '(Default)' : '(Custom)'}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.category}</p>
              )}
            </div>
          </div>

          {/* Inline Create Category Box (FR-EXP-05) */}
          {isCreatingCategory && (
            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Category name (e.g. Gym, Pet Care)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 p-2 text-xs bg-white border border-gray-200 rounded-xl"
              />
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                title="Choose category color"
              />
              <button
                type="button"
                onClick={handleCreateCustomCategory}
                className="px-3 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
              >
                Add
              </button>
            </div>
          )}

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                max={todayStr}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-700"
              />
              {fieldErrors.date && (
                <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.date}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-700"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="Debit/Credit Card">Debit / Credit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Wallet">Wallet</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">Notes (Optional)</label>
              <span className="text-[10px] text-gray-400">{formData.notes.length}/250</span>
            </div>
            <textarea
              rows={2}
              maxLength={250}
              placeholder="Add optional notes or remarks..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-700 resize-none"
            />
          </div>
        </div>

        {/* Modal Actions (FR-EXP-07) */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>

          {!expenseToEdit && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs rounded-xl transition-all border border-emerald-200"
            >
              Save & Add Another
            </button>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto px-6 py-2 bg-[#1b3d2b] hover:bg-[#153022] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Saving...' : expenseToEdit ? 'Update Expense' : 'Save Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}
