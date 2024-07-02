from django.urls import path
from user.views import (
    HomeView,
    AddToCartView,
    CartView,
    CustomSignupView,
)

urlpatterns = [
    path("home", HomeView.as_view(), name="home"),
    # path("register", UserRegistrationView.as_view(), name="register"),
    # path("logout", UserLogoutView.as_view(), name="logout"),
    path("add_to_cart", AddToCartView.as_view(), name="add_to_cart"),
    path("cart", CartView.as_view(), name="cart"),
    path("signup/", CustomSignupView.as_view(), name="signup"),
]
