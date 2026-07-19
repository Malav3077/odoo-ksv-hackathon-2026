from rest_framework.generics import RetrieveUpdateAPIView

from .models import OrganizationSettings
from .permissions import IsAdmin
from .serializers import OrganizationSettingsSerializer


class SettingsView(RetrieveUpdateAPIView):
    serializer_class = OrganizationSettingsSerializer
    permission_classes = [IsAdmin]

    def get_object(self):
        return OrganizationSettings.load()
