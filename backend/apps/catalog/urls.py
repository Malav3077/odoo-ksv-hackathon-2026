from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("categories", views.CategoryViewSet, basename="category")
router.register("attributes", views.AttributeViewSet, basename="attribute")
router.register("products", views.ProductViewSet, basename="product")
router.register("pricelists", views.PriceListViewSet, basename="pricelist")

urlpatterns = router.urls
