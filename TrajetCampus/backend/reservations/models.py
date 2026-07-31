from django.db import models

from trips.models import Trip
from users.models import CustomUser


class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "En attente"
        ACCEPTED = "accepted", "Acceptée"
        REFUSED = "refused", "Refusée"
        CANCELLED = "cancelled", "Annulée"

    passenger = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="reservations",
        verbose_name="Passager",
    )
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name="reservations",
        verbose_name="Trajet",
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name="Statut",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créée le")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["trip", "passenger"],
                name="unique_trip_passenger",
            )
        ]

    def __str__(self):
        return f"{self.passenger.username} → {self.trip} ({self.get_status_display()})"


class Rating(models.Model):
    reservation = models.ForeignKey(
        Reservation,
        on_delete=models.CASCADE,
        related_name="ratings",
        verbose_name="Réservation",
    )
    rating = models.PositiveSmallIntegerField(verbose_name="Note (1 à 5)")
    comment = models.TextField(blank=True, verbose_name="Commentaire")
    rated_by = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="ratings_given",
        verbose_name="Noté par",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé à")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["reservation", "rated_by"],
                name="unique_rating_per_person",
            )
        ]

    def __str__(self):
        return f"Note {self.rating}/5 — {self.reservation}"


class Report(models.Model):
    class Reason(models.TextChoices):
        DANGEROUS_DRIVING = "dangerous_driving", "Conduite dangereuse"
        HARASSMENT = "harassment", "Harcèlement"
        FRAUD = "fraud", "Fraude"
        OTHER = "other", "Autre"

    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name="reports",
        verbose_name="Trajet",
    )
    reporter = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="reports",
        verbose_name="Signaleur",
    )
    reason = models.CharField(
        max_length=30,
        choices=Reason.choices,
        verbose_name="Motif",
    )
    description = models.TextField(blank=True, verbose_name="Description")
    resolved = models.BooleanField(default=False, verbose_name="Traité par le modérateur")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé à")

    def __str__(self):
        return f"Signalement {self.get_reason_display()} — {self.trip}"
