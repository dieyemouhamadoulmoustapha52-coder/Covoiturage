from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import CustomUser

from .models import ModerationAlert
from .permissions import IsModerator
from .serializers import AlertSerializer, ReportDetailSerializer, UserCardSerializer


class AlertListView(APIView):
    permission_classes = [IsModerator]

    def get(self, request):
        alerts = ModerationAlert.objects.select_related(
            "report__trip", "report__reporter"
        ).order_by("-created_at")
        return Response(AlertSerializer(alerts, many=True).data)


class ReportDetailView(APIView):
    permission_classes = [IsModerator]

    def get(self, request, pk):
        try:
            alert = ModerationAlert.objects.select_related(
                "report__trip", "report__reporter"
            ).get(report_id=pk)
        except ModerationAlert.DoesNotExist:
            return Response(
                {"detail": "Aucune alerte pour ce signalement."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not alert.is_read:
            alert.is_read = True
            alert.save()
        return Response(ReportDetailSerializer(alert).data)


class ReportResolveView(APIView):
    permission_classes = [IsModerator]

    def post(self, request, pk):
        try:
            alert = ModerationAlert.objects.select_related("report").get(report_id=pk)
        except ModerationAlert.DoesNotExist:
            return Response(
                {"detail": "Aucune alerte pour ce signalement."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not alert.is_read:
            return Response(
                {"detail": "Examinez d'abord le signalement avant de le clôturer."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        alert.report.resolved = True
        alert.report.save()
        return Response(ReportDetailSerializer(alert).data)


class UserSuspendView(APIView):
    permission_classes = [IsModerator]

    def post(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response(
                {"detail": "Utilisateur introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if user.is_moderator:
            return Response(
                {"detail": "Impossible de suspendre un modérateur."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not user.is_active or user.suspended_until:
            return Response(
                {"detail": "Ce compte est déjà suspendu."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            days = int(request.data.get("days", 7))
        except (TypeError, ValueError):
            days = 7
        days = max(1, min(days, 30))
        user.is_active = False
        user.suspended_until = timezone.now() + timedelta(days=days)
        user.save()
        return Response(
            {
                "detail": (
                    f"Compte {user.username} suspendu jusqu'au "
                    f"{user.suspended_until:%d/%m/%Y}."
                ),
                "suspended_until": user.suspended_until,
            }
        )


class UserReinstateView(APIView):
    permission_classes = [IsModerator]

    def post(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response(
                {"detail": "Utilisateur introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if user.is_active and not user.suspended_until:
            return Response(
                {"detail": "Ce compte n'est pas suspendu."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.is_active = True
        user.suspended_until = None
        user.save()
        return Response(
            {"detail": f"Compte {user.username} réactivé."},
        )


class UserCardListView(APIView):
    permission_classes = [IsModerator]

    def get(self, request):
        users = CustomUser.objects.all().order_by("-date_joined")
        return Response(UserCardSerializer(users, many=True).data)


class UserVerifyToggleView(APIView):
    permission_classes = [IsModerator]

    def post(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response(
                {"detail": "Utilisateur introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        user.is_verified = not user.is_verified
        user.save(update_fields=["is_verified"])
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "is_verified": user.is_verified,
            }
        )
