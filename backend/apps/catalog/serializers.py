from rest_framework import serializers

from .models import (
    Attribute,
    AttributeValue,
    Category,
    PriceList,
    PriceListRule,
    Product,
    RentalConfig,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "parent")


class AttributeValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeValue
        fields = ("id", "attribute", "value", "extra_price")


class AttributeSerializer(serializers.ModelSerializer):
    values = AttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model = Attribute
        fields = ("id", "name", "display_type", "values")


class RentalConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalConfig
        fields = ("periodicity", "padding_time", "late_fee_per_hour", "security_deposit_amount")


class ProductSerializer(serializers.ModelSerializer):
    rental_config = RentalConfigSerializer(required=False)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "category",
            "category_name",
            "description",
            "product_type",
            "sales_price",
            "cost_price",
            "quantity_on_hand",
            "image_url",
            "is_published",
            "attribute_values",
            "rental_config",
            "created_by",
        )
        read_only_fields = ("created_by",)

    def validate_sales_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def create(self, validated_data):
        rental_config = validated_data.pop("rental_config", None)
        attribute_values = validated_data.pop("attribute_values", [])
        product = Product.objects.create(**validated_data)
        product.attribute_values.set(attribute_values)
        if rental_config:
            RentalConfig.objects.create(product=product, **rental_config)
        return product

    def update(self, instance, validated_data):
        rental_config = validated_data.pop("rental_config", None)
        attribute_values = validated_data.pop("attribute_values", None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        if attribute_values is not None:
            instance.attribute_values.set(attribute_values)
        if rental_config:
            RentalConfig.objects.update_or_create(product=instance, defaults=rental_config)
        return instance


class PriceListRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceListRule
        fields = (
            "id",
            "pricelist",
            "applies_to_product",
            "price_type",
            "discount_percent",
            "fixed_price",
            "min_qty",
        )


class PriceListSerializer(serializers.ModelSerializer):
    rules = PriceListRuleSerializer(many=True, read_only=True)

    class Meta:
        model = PriceList
        fields = ("id", "name", "is_default", "valid_from", "valid_to", "rules")
