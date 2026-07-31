from django.contrib import admin

from .models import Rating, Report, Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("trip", "passenger", "status", "created_at")
    list_filter = ("status",)


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ("reservation", "rating", "rated_by", "created_at")


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("trip", "reporter", "reason", "resolved", "created_at")
    list_filter = ("reason", "resolved")
