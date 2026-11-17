from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
from decimal import Decimal
from apps.accounts.models import User
from apps.expenses.models import Category, Expense, Milestone, Contribution

class Command(BaseCommand):
    help = 'Seeds initial default categories, demo user Elakiya, and matching mock expenses & milestones'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Spendora data...")

        # 1. Default Categories (FR-EXP-04)
        default_categories = [
            {'name': 'Food & Dining', 'color': '#F43F5E', 'icon': 'Utensils'},
            {'name': 'Shopping', 'color': '#6366F1', 'icon': 'ShoppingBag'},
            {'name': 'Travel', 'color': '#F59E0B', 'icon': 'Car'},
            {'name': 'Bills', 'color': '#06B6D4', 'icon': 'Zap'},
            {'name': 'Entertainment', 'color': '#8B5CF6', 'icon': 'Film'},
            {'name': 'Health', 'color': '#10B981', 'icon': 'HeartPulse'},
            {'name': 'Education', 'color': '#3B82F6', 'icon': 'BookOpen'},
            {'name': 'Others', 'color': '#64748B', 'icon': 'MoreHorizontal'},
            {'name': 'Salary', 'color': '#10B981', 'icon': 'Briefcase'},
        ]

        cat_map = {}
        for c in default_categories:
            category, _ = Category.objects.get_or_create(
                name=c['name'],
                is_default=True,
                defaults={'color': c['color'], 'icon': c['icon']}
            )
            cat_map[c['name']] = category

        # 2. Demo User: Elakiya
        email = 'elakiya@spendora.app'
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'name': 'Elakiya R'}
        )
        user.set_password('password123')
        user.name = 'Elakiya R'
        user.save()

        # Clean existing user data for idempotence
        Expense.objects.filter(user=user).delete()
        Milestone.objects.filter(user=user).delete()

        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        two_days_ago = today - timedelta(days=2)
        three_days_ago = today - timedelta(days=3)

        # 3. Add Expenses matching the UI screenshot:
        # Food - Zomato: -450
        # Shopping - Zara: -2,300
        # Salary Credit: +50,000
        # Travel - Ola: -380
        # Electricity Bill: -1,250
        # Plus additional breakdown so totals match UI:
        # Food: 5340 total
        # Shopping: 4270 total
        # Travel: 2740 total
        # Bills: 1830 total
        # Others: 1070 total
        # Total Spent: 15,250

        # Recent transactions
        Expense.objects.create(
            user=user, category=cat_map['Food & Dining'], title='Food - Zomato',
            amount=Decimal('450.00'), type='EXPENSE', date=today,
            payment_method='UPI', notes='Dinner order with friends'
        )
        Expense.objects.create(
            user=user, category=cat_map['Shopping'], title='Shopping - Zara',
            amount=Decimal('2300.00'), type='EXPENSE', date=yesterday,
            payment_method='Debit/Credit Card', notes='Weekend apparel shopping'
        )
        Expense.objects.create(
            user=user, category=cat_map['Salary'], title='Salary Credit',
            amount=Decimal('50000.00'), type='INCOME', date=yesterday,
            payment_method='Net Banking', notes='Monthly salary deposit'
        )
        Expense.objects.create(
            user=user, category=cat_map['Travel'], title='Travel - Ola',
            amount=Decimal('380.00'), type='EXPENSE', date=two_days_ago,
            payment_method='UPI', notes='Cab to college/work'
        )
        Expense.objects.create(
            user=user, category=cat_map['Bills'], title='Electricity Bill',
            amount=Decimal('1250.00'), type='EXPENSE', date=three_days_ago,
            payment_method='Net Banking', notes='TNEB electricity bill'
        )

        # Remaining expenses to reach exact category totals
        # Food: 5340 - 450 = 4890
        Expense.objects.create(
            user=user, category=cat_map['Food & Dining'], title='Supermarket & Groceries',
            amount=Decimal('3200.00'), type='EXPENSE', date=today - timedelta(days=4),
            payment_method='UPI', notes='Monthly grocery replenishment'
        )
        Expense.objects.create(
            user=user, category=cat_map['Food & Dining'], title='Cafe Coffee Day',
            amount=Decimal('1690.00'), type='EXPENSE', date=today - timedelta(days=6),
            payment_method='Cash', notes='Study snacks'
        )

        # Shopping: 4270 - 2300 = 1970
        Expense.objects.create(
            user=user, category=cat_map['Shopping'], title='Books & Stationery',
            amount=Decimal('1970.00'), type='EXPENSE', date=today - timedelta(days=5),
            payment_method='UPI', notes='College reference books'
        )

        # Travel: 2740 - 380 = 2360
        Expense.objects.create(
            user=user, category=cat_map['Travel'], title='Fuel & Metro Pass',
            amount=Decimal('2360.00'), type='EXPENSE', date=today - timedelta(days=7),
            payment_method='Debit/Credit Card', notes='Monthly transit recharge'
        )

        # Bills: 1830 - 1250 = 580
        Expense.objects.create(
            user=user, category=cat_map['Bills'], title='WiFi Broadband',
            amount=Decimal('580.00'), type='EXPENSE', date=today - timedelta(days=8),
            payment_method='UPI', notes='Fiber internet subscription'
        )

        # Others: 1070
        Expense.objects.create(
            user=user, category=cat_map['Others'], title='Personal Care & Misc',
            amount=Decimal('1070.00'), type='EXPENSE', date=today - timedelta(days=9),
            payment_method='Cash', notes='Miscellaneous expenses'
        )

        # 4. Savings Milestones:
        # Savings Goal: ₹50,000 target, 70% reached (35,000 saved)
        start_month = today.replace(day=1)
        end_year = date(today.year, 12, 31)
        savings_goal = Milestone.objects.create(
            user=user,
            title='Dream Vacation & Tech Fund',
            type='SAVINGS',
            target_amount=Decimal('50000.00'),
            start_date=start_month,
            end_date=end_year,
            status='ACTIVE'
        )

        Contribution.objects.create(
            milestone=savings_goal,
            amount=Decimal('25000.00'),
            date=start_month,
            note='Initial savings seed'
        )
        Contribution.objects.create(
            milestone=savings_goal,
            amount=Decimal('10000.00'),
            date=yesterday,
            note='Monthly savings allocation'
        )

        # Another savings milestone: "Emergency Fund" (target ₹20,000, ₹9,500 total saved)
        emergency_fund = Milestone.objects.create(
            user=user,
            title='Emergency Rainy Day Fund',
            type='SAVINGS',
            target_amount=Decimal('20000.00'),
            start_date=start_month,
            end_date=end_year,
            status='ACTIVE'
        )
        Contribution.objects.create(
            milestone=emergency_fund,
            amount=Decimal('9500.00'),
            date=today - timedelta(days=3),
            note='Emergency cushion'
        )

        # Spending Limit Milestones (FR-MIL-01 to 07):
        # 1. Food Limit: 6,000 cap (Current spent is 5,340, which is 89% -> triggers warning!)
        limit_food = Milestone.objects.create(
            user=user,
            category=cat_map['Food & Dining'],
            title='Monthly Dining & Food Limit',
            type='LIMIT',
            target_amount=Decimal('6000.00'),
            start_date=start_month,
            end_date=today + timedelta(days=15),
            status='ACTIVE'
        )

        # 2. Shopping Limit: 5,000 cap (Current spent is 4,270, 85.4% -> warning!)
        limit_shop = Milestone.objects.create(
            user=user,
            category=cat_map['Shopping'],
            title='Monthly Shopping Limit',
            type='LIMIT',
            target_amount=Decimal('5000.00'),
            start_date=start_month,
            end_date=today + timedelta(days=15),
            status='ACTIVE'
        )

        # Recalculate all milestones
        for m in [savings_goal, emergency_fund, limit_food, limit_shop]:
            m.calculate_progress()

        self.stdout.write(self.style.SUCCESS(
            "Successfully seeded database with Elakiya R (elakiya@spendora.app / password123), categories, expenses, and milestones!"
        ))
