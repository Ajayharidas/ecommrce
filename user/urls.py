from django.urls import path
from user.views import (
    HomeView,
    AddToCartView,
    AddToWishlist,
    CartView,
    UpdateQTYView,
    UpdateSizeView,
    DeleteCartItem,
    CheckCartItem,
)

urlpatterns = [
    path("/", HomeView.as_view(), name="home"),
    path("home", HomeView.as_view(), name="home"),
    path("add_to_cart", AddToCartView.as_view(), name="add_to_cart"),
    path("add_to_wishlist", AddToWishlist.as_view(), name="add_to_wishlist"),
    path("update_qty", UpdateQTYView.as_view(), name="update_qty"),
    path("update_size", UpdateSizeView.as_view(), name="update_size"),
    path(
        "delete_cart_item/<int:pk>", DeleteCartItem.as_view(), name="delete_cart_item"
    ),
    path("check_cart_item", CheckCartItem.as_view(), name="check_cart_item"),
    path("cart", CartView.as_view(), name="cart"),
]
