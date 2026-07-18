from rest_framework.permissions import BasePermission


def _has_role(request, *roles):
    user = request.user
    return bool(user and user.is_authenticated and user.role in roles)


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, "admin")


class IsVendor(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, "vendor")


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, "customer")


class IsAdminOrVendor(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, "admin", "vendor")
