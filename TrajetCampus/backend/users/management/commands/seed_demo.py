# -*- coding: utf-8 -*-
"""Peuple la base avec les comptes de démonstration et quelques données.

Usage : python manage.py seed_demo
Idempotent : peut être relancé sans doublonner les données.
"""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from reservations.models import Reservation
from users.models import CustomUser


class Command(BaseCommand):
    help = "Crée les comptes de démonstration et des données d'exemple."

    def handle(self, *args, **options):
        now = timezone.now()
        users = [
            # username, password, role, carte, verified, moderator, superuser, active, suspendu_jusqu'à
            ("admin", "Admin123!", "student", "CARTE-ADMIN-1", False, False, True, True, None),
            ("Fatou", "Secret12345", "student", "CARTE-2026-002", True, False, False, True, None),
            ("modo", "Modo12345!", "student", "CARTE-MODO-1", False, True, False, True, None),
            ("Moustapha", "Test12345!", "student", "CARTE-2026-001", False, False, False, True, None),
            ("Aminata", "Test12345!", "student", "CARTE-2026-004", False, False, False, True, None),
            ("Ibrahima", "Test12345!", "student", "CARTE-2026-005", False, False, False, True, None),
            ("Ali", "Test12345!", "teacher", "CARTE-2026-003", False, False, False, True, None),
            ("Awa", "Test12345!", "student", "CARTE-2026-006", True, False, False, True, None),
            ("Ousmane", "Test12345!", "student", "CARTE-2026-007", False, False, False, True, None),
            ("Mariama", "Test12345!", "student", "CARTE-2026-008", True, False, False, True, None),
            ("Astou", "Test12345!", "student", "CARTE-2026-009", False, False, False, False, now + timedelta(days=7)),
            ("Bintou", "Test12345!", "student", "CARTE-2026-010", False, False, False, False, None),
        ]
        created = []
        for username, password, role, card, verified, mod, superuser, active, suspended_until in users:
            user, was_created = CustomUser.objects.update_or_create(
                username=username,
                defaults={
                    "email": f"{username.lower()}@isep.sn",
                    "role": role,
                    "student_card_number": card,
                    "is_verified": verified,
                    "is_moderator": mod,
                    "is_superuser": superuser,
                    "is_staff": superuser,
                    "is_active": active,
                    "suspended_until": suspended_until,
                    "phone_number": f"+22177{str(len(created) + 10).zfill(7)}",
                },
            )
            user.set_password(password)
            user.save()
            created.append((username, was_created))

        self.stdout.write(self.style.SUCCESS("Comptes OK (12) :"))
        for username, was_created in created:
            tag = "créé" if was_created else "déjà présent"
            self.stdout.write(f"  - {username} ({tag})")

        if not Reservation.objects.exists():
            self._create_sample_data()
            self.stdout.write(self.style.SUCCESS("Données d'exemple créées."))
        else:
            self.stdout.write("Réservations déjà présentes : données d'exemple ignorées.")

    def _create_sample_data(self):
        from payments.models import Payment
        from trips.models import Trip

        fatou = CustomUser.objects.get(username="Fatou")
        awa = CustomUser.objects.get(username="Awa")
        moustapha = CustomUser.objects.get(username="Moustapha")
        ibrahima = CustomUser.objects.get(username="Ibrahima")

        now = timezone.now()
        trips = [
            (fatou, "Dakar", "ISEP", now + timedelta(days=1, hours=1), 1500, 3),
            (fatou, "Dakar", "ISEP", now + timedelta(days=2, hours=2), 1500, 2),
            (awa, "Rufisque", "ISEP", now + timedelta(days=1, hours=3), 1000, 4),
            (fatou, "Thiès", "ISEP", now - timedelta(days=2, hours=1), 2000, 3),
        ]
        trip_objects = []
        for driver, dep, arr, when, price, seats in trips:
            trip = Trip.objects.create(
                driver=driver,
                departure_region=dep,
                arrival_region=arr,
                departure_time=when,
                price=price,
                seats=seats,
                status="scheduled" if when > now else "finished",
            )
            trip_objects.append(trip)

        res = Reservation.objects.create(
            trip=trip_objects[0], passenger=moustapha, status="accepted"
        )
        finished_res = Reservation.objects.create(
            trip=trip_objects[3], passenger=ibrahima, status="finished"
        )
        Payment.objects.create(
            reservation=finished_res,
            amount=trip_objects[3].price,
            method="wave",
            reference="TC-DEMO-0001",
            status="completed",
        )
        self.stdout.write(f"  - 4 trajets, 2 réservations, 1 paiement ({res}, {finished_res})")
