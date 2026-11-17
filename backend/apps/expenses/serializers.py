from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal
from .models import Category, Expense, Milestone, Contribution

class CategorySerializer(serializers.ModelSerializer):
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'is_default', 'color', 'icon', 'can_delete']

    def get_can_delete(self, obj):
        if obj.is_default:
            return False
        # Cannot be deleted if in use
        return not obj.expenses.exists()

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_color = serializers.ReadOnlyField(source='category.color')
    category_icon = serializers.ReadOnlyField(source='category.icon')

    class Meta:
        model = Expense
        fields = [
            'id', 'user', 'category', 'category_name', 'category_color', 'category_icon',
            'title', 'amount', 'type', 'date', 'payment_method', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate_title(self, value):
        trimmed = value.strip()
        if len(trimmed) < 2 or len(trimmed) > 100:
            raise serializers.ValidationError("Title must be between 2 and 100 characters.")
        return trimmed

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Amount must be greater than zero.")
        if value > Decimal('99999999.99'):
            raise serializers.ValidationError("Amount cannot exceed ₹99,999,999.99.")
        return value

    def validate_date(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError("Future dates are not allowed.")
        return value

class ContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contribution
        fields = ['id', 'milestone', 'amount', 'date', 'note', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Contribution amount must be greater than zero.")
        return value

class MilestoneSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    progress = serializers.SerializerMethodField()
    contributions = ContributionSerializer(many=True, read_only=True)

    class Meta:
        model = Milestone
        fields = [
            'id', 'user', 'category', 'category_name', 'title', 'type',
            'target_amount', 'start_date', 'end_date', 'status', 'created_at',
            'progress', 'contributions'
        ]
        read_only_fields = ['id', 'user', 'created_at']

    def validate_target_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Target amount must be greater than zero.")
        return value

    def validate(self, data):
        start_date = data.get('start_date') or (self.instance.start_date if self.instance else None)
        end_date = data.get('end_date') or (self.instance.end_date if self.instance else None)

        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError({"end_date": "End date must be strictly after the start date."})
        return data

    def get_progress(self, obj):
        return obj.calculate_progress()
