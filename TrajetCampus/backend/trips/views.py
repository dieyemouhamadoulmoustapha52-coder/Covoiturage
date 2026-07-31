from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from reservations.models import Reservation

from .models import Trip, TripLocation
from .serializers import TripLocationSerializer, TripSerializer


class TripListCreateView(generics.ListCreateAPIView):
    serializer_class = TripSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Trip.objects.filter(status=Trip.Status.SCHEDULED).order_by("departure_time")
        departure = self.request.query_params.get("departure_region")
        arrival = self.request.query_params.get("arrival_region")
        if departure:
            queryset = queryset.filter(departure_region=departure)
        if arrival:
            queryset = queryset.filter(arrival_region=arrival)
        return queryset

    def perform_create(self, serializer):
        if not self.request.user.is_verified:
            raise PermissionDenied(
                "Votre carte étudiant n'a pas encore été vérifiée par un modérateur. "
                "Vous ne pouvez pas publier de trajet pour le moment."
            )
        serializer.save(driver=self.request.user)


class TripStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            trip = Trip.objects.get(pk=pk)
        except Trip.DoesNotExist:
            return Response(
                {"detail": "Trajet introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if trip.driver != request.user:
            return Response(
                {"detail": "Seul le conducteur peut démarrer le trajet."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if trip.status != Trip.Status.SCHEDULED:
            return Response(
                {"detail": "Seul un trajet planifié peut démarrer."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        trip.status = Trip.Status.ONGOING
        trip.save()
        return Response(TripSerializer(trip).data)


class TripFinishView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            trip = Trip.objects.get(pk=pk)
        except Trip.DoesNotExist:
            return Response(
                {"detail": "Trajet introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if trip.driver != request.user:
            return Response(
                {"detail": "Seul le conducteur peut terminer le trajet."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if trip.status != Trip.Status.ONGOING:
            return Response(
                {"detail": "Seul un trajet en cours peut être terminé."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        trip.status = Trip.Status.FINISHED
        trip.save()
        return Response(TripSerializer(trip).data)


class TripLocationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            trip = Trip.objects.get(pk=pk)
        except Trip.DoesNotExist:
            return Response(
                {"detail": "Trajet introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if trip.driver != request.user:
            return Response(
                {"detail": "Seul le conducteur peut partager sa position."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if trip.status != Trip.Status.ONGOING:
            return Response(
                {
                    "detail": "Le partage de position n'est actif que pendant un trajet en cours."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = TripLocationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(trip=trip)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TripLatestLocationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            trip = Trip.objects.get(pk=pk)
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
        if trip.driver != request.user and not is_passenger:
            return Response(
                {
                    "detail": "Seul le conducteur ou un passager accepté peut voir la position."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        location = trip.locations.order_by("-recorded_at").first()
        if location is None:
            return Response(
                {"detail": "Aucune position partagée pour le moment."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(TripLocationSerializer(location).data)
