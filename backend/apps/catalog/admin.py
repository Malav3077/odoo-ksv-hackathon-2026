from django.contrib import admin

from .models import (
    Attribute,
    AttributeValue,
    Category,
    PriceList,
    PriceListRule,
    Product,
    RentalConfig,
)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "sales_price", "quantity_on_hand", "is_published", "created_by")
    list_filter = ("is_published", "product_type", "category")
    search_fields = ("name", "description")


admin.site.register(Category)
admin.site.register(Attribute)
admin.site.register(AttributeValue)
admin.site.register(RentalConfig)
admin.site.register(PriceList)
admin.site.register(PriceListRule)
