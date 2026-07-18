from django.contrib import admin

from .models import Invoice, Payment


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "order", "status", "total_amount", "invoice_date")
    list_filter = ("status",)
    search_fields = ("invoice_number", "order__order_reference")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("order", "payment_type", "amount", "status", "paid_at")
    list_filter = ("payment_type", "status")
