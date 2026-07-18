import math
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.common.models import ActivityLog

from .models import RentalOrder, RentalOrderLine

TAX_RATE = Decimal("0.10")


def _generate_reference(order):
    if not order.order_reference:
        order.order_reference = f"SO{order.id:04d}"
        order.save(update_fields=["order_reference"])


def _recalculate_totals(order):
    untaxed = sum((line.amount for line in order.lines.all()), Decimal("0"))
    tax = (untaxed * TAX_RATE).quantize(Decimal("0.01"))
    order.untaxed_amount = untaxed
    order.tax_amount = tax
    order.total_amount = untaxed + tax


@transaction.atomic
def create_order(*, customer, lines, pickup_date, return_date,
                 delivery_method="store_pickup", invoice_address=None,
                 delivery_address=None, pricelist=None, created_by=None, confirm=False):
    order = RentalOrder.objects.create(
        customer=customer,
        status="reserved" if confirm else "quotation",
        pickup_date=pickup_date,
        return_date=return_date,
        delivery_method=delivery_method,
        invoice_address=invoice_address,
        delivery_address=delivery_address,
        pricelist=pricelist,
        created_by=created_by,
    )
    _generate_reference(order)

    deposit_total = Decimal("0")
    for item in lines:
        product = item["product"]
        qty = item["quantity"]
        unit_price = product.sales_price
        RentalOrderLine.objects.create(
            order=order,
            product=product,
            quantity=qty,
            unit="Units",
            unit_price=unit_price,
            amount=unit_price * qty,
            rental_start=item.get("rental_start") or pickup_date,
            rental_end=item.get("rental_end") or return_date,
        )
        if hasattr(product, "rental_config"):
            deposit_total += product.rental_config.security_deposit_amount * qty

    order.security_deposit_held = deposit_total
    _recalculate_totals(order)
    if confirm:
        order.invoice_status = "invoiced"
    order.save()
    ActivityLog.objects.create(
        user=created_by or customer, action=f"Created order {order.order_reference}"
    )
    return order


def _transition(order, new_status, action, user):
    order.status = new_status
    order.save(update_fields=["status", "updated_at"])
    ActivityLog.objects.create(user=user, action=f"{action} {order.order_reference}")
    return order


def send_quotation(order, user):
    if order.status != "quotation":
        raise ValueError("Only a draft quotation can be sent.")
    order.invoice_status = "quotation_sent"
    order.save(update_fields=["invoice_status"])
    return _transition(order, "quotation_sent", "Sent quotation", user)


def confirm_order(order, user):
    if order.status not in ("quotation", "quotation_sent"):
        raise ValueError("Only a quotation can be confirmed.")
    order.invoice_status = "invoiced"
    order.save(update_fields=["invoice_status"])
    return _transition(order, "reserved", "Confirmed order", user)


def cancel_order(order, user):
    if order.status in ("returned", "late_return", "cancelled"):
        raise ValueError("This order can no longer be cancelled.")
    return _transition(order, "cancelled", "Cancelled order", user)


def mark_pickup(order, user, when=None):
    if order.status != "reserved":
        raise ValueError("Only a reserved order can be picked up.")
    when = when or timezone.now()
    status = "late_pickup" if when > order.pickup_date else "picked_up"
    return _transition(order, status, "Marked pickup for", user)


def compute_late_fee(order, when):
    """Late fee = late_fee_per_hour x hours_late x quantity, summed over lines.

    Hours late are rounded up so any part-hour counts as a full hour.
    Returns Decimal("0") for on-time returns.
    """
    if when <= order.return_date:
        return Decimal("0")
    seconds_late = (when - order.return_date).total_seconds()
    hours_late = Decimal(math.ceil(seconds_late / 3600))
    fee = Decimal("0")
    for line in order.lines.select_related("product__rental_config"):
        product = line.product
        if product is not None and hasattr(product, "rental_config"):
            fee += product.rental_config.late_fee_per_hour * hours_late * line.quantity
    return fee.quantize(Decimal("0.01"))


def mark_return(order, user, when=None):
    if order.status not in ("picked_up", "late_pickup"):
        raise ValueError("Only a picked-up order can be returned.")
    when = when or timezone.now()
    late_fee = compute_late_fee(order, when)
    refund = order.security_deposit_held - late_fee
    if refund < 0:
        refund = Decimal("0")
    order.actual_return_date = when
    order.late_fee_charged = late_fee
    order.deposit_refunded = refund
    order.save(
        update_fields=["actual_return_date", "late_fee_charged", "deposit_refunded"]
    )
    status = "late_return" if when > order.return_date else "returned"
    return _transition(order, status, "Marked return for", user)
