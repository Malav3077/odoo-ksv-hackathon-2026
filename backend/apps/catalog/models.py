from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel


class Category(models.Model):
    name = models.CharField(max_length=120)
    parent = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.SET_NULL, related_name="children"
    )

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Attribute(models.Model):
    DISPLAY_CHOICES = (
        ("radio", "Radio"),
        ("pills", "Pills"),
        ("checkbox", "Checkbox"),
        ("image", "Image"),
    )
    name = models.CharField(max_length=80)
    display_type = models.CharField(max_length=20, choices=DISPLAY_CHOICES, default="radio")

    def __str__(self):
        return self.name


class AttributeValue(models.Model):
    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE, related_name="values")
    value = models.CharField(max_length=80)
    extra_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.attribute.name}: {self.value}"


class Product(TimeStampedModel):
    TYPE_CHOICES = (("goods", "Goods"), ("service", "Service"))
    name = models.CharField(max_length=200)
    category = models.ForeignKey(
        Category, null=True, blank=True, on_delete=models.SET_NULL, related_name="products"
    )
    description = models.TextField(blank=True)
    product_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="goods")
    sales_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    quantity_on_hand = models.PositiveIntegerField(default=0)
    image_url = models.URLField(blank=True)
    is_published = models.BooleanField(default=False)
    attribute_values = models.ManyToManyField(
        AttributeValue, blank=True, related_name="products"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="products",
    )

    def __str__(self):
        return self.name


class RentalConfig(models.Model):
    PERIOD_CHOICES = (("hourly", "Hourly"), ("daily", "Daily"), ("weekly", "Weekly"))
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="rental_config")
    periodicity = models.CharField(max_length=20, choices=PERIOD_CHOICES, default="daily")
    padding_time = models.PositiveIntegerField(default=0)
    late_fee_per_hour = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    security_deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Rental config for {self.product.name}"


class PriceList(models.Model):
    name = models.CharField(max_length=120)
    is_default = models.BooleanField(default=False)
    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name


class PriceListRule(models.Model):
    PRICE_TYPE = (("discount", "Discount"), ("fixed_price", "Fixed Price"))
    pricelist = models.ForeignKey(PriceList, on_delete=models.CASCADE, related_name="rules")
    applies_to_product = models.ForeignKey(
        Product, null=True, blank=True, on_delete=models.CASCADE, related_name="pricelist_rules"
    )
    price_type = models.CharField(max_length=20, choices=PRICE_TYPE, default="discount")
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    fixed_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    min_qty = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.pricelist.name} rule"
