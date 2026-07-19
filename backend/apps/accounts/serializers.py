import re

from rest_framework import serializers

from .models import CustomerAddress, User, VendorProfile


def validate_password_policy(value):
    if not 6 <= len(value) <= 12:
        raise serializers.ValidationError("Password must be 6 to 12 characters long.")
    if not re.search(r"[A-Z]", value):
        raise serializers.ValidationError("Password must include at least one uppercase letter.")
    if not re.search(r"[a-z]", value):
        raise serializers.ValidationError("Password must include at least one lowercase letter.")
    if not re.search(r"[@$&_]", value):
        raise serializers.ValidationError("Password must include one special character (@ $ & _).")
    return value


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "first_name", "last_name", "phone")


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("first_name", "last_name", "phone")


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        return validate_password_policy(value)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "password", "confirm_password")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_password(self, value):
        return validate_password_policy(value)

    def validate(self, data):
        if data.get("password") != data.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        user = User(role="customer", **validated_data)
        user.set_password(password)
        user.save()
        return user


class VendorRegisterSerializer(RegisterSerializer):
    company_name = serializers.CharField()
    gst_no = serializers.CharField(required=False, allow_blank=True)

    class Meta(RegisterSerializer.Meta):
        fields = RegisterSerializer.Meta.fields + ("company_name", "gst_no")

    def create(self, validated_data):
        company_name = validated_data.pop("company_name")
        gst_no = validated_data.pop("gst_no", "")
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        user = User(role="vendor", **validated_data)
        user.set_password(password)
        user.save()
        VendorProfile.objects.create(user=user, company_name=company_name, gst_no=gst_no)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = ("id", "full_name", "address_line", "city", "zip_code", "country", "is_default")
