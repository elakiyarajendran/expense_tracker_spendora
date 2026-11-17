import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ExpenseModal from './components/ExpenseModal';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import MilestonesPage from './pages/MilestonesPage';
import TransactionsPage from './pages/TransactionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

function PrivateLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const [isGlobalExpenseModalOpen, setIsGlobalExpenseModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f2eb]">
        <div className="text-emerald-900 font-bold text-sm">Authenticating with Spendora...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#f5f2eb]">
      <Sidebar onOpenAddExpense={() => setIsGlobalExpenseModalOpen(true)} />
      <main className="flex-1 overflow-x-hidden min-h-screen flex flex-col">
        {children}
      </main>

      <ExpenseModal
        isOpen={isGlobalExpenseModalOpen}
        onClose={() => setIsGlobalExpenseModalOpen(false)}
        onSuccess={() => {
          // Trigger refresh if needed or page reload
          window.location.reload();
        }}
      />
    </div>
  );
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateLayout>
                <DashboardPage />
              </PrivateLayout>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateLayout>
                <TransactionsPage />
              </PrivateLayout>
            }
          />
          <Route
            path="/budgets"
            element={
              <PrivateLayout>
                <MilestonesPage />
              </PrivateLayout>
            }
          />
          <Route
            path="/goals"
            element={
              <PrivateLayout>
                <MilestonesPage />
              </PrivateLayout>
            }
          />
          <Route
            path="/milestones"
            element={
              <PrivateLayout>
                <MilestonesPage />
              </PrivateLayout>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateLayout>
                <AnalyticsPage />
              </PrivateLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateLayout>
                <SettingsPage />
              </PrivateLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
