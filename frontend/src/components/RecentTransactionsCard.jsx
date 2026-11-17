import React, { useState } from 'react';
import { 
  Zap, 
  Utensils, 
  ShoppingBag, 
  Briefcase, 
  Car, 
  MoreHorizontal, 
  ArrowRight,
  Edit2, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecentTransactionsCard({ 
  transactions = [], 
  onEdit, 
  onDelete 
}) {
  const navigate = useNavigate();
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const getTransactionIcon = (title, catName) => {
    const text = `${title} ${catName}`.toLowerCase();
    if (text.includes('food') || text.includes('zomato') || text.includes('dining')) {
      return { Icon: Utensils, bg: 'bg-[#ff6b6b]', color: 'text-white' };
    }
    if (text.includes('shop') || text.includes('zara')) {
      return { Icon: ShoppingBag, bg: 'bg-[#4f86f7]', color: 'text-white' };
    }
    if (text.includes('salary') || text.includes('income')) {
      return { Icon: Briefcase, bg: 'bg-[#20bf6b]', color: 'text-white' };
    }
    if (text.includes('travel') || text.includes('ola') || text.includes('fuel')) {
      return { Icon: Car, bg: 'bg-[#ff4757]', color: 'text-white' };
    }
    if (text.includes('electricity') || text.includes('bill') || text.includes('power')) {
      return { Icon: Zap, bg: 'bg-[#ffa502]', color: 'text-white' };
    }
    return { Icon: MoreHorizontal, bg: 'bg-gray-400', color: 'text-white' };
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Recent';
    const d = new Date(dateStr);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today, 9:14 PM';
    if (isYesterday) return 'Yesterday, 6:20 PM';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="card-soft p-6 flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4 fill-amber-500" />
          </div>
          <h3 className="text-base font-bold text-gray-800">Recent Transactions</h3>
        </div>
        <button
          onClick={() => navigate('/transactions')}
          className="text-xs font-bold text-gray-400 hover:text-emerald-800 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            No transactions found for this period. Add one above! 🌱
          </div>
        ) : (
          transactions.slice(0, 5).map((item) => {
            const { Icon, bg, color } = getTransactionIcon(item.title, item.category_name);
            const isIncome = item.type === 'INCOME';

            return (
              <div
                key={item.id}
                className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50/90 transition-all border border-transparent hover:border-gray-200/60"
              >
                {/* Left: Icon, Title, Date */}
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-full ${bg} ${color} flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-800 leading-tight">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      {formatDateTime(item.date)}
                    </p>
                  </div>
                </div>

                {/* Right: Amount, Badge, and Action Buttons */}
                <div className="flex items-center gap-4">
                  {/* Amount with sign */}
                  <span
                    className={`text-sm font-black tracking-tight ${
                      isIncome ? 'text-[#10b981]' : 'text-[#ff4757]'
                    }`}
                  >
                    {isIncome ? `+ ₹${Number(item.amount).toLocaleString('en-IN')}` : `- ₹${Number(item.amount).toLocaleString('en-IN')}`}
                  </span>

                  {/* Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                      isIncome
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {isIncome ? 'Income' : 'Expense'}
                  </span>

                  {/* Edit / Delete actions shown on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-gray-200/60 rounded-lg transition-colors"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => setDeleteCandidate(item)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-200/60 rounded-lg transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Deletion (FR-HOM-08) */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-gray-900 text-center mb-1">Delete Expense?</h4>
            <p className="text-xs text-gray-500 text-center mb-5">
              Are you sure you want to delete <span className="font-semibold text-gray-800">"{deleteCandidate.title}"</span>? This will update your balances and milestones.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteCandidate.id);
                  setDeleteCandidate(null);
                }}
                className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
