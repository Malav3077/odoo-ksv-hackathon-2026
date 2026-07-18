from django.db import models

from apps.rentals.models import RentalOrder


class Invoice(models.Model):
    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("posted", "Posted"),
        ("paid", "Paid"),
    )
    order = models.OneToOneField(RentalOrder, on_delete=models.CASCADE, related_name="invoice")
    invoice_number = models.CharField(max_length=30, unique=True, blank=True)
    invoice_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="draft")
    untaxed_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return self.invoice_number or f"Invoice for {self.order}"


class Payment(models.Model):
    TYPE_CHOICES = (
        ("rental", "Rental"),
        ("security_deposit", "Security Deposit"),
    )
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("success", "Success"),
    )
    order = models.ForeignKey(RentalOrder, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="rental")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.payment_type} {self.amount} ({self.order.order_reference})"
