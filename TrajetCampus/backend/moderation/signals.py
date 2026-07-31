from django.db.models.signals import post_save
from django.dispatch import receiver

from reservations.models import Report

from .models import ModerationAlert


@receiver(post_save, sender=Report)
def create_alert_on_report(sender, instance, created, **kwargs):
    if created:
        ModerationAlert.objects.get_or_create(report=instance)
