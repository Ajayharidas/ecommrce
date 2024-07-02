from django.urls import path
from order.views import OrderListView, OrderCreateView

urlpatterns = [
    path("orders", OrderListView.as_view(), name="orders"),
    path("order_create", OrderCreateView.as_view(), name="order_create"),
]
