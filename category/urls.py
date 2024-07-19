from django.urls import path
from category.views import CategoryCreateListView, CategoryCreateView

app_name = "category"

urlpatterns = [
    path("create", CategoryCreateView.as_view(), name="create"),
    path("create-category", CategoryCreateListView.as_view(), name="create-category"),
]
