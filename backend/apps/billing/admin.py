from django.contrib import admin

from .models import Invoice, InvoiceLine


class InvoiceLineInline(admin.TabularInline):
    model = InvoiceLine
    extra = 0


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        "invoice_number",
        "order",
        "customer",
        "status",
        "total_amount",
        "late_fee",
        "issue_date",
    )
    list_filter = ("status",)
    search_fields = ("invoice_number", "order__order_reference", "customer__email")
    inlines = [InvoiceLineInline]
