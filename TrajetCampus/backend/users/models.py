from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Étudiant"
        TEACHER = "teacher", "Enseignant"

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
        verbose_name="Rôle",
    )
    student_card_number = models.CharField(
        max_length=30,
        unique=True,
        verbose_name="Numéro de carte étudiant",
    )
    student_card = models.ImageField(
        upload_to="student_cards/",
        blank=True,
        null=True,
        verbose_name="Photo de la carte étudiant",
    )
    is_verified = models.BooleanField(
        default=False,
        verbose_name="Carte vérifiée par un modérateur",
    )
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Numéro de téléphone",
    )
    is_moderator = models.BooleanField(
        default=False,
        verbose_name="Modérateur",
    )
    suspended_until = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Suspendu jusqu'au",
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
