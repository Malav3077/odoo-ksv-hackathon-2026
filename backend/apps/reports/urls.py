from django.urls import path

from . import views

urlpatterns = [
    path("dashboard/stats/", views.DashboardStatsView.as_view(), name="dashboard-stats"),
    path("dashboard/orders/", views.DashboardOrdersView.as_view(), name="dashboard-orders"),
]
