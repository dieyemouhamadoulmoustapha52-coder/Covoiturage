from rest_framework import serializers

from users.models import CustomUser

from .models import ModerationAlert


class AlertSerializer(serializers.ModelSerializer):
    report_id = serializers.IntegerField(source="report.id", read_only=True)
    reason = serializers.CharField(source="report.reason", read_only=True)
    reason_display = serializers.CharField(source="report.get_reason_display", read_only=True)
    description = serializers.CharField(source="report.description", read_only=True)
    reporter_id = serializers.IntegerField(source="report.reporter.id", read_only=True)
    reporter_username = serializers.CharField(source="report.reporter.username", read_only=True)
    trip_id = serializers.IntegerField(source="report.trip.id", read_only=True)
    trip_label = serializers.SerializerMethodField()

    class Meta:
        model = ModerationAlert
        fields = (
            "id",
            "report_id",
            "reason",
            "reason_display",
            "description",
            "reporter_id",
            "reporter_username",
            "trip_id",
            "trip_label",
            "is_read",
            "created_at",
        )

    def get_trip_label(self, obj):
        return str(obj.report.trip)


class ReportDetailSerializer(serializers.ModelSerializer):
    report_id = serializers.IntegerField(source="report.id", read_only=True)
    reason = serializers.CharField(source="report.reason", read_only=True)
    reason_display = serializers.CharField(source="report.get_reason_display", read_only=True)
    description = serializers.CharField(source="report.description", read_only=True)
    reporter_id = serializers.IntegerField(source="report.reporter.id", read_only=True)
    reporter_username = serializers.CharField(source="report.reporter.username", read_only=True)
    reporter_suspended = serializers.DateTimeField(
        source="report.reporter.suspended_until",
        read_only=True,
    )
    trip_id = serializers.IntegerField(source="report.trip.id", read_only=True)
    trip_label = serializers.SerializerMethodField()
    driver_username = serializers.CharField(source="report.trip.driver.username", read_only=True)
    resolved = serializers.BooleanField(source="report.resolved", read_only=True)

    class Meta:
        model = ModerationAlert
        fields = (
            "id",
            "report_id",
            "reason",
            "reason_display",
            "description",
            "reporter_id",
            "reporter_username",
            "reporter_suspended",
            "trip_id",
            "trip_label",
            "driver_username",
            "resolved",
            "is_read",
            "created_at",
        )

    def get_trip_label(self, obj):
        return str(obj.report.trip)


class UserCardSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "username",
            "email",
            "role",
            "role_display",
            "student_card_number",
            "student_card",
            "is_verified",
            "date_joined",
        )
