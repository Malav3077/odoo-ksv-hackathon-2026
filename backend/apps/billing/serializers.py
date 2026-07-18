from rest_framework import serializers

from .models import Invoice, InvoiceLine


class InvoiceLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLine
        fields = ("id", "description", "quantity", "unit_price", "amount")


class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, read_only=True)
    order_reference = serializers.CharField(source="order.order_reference", read_only=True)
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = (
            "id",
            "invoice_number",
            "order",
            "order_reference",
            "customer",
            "customer_name",
            "status",
            "issue_date",
            "untaxed_amount",
            "tax_amount",
            "late_fee",
            "security_deposit",
            "deposit_refunded",
            "total_amount",
            "lines",
        )

    def get_customer_name(self, obj):
        full = obj.customer.get_full_name()
        return full or obj.customer.username
