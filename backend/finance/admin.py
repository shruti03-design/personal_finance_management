from django.contrib import admin
from .models import Account, Bill, Goal, Transaction

for m in (Account, Bill, Goal, Transaction):
    admin.site.register(m)
