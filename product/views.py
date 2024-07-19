from django.db.models.query import QuerySet
from django.http.response import HttpResponse as HttpResponse
from django.shortcuts import render
from django.views import generic
from brand.models import Brand
from product.models import Gender, Product, Size
from category.models import Category
from django.db.models import Q
from django.http import JsonResponse
import json


class ProductListView(generic.ListView):
    model = Product
    template_name = "index.html"

    def get_queryset(self):
        category_id = self.kwargs.get("pk")
        return self.model.productobjects.filter(
            Q(category__id=category_id) | Q(category__parent__id=category_id)
        ).distinct()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        products_queryset = context["object_list"]
        product_data = [
            {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "slug": product.slug,
                "price": product.price,
                "brand": {
                    "id": product.brand.id,
                    "name": product.brand.name,
                },
                "images": list(
                    {"id": image.id, "name": str(image.image)}
                    for image in product.productimage.all()
                ),
                "sizes": list(
                    {"id": size.size.id, "name": size.size.name, "stock": size.stock}
                    for size in product.productsize.all()
                ),
            }
            for product in products_queryset
        ]

        genders = Gender.objects.filter(product__in=products_queryset).distinct()

        categories = (
            Category.objects.filter(product__in=products_queryset, parent__isnull=False)
            .distinct()
            .only("id", "name")
        )
        sizes = Size.objects.filter(
            productsize__product__in=products_queryset
        ).distinct()

        brands = (
            Brand.objects.filter(product__in=products_queryset)
            .distinct()
            .only("id", "name")
        )

        filter_data = {
            "categories": list(
                {
                    "id": category.id,
                    "name": category.name,
                }
                for category in categories
            ),
            "brands": list({"id": brand.id, "name": brand.name} for brand in brands),
            "sizes": list({"id": size.id, "name": size.name} for size in sizes),
            "genders": list(
                {"id": gender.id, "name": gender.name} for gender in genders
            ),
        }

        context["data"] = json.dumps({"products": product_data, "filters": filter_data})
        return context


class ProductDetailView(generic.DetailView):
    model = Product
    template_name = "index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        product = context["product"]
        product_dict = {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "brand": {"id": product.brand.id, "name": product.brand.name},
            "description": product.description,
            "sizes": [
                {"id": size.size.id, "name": size.size.name, "stock": size.stock}
                for size in product.productsize.all()
            ],
            "images": [
                {"id": image.id, "path": str(image.image)}
                for image in product.productimage.all()
            ],
        }
        context["data"] = json.dumps(product_dict)
        return context

    def get_queryset(self):
        return self.model.productobjects.all()


class ProductFilterView(generic.View):
    def get(self, request, *args, **kwargs):
        category = int(request.GET.get("category", ""))
        genders = [int(gender) for gender in request.GET.getlist("genders[]", [])]
        subcategories = [
            int(subcategory)
            for subcategory in request.GET.getlist("subcategories[]", [])
        ]
        brands = [int(brand) for brand in request.GET.getlist("brands[]", [])]
        sizes = [int(size) for size in request.GET.getlist("sizes[]", [])]

        queryset = Product.productobjects.all()

        if category:
            queryset = queryset.filter(category__id=category)

        if genders:
            queryset = queryset.filter(gender__id__in=genders)

        if subcategories:
            queryset = queryset.filter(category__id__in=subcategories)

        if brands:
            queryset = queryset.filter(brand__id__in=brands)

        if sizes:
            queryset = queryset.filter(productsize__size__id__in=sizes)

        queryset = queryset.distinct()

        data = list(
            {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "slug": product.slug,
                "price": product.price,
                "brand": {
                    "id": product.brand.id,
                    "name": product.brand.name,
                },
                "images": list(
                    {"id": image.id, "name": str(image.image)}
                    for image in product.productimage.all()
                ),
                "sizes": list(
                    {"id": size.size.id, "name": size.size.name, "stock": size.stock}
                    for size in product.productsize.all()
                ),
            }
            for product in queryset
        )
        return JsonResponse(data, safe=False)
    

