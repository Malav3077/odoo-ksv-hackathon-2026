from django.urls import path

from . import views

urlpatterns = [
    path("orders/<int:order_id>/invoice/", views.OrderInvoiceView.as_view(), name="order-invoice"),
    path("invoices/<int:pk>/pdf/", views.InvoicePDFView.as_view(), name="invoice-pdf"),
    path("payments/", views.PaymentListCreateView.as_view(), name="payments"),
]
