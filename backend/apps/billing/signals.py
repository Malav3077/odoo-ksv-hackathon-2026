from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.rentals.models import RentalOrder

from .services import generate_invoice_for_order

# Order states for which a customer invoice should exist / stay in sync.
INVOICEABLE_STATES = {
    "reserved",
    "picked_up",
    "late_pickup",
    "returned",
    "late_return",
}


@receiver(post_save, sender=RentalOrder)
def sync_invoice(sender, instance, **kwargs):
    """Auto-generate or refresh the invoice whenever an order is invoiceable.

    Kept self-contained in the billing app so the rentals app has no
    dependency on billing. generate_invoice_for_order only writes Invoice
    rows, so this never re-triggers the RentalOrder post_save.
    """
    if instance.invoice_status != "invoiced":
        return
    if instance.status not in INVOICEABLE_STATES:
        return
    generate_invoice_for_order(instance)
