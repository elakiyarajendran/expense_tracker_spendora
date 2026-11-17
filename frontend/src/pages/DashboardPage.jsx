import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import StatCards from '../components/StatCards';
import ExpenseOverviewCard from '../components/ExpenseOverviewCard';
import SavingsGoalCard from '../components/SavingsGoalCard';
import MilestoneBadgesCard from '../components/MilestoneBadgesCard';
import SunsetQuoteCard from '../components/SunsetQuoteCard';
import RecentTransactionsCard from '../components/RecentTransactionsCard';
import BottomBanner from '../components/BottomBanner';
import ExpenseModal from '../components/ExpenseModal';
import ContributionModal from '../components/ContributionModal';
import MilestoneModal from '../components/MilestoneModal';
import api from '../services/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [period, setPeriod] = useState('1M');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [selectedGoalForContribute, setSelectedGoalForContribute] = useState(null);

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneToEdit, setMilestoneToEdit] = useState(null);

  useEffect(() => {
    fetchDashboard(period);
  }, [period]);

  const fetchDashboard = async (p = period) => {
    try {
      const res = await api.get(`/dashboard/summary/?period=${p}`);
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const handleOpenAddExpense = () => {
    setExpenseToEdit(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}/`);
      fetchDashboard(period);
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const handleOpenContribute = (goal) => {
    setSelectedGoalForContribute(goal || dashboardData?.main_savings_goal);
    setIsContributionModalOpen(true);
  };

  const handleEditGoal = (goal) => {
    setMilestoneToEdit(goal);
    setIsMilestoneModalOpen(true);
  };

  // Filter recent expenses if user searches in header
  const filteredExpenses = (dashboardData?.recent_expenses || []).filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(term)) ||
      (item.category_name && item.category_name.toLowerCase().includes(term)) ||
      (item.notes && item.notes.toLowerCase().includes(term))
    );
  });

  if (loading && !dashboardData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-screen text-emerald-900">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-700 mb-3" />
        <p className="text-sm font-bold">Loading Spendora Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full relative">
      {/* Top Header with Greetings, Search, Sleeping Kitten & Quote */}
      <Header 
        alerts={dashboardData?.alerts || []} 
        onSearch={(term) => setSearchTerm(term)} 
      />

      {/* Top 3 Stat Cards (Balance, Spent, Saved) */}
      <StatCards summary={dashboardData?.summary} />

      {/* Middle Grid: Expense Overview (Donut + Breakdown) & Right Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Side: Expense Overview Card (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col">
          <ExpenseOverviewCard
            categoryBreakdown={dashboardData?.category_breakdown || []}
            totalSpent={dashboardData?.summary?.total_spent || 15250}
            period={period}
            onPeriodChange={handlePeriodChange}
          />
        </div>

        {/* Right Side: Savings Goal, Milestones Badges & Sunset Quote (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          {/* Your Savings Goal */}
          <SavingsGoalCard
            goal={dashboardData?.main_savings_goal}
            onContribute={handleOpenContribute}
            onEdit={handleEditGoal}
          />

          {/* Milestones Badges */}
          <MilestoneBadgesCard />

          {/* Sunset Silhouette Motivational Quote */}
          <SunsetQuoteCard />
        </div>
      </div>

      {/* Recent Transactions Card */}
      <div className="mb-6">
        <RecentTransactionsCard
          transactions={filteredExpenses}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
        />
      </div>

      {/* Bottom Motivational Banner */}
      <BottomBanner />

      {/* Floating "+ Add Expense" Button (FR-HOM-09) */}
      <button
        onClick={handleOpenAddExpense}
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-bold p-4 rounded-full shadow-2xl hover:shadow-emerald-900/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group border-2 border-emerald-300/40"
        title="Record New Expense"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        <span className="hidden sm:inline pr-2 text-xs uppercase tracking-wider font-extrabold">
          Add Expense
        </span>
      </button>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expenseToEdit={expenseToEdit}
        onSuccess={() => fetchDashboard(period)}
      />

      <ContributionModal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        milestone={selectedGoalForContribute}
        onSuccess={() => fetchDashboard(period)}
      />

      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        milestoneToEdit={milestoneToEdit}
        onSuccess={() => fetchDashboard(period)}
      />
    </div>
  );
}
