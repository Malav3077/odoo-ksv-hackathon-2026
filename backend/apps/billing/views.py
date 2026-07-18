from django.shortcuts import get_object_or_404, render
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import IsAdminOrVendor
from apps.rentals.models import RentalOrder

from . import services
from .models import Invoice
from .serializers import InvoiceSerializer


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Invoice.objects.select_related("order", "customer").prefetch_related("lines")
        if user.role == "customer":
            return qs.filter(customer=user)
        return qs

    def get_permissions(self):
        return [IsAuthenticated()]

    @action(detail=False, methods=["post"], permission_classes=[IsAdminOrVendor])
    def generate(self, request):
        """Generate (or refresh) an invoice for a given order id."""
        order_id = request.data.get("order")
        if not order_id:
            return Response(
                {"detail": "order id is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        order = get_object_or_404(RentalOrder, pk=order_id)
        invoice = services.generate_invoice_for_order(order, user=request.user)
        return Response(
            InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["get"], url_path="print")
    def print_invoice(self, request, pk=None):
        """Printable HTML invoice. Open in a browser and use Save as PDF."""
        invoice = self.get_object()
        return render(request, "billing/invoice.html", {"invoice": invoice})
