import io

from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from .models import Invoice, Payment


def generate_invoice(order):
    invoice, created = Invoice.objects.get_or_create(
        order=order,
        defaults={
            "status": "posted",
            "untaxed_amount": order.untaxed_amount,
            "tax_amount": order.tax_amount,
            "total_amount": order.total_amount,
        },
    )
    if created and not invoice.invoice_number:
        year = timezone.now().year
        invoice.invoice_number = f"INV/{year}/{invoice.id:04d}"
        invoice.save(update_fields=["invoice_number"])
    return invoice


def record_payments(order):
    now = timezone.now()
    payments = []
    payments.append(
        Payment.objects.create(
            order=order, amount=order.total_amount, payment_type="rental",
            status="success", paid_at=now,
        )
    )
    if order.security_deposit_held > 0:
        payments.append(
            Payment.objects.create(
                order=order, amount=order.security_deposit_held,
                payment_type="security_deposit", status="success", paid_at=now,
            )
        )
    return payments


def render_invoice_pdf(invoice):
    order = invoice.order
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    pdf.setFillColor(colors.HexColor("#6B21A8"))
    pdf.rect(0, height - 40 * mm, width, 40 * mm, fill=1, stroke=0)
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(20 * mm, height - 22 * mm, "RentEase")
    pdf.setFont("Helvetica", 11)
    pdf.drawString(20 * mm, height - 30 * mm, "Rental Management System")
    pdf.drawRightString(width - 20 * mm, height - 22 * mm, "INVOICE")

    y = height - 55 * mm
    pdf.setFillColor(colors.black)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(20 * mm, y, f"Invoice: {invoice.invoice_number}")
    pdf.setFont("Helvetica", 10)
    pdf.drawString(20 * mm, y - 6 * mm, f"Order: {order.order_reference}")
    pdf.drawString(20 * mm, y - 12 * mm, f"Date: {invoice.invoice_date}")
    pdf.drawString(20 * mm, y - 18 * mm, f"Customer: {order.customer.get_full_name() or order.customer.username}")
    pdf.drawString(20 * mm, y - 24 * mm, f"Status: {invoice.get_status_display()}")

    y -= 38 * mm
    pdf.setFillColor(colors.HexColor("#F3E8FF"))
    pdf.rect(20 * mm, y, width - 40 * mm, 8 * mm, fill=1, stroke=0)
    pdf.setFillColor(colors.black)
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(22 * mm, y + 2.5 * mm, "Product")
    pdf.drawString(110 * mm, y + 2.5 * mm, "Qty")
    pdf.drawString(130 * mm, y + 2.5 * mm, "Unit Price")
    pdf.drawRightString(width - 22 * mm, y + 2.5 * mm, "Amount")

    y -= 8 * mm
    pdf.setFont("Helvetica", 10)
    for line in order.lines.all():
        name = line.product.name if line.product else "Product"
        pdf.drawString(22 * mm, y + 2 * mm, name)
        pdf.drawString(110 * mm, y + 2 * mm, str(line.quantity))
        pdf.drawString(130 * mm, y + 2 * mm, str(line.unit_price))
        pdf.drawRightString(width - 22 * mm, y + 2 * mm, str(line.amount))
        y -= 7 * mm

    y -= 4 * mm
    pdf.setFont("Helvetica", 10)
    for label, value in (
        ("Untaxed Amount", invoice.untaxed_amount),
        ("Tax (10%)", invoice.tax_amount),
        ("Security Deposit", order.security_deposit_held),
    ):
        pdf.drawRightString(150 * mm, y, f"{label}:")
        pdf.drawRightString(width - 22 * mm, y, str(value))
        y -= 6 * mm

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawRightString(150 * mm, y, "Total:")
    pdf.drawRightString(width - 22 * mm, y, str(invoice.total_amount))

    pdf.setFont("Helvetica-Oblique", 8)
    pdf.setFillColor(colors.grey)
    pdf.drawCentredString(width / 2, 15 * mm, "Thank you for renting with RentEase")

    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return buffer
