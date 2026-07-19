from django.conf import settings
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class ActivityLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs",
    )
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.user} - {self.action}"


class OrganizationSettings(models.Model):
    company_name = models.CharField(max_length=200, default="RentEase")
    currency = models.CharField(max_length=10, default="INR")
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    default_grace_hours = models.PositiveIntegerField(default=2)
    default_late_fee_per_hour = models.DecimalField(max_digits=10, decimal_places=2, default=100)
    invoice_prefix = models.CharField(max_length=20, default="INV")

    class Meta:
        verbose_name_plural = "Organization settings"

    def __str__(self):
        return self.company_name

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
