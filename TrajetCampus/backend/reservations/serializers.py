from rest_framework import serializers

from .models import Rating, Report, Reservation


class ReservationSerializer(serializers.ModelSerializer):
    passenger_username = serializers.CharField(source="passenger.username", read_only=True)
    driver_username = serializers.CharField(source="trip.driver.username", read_only=True)
    trip_status = serializers.CharField(source="trip.status", read_only=True)
    trip_departure = serializers.CharField(source="trip.departure_region", read_only=True)
    trip_arrival = serializers.CharField(source="trip.arrival_region", read_only=True)
    trip_time = serializers.DateTimeField(source="trip.departure_time", read_only=True)
    rated_by_me = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = (
            "id",
            "trip",
            "passenger",
            "passenger_username",
            "driver_username",
            "trip_status",
            "trip_departure",
            "trip_arrival",
            "trip_time",
            "status",
            "rated_by_me",
            "created_at",
        )
        read_only_fields = ("passenger", "status", "created_at")

    def get_rated_by_me(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Rating.objects.filter(
            reservation=obj,
            rated_by=request.user,
        ).exists()


class RatingSerializer(serializers.ModelSerializer):
    rated_by_username = serializers.CharField(source="rated_by.username", read_only=True)

    class Meta:
        model = Rating
        fields = ("id", "reservation", "rating", "comment", "rated_by", "rated_by_username", "created_at")
        read_only_fields = ("reservation", "rated_by", "created_at")


class ReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source="reporter.username", read_only=True)

    class Meta:
        model = Report
        fields = ("id", "trip", "reporter", "reporter_username", "reason", "description", "resolved", "created_at")
        read_only_fields = ("trip", "reporter", "resolved", "created_at")
