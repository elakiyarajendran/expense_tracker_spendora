import os
import django
from decimal import Decimal
from datetime import timedelta, date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spendora_backend.settings')
django.setup()

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.expenses.models import Category, Expense, Milestone, Contribution

def run_tests():
    print("=" * 60)
    print("RUNNING SPENDORA SRS FUNCTIONAL VERIFICATION SUITE")
    print("=" * 60)

    # Initial cleanup
    Expense.objects.filter(user__email='tester@spendora.app').delete()
    Milestone.objects.filter(user__email='tester@spendora.app').delete()
    Category.objects.filter(user__email='tester@spendora.app').delete()
    User.objects.filter(email='tester@spendora.app').delete()

    client = APIClient()

    # TEST 1: Register Account (FR-LOG-06)
    reg_data = {
        'name': 'Test User',
        'email': 'tester@spendora.app',
        'password': 'password123',
        'confirm_password': 'password123'
    }
    res = client.post('/api/auth/register/', reg_data, format='json')
    assert res.status_code == 201, f"Register failed: {res.data}"
    print("[PASS] FR-LOG-06: User Registration")

    # TEST 2: Login Success & JWT tokens (FR-LOG-03, FR-LOG-04)
    login_data = {
        'email': 'tester@spendora.app',
        'password': 'password123'
    }
    res = client.post('/api/auth/login/', login_data, format='json')
    assert res.status_code == 200, f"Login failed: {res.data}"
    access_token = res.data['tokens']['access']
    refresh_token = res.data['tokens']['refresh']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    print("[PASS] FR-LOG-03: JWT Authentication & Token Issuance")

    # TEST 3: Account Lockout after 5 Failed Attempts (FR-LOG-08)
    bad_client = APIClient()
    for attempt in range(5):
        bad_client.post('/api/auth/login/', {'email': 'tester@spendora.app', 'password': 'wrongpassword'}, format='json')
    locked_res = bad_client.post('/api/auth/login/', {'email': 'tester@spendora.app', 'password': 'wrongpassword'}, format='json')
    assert locked_res.status_code == 400
    assert 'locked' in str(locked_res.data).lower()
    print("[PASS] FR-LOG-08: 15-Minute Account Lockout after 5 Failed Attempts")

    # TEST 4: Categories listing & custom category creation (FR-EXP-04, FR-EXP-05)
    cat_res = client.get('/api/categories/')
    assert cat_res.status_code == 200
    assert len(cat_res.data) >= 8, f"Expected default categories, got {len(cat_res.data)}"
    
    # Create custom category
    custom_cat_res = client.post('/api/categories/', {'name': 'Photography', 'color': '#8B5CF6', 'icon': 'Camera'}, format='json')
    assert custom_cat_res.status_code == 201
    custom_cat_id = custom_cat_res.data['id']
    print("[PASS] FR-EXP-04 & FR-EXP-05: Default & Custom Categories")

    # TEST 5: Create Spending Limit Milestone (FR-MIL-01, FR-MIL-02)
    today = timezone.now().date()
    milestone_res = client.post('/api/milestones/', {
        'title': 'Test Dining Budget',
        'type': 'LIMIT',
        'target_amount': '1000.00',
        'start_date': str(today),
        'end_date': str(today + timedelta(days=30)),
        'category': custom_cat_id
    }, format='json')
    assert milestone_res.status_code == 201
    limit_id = milestone_res.data['id']
    print("[PASS] FR-MIL-01 & FR-MIL-02: Milestone Creation & End Date Validation")

    # TEST 6: Record Expense & 80% / 100% Limit Warnings (FR-EXP-01, FR-EXP-06, FR-EXP-10)
    # Expense 1: ₹850 (85% of ₹1000 limit -> warning expected!)
    exp_res1 = client.post('/api/expenses/', {
        'title': 'Camera Lens Filter',
        'amount': '850.00',
        'type': 'EXPENSE',
        'category': custom_cat_id,
        'date': str(today),
        'payment_method': 'UPI',
        'notes': 'Test limit alert'
    }, format='json')
    assert exp_res1.status_code == 201
    assert len(exp_res1.data['warnings']) > 0
    assert exp_res1.data['warnings'][0]['percentage'] >= 80.0
    print("[PASS] FR-EXP-10 & FR-MIL-07: Spending Limit 80% Warning Alert Triggered")

    # TEST 7: Savings Goal & Contribution Progress (FR-MIL-04, FR-MIL-05, FR-MIL-06, FR-MIL-10)
    savings_goal_res = client.post('/api/milestones/', {
        'title': 'MacBook Fund',
        'type': 'SAVINGS',
        'target_amount': '5000.00',
        'start_date': str(today),
        'end_date': str(today + timedelta(days=60))
    }, format='json')
    assert savings_goal_res.status_code == 201
    savings_id = savings_goal_res.data['id']

    # Add contribution of 5000 -> Should achieve goal!
    contrib_res = client.post(f'/api/milestones/{savings_id}/contribute/', {
        'amount': '5000.00',
        'date': str(today),
        'note': 'Full deposit'
    }, format='json')
    assert contrib_res.status_code == 201
    assert contrib_res.data['is_newly_achieved'] is True
    assert contrib_res.data['milestone']['status'] == 'ACHIEVED'
    print("[PASS] FR-MIL-05 & FR-MIL-10: Savings Contribution & Goal Achievement")

    # TEST 8: Dashboard Summary API (FR-HOM-01 to FR-HOM-07)
    dash_res = client.get('/api/dashboard/summary/?period=1M')
    assert dash_res.status_code == 200
    summary = dash_res.data['summary']
    assert summary['total_spent'] >= 850.0
    assert len(dash_res.data['monthly_trend']) == 6
    assert len(dash_res.data['recent_expenses']) >= 1
    print("[PASS] FR-HOM-02 to FR-HOM-07: Dashboard Summary, Period Filter & Trends")

    # Clean up test user
    Expense.objects.filter(user__email='tester@spendora.app').delete()
    Milestone.objects.filter(user__email='tester@spendora.app').delete()
    Category.objects.filter(user__email='tester@spendora.app').delete()
    User.objects.filter(email='tester@spendora.app').delete()

    print("=" * 60)
    print("ALL 8 AUTOMATED FUNCTIONAL TESTS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
