from django.conf import settings
from django.db import models

from apps.catalog.models import PriceList, Product
from apps.common.models import TimeStampedModel


class RentalOrder(TimeStampedModel):
    STATUS_CHOICES = (
        ("quotation", "Quotation"),
        ("quotation_sent", "Quotation Sent"),
        ("reserved", "Reserved"),
        ("picked_up", "Picked Up"),
        ("late_pickup", "Late Pickup"),
        ("returned", "Returned"),
        ("late_return", "Late Return"),
        ("cancelled", "Cancelled"),
    )
    INVOICE_STATUS_CHOICES = (
        ("nothing_to_invoice", "Nothing to Invoice"),
        ("quotation_sent", "Quotation Sent"),
        ("invoiced", "Invoiced"),
    )
    DELIVERY_CHOICES = (
        ("standard_delivery", "Standard Delivery"),
        ("store_pickup", "Store Pickup"),
    )

    order_reference = models.CharField(max_length=20, unique=True, blank=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="quotation")
    invoice_status = models.CharField(
        max_length=20, choices=INVOICE_STATUS_CHOICES, default="nothing_to_invoice"
    )
    pickup_date = models.DateTimeField()
    return_date = models.DateTimeField()
    actual_return_date = models.DateTimeField(null=True, blank=True)
    invoice_address = models.ForeignKey(
        "accounts.CustomerAddress",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="invoice_orders",
    )
    delivery_address = models.ForeignKey(
        "accounts.CustomerAddress",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="delivery_orders",
    )
    delivery_method = models.CharField(
        max_length=20, choices=DELIVERY_CHOICES, default="store_pickup"
    )
    pricelist = models.ForeignKey(
        PriceList, null=True, blank=True, on_delete=models.SET_NULL, related_name="orders"
    )
    untaxed_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    security_deposit_held = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    late_fee_charged = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deposit_refunded = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_orders",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.order_reference or f"Order #{self.pk}"


class RentalOrderLine(models.Model):
    order = models.ForeignKey(RentalOrder, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey(
        Product, null=True, on_delete=models.SET_NULL, related_name="order_lines"
    )
    quantity = models.PositiveIntegerField(default=1)
    unit = models.CharField(max_length=30, default="Units")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    rental_start = models.DateTimeField()
    rental_end = models.DateTimeField()

    def __str__(self):
        return f"{self.quantity} x {self.product} ({self.order.order_reference})"
