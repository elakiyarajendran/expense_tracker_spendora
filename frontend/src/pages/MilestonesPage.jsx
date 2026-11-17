import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  ShieldAlert, 
  Plus, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import Header from '../components/Header';
import MilestoneModal from '../components/MilestoneModal';
import ContributionModal from '../components/ContributionModal';
import api from '../services/api';

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [milestoneToEdit, setMilestoneToEdit] = useState(null);

  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [deleteCandidate, setDeleteCandidate] = useState(null);

  useEffect(() => {
    fetchMilestones(statusFilter);
  }, [statusFilter]);

  const fetchMilestones = async (filter = statusFilter) => {
    try {
      setLoading(true);
      const res = await api.get(`/milestones/?status=${filter}`);
      setMilestones(res.data);
    } catch (err) {
      console.error('Failed to fetch milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setMilestoneToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setMilestoneToEdit(m);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/milestones/${id}/`);
      fetchMilestones(statusFilter);
    } catch (err) {
      console.error('Failed to delete milestone:', err);
    }
  };

  const handleOpenContribute = (m) => {
    setSelectedGoal(m);
    setIsContributionOpen(true);
  };

  const filterTabs = [
    { key: 'ALL', label: 'All Milestones' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'ACHIEVED', label: 'Achieved 🎉' },
    { key: 'EXCEEDED/EXPIRED', label: 'Exceeded / Expired' },
  ];

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-2xl bg-amber-100 text-amber-800">
              <Trophy className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Financial Milestones & Budgets
            </h2>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Track your savings ambitions and protect against overspending with active caps.
          </p>
        </div>

        {/* Action Button (FR-MIL-01) */}
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#14281e] hover:bg-[#1a382a] text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Milestone</span>
        </button>
      </div>

      {/* Filter Tabs (FR-MIL-09) */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-2 border-b border-gray-200/60">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab.key
                ? 'bg-[#1b3829] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Milestones Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mb-2" />
          <p className="text-xs font-bold">Loading milestones...</p>
        </div>
      ) : milestones.length === 0 ? (
        <div className="card-soft p-12 text-center text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h4 className="text-base font-bold text-gray-700 mb-1">No Milestones Found</h4>
          <p className="text-xs max-w-sm mx-auto mb-4">
            You don't have any milestones under this filter. Create a Savings Goal or Spending Limit to start tracking!
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
          >
            + Create First Milestone
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((m) => {
            const isSavings = m.type === 'SAVINGS';
            const progress = m.progress || {};
            const pct = progress.percentage || 0;
            const currentAmt = progress.current_amount || 0;
            const targetAmt = progress.target_amount || m.target_amount;
            const daysLeft = progress.days_remaining ?? 0;
            const statusVal = m.status;

            return (
              <div
                key={m.id}
                className="card-soft p-6 flex flex-col justify-between hover:shadow-lg transition-all border border-gray-200/80 relative overflow-hidden"
              >
                {/* Top Badge & Actions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                        isSavings
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isSavings ? <Target className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      <span>{isSavings ? 'Savings Goal' : 'Spending Limit'}</span>
                    </span>

                    {/* Status badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase ${
                        statusVal === 'ACHIEVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : statusVal === 'EXCEEDED'
                          ? 'bg-rose-100 text-rose-800'
                          : statusVal === 'EXPIRED'
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {statusVal}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <h4 className="text-base font-extrabold text-gray-900 leading-snug mb-1">
                    {m.title}
                  </h4>
                  {m.category_name && (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-2">
                      Category: {m.category_name}
                    </span>
                  )}

                  {/* Progress details */}
                  <div className="my-4">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xs text-gray-500 font-bold">
                        {isSavings ? 'Saved' : 'Spent'}: <span className="text-gray-900">₹{currentAmt.toLocaleString('en-IN')}</span>
                      </span>
                      <span className="text-xs text-gray-500 font-bold">
                        Target: <span className="text-gray-900">₹{Number(targetAmt).toLocaleString('en-IN')}</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSavings
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                            : pct >= 100
                            ? 'bg-rose-500'
                            : pct >= 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold mt-1 text-gray-600">
                      <span>{pct}% complete</span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        {daysLeft > 0 ? `${daysLeft} days remaining` : 'Period Ended'}
                      </span>
                    </div>

                    {/* Alert notice if limit >= 80% */}
                    {!isSavings && pct >= 80 && (
                      <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          {pct >= 100 ? 'Limit exceeded! Cut down spending.' : 'Limit warning! Over 80% used.'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons: Add Savings (if savings goal) + Edit / Delete */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 text-gray-400 hover:text-emerald-800 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit Milestone"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate(m)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Delete Milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isSavings && statusVal === 'ACTIVE' && (
                    <button
                      onClick={() => handleOpenContribute(m)}
                      className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Savings</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <MilestoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        milestoneToEdit={milestoneToEdit}
        onSuccess={() => fetchMilestones(statusFilter)}
      />

      <ContributionModal
        isOpen={isContributionOpen}
        onClose={() => setIsContributionOpen(false)}
        milestone={selectedGoal}
        onSuccess={() => fetchMilestones(statusFilter)}
      />

      {/* Delete Confirmation */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <h4 className="text-base font-bold text-gray-900 text-center mb-1">Delete Milestone?</h4>
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
