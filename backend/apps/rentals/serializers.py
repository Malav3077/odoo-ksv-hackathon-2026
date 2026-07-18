from rest_framework import serializers

from apps.accounts.models import CustomerAddress, User
from apps.catalog.models import PriceList, Product

from .models import RentalOrder, RentalOrderLine


class RentalOrderLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = RentalOrderLine
        fields = (
            "id",
            "product",
            "product_name",
            "quantity",
            "unit",
            "unit_price",
            "amount",
            "rental_start",
            "rental_end",
        )


class RentalOrderSerializer(serializers.ModelSerializer):
    lines = RentalOrderLineSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source="customer.username", read_only=True)

    class Meta:
        model = RentalOrder
        fields = (
            "id",
            "order_reference",
            "customer",
            "customer_name",
            "status",
            "invoice_status",
            "pickup_date",
            "return_date",
            "actual_return_date",
            "delivery_method",
            "untaxed_amount",
            "tax_amount",
            "total_amount",
            "security_deposit_held",
            "late_fee_charged",
            "deposit_refunded",
            "created_at",
            "lines",
        )


class CheckoutLineSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    rental_start = serializers.DateTimeField(required=False)
    rental_end = serializers.DateTimeField(required=False)


class CheckoutSerializer(serializers.Serializer):
    lines = CheckoutLineSerializer(many=True)
    pickup_date = serializers.DateTimeField()
    return_date = serializers.DateTimeField()
    delivery_method = serializers.ChoiceField(
        choices=[c[0] for c in RentalOrder.DELIVERY_CHOICES], default="store_pickup"
    )
    invoice_address = serializers.PrimaryKeyRelatedField(
        queryset=CustomerAddress.objects.all(), required=False, allow_null=True
    )
    delivery_address = serializers.PrimaryKeyRelatedField(
        queryset=CustomerAddress.objects.all(), required=False, allow_null=True
    )

    def validate_lines(self, value):
        if not value:
            raise serializers.ValidationError("At least one product is required.")
        return value

    def validate(self, data):
        if data["return_date"] <= data["pickup_date"]:
            raise serializers.ValidationError("Return date must be after pickup date.")
        return data


class QuotationCreateSerializer(CheckoutSerializer):
    customer = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    pricelist = serializers.PrimaryKeyRelatedField(
        queryset=PriceList.objects.all(), required=False, allow_null=True
    )
