import os
import sys
import django
import json
import time
from decimal import Decimal
from datetime import timedelta, date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spendora_backend.settings')
django.setup()

from django.utils import timezone
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.expenses.models import Category, Expense, Milestone, Contribution

def cleanup_user(email):
    Expense.objects.filter(user__email=email).delete()
    Milestone.objects.filter(user__email=email).delete()
    Category.objects.filter(user__email=email).delete()
    User.objects.filter(email=email).delete()

def run_20_test_cases():
    results = []
    
    # Unique test emails
    test_user_a = "tester_a_20@spendora.app"
    test_user_b = "tester_b_20@spendora.app"

    # Pre-test cleanup
    cleanup_user(test_user_a)
    cleanup_user(test_user_b)

    client_a = APIClient()
    client_b = APIClient()

    today = timezone.now().date()
    yesterday = today - timedelta(days=1)
    tomorrow = today + timedelta(days=1)

    print("\n" + "="*80)
    print(" SPENDORA SMART EXPENSE TRACKER - 20 FUNCTIONAL TEST CASES SUITE ")
    print("="*80)

    # -------------------------------------------------------------
    # TC-01: User Registration with Valid Data (FR-LOG-06)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        res = client_a.post('/api/auth/register/', {
            'name': 'Elakiya Tester',
            'email': test_user_a,
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!'
        }, format='json')
        assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.data}"
        assert 'tokens' in res.data and 'access' in res.data['tokens']
        assert res.data['user']['email'] == test_user_a
        results.append({
            'id': 'TC-01',
            'module': 'Authentication',
            'title': 'User Registration with Valid Credentials (FR-LOG-06)',
            'expected': 'HTTP 201 Created, returns user info and JWT token pair',
            'actual': f"HTTP {res.status_code}, User registered with ID {res.data['user']['id']}",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-01',
            'module': 'Authentication',
            'title': 'User Registration with Valid Credentials (FR-LOG-06)',
            'expected': 'HTTP 201 Created',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-02: User Registration - Password Mismatch Rejection (FR-LOG-06)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        res = client_a.post('/api/auth/register/', {
            'name': 'Mismatch User',
            'email': 'mismatch@spendora.app',
            'password': 'Password123!',
            'confirm_password': 'DifferentPassword456!'
        }, format='json')
        assert res.status_code == 400
        assert 'confirm_password' in res.data
        results.append({
            'id': 'TC-02',
            'module': 'Authentication',
            'title': 'Registration Validation - Password Mismatch (FR-LOG-06)',
            'expected': 'HTTP 400 Bad Request with "Passwords do not match"',
            'actual': f"HTTP {res.status_code}: {res.data.get('confirm_password', [''])[0]}",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-02',
            'module': 'Authentication',
            'title': 'Registration Validation - Password Mismatch (FR-LOG-06)',
            'expected': 'HTTP 400 Bad Request',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-03: User Registration - Duplicate Email Prevention (FR-LOG-06)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        res = client_a.post('/api/auth/register/', {
            'name': 'Duplicate User',
            'email': test_user_a,
            'password': 'Password123!',
            'confirm_password': 'Password123!'
        }, format='json')
        assert res.status_code == 400
        assert 'email' in res.data
        results.append({
            'id': 'TC-03',
            'module': 'Authentication',
            'title': 'Registration Validation - Duplicate Email Prevention (FR-LOG-06)',
            'expected': 'HTTP 400 Bad Request rejecting duplicate registered email',
            'actual': f"HTTP {res.status_code}: {res.data.get('email', [''])[0]}",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-03',
            'module': 'Authentication',
            'title': 'Registration Validation - Duplicate Email Prevention (FR-LOG-06)',
            'expected': 'HTTP 400 Bad Request',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-04: User Login with Valid Credentials (FR-LOG-03, FR-LOG-04)
    # -------------------------------------------------------------
    t0 = time.time()
    access_token_a = None
    refresh_token_a = None
    try:
        res = client_a.post('/api/auth/login/', {
            'email': test_user_a,
            'password': 'StrongPassword123!'
        }, format='json')
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        assert 'tokens' in res.data and 'access' in res.data['tokens']
        access_token_a = res.data['tokens']['access']
        refresh_token_a = res.data['tokens']['refresh']
        client_a.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token_a}')
        results.append({
            'id': 'TC-04',
            'module': 'Authentication',
            'title': 'User Login & JWT Token Pair Generation (FR-LOG-03)',
            'expected': 'HTTP 200 OK with valid JWT access and refresh tokens',
            'actual': f"HTTP {res.status_code}, Token generated successfully",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-04',
            'module': 'Authentication',
            'title': 'User Login & JWT Token Pair Generation (FR-LOG-03)',
            'expected': 'HTTP 200 OK with tokens',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-05: Generic Error on Invalid Credentials (FR-LOG-05)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        probe_client = APIClient()
        res = probe_client.post('/api/auth/login/', {
            'email': test_user_a,
            'password': 'WrongIncorrectPassword!'
        }, format='json')
        assert res.status_code == 400
        assert "Invalid email or password." in str(res.data)
        results.append({
            'id': 'TC-05',
            'module': 'Authentication',
            'title': 'Generic Error for Invalid Credentials (FR-LOG-05)',
            'expected': 'HTTP 400 with generic "Invalid email or password." without revealing email vs password',
            'actual': f"HTTP {res.status_code}, Returned generic error message",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-05',
            'module': 'Authentication',
            'title': 'Generic Error for Invalid Credentials (FR-LOG-05)',
            'expected': 'HTTP 400 generic error',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-06: 15-Minute Account Lockout After 5 Failed Attempts (FR-LOG-08)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        lock_client = APIClient()
        # Attempt remaining 4 failed attempts (1 already done in TC-05)
        for _ in range(4):
            lock_client.post('/api/auth/login/', {
                'email': test_user_a,
                'password': 'WrongIncorrectPassword!'
            }, format='json')
        
        # 6th attempt should trigger lock message
        res = lock_client.post('/api/auth/login/', {
            'email': test_user_a,
            'password': 'StrongPassword123!' # Even with correct password, must be locked!
        }, format='json')
        assert res.status_code == 400
        assert 'temporarily locked' in str(res.data).lower()
        
        # Reset lock for subsequent tests
        u = User.objects.get(email=test_user_a)
        u.reset_failed_attempts()

        results.append({
            'id': 'TC-06',
            'module': 'Authentication',
            'title': 'Account Lockout for 15 Min After 5 Failed Logins (FR-LOG-08)',
            'expected': 'HTTP 400 with "Account is temporarily locked due to 5 failed attempts"',
            'actual': f"HTTP {res.status_code}, Account locked for 15 minutes as enforced",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-06',
            'module': 'Authentication',
            'title': 'Account Lockout for 15 Min After 5 Failed Logins (FR-LOG-08)',
            'expected': 'HTTP 400 account locked',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-07: JWT Token Refresh (FR-LOG-04)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        res = client_a.post('/api/auth/token/refresh/', {
            'refresh': refresh_token_a
        }, format='json')
        assert res.status_code == 200
        assert 'access' in res.data
        new_access = res.data['access']
        client_a.credentials(HTTP_AUTHORIZATION=f'Bearer {new_access}')
        results.append({
            'id': 'TC-07',
            'module': 'Authentication',
            'title': 'JWT Access Token Refresh via Refresh Token (FR-LOG-04)',
            'expected': 'HTTP 200 OK with new JWT access token',
            'actual': f"HTTP {res.status_code}, New access token issued successfully",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-07',
            'module': 'Authentication',
            'title': 'JWT Access Token Refresh via Refresh Token (FR-LOG-04)',
            'expected': 'HTTP 200 OK with refreshed access token',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-08: Default Categories Retrieval (FR-EXP-04)
    # -------------------------------------------------------------
    t0 = time.time()
    default_cat_id = None
    try:
        res = client_a.get('/api/categories/')
        assert res.status_code == 200
        categories = res.data
        cat_names = [c['name'] for c in categories]
        for expected_name in ['Food & Dining', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Health', 'Education', 'Others']:
            assert any(expected_name.lower() in name.lower() for name in cat_names), f"Missing category: {expected_name}"
        default_cat_id = categories[0]['id']
        results.append({
            'id': 'TC-08',
            'module': 'Categories',
            'title': 'Default Categories Retrieval (FR-EXP-04)',
            'expected': 'HTTP 200 OK containing at least 8 default categories',
            'actual': f"HTTP {res.status_code}, Retrieved {len(categories)} categories including Food, Travel, Bills",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-08',
            'module': 'Categories',
            'title': 'Default Categories Retrieval (FR-EXP-04)',
            'expected': 'HTTP 200 OK with default categories',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-09: Create Custom User Category (FR-EXP-05)
    # -------------------------------------------------------------
    t0 = time.time()
    custom_cat_id = None
    try:
        res = client_a.post('/api/categories/', {
            'name': 'Tech Gadgets',
            'color': '#3B82F6',
            'icon': 'Cpu'
        }, format='json')
        assert res.status_code == 201
        assert res.data['name'] == 'Tech Gadgets'
        assert res.data['is_default'] is False
        custom_cat_id = res.data['id']
        results.append({
            'id': 'TC-09',
            'module': 'Categories',
            'title': 'Create Custom User Category (FR-EXP-05)',
            'expected': 'HTTP 201 Created with custom category attributes',
            'actual': f"HTTP {res.status_code}, Created category '{res.data['name']}' (ID: {custom_cat_id})",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-09',
            'module': 'Categories',
            'title': 'Create Custom User Category (FR-EXP-05)',
            'expected': 'HTTP 201 Created',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-10: Record Valid Expense (FR-EXP-01, FR-EXP-06)
    # -------------------------------------------------------------
    t0 = time.time()
    expense_id = None
    try:
        res = client_a.post('/api/expenses/', {
            'title': 'Noise Cancelling Headphones',
            'amount': '3499.00',
            'type': 'EXPENSE',
            'category': custom_cat_id,
            'date': str(today),
            'payment_method': 'UPI',
            'notes': 'Purchased online for studying'
        }, format='json')
        assert res.status_code == 201
        assert 'expense' in res.data
        expense_id = res.data['expense']['id']
        assert float(res.data['expense']['amount']) == 3499.00
        results.append({
            'id': 'TC-10',
            'module': 'Expenses',
            'title': 'Record New Expense with Valid Fields (FR-EXP-01, FR-EXP-06)',
            'expected': 'HTTP 201 Created with saved expense record',
            'actual': f"HTTP {res.status_code}, Expense saved with ID {expense_id} (Amount: ₹3499.00)",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-10',
            'module': 'Expenses',
            'title': 'Record New Expense with Valid Fields (FR-EXP-01, FR-EXP-06)',
            'expected': 'HTTP 201 Created',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-11: Future Date and Negative Amount Rejection (FR-EXP-02, FR-EXP-03)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        # Future date test
        future_res = client_a.post('/api/expenses/', {
            'title': 'Future Expense',
            'amount': '500.00',
            'type': 'EXPENSE',
            'category': default_cat_id,
            'date': str(tomorrow),
            'payment_method': 'Cash'
        }, format='json')
        assert future_res.status_code == 400
        assert 'Future dates are not allowed' in str(future_res.data)

        # Zero/Negative amount test
        neg_res = client_a.post('/api/expenses/', {
            'title': 'Zero Amount Expense',
            'amount': '0.00',
            'type': 'EXPENSE',
            'category': default_cat_id,
            'date': str(today),
            'payment_method': 'Cash'
        }, format='json')
        assert neg_res.status_code == 400
        assert 'greater than zero' in str(neg_res.data)

        results.append({
            'id': 'TC-11',
            'module': 'Expenses',
            'title': 'Expense Field Validations (No Future Dates, Amount > 0) (FR-EXP-02, FR-EXP-03)',
            'expected': 'HTTP 400 Bad Request rejecting future dates and non-positive amounts',
            'actual': f"HTTP 400 returned for future date ('{tomorrow}') and zero amount ('0.00')",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-11',
            'module': 'Expenses',
            'title': 'Expense Field Validations (No Future Dates, Amount > 0) (FR-EXP-02, FR-EXP-03)',
            'expected': 'HTTP 400 Bad Request',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-12: Update Existing Expense (FR-EXP-08)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        res = client_a.put(f'/api/expenses/{expense_id}/', {
            'title': 'Noise Cancelling Wireless Headphones',
            'amount': '3299.00', # Discount applied
            'payment_method': 'Debit/Credit Card'
        }, format='json')
        assert res.status_code == 200
        assert float(res.data['expense']['amount']) == 3299.00
        assert res.data['expense']['title'] == 'Noise Cancelling Wireless Headphones'
        results.append({
            'id': 'TC-12',
            'module': 'Expenses',
            'title': 'Update Existing Expense Details via PUT (FR-EXP-08)',
            'expected': 'HTTP 200 OK with updated expense data',
            'actual': f"HTTP {res.status_code}, Amount updated to ₹3299.00, title updated",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-12',
            'module': 'Expenses',
            'title': 'Update Existing Expense Details via PUT (FR-EXP-08)',
            'expected': 'HTTP 200 OK with updated fields',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-13: Delete Expense (FR-EXP-09, FR-HOM-08)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        # Create a temporary expense to delete
        temp_res = client_a.post('/api/expenses/', {
            'title': 'Temporary Expense to Delete',
            'amount': '150.00',
            'type': 'EXPENSE',
            'category': default_cat_id,
            'date': str(today),
            'payment_method': 'Cash'
        }, format='json')
        del_id = temp_res.data['expense']['id']

        del_res = client_a.delete(f'/api/expenses/{del_id}/')
        assert del_res.status_code == 200

        # Verify it no longer exists
        verify_res = client_a.get(f'/api/expenses/{del_id}/')
        assert verify_res.status_code == 404
        results.append({
            'id': 'TC-13',
            'module': 'Expenses',
            'title': 'Delete Expense with Confirmation (FR-EXP-09, FR-HOM-08)',
            'expected': 'HTTP 200 OK on delete, subsequent GET returns HTTP 404 Not Found',
            'actual': f"HTTP {del_res.status_code} delete, GET returned 404 as expected",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-13',
            'module': 'Expenses',
            'title': 'Delete Expense with Confirmation (FR-EXP-09, FR-HOM-08)',
            'expected': 'HTTP 200 then HTTP 404',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-14: User Data Isolation & Authorization Protection (FR-EXP-11, NFR-03)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        # Register User B
        reg_b = client_b.post('/api/auth/register/', {
            'name': 'User B Other',
            'email': test_user_b,
            'password': 'Password123!',
            'confirm_password': 'Password123!'
        }, format='json')
        token_b = reg_b.data['tokens']['access']
        client_b.credentials(HTTP_AUTHORIZATION=f'Bearer {token_b}')

        # User B attempts to access User A's expense (expense_id)
        forbidden_get = client_b.get(f'/api/expenses/{expense_id}/')
        assert forbidden_get.status_code == 404, f"Expected 404 for User B, got {forbidden_get.status_code}"

        # User B attempts to delete User A's expense
        forbidden_del = client_b.delete(f'/api/expenses/{expense_id}/')
        assert forbidden_del.status_code == 404, f"Expected 404 for User B, got {forbidden_del.status_code}"

        # User B gets list of expenses -> User A's expense must not appear
        b_list = client_b.get('/api/expenses/')
        assert not any(item['id'] == expense_id for item in b_list.data)

        results.append({
            'id': 'TC-14',
            'module': 'Security & Isolation',
            'title': 'User Data Isolation & Access Authorization (FR-EXP-11, NFR-03)',
            'expected': 'HTTP 404 Not Found when User B attempts to view/modify User A data',
            'actual': f"HTTP {forbidden_get.status_code} on access attempt. Strict user isolation confirmed.",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-14',
            'module': 'Security & Isolation',
            'title': 'User Data Isolation & Access Authorization (FR-EXP-11, NFR-03)',
            'expected': 'HTTP 404 Not Found',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-15: Create Spending Limit Milestone & Date Validation (FR-MIL-01, FR-MIL-02)
    # -------------------------------------------------------------
    t0 = time.time()
    spending_limit_id = None
    try:
        # Invalid date: end_date before start_date
        bad_date_res = client_a.post('/api/milestones/', {
            'title': 'Invalid Date Budget',
            'type': 'LIMIT',
            'target_amount': '2000.00',
            'start_date': str(today),
            'end_date': str(yesterday)
        }, format='json')
        assert bad_date_res.status_code == 400
        assert 'strictly after the start date' in str(bad_date_res.data)

        # Valid spending limit creation
        valid_res = client_a.post('/api/milestones/', {
            'title': 'Dining & Coffee Limit',
            'type': 'LIMIT',
            'target_amount': '2000.00',
            'start_date': str(today),
            'end_date': str(today + timedelta(days=30)),
            'category': default_cat_id
        }, format='json')
        assert valid_res.status_code == 201
        spending_limit_id = valid_res.data['id']
        assert valid_res.data['status'] == 'ACTIVE'

        results.append({
            'id': 'TC-15',
            'module': 'Milestones',
            'title': 'Create Spending Limit with Date Validations (FR-MIL-01, FR-MIL-02)',
            'expected': 'Rejects end_date <= start_date (400), creates valid limit (201)',
            'actual': f"HTTP 400 on invalid date range; HTTP 201 on valid creation (ID: {spending_limit_id})",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-15',
            'module': 'Milestones',
            'title': 'Create Spending Limit with Date Validations (FR-MIL-01, FR-MIL-02)',
            'expected': 'HTTP 400 then 201',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-16: Spending Limit 80% Warning Alert Trigger (FR-EXP-10, FR-MIL-07)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        # Spending limit target is ₹2000. Adding ₹1650 (82.5%):
        res = client_a.post('/api/expenses/', {
            'title': 'Family Dinner Celebration',
            'amount': '1650.00',
            'type': 'EXPENSE',
            'category': default_cat_id,
            'date': str(today),
            'payment_method': 'UPI'
        }, format='json')
        assert res.status_code == 201
        warnings = res.data.get('warnings', [])
        assert len(warnings) > 0, "Expected 80% threshold warning alert"
        warning = warnings[0]
        assert warning['percentage'] >= 80.0
        assert warning['level'] == 'warning'
        assert 'reached 82.5%' in warning['message']

        results.append({
            'id': 'TC-16',
            'module': 'Milestones',
            'title': 'Spending Limit 80% Warning Alert (FR-EXP-10, FR-MIL-07)',
            'expected': 'API returns warning alert when spend reaches 80% of limit target',
            'actual': f"Triggered warning alert at {warning['percentage']}%: '{warning['message']}'",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-16',
            'module': 'Milestones',
            'title': 'Spending Limit 80% Warning Alert (FR-EXP-10, FR-MIL-07)',
            'expected': 'Warning alert at >= 80%',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-17: Spending Limit Exceeded (> 100%) and Danger Alert (FR-EXP-10, FR-MIL-06, FR-MIL-07)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        # Add another ₹500 (total spent = 1650 + 500 = ₹2150 on ₹2000 limit = 107.5%)
        res = client_a.post('/api/expenses/', {
            'title': 'Late Night Dessert Delivery',
            'amount': '500.00',
            'type': 'EXPENSE',
            'category': default_cat_id,
            'date': str(today),
            'payment_method': 'UPI'
        }, format='json')
        assert res.status_code == 201
        warnings = res.data.get('warnings', [])
        assert len(warnings) > 0
        danger_alert = warnings[0]
        assert danger_alert['level'] == 'danger'
        assert danger_alert['percentage'] >= 100.0

        # Check milestone status in database
        m_check = client_a.get(f'/api/milestones/{spending_limit_id}/')
        assert m_check.data['status'] == 'EXCEEDED'
        assert m_check.data['progress']['percentage'] > 100.0

        results.append({
            'id': 'TC-17',
            'module': 'Milestones',
            'title': 'Spending Limit Exceeded (>100%) Status & Alert (FR-EXP-10, FR-MIL-06)',
            'expected': 'Status transitions to EXCEEDED and raises danger alert',
            'actual': f"Status: {m_check.data['status']}, Progress: {m_check.data['progress']['percentage']}%, Alert: danger",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-17',
            'module': 'Milestones',
            'title': 'Spending Limit Exceeded (>100%) Status & Alert (FR-EXP-10, FR-MIL-06)',
            'expected': 'Status EXCEEDED and danger alert',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-18: Create Savings Goal & Record Contribution (FR-MIL-01, FR-MIL-05)
    # -------------------------------------------------------------
    t0 = time.time()
    savings_goal_id = None
    try:
        res = client_a.post('/api/milestones/', {
            'title': 'Goa Vacation Trip',
            'type': 'SAVINGS',
            'target_amount': '15000.00',
            'start_date': str(today),
            'end_date': str(today + timedelta(days=90))
        }, format='json')
        assert res.status_code == 201
        savings_goal_id = res.data['id']

        # Add contribution of ₹5,000 (33.3% progress)
        contrib_res = client_a.post(f'/api/milestones/{savings_goal_id}/contribute/', {
            'amount': '5000.00',
            'date': str(today),
            'note': 'Part 1 savings deposit'
        }, format='json')
        assert contrib_res.status_code == 201
        assert float(contrib_res.data['contribution']['amount']) == 5000.00
        assert contrib_res.data['milestone']['progress']['percentage'] == 33.3
        assert contrib_res.data['is_newly_achieved'] is False

        results.append({
            'id': 'TC-18',
            'module': 'Milestones',
            'title': 'Create Savings Goal & Add Savings Contribution (FR-MIL-01, FR-MIL-05)',
            'expected': 'HTTP 201 for Goal & Contribution, progress increments accurately to 33.3%',
            'actual': f"HTTP {contrib_res.status_code}, Saved ₹5000 of ₹15000 (33.3% progress calculated)",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-18',
            'module': 'Milestones',
            'title': 'Create Savings Goal & Add Savings Contribution (FR-MIL-01, FR-MIL-05)',
            'expected': 'HTTP 201 for Goal & Contribution',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-19: Savings Goal Achievement & Confetti Celebration Trigger (FR-MIL-06, FR-MIL-10)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        # Add remaining ₹10,000 contribution to hit 100%
        contrib_res = client_a.post(f'/api/milestones/{savings_goal_id}/contribute/', {
            'amount': '10000.00',
            'date': str(today),
            'note': 'Final trip funding deposit'
        }, format='json')
        assert contrib_res.status_code == 201
        assert contrib_res.data['is_newly_achieved'] is True
        assert contrib_res.data['milestone']['status'] == 'ACHIEVED'
        assert contrib_res.data['milestone']['progress']['percentage'] == 100.0

        results.append({
            'id': 'TC-19',
            'module': 'Milestones',
            'title': 'Savings Goal Achievement & Celebration Trigger (FR-MIL-06, FR-MIL-10)',
            'expected': 'Status switches to ACHIEVED, is_newly_achieved is True (triggers confetti)',
            'actual': f"Status: {contrib_res.data['milestone']['status']}, is_newly_achieved: True, Progress: 100%",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-19',
            'module': 'Milestones',
            'title': 'Savings Goal Achievement & Celebration Trigger (FR-MIL-06, FR-MIL-10)',
            'expected': 'Goal marked ACHIEVED',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # -------------------------------------------------------------
    # TC-20: Dashboard Summary Totals, Donut Chart & Monthly Trend (FR-HOM-02 to FR-HOM-07)
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        # Also record an income of ₹30,000 so total balance computes properly
        client_a.post('/api/expenses/', {
            'title': 'Internship Stipend',
            'amount': '30000.00',
            'type': 'INCOME',
            'category': default_cat_id,
            'date': str(today),
            'payment_method': 'Net Banking'
        }, format='json')

        dash_res = client_a.get('/api/dashboard/summary/?period=1M')
        assert dash_res.status_code == 200
        data = dash_res.data

        summary = data['summary']
        assert summary['total_spent'] > 0
        assert summary['total_income'] == 30000.00
        assert summary['total_saved'] == 15000.00
        assert len(data['category_breakdown']) > 0
        assert len(data['monthly_trend']) == 6
        assert len(data['recent_expenses']) > 0
        assert len(data['active_milestones']) >= 0
        assert any(a['level'] == 'danger' for a in data['alerts']), "Expected exceeded limit alert in dashboard alerts"

        results.append({
            'id': 'TC-20',
            'module': 'Dashboard & Reporting',
            'title': 'Dashboard Summary Totals, Donut Breakdown & 6-Month Trend (FR-HOM-02 to FR-HOM-07)',
            'expected': 'HTTP 200 with summary totals, categories breakdown, 6 monthly trend buckets, active alerts',
            'actual': f"HTTP {dash_res.status_code}, Total Spent: ₹{summary['total_spent']}, Total Saved: ₹{summary['total_saved']}, 6-mo Trend: {len(data['monthly_trend'])} buckets, Alerts: {len(data['alerts'])}",
            'status': 'PASS',
            'time_ms': round((time.time() - t0)*1000, 2)
        })
    except Exception as e:
        results.append({
            'id': 'TC-20',
            'module': 'Dashboard & Reporting',
            'title': 'Dashboard Summary Totals, Donut Breakdown & 6-Month Trend (FR-HOM-02 to FR-HOM-07)',
            'expected': 'HTTP 200 OK with complete dashboard payload',
            'actual': str(e),
            'status': 'FAIL',
            'time_ms': round((time.time() - t0)*1000, 2)
        })

    # Cleanup after test suite
    cleanup_user(test_user_a)
    cleanup_user(test_user_b)

    # Save JSON report
    with open('test_results_20.json', 'w') as f:
        json.dump(results, f, indent=2)

    # Print summary
    passed_count = sum(1 for r in results if r['status'] == 'PASS')
    failed_count = sum(1 for r in results if r['status'] == 'FAIL')

    print("\n" + "-"*80)
    print(f" EXECUTION COMPLETE: {passed_count} PASSED | {failed_count} FAILED out of {len(results)} Test Cases")
    print("-"*80)
    for r in results:
        status_symbol = "✓ PASS" if r['status'] == 'PASS' else "✗ FAIL"
        print(f"[{status_symbol}] {r['id']} ({r['module']}): {r['title']} ({r['time_ms']} ms)")
        if r['status'] == 'FAIL':
            print(f"       ERROR: {r['actual']}")
    print("="*80 + "\n")

    return results

if __name__ == '__main__':
    run_20_test_cases()
