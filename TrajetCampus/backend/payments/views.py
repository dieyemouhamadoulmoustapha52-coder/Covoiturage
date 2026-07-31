from uuid import uuid4

from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from reservations.models import Reservation

from .models import Payment
from .serializers import PaymentSerializer


class PaymentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):
        try:
            reservation = Reservation.objects.get(pk=reservation_id)
        except Reservation.DoesNotExist:
            return Response(
                {"detail": "Réservation introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if reservation.passenger != request.user:
            return Response(
                {"detail": "Seul le passager peut payer son trajet."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if reservation.status != Reservation.Status.ACCEPTED:
            return Response(
                {"detail": "Seule une réservation acceptée peut être payée."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if reservation.trip.status != "finished":
            return Response(
                {
                    "detail": "Le paiement se fait obligatoirement une fois le trajet terminé."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if hasattr(reservation, "payment"):
            return Response(
                {"detail": "Cette réservation a déjà été payée."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        method = request.data.get("method")
        if method not in {Payment.Method.WAVE, Payment.Method.ORANGE}:
            return Response(
                {"detail": "Méthode invalide. Choisissez wave ou orange."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        reference = f"TC-{reservation.id}-{uuid4().hex[:8].upper()}"
        payment = Payment.objects.create(
            reservation=reservation,
            method=method,
            amount=reservation.trip.price_per_seat,
            status=Payment.Status.PAID,
            reference=reference,
            paid_at=timezone.now(),
        )
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class PaymentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = Payment.objects.filter(
            Q(reservation__passenger=request.user) | Q(reservation__trip__driver=request.user)
        ).order_by("-created_at")
        return Response(PaymentSerializer(payments, many=True).data)
