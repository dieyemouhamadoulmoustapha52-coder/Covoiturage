from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    passenger_username = serializers.CharField(
        source="reservation.passenger.username",
        read_only=True,
    )
    driver_username = serializers.CharField(
        source="reservation.trip.driver.username",
        read_only=True,
    )

    class Meta:
        model = Payment
        fields = (
            "id",
            "reservation",
            "passenger_username",
            "driver_username",
            "method",
            "amount",
            "status",
            "reference",
            "created_at",
            "paid_at",
        )
