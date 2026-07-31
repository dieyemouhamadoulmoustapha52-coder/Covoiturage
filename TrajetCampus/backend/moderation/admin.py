from django.contrib import admin

from .models import ModerationAlert


@admin.register(ModerationAlert)
class ModerationAlertAdmin(admin.ModelAdmin):
    list_display = ("report", "is_read", "created_at")
    list_filter = ("is_read",)
