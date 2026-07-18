from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsAdminOrVendor

from .services import dashboard_stats


class DashboardView(APIView):
    """Admin / vendor dashboard KPIs and recent orders."""

    permission_classes = [IsAdminOrVendor]

    def get(self, request):
        return Response(dashboard_stats(request.user))
