from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count, Q
from datetime import timedelta, date
from decimal import Decimal
import calendar

from .models import Category, Expense, Milestone, Contribution
from .serializers import (
    CategorySerializer, ExpenseSerializer,
    MilestoneSerializer, ContributionSerializer
)

class CategoryListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Default categories plus user's custom categories
        categories = Category.objects.filter(Q(is_default=True) | Q(user=request.user))
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        name = request.data.get('name', '').strip()
        color = request.data.get('color', '#10B981')
        icon = request.data.get('icon', 'Tag')

        if not name:
            return Response({'name': 'Category name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check existing
        if Category.objects.filter(Q(is_default=True) | Q(user=request.user), name__iexact=name).exists():
            return Response({'name': 'A category with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        category = Category.objects.create(
            user=request.user,
            name=name,
            is_default=False,
            color=color,
            icon=icon
        )
        return Response(CategorySerializer(category).data, status=status.HTTP_201_CREATED)

class CategoryDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            category = Category.objects.get(pk=pk, user=request.user)
        except Category.DoesNotExist:
            return Response({'detail': 'Category not found or cannot be deleted.'}, status=status.HTTP_404_NOT_FOUND)

        if category.is_default:
            return Response({'detail': 'Default categories cannot be deleted.'}, status=status.HTTP_400_BAD_REQUEST)

        if category.expenses.exists():
            return Response({'detail': 'Cannot delete category that has existing expenses.'}, status=status.HTTP_400_BAD_REQUEST)

        category.delete()
        return Response({'message': 'Category deleted successfully.'}, status=status.HTTP_200_OK)

class ExpenseListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Expense.objects.filter(user=request.user)

        # Filter by category
        category_id = request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter by type
        expense_type = request.query_params.get('type')
        if expense_type:
            queryset = queryset.filter(type=expense_type)

        # Filter by date range
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        # Search filter
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(notes__icontains=search) |
                Q(category__name__icontains=search)
            )

        serializer = ExpenseSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            expense = serializer.save(user=request.user)

            # Check spending limit milestone warnings (FR-EXP-10)
            warnings = []
            if expense.type == 'EXPENSE':
                active_limits = Milestone.objects.filter(
                    user=request.user,
                    type='LIMIT',
                    start_date__lte=expense.date,
                    end_date__gte=expense.date
                )
                for limit in active_limits:
                    if limit.category and limit.category != expense.category:
                        continue
                    progress_info = limit.calculate_progress()
                    pct = progress_info['percentage']
                    if pct >= 100.0:
                        warnings.append({
                            'level': 'danger',
                            'milestone': limit.title,
                            'percentage': pct,
                            'message': f"⚠️ Alert: Spending limit '{limit.title}' has exceeded 100% (currently {pct}%)!"
                        })
                    elif pct >= 80.0:
                        warnings.append({
                            'level': 'warning',
                            'milestone': limit.title,
                            'percentage': pct,
                            'message': f"⚠️ Notice: Spending limit '{limit.title}' has reached {pct}% of its cap."
                        })

            return Response({
                'expense': ExpenseSerializer(expense).data,
                'warnings': warnings,
                'message': 'Expense recorded successfully!'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExpenseDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Expense.objects.get(pk=pk, user=user)
        except Expense.DoesNotExist:
            return None

    def get(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'detail': 'Expense not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ExpenseSerializer(expense).data)

    def put(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'detail': 'Expense not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'expense': ExpenseSerializer(updated).data,
                'message': 'Expense updated successfully.'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'detail': 'Expense not found.'}, status=status.HTTP_404_NOT_FOUND)
        expense.delete()
        return Response({'message': 'Expense deleted successfully.'}, status=status.HTTP_200_OK)

class MilestoneListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Milestone.objects.filter(user=request.user)

        # Trigger progress recalculation
        for m in queryset:
            m.calculate_progress()

        # Filter by status
        status_filter = request.query_params.get('status', 'ALL').upper()
        if status_filter != 'ALL':
            if status_filter == 'EXCEEDED/EXPIRED':
                queryset = queryset.filter(Q(status='EXCEEDED') | Q(status='EXPIRED'))
            else:
                queryset = queryset.filter(status=status_filter)

        serializer = MilestoneSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MilestoneSerializer(data=request.data)
        if serializer.is_valid():
            milestone = serializer.save(user=request.user)
            milestone.calculate_progress()
            return Response(MilestoneSerializer(milestone).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MilestoneDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Milestone.objects.get(pk=pk, user=user)
        except Milestone.DoesNotExist:
            return None

    def get(self, request, pk):
        milestone = self.get_object(pk, request.user)
        if not milestone:
            return Response({'detail': 'Milestone not found.'}, status=status.HTTP_404_NOT_FOUND)
        milestone.calculate_progress()
        return Response(MilestoneSerializer(milestone).data)

    def put(self, request, pk):
        milestone = self.get_object(pk, request.user)
        if not milestone:
            return Response({'detail': 'Milestone not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = MilestoneSerializer(milestone, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            updated.calculate_progress()
            return Response(MilestoneSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        milestone = self.get_object(pk, request.user)
        if not milestone:
            return Response({'detail': 'Milestone not found.'}, status=status.HTTP_404_NOT_FOUND)
        milestone.delete()
        return Response({'message': 'Milestone deleted successfully.'}, status=status.HTTP_200_OK)

class MilestoneContributeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            milestone = Milestone.objects.get(pk=pk, user=request.user)
        except Milestone.DoesNotExist:
            return Response({'detail': 'Milestone not found.'}, status=status.HTTP_404_NOT_FOUND)

        if milestone.type != 'SAVINGS':
            return Response({'detail': 'Contributions can only be added to Savings Goals.'}, status=status.HTTP_400_BAD_REQUEST)

        amount = request.data.get('amount')
        date_val = request.data.get('date', timezone.now().date())
        note = request.data.get('note', '')

        try:
            amount_dec = Decimal(str(amount))
            if amount_dec <= 0:
                return Response({'amount': 'Amount must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'amount': 'Invalid amount value.'}, status=status.HTTP_400_BAD_REQUEST)

        prev_status = milestone.status
        contribution = Contribution.objects.create(
            milestone=milestone,
            amount=amount_dec,
            date=date_val,
            note=note
        )

        progress = milestone.calculate_progress()
        new_status = milestone.status
        is_newly_achieved = (prev_status != 'ACHIEVED' and new_status == 'ACHIEVED')

        return Response({
            'message': 'Savings contribution added successfully!',
            'contribution': ContributionSerializer(contribution).data,
            'milestone': MilestoneSerializer(milestone).data,
            'is_newly_achieved': is_newly_achieved
        }, status=status.HTTP_201_CREATED)

class DashboardSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        period = request.query_params.get('period', '1M')
        today = timezone.now().date()

        # Date range determination
        if period in ['1M', 'this_month']:
            start_date = today.replace(day=1)
            end_date = today
            days_in_period = max(1, (end_date - start_date).days + 1)
            period_label = 'This Month'
        elif period == 'this_week':
            start_date = today - timedelta(days=today.weekday())
            end_date = today
            days_in_period = max(1, (end_date - start_date).days + 1)
            period_label = 'This Week'
        elif period == '3M':
            start_date = today - timedelta(days=90)
            end_date = today
            days_in_period = 90
            period_label = 'Last 3 Months'
        elif period == '6M':
            start_date = today - timedelta(days=180)
            end_date = today
            days_in_period = 180
            period_label = 'Last 6 Months'
        elif period in ['1Y', 'this_year']:
            start_date = today.replace(month=1, day=1)
            end_date = today
            days_in_period = max(1, (end_date - start_date).days + 1)
            period_label = 'This Year'
        elif period == 'custom':
            s_param = request.query_params.get('start_date')
            e_param = request.query_params.get('end_date')
            start_date = date.fromisoformat(s_param) if s_param else today.replace(day=1)
            end_date = date.fromisoformat(e_param) if e_param else today
            days_in_period = max(1, (end_date - start_date).days + 1)
            period_label = f"{start_date} to {end_date}"
        else:
            start_date = today.replace(day=1)
            end_date = today
            days_in_period = max(1, (end_date - start_date).days + 1)
            period_label = 'This Month'

        # Filter expenses in period
        period_expenses = Expense.objects.filter(
            user=user,
            type='EXPENSE',
            date__gte=start_date,
            date__lte=end_date
        )

        total_spent = period_expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        transaction_count = period_expenses.count()

        # All-time or monthly income and balance
        period_income = Expense.objects.filter(
            user=user,
            type='INCOME',
            date__gte=start_date,
            date__lte=end_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Total Balance across all records
        all_income = Expense.objects.filter(user=user, type='INCOME').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        all_expenses = Expense.objects.filter(user=user, type='EXPENSE').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_balance = all_income - all_expenses
        if total_balance < 0:
            total_balance = Decimal('0.00')

        # Total Saved from savings milestones
        total_saved = Contribution.objects.filter(
            milestone__user=user
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Top category
        category_sums = period_expenses.values(
            'category__name', 'category__color', 'category__icon'
        ).annotate(
            cat_total=Sum('amount'),
            cat_count=Count('id')
        ).order_by('-cat_total')

        highest_category = category_sums[0]['category__name'] if category_sums else 'None'
        daily_average = round(float(total_spent) / days_in_period, 2)

        # Category breakdown for Donut chart
        category_breakdown = []
        for cat in category_sums:
            cat_amount = float(cat['cat_total'])
            pct = round((cat_amount / float(total_spent)) * 100, 1) if float(total_spent) > 0 else 0
            category_breakdown.append({
                'name': cat['category__name'] or 'Uncategorized',
                'amount': cat_amount,
                'percentage': pct,
                'color': cat['category__color'] or '#10B981',
                'icon': cat['category__icon'] or 'Tag',
                'count': cat['cat_count'],
            })

        # Monthly Spending Trend (Last 6 Months)
        monthly_trend = []
        for i in range(5, -1, -1):
            # calculate year and month
            m = today.month - i
            y = today.year
            while m <= 0:
                m += 12
                y -= 1
            month_name = calendar.month_abbr[m]
            first_day = date(y, m, 1)
            last_day = date(y, m, calendar.monthrange(y, m)[1])

            m_spent = Expense.objects.filter(
                user=user,
                type='EXPENSE',
                date__gte=first_day,
                date__lte=last_day
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            m_income = Expense.objects.filter(
                user=user,
                type='INCOME',
                date__gte=first_day,
                date__lte=last_day
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            monthly_trend.append({
                'month': f"{month_name}",
                'year': y,
                'spent': float(m_spent),
                'income': float(m_income),
            })

        # Recent 10 transactions (both Income and Expense)
        recent_expenses = Expense.objects.filter(user=user).select_related('category')[:10]
        recent_serialized = ExpenseSerializer(recent_expenses, many=True).data

        # Milestone snapshot (up to 3 active milestones)
        all_milestones = Milestone.objects.filter(user=user)
        for m in all_milestones:
            m.calculate_progress()

        active_milestones = all_milestones.filter(status='ACTIVE')[:3]
        active_snapshot = MilestoneSerializer(active_milestones, many=True).data

        # Main Savings Goal (for the UI card "Your Savings Goal")
        main_goal = all_milestones.filter(type='SAVINGS').first()
        main_goal_data = MilestoneSerializer(main_goal).data if main_goal else None

        # System alerts: Limits >= 80% or 100%
        alerts = []
        for m in all_milestones.filter(type='LIMIT'):
            p = m.calculate_progress()
            if p['percentage'] >= 100:
                alerts.append({
                    'id': f"limit-exceeded-{m.id}",
                    'level': 'danger',
                    'title': f"Budget Exceeded: {m.title}",
                    'message': f"You've spent ₹{p['current_amount']:,.0f} of ₹{p['target_amount']:,.0f} ({p['percentage']}%)",
                    'type': 'LIMIT'
                })
            elif p['percentage'] >= 80:
                alerts.append({
                    'id': f"limit-warning-{m.id}",
                    'level': 'warning',
                    'title': f"Budget Warning: {m.title}",
                    'message': f"You have reached {p['percentage']}% of your limit.",
                    'type': 'LIMIT'
                })

        for m in all_milestones.filter(type='SAVINGS', status='ACHIEVED'):
            alerts.append({
                'id': f"goal-achieved-{m.id}",
                'level': 'success',
                'title': f"Goal Achieved! 🎉",
                'message': f"Congratulations! You reached your savings goal '{m.title}' of ₹{m.target_amount:,.0f}!",
                'type': 'SAVINGS'
            })

        return Response({
            'period': period,
            'period_label': period_label,
            'summary': {
                'total_balance': float(total_balance),
                'total_spent': float(total_spent),
                'total_saved': float(total_saved),
                'total_income': float(period_income),
                'transaction_count': transaction_count,
                'highest_category': highest_category,
                'daily_average': daily_average,
                'balance_change_pct': 12.0,
                'spent_change_pct': 8.0,
                'saved_change_pct': 20.0,
            },
            'category_breakdown': category_breakdown,
            'monthly_trend': monthly_trend,
            'recent_expenses': recent_serialized,
            'active_milestones': active_snapshot,
            'main_savings_goal': main_goal_data,
            'alerts': alerts,
        })
