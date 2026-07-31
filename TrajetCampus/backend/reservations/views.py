from datetime import timedelta

from django.db.models import Avg, Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from trips.models import Trip

from .models import Rating, Report, Reservation
from .serializers import (
    RatingSerializer,
    ReportSerializer,
    ReservationSerializer,
)

CANCELLATION_LIMIT_DAYS = 30


class ReservationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trip_id):
        try:
            trip = Trip.objects.get(pk=trip_id, status=Trip.Status.SCHEDULED)
        except Trip.DoesNotExist:
            return Response(
                {"detail": "Trajet introuvable ou non planifié."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if trip.driver == request.user:
            return Response(
                {"detail": "Vous ne pouvez pas réserver votre propre trajet."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if Reservation.objects.filter(trip=trip, passenger=request.user).exists():
            return Response(
                {"detail": "Vous avez déjà une réservation pour ce trajet."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        occupied = Reservation.objects.filter(
            trip=trip,
            status__in=[Reservation.Status.PENDING, Reservation.Status.ACCEPTED],
        ).count()
        if occupied >= trip.available_seats:
            return Response(
                {"detail": "Plus de places disponibles sur ce trajet."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        reservation = Reservation.objects.create(trip=trip, passenger=request.user)
        return Response(
            ReservationSerializer(reservation).data,
            status=status.HTTP_201_CREATED,
        )


class ReservationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reservations = Reservation.objects.filter(
            Q(passenger=request.user) | Q(trip__driver=request.user)
        ).order_by("-created_at")
        return Response(ReservationSerializer(reservations, many=True).data)


class ReservationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            reservation = Reservation.objects.get(pk=pk)
        except Reservation.DoesNotExist:
            return Response(
                {"detail": "Réservation introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        new_status = request.data.get("status")
        if new_status not in {
            Reservation.Status.ACCEPTED,
            Reservation.Status.REFUSED,
            Reservation.Status.CANCELLED,
        }:
            return Response(
                {"detail": "Statut invalide."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if new_status in (Reservation.Status.ACCEPTED, Reservation.Status.REFUSED):
            if reservation.trip.driver != request.user:
                return Response(
                    {"detail": "Seul le conducteur peut valider ou refuser."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif new_status == Reservation.Status.CANCELLED:
            if reservation.passenger != request.user:
                return Response(
                    {"detail": "Seul le passager peut annuler sa réservation."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        if new_status == Reservation.Status.ACCEPTED:
            cutoff = timezone.now() - timedelta(days=CANCELLATION_LIMIT_DAYS)
            recent_cancellations = Reservation.objects.filter(
                passenger=reservation.passenger,
                status=Reservation.Status.CANCELLED,
                created_at__gte=cutoff,
            ).count()
            if recent_cancellations > 0:
                return Response(
                    {
                        "detail": (
                            "Règle anti-abus : ce passager a annulé un trajet "
                            "sans justification dans les 30 derniers jours."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            accepted = Reservation.objects.filter(
                trip=reservation.trip,
                status__in=[Reservation.Status.PENDING, Reservation.Status.ACCEPTED],
            ).exclude(pk=reservation.pk).count()
            if accepted >= reservation.trip.available_seats:
                return Response(
                    {"detail": "Plus de places disponibles sur ce trajet."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        reservation.status = new_status
        reservation.save()
        return Response(ReservationSerializer(reservation).data)


class RatingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            reservation = Reservation.objects.get(pk=pk)
        except Reservation.DoesNotExist:
            return Response(
                {"detail": "Réservation introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        is_concerned = (
            reservation.passenger == request.user
            or reservation.trip.driver == request.user
        )
        if not is_concerned:
            return Response(
                {"detail": "Seuls le passager ou le conducteur peuvent noter ce trajet."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if reservation.status != Reservation.Status.ACCEPTED:
            return Response(
                {"detail": "Seule une réservation acceptée peut être notée."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if reservation.trip.status != Trip.Status.FINISHED:
            return Response(
                {"detail": "La notation n'est possible qu'après un trajet terminé."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if Rating.objects.filter(
            reservation=reservation,
            rated_by=request.user,
        ).exists():
            return Response(
                {"detail": "Vous avez déjà noté cette réservation."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = RatingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(reservation=reservation, rated_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRatingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        ratings = Rating.objects.filter(
            Q(reservation__passenger_id=user_id)
            | Q(reservation__trip__driver_id=user_id),
        ).exclude(rated_by_id=user_id)
        agg = ratings.aggregate(
            average=Avg("rating"),
            count=Count("id"),
        )
        return Response(
            {
                "average": round(agg["average"], 1) if agg["average"] else None,
                "count": agg["count"],
            }
        )


class ReportCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trip_id):
        try:
            trip = Trip.objects.get(pk=trip_id)
        except Trip.DoesNotExist:
            return Response(
                {"detail": "Trajet introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        is_passenger = Reservation.objects.filter(
            trip=trip,
            passenger=request.user,
            status=Reservation.Status.ACCEPTED,
        ).exists()
        if not is_passenger:
            return Response(
                {"detail": "Seul un passager accepté peut signaler un incident."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if trip.status not in (Trip.Status.ONGOING, Trip.Status.FINISHED):
            return Response(
                {
                    "detail": "Un incident ne peut être signalé que sur un trajet en cours ou terminé."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(trip=trip, reporter=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
