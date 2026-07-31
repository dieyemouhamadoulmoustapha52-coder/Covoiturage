from django.db import models

from reservations.models import Reservation


class Payment(models.Model):
    class Method(models.TextChoices):
        WAVE = "wave", "Wave"
        ORANGE = "orange", "Orange Money"

    class Status(models.TextChoices):
        PENDING = "pending", "En attente"
        PAID = "paid", "Payé"

    reservation = models.OneToOneField(
        Reservation,
        on_delete=models.CASCADE,
        related_name="payment",
        verbose_name="Réservation",
    )
    method = models.CharField(
        max_length=10,
        choices=Method.choices,
        verbose_name="Méthode de paiement",
    )
    amount = models.PositiveIntegerField(verbose_name="Montant (FCFA)")
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name="Statut",
    )
    reference = models.CharField(
        max_length=30,
        unique=True,
        verbose_name="Référence externe",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé à")
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name="Payé à")

    def __str__(self):
        return f"{self.reference} — {self.get_method_display()} — {self.amount} FCFA"
