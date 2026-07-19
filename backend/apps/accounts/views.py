from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.models import ActivityLog
from apps.common.permissions import IsCustomer

from .models import CustomerAddress, User
from .serializers import (
    ChangePasswordSerializer,
    CustomerAddressSerializer,
    LoginSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
    VendorRegisterSerializer,
)


def _tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        ActivityLog.objects.create(user=user, action=f"Registered as {user.role}")
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class VendorRegisterView(RegisterView):
    serializer_class = VendorRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        ActivityLog.objects.create(user=user, action=f"Registered as {user.role}")
        data = UserSerializer(user).data
        data["company_name"] = user.vendor_profile.company_name
        return Response(data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        user = User.objects.filter(email__iexact=email).first()
        if user is None or not user.check_password(password):
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_active:
            return Response(
                {"detail": "This account is inactive."},
                status=status.HTTP_403_FORBIDDEN,
            )
        ActivityLog.objects.create(user=user, action="Logged in")
        data = _tokens_for(user)
        data["user"] = UserSerializer(user).data
        return Response(data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except TokenError:
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ActivityLog.objects.create(user=request.user, action="Logged out")
        return Response({"detail": "Successfully logged out."})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        ActivityLog.objects.create(user=request.user, action="Updated profile")
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"old_password": ["Current password is incorrect."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if serializer.validated_data["old_password"] == serializer.validated_data["new_password"]:
            return Response(
                {"new_password": ["New password must be different from the current one."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        ActivityLog.objects.create(user=user, action="Changed password")
        return Response({"detail": "Password changed successfully."})


class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    def post(self, request):
        email = (request.data.get("email") or "").strip()
        if not email:
            return Response(
                {"email": ["Email is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = User.objects.filter(email__iexact=email).first()
        if user is not None:
            print(
                f"[PASSWORD RESET] Link for {email}: "
                f"http://localhost:3000/reset-password/confirm?token=DEMO-TOKEN"
            )
        return Response({"message": "Password reset link sent to your email"})


class AddressListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsCustomer]
    serializer_class = CustomerAddressSerializer
    pagination_class = None

    def get_queryset(self):
        return CustomerAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        ActivityLog.objects.create(user=self.request.user, action="Added a delivery address")


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsCustomer]
    serializer_class = CustomerAddressSerializer

    def get_queryset(self):
        return CustomerAddress.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()
        ActivityLog.objects.create(user=self.request.user, action="Updated a delivery address")
