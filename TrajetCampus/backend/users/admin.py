from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (
            "Informations TrajetCampus",
            {"fields": ("role", "student_card_number", "student_card", "phone_number")},
        ),
        ("Statuts", {"fields": ("is_moderator", "is_verified", "suspended_until")}),
    )
    list_display = ("username", "email", "role", "student_card_number", "is_verified", "is_staff", "is_moderator", "suspended_until")
    list_filter = ("role", "is_verified", "is_staff", "is_moderator")
