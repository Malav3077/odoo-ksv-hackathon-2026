import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.common.models import ActivityLog
from apps.common.permissions import IsAdmin, IsAdminOrVendor

from .models import Attribute, Category, PriceList, Product
from .serializers import (
    AttributeSerializer,
    AttributeValueSerializer,
    CategorySerializer,
    PriceListRuleSerializer,
    PriceListSerializer,
    ProductSerializer,
)


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="sales_price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="sales_price", lookup_expr="lte")

    class Meta:
        model = Product
        fields = ["category", "is_published"]


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdmin()]


class AttributeViewSet(viewsets.ModelViewSet):
    queryset = Attribute.objects.prefetch_related("values").all()
    serializer_class = AttributeSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdmin()]

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def values(self, request, pk=None):
        attribute = self.get_object()
        payload = {**request.data, "attribute": attribute.id}
        serializer = AttributeValueSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name", "description"]
    ordering_fields = ["sales_price", "created_at", "name"]

    def get_queryset(self):
        qs = Product.objects.select_related("category", "rental_config").prefetch_related(
            "attribute_values"
        )
        user = self.request.user
        if not (user.is_authenticated and user.role in ("admin", "vendor")):
            qs = qs.filter(is_published=True, is_active=True)
        return qs

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminOrVendor()]

    def perform_create(self, serializer):
        product = serializer.save(created_by=self.request.user)
        ActivityLog.objects.create(
            user=self.request.user, action=f"Created product {product.name}"
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def publish(self, request, pk=None):
        product = self.get_object()
        product.is_published = bool(request.data.get("is_published", True))
        product.save()
        label = "Published" if product.is_published else "Unpublished"
        ActivityLog.objects.create(user=request.user, action=f"{label} product {product.name}")
        return Response({"id": product.id, "is_published": product.is_published})


class PriceListViewSet(viewsets.ModelViewSet):
    queryset = PriceList.objects.prefetch_related("rules").all()
    serializer_class = PriceListSerializer
    permission_classes = [IsAdminOrVendor]

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def rules(self, request, pk=None):
        pricelist = self.get_object()
        payload = {**request.data, "pricelist": pricelist.id}
        serializer = PriceListRuleSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
