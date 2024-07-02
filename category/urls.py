from django.urls import path
from category.views import CreateCategoryView

app_name = "category"

urlpatterns = [
    path("create", CreateCategoryView.as_view(), name="create"),
]
