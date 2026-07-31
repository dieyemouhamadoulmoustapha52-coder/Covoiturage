from django.db.models import Avg, Count
from rest_framework import serializers

from reservations.models import Rating

from .models import Trip, TripLocation


class TripSerializer(serializers.ModelSerializer):
    driver_username = serializers.CharField(source="driver.username", read_only=True)
    driver_rating = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = (
            "id",
            "driver",
            "driver_username",
            "driver_rating",
            "departure_region",
            "arrival_region",
            "departure_time",
            "available_seats",
            "price_per_seat",
            "status",
            "created_at",
        )
        read_only_fields = ("driver", "status", "created_at")

    def get_driver_rating(self, obj):
        agg = Rating.objects.filter(
            reservation__trip__driver=obj.driver,
        ).exclude(rated_by=obj.driver).aggregate(
            average=Avg("rating"),
            count=Count("id"),
        )
        return {
            "average": round(agg["average"], 1) if agg["average"] else None,
            "count": agg["count"],
        }


class TripLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripLocation
        fields = ("id", "trip", "latitude", "longitude", "recorded_at")
        read_only_fields = ("trip", "recorded_at")
