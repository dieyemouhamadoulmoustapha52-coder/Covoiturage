from django.core.management.base import BaseCommand
from django.utils import timezone

from users.models import CustomUser


class Command(BaseCommand):
    help = "Réactive les comptes dont la suspension est expirée."

    def handle(self, *args, **options):
        now = timezone.now()
        expired = CustomUser.objects.filter(
            is_active=False,
            suspended_until__isnull=False,
            suspended_until__lte=now,
        )
        count = expired.count()
        for user in expired:
            user.is_active = True
            user.suspended_until = None
            user.save()
        self.stdout.write(f"{count} compte(s) réactivé(s).")
