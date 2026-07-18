from rest_framework import serializers

from .models import Invoice, Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ("id", "order", "amount", "payment_type", "status", "paid_at")
        read_only_fields = ("status", "paid_at")


class InvoiceSerializer(serializers.ModelSerializer):
    order_reference = serializers.CharField(source="order.order_reference", read_only=True)
    customer_name = serializers.CharField(source="order.customer.username", read_only=True)

    class Meta:
        model = Invoice
        fields = (
            "id",
            "order",
            "order_reference",
            "customer_name",
            "invoice_number",
            "invoice_date",
            "status",
            "untaxed_amount",
            "tax_amount",
            "total_amount",
        )
