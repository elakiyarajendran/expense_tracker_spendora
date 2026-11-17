from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal

PAYMENT_METHODS = [
    ('Cash', 'Cash'),
    ('UPI', 'UPI'),
    ('Debit/Credit Card', 'Debit/Credit Card'),
    ('Net Banking', 'Net Banking'),
    ('Wallet', 'Wallet'),
]

MILESTONE_TYPES = [
    ('SAVINGS', 'Savings Goal'),
    ('LIMIT', 'Spending Limit'),
]

MILESTONE_STATUS = [
    ('ACTIVE', 'Active'),
    ('ACHIEVED', 'Achieved'),
    ('EXCEEDED', 'Exceeded'),
    ('EXPIRED', 'Expired'),
]

class Category(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='categories')
    name = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)
    color = models.CharField(max_length=30, default='#10B981')
    icon = models.CharField(max_length=50, default='Tag')

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

class Expense(models.Model):
    EXPENSE_TYPES = [
        ('EXPENSE', 'Expense'),
        ('INCOME', 'Income'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='expenses')
    title = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=EXPENSE_TYPES, default='EXPENSE')
    date = models.DateField(default=timezone.now)
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHODS, default='UPI')
    notes = models.CharField(max_length=250, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} - ₹{self.amount} ({self.date})"

class Milestone(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='milestones')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='milestones')
    title = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=MILESTONE_TYPES, default='SAVINGS')
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=15, choices=MILESTONE_STATUS, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_type_display()}) - ₹{self.target_amount}"

    def calculate_progress(self):
        today = timezone.now().date()
        target = self.target_amount

        if self.type == 'SAVINGS':
            # Sum of contributions
            total_saved = self.contributions.aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')
            current_amount = total_saved
            percentage = min(100.0, float((current_amount / target) * 100)) if target > 0 else 0.0

            if current_amount >= target:
                calculated_status = 'ACHIEVED'
            elif today > self.end_date and current_amount < target:
                calculated_status = 'EXPIRED'
            else:
                calculated_status = 'ACTIVE'

        else: # Spending Limit
            # Sum of matching user expenses in the period
            expenses_qs = Expense.objects.filter(
                user=self.user,
                type='EXPENSE',
                date__gte=self.start_date,
                date__lte=self.end_date
            )
            if self.category:
                expenses_qs = expenses_qs.filter(category=self.category)

            total_spent = expenses_qs.aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')
            current_amount = total_spent
            percentage = float((current_amount / target) * 100) if target > 0 else 0.0

            if current_amount > target:
                calculated_status = 'EXCEEDED'
            elif today > self.end_date and current_amount <= target:
                calculated_status = 'ACHIEVED'
            else:
                calculated_status = 'ACTIVE'

        # Auto-update status if changed
        if self.status != calculated_status:
            self.status = calculated_status
            self.save(update_fields=['status'])

        days_remaining = (self.end_date - today).days

        return {
            'current_amount': float(current_amount),
            'target_amount': float(target),
            'percentage': round(percentage, 1),
            'status': calculated_status,
            'days_remaining': max(0, days_remaining),
            'is_overdue': today > self.end_date,
        }

class Contribution(models.Model):
    milestone = models.ForeignKey(Milestone, on_delete=models.CASCADE, related_name='contributions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(default=timezone.now)
    note = models.CharField(max_length=250, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"₹{self.amount} to {self.milestone.title} on {self.date}"
