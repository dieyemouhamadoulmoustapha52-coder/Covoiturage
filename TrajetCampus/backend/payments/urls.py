from django.urls import path

from .views import PaymentCreateView, PaymentListView

urlpatterns = [
    path("reservations/<int:reservation_id>/payments/", PaymentCreateView.as_view(), name="payment-create"),
    path("payments/", PaymentListView.as_view(), name="payment-list"),
]
