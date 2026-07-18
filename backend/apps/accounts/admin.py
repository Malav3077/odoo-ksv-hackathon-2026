from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomerAddress, User, VendorProfile


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "is_active", "date_joined")
    list_filter = ("role", "is_active")
    search_fields = ("username", "email")
    fieldsets = UserAdmin.fieldsets + (("Rental role", {"fields": ("role", "phone")}),)


admin.site.register(VendorProfile)
admin.site.register(CustomerAddress)
