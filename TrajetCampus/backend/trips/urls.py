from django.urls import path

from .views import (
    TripFinishView,
    TripLatestLocationView,
    TripListCreateView,
    TripLocationCreateView,
    TripStartView,
)

urlpatterns = [
    path("trips/", TripListCreateView.as_view(), name="trip-list-create"),
    path("trips/<int:pk>/start/", TripStartView.as_view(), name="trip-start"),
    path("trips/<int:pk>/finish/", TripFinishView.as_view(), name="trip-finish"),
    path("trips/<int:pk>/locations/", TripLocationCreateView.as_view(), name="trip-location-create"),
    path("trips/<int:pk>/locations/latest/", TripLatestLocationView.as_view(), name="trip-location-latest"),
]
