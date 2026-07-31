from django.db import models

from users.models import CustomUser


class Trip(models.Model):
    class Region(models.TextChoices):
        DAKAR = "Dakar", "Dakar"
        DIOURBEL = "Diourbel", "Diourbel"
        FATICK = "Fatick", "Fatick"
        KAFFRINE = "Kaffrine", "Kaffrine"
        KAOLACK = "Kaolack", "Kaolack"
        KEDOUGOU = "Kédougou", "Kédougou"
        KOLDA = "Kolda", "Kolda"
        LOUGA = "Louga", "Louga"
        MATAM = "Matam", "Matam"
        SAINT_LOUIS = "Saint-Louis", "Saint-Louis"
        SEDHIOU = "Sédhiou", "Sédhiou"
        TAMBACOUNDA = "Tambacounda", "Tambacounda"
        THIES = "Thiès", "Thiès"
        ZIGUINCHOR = "Ziguinchor", "Ziguinchor"

    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Planifié"
        ONGOING = "ongoing", "En cours"
        FINISHED = "finished", "Terminé"
        CANCELLED = "cancelled", "Annulé"

    driver = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="trips",
        verbose_name="Conducteur",
    )
    departure_region = models.CharField(
        max_length=20,
        choices=Region.choices,
        verbose_name="Région de départ",
    )
    arrival_region = models.CharField(
        max_length=20,
        choices=Region.choices,
        verbose_name="Région d'arrivée",
    )
    departure_time = models.DateTimeField(verbose_name="Date et heure de départ")
    available_seats = models.PositiveIntegerField(verbose_name="Places disponibles")
    price_per_seat = models.PositiveIntegerField(verbose_name="Prix par place (FCFA)")
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.SCHEDULED,
        verbose_name="Statut",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")

    def __str__(self):
        return f"{self.departure_region} → {self.arrival_region} ({self.driver.username})"


class TripLocation(models.Model):
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name="locations",
        verbose_name="Trajet",
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        verbose_name="Latitude",
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        verbose_name="Longitude",
    )
    recorded_at = models.DateTimeField(auto_now_add=True, verbose_name="Enregistré à")

    def __str__(self):
        return f"{self.trip} @ {self.latitude}, {self.longitude}"
