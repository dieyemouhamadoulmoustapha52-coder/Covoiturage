from django.urls import path

from .views import (
    RatingCreateView,
    ReportCreateView,
    ReservationCreateView,
    ReservationListView,
    ReservationStatusView,
    UserRatingView,
)

urlpatterns = [
    path("trips/<int:trip_id>/reservations/", ReservationCreateView.as_view(), name="reservation-create"),
    path("trips/<int:trip_id>/reports/", ReportCreateView.as_view(), name="report-create"),
    path("reservations/", ReservationListView.as_view(), name="reservation-list"),
    path("reservations/<int:pk>/", ReservationStatusView.as_view(), name="reservation-status"),
    path("reservations/<int:pk>/rating/", RatingCreateView.as_view(), name="rating-create"),
    path("users/<int:user_id>/rating/", UserRatingView.as_view(), name="user-rating"),
]
