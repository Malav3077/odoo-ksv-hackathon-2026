from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel
from apps.rentals.models import RentalOrder


class Invoice(TimeStampedModel):
    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("posted", "Posted"),
        ("paid", "Paid"),
    )

    invoice_number = models.CharField(max_length=20, unique=True, blank=True)
    order = models.ForeignKey(
        RentalOrder, on_delete=models.CASCADE, related_name="invoices"
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="invoices"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="posted")
    issue_date = models.DateTimeField(auto_now_add=True)

    untaxed_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    late_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    security_deposit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deposit_refunded = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.invoice_number or f"Invoice #{self.pk}"


class InvoiceLine(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="lines")
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.description} ({self.amount})"
