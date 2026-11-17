from django.urls import path
from .views import (
    CategoryListCreateView, CategoryDetailView,
    ExpenseListCreateView, ExpenseDetailView,
    MilestoneListCreateView, MilestoneDetailView, MilestoneContributeView,
    DashboardSummaryView
)

urlpatterns = [
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('categories/', CategoryListCreateView.as_view(), name='category_list_create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category_detail'),
    path('expenses/', ExpenseListCreateView.as_view(), name='expense_list_create'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense_detail'),
    path('milestones/', MilestoneListCreateView.as_view(), name='milestone_list_create'),
    path('milestones/<int:pk>/', MilestoneDetailView.as_view(), name='milestone_detail'),
    path('milestones/<int:pk>/contribute/', MilestoneContributeView.as_view(), name='milestone_contribute'),
]
