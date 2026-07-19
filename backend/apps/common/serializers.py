from rest_framework import serializers

from .models import OrganizationSettings


class OrganizationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationSettings
        fields = (
            "company_name",
            "currency",
            "tax_percent",
            "default_grace_hours",
            "default_late_fee_per_hour",
            "invoice_prefix",
        )
