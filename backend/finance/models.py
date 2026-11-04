from django.contrib.auth.models import User
from django.db import models


# MODULE 1: User Authentication uses Django's built-in User model (imported above)


# MODULE 2: Accounts Management
class Account(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    card_type = models.CharField(max_length=30, default="Debit")
    last4 = models.CharField(max_length=4, blank=True)  # never store full card number / CVV
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return self.name


# MODULE 7: Goal Setting & Tracking
class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    target = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return self.name


# MODULE 4: Transaction History (also feeds Module 6 Expenses and Module 7 goal progress)
class Transaction(models.Model):
    TYPES = [("credit", "Credit"), ("debit", "Debit")]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    goal = models.ForeignKey(Goal, on_delete=models.SET_NULL, null=True, blank=True)
    item = models.CharField(max_length=200)
    type = models.CharField(max_length=6, choices=TYPES)
    payment_type = models.CharField(max_length=30, default="Card")
    date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ["-date", "-id"]


# MODULE 5: Bill Management
class Bill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=200, blank=True)
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_on = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["due_date"]
