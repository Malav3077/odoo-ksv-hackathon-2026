from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("register/vendor/", views.VendorRegisterView.as_view(), name="register-vendor"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", views.MeView.as_view(), name="me"),
    path("change-password/", views.ChangePasswordView.as_view(), name="change-password"),
    path("password-reset/", views.PasswordResetView.as_view(), name="password-reset"),
    path("addresses/", views.AddressListCreateView.as_view(), name="addresses"),
    path("addresses/<int:pk>/", views.AddressDetailView.as_view(), name="address-detail"),
]
