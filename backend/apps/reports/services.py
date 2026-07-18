from decimal import Decimal

from django.db.models import Count, Sum
from django.utils import timezone

from apps.rentals.models import RentalOrder

# Orders currently out with the customer.
ACTIVE_STATES = ("reserved", "picked_up", "late_pickup")
# Statuses that represent real (non-cancelled) revenue.
REVENUE_STATES = (
    "reserved",
    "picked_up",
    "late_pickup",
    "returned",
    "late_return",
)


def _scoped_queryset(user):
    """Admin sees everything; a vendor sees only the orders they created."""
    qs = RentalOrder.objects.all()
    if getattr(user, "role", None) == "vendor":
        qs = qs.filter(created_by=user)
    return qs


def _money(value):
    return str((value or Decimal("0")).quantize(Decimal("0.01")))


def dashboard_stats(user):
    qs = _scoped_queryset(user)
    now = timezone.now()
    today = now.date()

    out_qs = qs.filter(status__in=("picked_up", "late_pickup"))

    kpis = {
        "active_rentals": qs.filter(status__in=ACTIVE_STATES).count(),
        "due_today": out_qs.filter(return_date__date=today).count(),
        "upcoming_pickups": qs.filter(
            status="reserved", pickup_date__gte=now
        ).count(),
        "upcoming_returns": out_qs.filter(return_date__gte=now).count(),
        "overdue": out_qs.filter(return_date__lt=now).count(),
        "revenue": _money(
            qs.filter(status__in=REVENUE_STATES).aggregate(s=Sum("total_amount"))["s"]
        ),
        "deposits_held": _money(
            qs.filter(status__in=ACTIVE_STATES).aggregate(
                s=Sum("security_deposit_held")
            )["s"]
        ),
        "late_fee_collected": _money(
            qs.aggregate(s=Sum("late_fee_charged"))["s"]
        ),
        "total_orders": qs.count(),
    }

    status_breakdown = {
        row["status"]: row["count"]
        for row in qs.values("status").annotate(count=Count("id"))
    }

    recent = [
        {
            "id": o.id,
            "order_reference": o.order_reference,
            "customer": o.customer.get_full_name() or o.customer.username,
            "status": o.status,
            "total_amount": _money(o.total_amount),
            "pickup_date": o.pickup_date,
            "return_date": o.return_date,
        }
        for o in qs.select_related("customer")[:10]
    ]

    return {
        "kpis": kpis,
        "status_breakdown": status_breakdown,
        "recent_orders": recent,
    }
