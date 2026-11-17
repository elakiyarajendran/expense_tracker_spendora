import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Edit2, 
  Trash2, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import ExpenseModal from '../components/ExpenseModal';
import api from '../services/api';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [selectedCategory, selectedType, startDate, endDate]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (e) {
      console.warn('Failed to fetch categories', e);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedType) params.append('type', selectedType);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/expenses/?${params.toString()}`);
      setTransactions(res.data);
    } catch (e) {
      console.error('Failed to fetch transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleOpenAdd = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setExpenseToEdit(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}/`);
      fetchTransactions();
    } catch (e) {
      console.error('Failed to delete transaction:', e);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Date', 'Title', 'Category', 'Type', 'Amount (INR)', 'Payment Method', 'Notes'];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category_name || ''}"`,
      t.type,
      t.amount,
      t.payment_method,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Spendora_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick stats
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
  const netFlow = totalIncome - totalExpense;

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-2xl bg-emerald-100 text-emerald-800">
              <ArrowLeftRight className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Transactions History
            </h2>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Search, filter, edit and export all your expenses and incomes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#14281e] hover:bg-[#1a382a] text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-950/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Filtered Expenses</span>
          <div className="text-xl font-extrabold text-rose-600 mt-1">
            - ₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Filtered Incomes</span>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">
            + ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Net Balance Flow</span>
          <div className={`text-xl font-extrabold mt-1 ${netFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            ₹{netFlow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-soft p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
            >
              <option value="">All Types (Expense + Income)</option>
              <option value="EXPENSE">Expense Only</option>
              <option value="INCOME">Income Only</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              placeholder="Start date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              placeholder="End date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
            />
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card-soft overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mx-auto mb-2" />
            <p className="text-xs font-bold">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm font-bold text-gray-600 mb-1">No matching transactions</p>
            <p className="text-xs">Try adjusting your filters or record a new transaction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t) => {
                  const isIncome = t.type === 'INCOME';
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">
                        {t.date}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-gray-800">
                        {t.title}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold"
                          style={{
                            backgroundColor: `${t.category_color || '#10b981'}15`,
                            color: t.category_color || '#10b981',
                          }}
                        >
                          {t.category_name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {t.payment_method}
                      </td>
                      <td className="py-3 px-4 text-gray-400 max-w-xs truncate">
                        {t.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-black text-sm ${
                            isIncome ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isIncome ? '+' : '-'} ₹{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 text-gray-400 hover:text-emerald-800 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(t)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expenseToEdit={expenseToEdit}
        onSuccess={() => fetchTransactions()}
      />

      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <h4 className="text-base font-bold text-gray-900 text-center mb-1">Delete Transaction?</h4>
            <p className="text-xs text-gray-500 text-center mb-5">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteCandidate.title}"</span>?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(deleteCandidate.id);
                  setDeleteCandidate(null);
                }}
                className="flex-1 py-2 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
