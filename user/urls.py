from django.urls import path
from user.views import (
    HomeView,
    AddToCartView,
    CartView,
    UpdateQTYView
)

urlpatterns = [
    path("/", HomeView.as_view(), name="home"),
    path("home", HomeView.as_view(), name="home"),
    path("add_to_cart", AddToCartView.as_view(), name="add_to_cart"),
    path("update_qty", UpdateQTYView.as_view(), name="update_qty"),
    path("cart", CartView.as_view(), name="cart"),
]
