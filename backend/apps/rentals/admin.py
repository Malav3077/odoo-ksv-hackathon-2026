from django.contrib import admin

from .models import RentalOrder, RentalOrderLine


class RentalOrderLineInline(admin.TabularInline):
    model = RentalOrderLine
    extra = 0


@admin.register(RentalOrder)
class RentalOrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_reference",
        "customer",
        "status",
        "pickup_date",
        "return_date",
        "total_amount",
        "security_deposit_held",
    )
    list_filter = ("status", "invoice_status", "delivery_method")
    search_fields = ("order_reference", "customer__username")
    inlines = [RentalOrderLineInline]
