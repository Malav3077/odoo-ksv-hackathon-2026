from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing import services as billing_services
from apps.common.permissions import IsAdminOrVendor, IsCustomer

from . import services
from .models import RentalOrder
from .serializers import (
    CheckoutSerializer,
    QuotationCreateSerializer,
    RentalOrderSerializer,
)


def _line_payload(validated_lines):
    return [
        {
            "product": line["product"],
            "quantity": line["quantity"],
            "rental_start": line.get("rental_start"),
            "rental_end": line.get("rental_end"),
        }
        for line in validated_lines
    ]


class CheckoutView(APIView):
    permission_classes = [IsCustomer]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        order = services.create_order(
            customer=request.user,
            lines=_line_payload(data["lines"]),
            pickup_date=data["pickup_date"],
            return_date=data["return_date"],
            delivery_method=data["delivery_method"],
            invoice_address=data.get("invoice_address"),
            delivery_address=data.get("delivery_address"),
            confirm=True,
        )
        invoice = billing_services.generate_invoice(order)
        billing_services.record_payments(order)
        return Response(
            {
                "order_id": order.id,
                "order_reference": order.order_reference,
                "invoice_id": invoice.id,
                "total_amount": str(order.total_amount),
                "security_deposit_held": str(order.security_deposit_held),
            },
            status=status.HTTP_201_CREATED,
        )


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = RentalOrderSerializer
    http_method_names = ["get", "post"]

    def get_queryset(self):
        user = self.request.user
        qs = RentalOrder.objects.select_related("customer").prefetch_related("lines__product")
        if user.role == "customer":
            return qs.filter(customer=user)
        return qs

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsAdminOrVendor()]

    def create(self, request, *args, **kwargs):
        serializer = QuotationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        order = services.create_order(
            customer=data["customer"],
            lines=_line_payload(data["lines"]),
            pickup_date=data["pickup_date"],
            return_date=data["return_date"],
            delivery_method=data["delivery_method"],
            invoice_address=data.get("invoice_address"),
            delivery_address=data.get("delivery_address"),
            pricelist=data.get("pricelist"),
            created_by=request.user,
            confirm=False,
        )
        return Response(RentalOrderSerializer(order).data, status=status.HTTP_201_CREATED)

    def _run(self, service_fn):
        order = self.get_object()
        try:
            service_fn(order, self.request.user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        order = self.get_queryset().get(pk=order.pk)
        return Response(RentalOrderSerializer(order).data)

    @action(detail=True, methods=["post"], url_path="send-quotation")
    def send_quotation(self, request, pk=None):
        return self._run(services.send_quotation)

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        order = self.get_object()
        try:
            services.confirm_order(order, request.user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        billing_services.generate_invoice(order)
        return Response(RentalOrderSerializer(order).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        return self._run(services.cancel_order)

    @action(detail=True, methods=["post"])
    def pickup(self, request, pk=None):
        return self._run(services.mark_pickup)

    @action(detail=True, methods=["post"], url_path="return")
    def return_order(self, request, pk=None):
        return self._run(services.settle_return)
