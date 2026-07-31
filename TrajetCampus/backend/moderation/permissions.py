from rest_framework.permissions import BasePermission


class IsModerator(BasePermission):
    message = "Réservé au modérateur."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_moderator
        )
