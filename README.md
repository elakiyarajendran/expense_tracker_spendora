# Spendora – Smart Expense Tracker

> **Track Smart. Spend Wise. Live Better.**  
> Built strictly according to the **Software Requirements Specification (SRS Version 1.0)** and the **Spendora Botanical UI Design**.

---

## 🌿 Overview

**Spendora** is a self-contained, three-tier web application designed to help individuals record daily expenses, monitor spending habits, and accomplish personal financial milestones (Savings Goals & Spending Limits).

- **Student Author:** Elakiya (Register No: `25BCA019`)
- **Institution:** Sri Krishna Arts and Science College (SKASC)
- **Department:** Department of Computer Applications (BCA – II Year)
- **Frontend:** React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts
- **Backend:** Python + Django 6 + Django REST Framework + SimpleJWT + SQLite

---

## 🎨 UI Design Implementation

The frontend strictly implements the uploaded visual design:
- **Curved Forest-Green Botanical Sidebar:** Spendora leaf emblem, navigation menu, *Go Premium* promotion card, and user status profile badge (`Elakiya R - Premium User 👑`).
- **Interactive Top Header:** Live transaction search, notification bell with active budget alert badges, dark/light theme toggle, and the signature **curled sleeping kitten on pastel books** with the coffee mug (`Dream Plan Save 🤍`) and quote (`"You're doing great!" 🤍`).
- **Summary Stat Cards:** Wave sparklines for **Total Balance** (₹24,750, `↑ +12%`), **Total Spent** (₹15,250, `↑ +8%`), and **Total Saved** (₹9,500, `↑ +20%`).
- **Expense Overview Card:** Donut chart with center spend tally (`₹15,250 Total Spent 🍃`), period filter selector (`1M`, `3M`, `6M`, `1Y`), and category breakdown list.
- **Savings Goal Card:** Target ₹50,000, 70% progress bar, **3D gold coins in glass jar illustration**, and *Keep Going* contribution trigger.
- **Milestones Achievement Badges:** *First Expense Tracked*, *Saved ₹5,000*, and *Reached 50% of Goal*.
- **Sunset Motivational Card:** Silhouette meditation artwork with `"Plan well, spend wisely, and enjoy the little things." 🤍`.
- **Recent Transactions Card:** Real-time expense feed with icons, dates, amounts, expense/income tags, and instant edit/delete actions with confirmation prompts.
- **Bottom Banner:** Gold trophy, glowing sparkles, and `"Stay Consistent! You're on the right path to a financially free you! 💚"`.

---

## 📋 SRS Requirements Traceability Matrix

| Requirement ID | Specification | Status | Implementation Details |
|---|---|---|---|
| **FR-LOG-01 to 05** | Email/Password login, JWT access & refresh tokens, generic failure error | ✅ Complete | SimpleJWT integration, stored tokens, auto-refresh on 401 |
| **FR-LOG-06** | User registration (name, unique email, 8+ char password) | ✅ Complete | `RegisterSerializer` and `/api/auth/register/` |
| **FR-LOG-07** | Show/Hide password toggle | ✅ Complete | Interactive eye toggle on all password inputs |
| **FR-LOG-08** | Account lockout for 15 minutes after 5 consecutive failed attempts | ✅ Complete | Tracked in database `locked_until` field |
| **FR-LOG-09 to 10** | Logout clears tokens; protected routes redirect to login | ✅ Complete | `AuthContext` + `PrivateRoute` wrapper |
| **FR-HOM-01 to 06** | Dashboard summary, period filter (`1M`, `3M`, `6M`, `1Y`), donut chart, 6-month trend | ✅ Complete | `/api/dashboard/summary/` + Recharts widgets |
| **FR-HOM-07 to 08** | Milestone snapshot & transaction edit/delete with confirmation | ✅ Complete | Inline modal actions with prompt |
| **FR-HOM-09** | Visible "+ Add Expense" action | ✅ Complete | Floating button & sidebar quick-action |
| **FR-EXP-01 to 03** | Title (2–100 chars), Amount (>0), Category, Date (no future dates), Payment method, Notes | ✅ Complete | Validated on client and Django serializers |
| **FR-EXP-04 to 05** | Default categories (Food, Transport, Shopping, Bills, etc.) + Custom category creation | ✅ Complete | Seeded default categories + inline category creator |
| **FR-EXP-06 to 07** | Save expense & "Save & Add Another" option | ✅ Complete | Implemented in `ExpenseModal.jsx` |
| **FR-EXP-08 to 09** | Expense edit mode (PUT) and deletion (DELETE) | ✅ Complete | `/api/expenses/{id}/` |
| **FR-EXP-10** | Spending limit warning when milestone reaches 80% or exceeds 100% | ✅ Complete | Live threshold checks in backend + UI warning banner |
| **FR-EXP-11 / NFR-03** | Strict User Isolation: users only access their own data | ✅ Complete | All queries filtered by `request.user` |
| **FR-MIL-01 to 03** | Create milestones, validate end date > start date, list milestone cards | ✅ Complete | `/api/milestones/` + `MilestonesPage.jsx` |
| **FR-MIL-04** | Auto-calculate spending limit progress from matching expenses in period | ✅ Complete | `Milestone.calculate_progress()` |
| **FR-MIL-05** | Add savings contributions via `/api/milestones/{id}/contribute/` | ✅ Complete | `ContributionModal.jsx` |
| **FR-MIL-06 to 07** | Auto status updates (Active, Achieved, Exceeded, Expired) & 80%/100% alerts | ✅ Complete | Dynamic calculation & in-app notifications |
| **FR-MIL-09 to 10** | Milestone status filters & achievement celebration badge / confetti | ✅ Complete | Filter tabs + Canvas Confetti animation |

---

## 🚀 Quick Start Guide

### Option 1: One-Click Startup (Windows)
Double-click `start_spendora.bat` or run in PowerShell:
```powershell
.\start_spendora.ps1
```

### Option 2: Manual Startup

#### 1. Backend (Django)
```bash
cd backend
python manage.py migrate
python manage.py seed_data
python manage.py runserver 8000
```
Backend API will be live at `http://localhost:8000/`.

#### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173/`.

---

## 🔑 Demo Account Credentials

- **Email:** `elakiya@spendora.app`
- **Password:** `password123`
- *(Alternatively, click the **"⚡ 1-Click Demo Login as Elakiya R"** button on the login screen for instant access!)*

---

## 🧪 Automated Test Suite

To verify all 8 functional SRS requirement groups:
```bash
cd backend
python test_spendora.py
```
Outputs:
```text
============================================================
RUNNING SPENDORA SRS FUNCTIONAL VERIFICATION SUITE
============================================================
[PASS] FR-LOG-06: User Registration
[PASS] FR-LOG-03: JWT Authentication & Token Issuance
[PASS] FR-LOG-08: 15-Minute Account Lockout after 5 Failed Attempts
[PASS] FR-EXP-04 & FR-EXP-05: Default & Custom Categories
[PASS] FR-MIL-01 & FR-MIL-02: Milestone Creation & End Date Validation
[PASS] FR-EXP-10 & FR-MIL-07: Spending Limit 80% Warning Alert Triggered
[PASS] FR-MIL-05 & FR-MIL-10: Savings Contribution & Goal Achievement
[PASS] FR-HOM-02 to FR-HOM-07: Dashboard Summary, Period Filter & Trends
============================================================
ALL 8 AUTOMATED FUNCTIONAL TESTS PASSED PERFECTLY!
============================================================
```
