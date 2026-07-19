from datetime import timedelta

from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsAdminOrVendor
from apps.rentals.models import RentalOrder, RentalOrderLine
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


class DashboardChartsView(APIView):
    """Aggregated, chart-ready data derived live from the order tables."""

    permission_classes = [IsAdminOrVendor]

    def get(self, request):
        now = timezone.now()
        qs = _scoped_orders(request.user)
        billable = qs.exclude(status__in=["quotation", "quotation_sent", "cancelled"])

        # 1) Revenue trend — last 14 days, zero-filled so the axis is continuous.
        days = 14
        start = (now - timedelta(days=days - 1)).date()
        buckets = {start + timedelta(days=i): 0.0 for i in range(days)}
        rows = (
            billable.filter(created_at__date__gte=start)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(total=Sum("total_amount"))
        )
        for row in rows:
            if row["day"] in buckets:
                buckets[row["day"]] = float(row["total"] or 0)
        revenue_trend = [
            {"date": day.isoformat(), "label": day.strftime("%d %b"), "revenue": value}
            for day, value in sorted(buckets.items())
        ]

        # 2) Order status breakdown — counts per status, only non-empty ones.
        label_map = dict(RentalOrder.STATUS_CHOICES)
        counts = {
            row["status"]: row["count"]
            for row in qs.values("status").annotate(count=Count("id"))
        }
        status_breakdown = [
            {"status": status, "label": label_map.get(status, status), "count": counts[status]}
            for status, _ in RentalOrder.STATUS_CHOICES
            if counts.get(status)
        ]

        # 3) Top rented products — by total quantity, with revenue.
        top = (
            RentalOrderLine.objects.filter(order__in=qs)
            .values("product__name")
            .annotate(quantity=Sum("quantity"), revenue=Sum("amount"))
            .order_by("-quantity")[:5]
        )
        top_products = [
            {
                "name": item["product__name"],
                "quantity": item["quantity"] or 0,
                "revenue": float(item["revenue"] or 0),
            }
            for item in top
        ]

        return Response(
            {
                "revenue_trend": revenue_trend,
                "status_breakdown": status_breakdown,
                "top_products": top_products,
            }
        )


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
