from datetime import timedelta
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.catalog.models import Product
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


def _add_late_fee_line(order, late_fee, when):
    product, _ = Product.objects.get_or_create(
        name="Late Fees",
        defaults={"product_type": "service", "sales_price": 0, "is_published": False},
    )
    RentalOrderLine.objects.create(
        order=order,
        product=product,
        quantity=1,
        unit="Fee",
        unit_price=late_fee,
        amount=late_fee,
        rental_start=order.return_date,
        rental_end=when,
    )


@transaction.atomic
def settle_return(order, user, when=None):
    if order.status not in ("picked_up", "late_pickup"):
        raise ValueError("Only a picked-up order can be returned.")
    when = when or timezone.now()

    grace_hours = 0
    rate_per_hour = Decimal("0")
    for line in order.lines.select_related("product__rental_config"):
        product = line.product
        if product and hasattr(product, "rental_config"):
            config = product.rental_config
            grace_hours = max(grace_hours, config.padding_time)
            rate_per_hour += config.late_fee_per_hour * line.quantity

    scheduled = order.return_date
    late_delta = when - scheduled - timedelta(hours=grace_hours)
    hours_late = max(0, late_delta.total_seconds() / 3600)

    deposit = order.security_deposit_held
    if hours_late <= 0:
        late_fee = Decimal("0")
        new_status = "returned"
    else:
        late_fee = Decimal(round(hours_late)) * rate_per_hour
        late_fee = min(late_fee, deposit)
        new_status = "late_return"
        _add_late_fee_line(order, late_fee, when)

    order.actual_return_date = when
    order.late_fee_charged = late_fee
    order.deposit_refunded = deposit - late_fee
    order.save(update_fields=["actual_return_date", "late_fee_charged", "deposit_refunded"])
    ActivityLog.objects.create(
        user=user,
        action=(
            f"Settled return {order.order_reference}: late_fee={late_fee}, "
            f"refund={order.deposit_refunded}"
        ),
    )
    return _transition(order, new_status, "Returned", user)
