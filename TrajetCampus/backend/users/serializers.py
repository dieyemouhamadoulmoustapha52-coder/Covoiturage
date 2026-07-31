from rest_framework import serializers

from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = (
            "username",
            "email",
            "password",
            "role",
            "student_card_number",
            "student_card",
            "phone_number",
        )

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "username",
            "email",
            "role",
            "role_display",
            "student_card_number",
            "student_card",
            "is_verified",
            "phone_number",
            "is_moderator",
        )
        read_only_fields = ("student_card_number", "is_verified")


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            "student_card",
            "phone_number",
        )
