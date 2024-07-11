from django.urls import path
from user.views import (
    HomeView,
    AddToCartView,
    CartView,
)

urlpatterns = [
    path("/", HomeView.as_view(), name="home"),
    path("home", HomeView.as_view(), name="home"),
    path("add_to_cart", AddToCartView.as_view(), name="add_to_cart"),
    path("cart", CartView.as_view(), name="cart"),
]
