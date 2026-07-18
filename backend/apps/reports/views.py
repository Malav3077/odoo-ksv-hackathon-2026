from datetime import timedelta

from django.db.models import Q, Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsAdminOrVendor
from apps.rentals.models import RentalOrder
from apps.rentals.serializers import RentalOrderSerializer

ACTIVE_STATUSES = ["reserved", "picked_up", "late_pickup"]
OUT_STATUSES = ["picked_up", "late_pickup"]


def _scoped_orders(user):
    qs = RentalOrder.objects.all()
    if user.role == "vendor":
        qs = qs.filter(Q(created_by=user) | Q(lines__product__created_by=user)).distinct()
    return qs


def _money(value):
    return str(value or 0)


class DashboardStatsView(APIView):
    permission_classes = [IsAdminOrVendor]

    def get(self, request):
        now = timezone.now()
        today = now.date()
        qs = _scoped_orders(request.user)
        data = {
            "active_rentals": qs.filter(status__in=ACTIVE_STATUSES).count(),
            "rentals_due_today": qs.filter(
                status__in=ACTIVE_STATUSES, return_date__date=today
            ).count(),
            "upcoming_pickups": qs.filter(status="reserved", pickup_date__gte=now).count(),
            "upcoming_returns": qs.filter(status__in=OUT_STATUSES, return_date__gte=now).count(),
            "overdue_rentals": qs.filter(status__in=OUT_STATUSES, return_date__lt=now).count(),
            "revenue": _money(
                qs.exclude(status__in=["quotation", "quotation_sent", "cancelled"]).aggregate(
                    total=Sum("total_amount")
                )["total"]
            ),
            "security_deposits_held": _money(
                qs.filter(status__in=ACTIVE_STATUSES).aggregate(
                    total=Sum("security_deposit_held")
                )["total"]
            ),
            "late_fees_collected": _money(
                qs.aggregate(total=Sum("late_fee_charged"))["total"]
            ),
            "sales_last_7_days": _money(
                qs.filter(created_at__gte=now - timedelta(days=7))
                .exclude(status="cancelled")
                .aggregate(total=Sum("total_amount"))["total"]
            ),
        }
        return Response(data)


class DashboardOrdersView(generics.ListAPIView):
    serializer_class = RentalOrderSerializer
    permission_classes = [IsAdminOrVendor]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status"]
    search_fields = ["order_reference", "customer__username"]
    ordering_fields = ["created_at", "return_date", "total_amount"]

    def get_queryset(self):
        return (
            _scoped_orders(self.request.user)
            .select_related("customer")
            .prefetch_related("lines")
        )
