from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.rentals.models import RentalOrder

from . import services
from .models import Invoice, Payment
from .serializers import InvoiceSerializer, PaymentSerializer


def _orders_for(user):
    qs = RentalOrder.objects.all()
    if user.role == "customer":
        qs = qs.filter(customer=user)
    return qs


class InvoiceListView(generics.ListAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Invoice.objects.select_related("order__customer").order_by("-id")
        if self.request.user.role == "customer":
            qs = qs.filter(order__customer=self.request.user)
        return qs


class OrderInvoiceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(_orders_for(request.user), pk=order_id)
        invoice = services.generate_invoice(order)
        return Response(InvoiceSerializer(invoice).data)


class InvoicePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        invoice = get_object_or_404(Invoice.objects.select_related("order"), pk=pk)
        if request.user.role == "customer" and invoice.order.customer_id != request.user.id:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        buffer = services.render_invoice_pdf(invoice)
        safe_name = invoice.invoice_number.replace("/", "-")
        return FileResponse(
            buffer,
            as_attachment=True,
            filename=f"{safe_name}.pdf",
            content_type="application/pdf",
        )


class PaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(order__in=_orders_for(self.request.user))

    def perform_create(self, serializer):
        serializer.save(status="success", paid_at=timezone.now())
