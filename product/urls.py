from django.urls import path
from product.views import ProductListView, ProductDetailView, ProductFilterView

urlpatterns = [
    path("products/<int:pk>", ProductListView.as_view(), name="products"),
    path("filter/", ProductFilterView.as_view(), name="filter"),
    path("product/<slug:slug>", ProductDetailView.as_view(), name="product"),
]
