from decimal import Decimal

from django.db import transaction

from apps.common.models import ActivityLog

from .models import Invoice, InvoiceLine


def _generate_number(invoice):
    if not invoice.invoice_number:
        invoice.invoice_number = f"INV{invoice.id:04d}"
        invoice.save(update_fields=["invoice_number"])


@transaction.atomic
def generate_invoice_for_order(order, user=None):
    """Create (or refresh) the invoice for a rental order.

    Snapshots the order's line items plus a late-fee line when one applies,
    so the invoice stays correct even after a return settles the deposit.
    """
    invoice = Invoice.objects.filter(order=order).first()
    if invoice is None:
        invoice = Invoice.objects.create(order=order, customer=order.customer)
        _generate_number(invoice)

    invoice.customer = order.customer
    invoice.untaxed_amount = order.untaxed_amount
    invoice.tax_amount = order.tax_amount
    invoice.late_fee = order.late_fee_charged
    invoice.security_deposit = order.security_deposit_held
    invoice.deposit_refunded = order.deposit_refunded
    invoice.total_amount = order.total_amount + order.late_fee_charged
    invoice.status = "paid" if order.status in ("returned", "late_return") else "posted"
    invoice.save()

    invoice.lines.all().delete()
    for line in order.lines.select_related("product"):
        product_name = line.product.name if line.product else "Rental item"
        InvoiceLine.objects.create(
            invoice=invoice,
            description=product_name,
            quantity=line.quantity,
            unit_price=line.unit_price,
            amount=line.amount,
        )
    if order.late_fee_charged and order.late_fee_charged > Decimal("0"):
        InvoiceLine.objects.create(
            invoice=invoice,
            description="Late return fee",
            quantity=1,
            unit_price=order.late_fee_charged,
            amount=order.late_fee_charged,
        )

    ActivityLog.objects.create(
        user=user or order.customer,
        action=f"Generated {invoice.invoice_number} for {order.order_reference}",
    )
    return invoice
