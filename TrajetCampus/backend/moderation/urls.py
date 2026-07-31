from django.urls import path

from .views import (
    AlertListView,
    ReportDetailView,
    ReportResolveView,
    UserCardListView,
    UserReinstateView,
    UserSuspendView,
    UserVerifyToggleView,
)

urlpatterns = [
    path("moderation/alerts/", AlertListView.as_view(), name="moderation-alerts"),
    path("moderation/reports/<int:pk>/", ReportDetailView.as_view(), name="moderation-report-detail"),
    path("moderation/reports/<int:pk>/resolve/", ReportResolveView.as_view(), name="moderation-report-resolve"),
    path("moderation/users/", UserCardListView.as_view(), name="moderation-users"),
    path("moderation/users/<int:pk>/verify/", UserVerifyToggleView.as_view(), name="moderation-user-verify"),
    path("moderation/users/<int:pk>/suspend/", UserSuspendView.as_view(), name="moderation-user-suspend"),
    path("moderation/users/<int:pk>/reinstate/", UserReinstateView.as_view(), name="moderation-user-reinstate"),
]
