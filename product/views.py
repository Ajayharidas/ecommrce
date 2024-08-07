from django.db.models.query import QuerySet
from django.http.response import HttpResponse as HttpResponse
from django.shortcuts import render
from django.views import generic
from brand.models import Brand
from product.models import Product, ProductImages, ProductSize, Size
from category.models import Category
from django.db.models import Count, Q, F
from django.http import JsonResponse
import json


class ProductListView(generic.ListView):
    model = Product
    template_name = "index.html"
    paginate_by = 1
    context_object_name = "data"

    def get_queryset(self):
        return Product.objects.filter(
            Q(category__id=self.kwargs.get("pk"))
            | Q(category__parent__id=self.kwargs.get("pk"))
        ).distinct()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        products_queryset = self.get_queryset()
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
                    "email": product.brand.email,
                    "phone": product.brand.phone,
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

        categories = Category.objects.filter(
            product__in=products_queryset, parent__id=self.kwargs.get("pk")
        ).distinct()

        sizes = Size.objects.filter(
            productsize__product__in=products_queryset
        ).distinct()

        brands = Brand.objects.filter(product__in=products_queryset).distinct()

        filter_data = {
            "categories": list(
                {
                    "id": category.id,
                    "name": category.name,
                    "parent": (category.parent.id, category.parent.name),
                }
                for category in categories
            ),
            "brands": list({"id": brand.id, "name": brand.name} for brand in brands),
            "sizes": list({"id": size.id, "name": size.name} for size in sizes),
        }

        context["data"] = json.dumps({"products": product_data, "filters": filter_data})
        return context


class ProductDetailView(generic.DetailView):
    model = Product
    template_name = "product/product.html"
    context_object_name = "product"

    def get_queryset(self):
        # change model to productsize and change lookup accordingly
        product = self.model.objects.filter(slug__iexact=self.kwargs.get("slug"))
        print(product)
        return product


class ProductFilterView(generic.View):
    def get(self, request, *args, **kwargs):
        category = int(request.GET.get("category", ""))
        subcategories = [
            int(subcategory)
            for subcategory in request.GET.getlist("subcategories[]", [])
        ]
        brands = [int(brand) for brand in request.GET.getlist("brands[]", [])]
        sizes = [int(size) for size in request.GET.getlist("sizes[]", [])]

        queryset = Product.objects.all()

        if category:
            queryset = queryset.filter(category__id=category)

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
                    "email": product.brand.email,
                    "phone": product.brand.phone,
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
