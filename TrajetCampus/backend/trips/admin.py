from django.contrib import admin

from .models import Trip, TripLocation


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = (
        "departure_region",
        "arrival_region",
        "departure_time",
        "driver",
        "available_seats",
        "price_per_seat",
        "status",
    )
    list_filter = ("status", "departure_region", "arrival_region")


@admin.register(TripLocation)
class TripLocationAdmin(admin.ModelAdmin):
    list_display = ("trip", "latitude", "longitude", "recorded_at")
