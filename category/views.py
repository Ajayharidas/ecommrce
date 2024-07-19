import json
from typing import Any
from django.db import IntegrityError
from django.db.models.query import QuerySet
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import render
from django.views import generic
from category.models import Category
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


class CategoryCreateListView(generic.ListView):
    model = Category
    template_name = "index.html"
    context_object_name = "categories"

    def get_queryset(self):
        return super().get_queryset().filter(parent__isnull=True)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        category_queryset = context[self.context_object_name]
        data = [
            {"id": category.id, "name": category.name} for category in category_queryset
        ]
        context["data"] = json.dumps(data)
        return context


@method_decorator(csrf_exempt, name="dispatch")
class CategoryCreateView(generic.View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError as e:
            return JsonResponse({"message": f"Invalid JSON: {str(e)}"}, status=400)

        new_category = data.get("category")
        parent_category = data.get("parent")
        print(new_category, parent_category)

        if not new_category:
            return JsonResponse(
                {"message": "Category name can't be empty..."}, status=400
            )

        try:
            category, created = Category.objects.get_or_create(
                name=new_category,
                parent=Category.objects.get(
                    id=int(parent_category) if parent_category else None
                ),
            )
        except IntegrityError:
            return JsonResponse(
                {"message": "A category with this name already exists."}, status=400
            )

        if created:
            return JsonResponse(
                {"message": "New category created successfully..."}, status=201
            )

        return JsonResponse({"message": "Category already exists..."}, status=200)
