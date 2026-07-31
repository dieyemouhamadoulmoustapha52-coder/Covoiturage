from django.db import models

from reservations.models import Report


class ModerationAlert(models.Model):
    report = models.OneToOneField(
        Report,
        on_delete=models.CASCADE,
        related_name="alert",
        verbose_name="Signalement",
    )
    is_read = models.BooleanField(default=False, verbose_name="Lu par le modérateur")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé à")

    def __str__(self):
        return f"Alerte — {self.report}"
