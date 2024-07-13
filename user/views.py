from django.shortcuts import redirect, render
from django.views import generic
from product.models import Product, ProductSize
from user.models import CustomUser, Cart
from category.models import Category
from django.utils.translation import gettext_lazy as _
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpRequest, HttpResponse, JsonResponse
import json
from django.db.models import Q


class HomeView(generic.ListView):
    model = Category
    template_name = "index.html"
    context_object_name = "categories"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        categories = context[
            "categories"
        ]  # or use default name 'object_list' and remove context_object_name='categories'
        user = self.request.user
        self.request.session["user"] = (
            {
                "id": user.id,
                "name": user.username,
                "is_authenticated": user.is_authenticated,
            }
            if user.is_authenticated
            else {"id": None, "name": None, "is_authenticated": False}
        )
        # print(self.request.session.session_key)
        obj = {
            "homedata": [
                {
                    "id": category.id,
                    "name": category.name,
                }
                for category in categories
            ],
            "sessiondata": self.request.session["user"],
        }
        context["data"] = json.dumps(obj)
        return context


@method_decorator(csrf_exempt, name="dispatch")
class AddToCartView(generic.View):
    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {"message": "You must be logged in to perform this action"}, status=403
            )

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON data"}, status=400)

        query = Q()
        for item in data:
            query |= Q(product_id=item["product"]["id"], size_id=item["selectedsize"])

        if query:
            products = ProductSize.objects.filter(query)

            if products:
                # Get all products already in the user's cart
                existing_cart_products = Cart.objects.filter(
                    user=request.user, product__in=products
                ).values_list("product_id", flat=True)
                print(existing_cart_products)

                # Determine which products are not in the cart
                products_to_add = [
                    product
                    for product in products
                    if product.id not in existing_cart_products
                ]
                print(products_to_add)

                # Bulk create new cart entries
                Cart.objects.bulk_create(
                    [
                        Cart(user=request.user, product=product)
                        for product in products_to_add
                    ]
                )

                return JsonResponse(
                    {"message": "Updated cart successfully"}, status=201
                )

            return JsonResponse({"message": "No matching products found"}, status=404)

        return JsonResponse({"message": "Empty request"}, status=400)


@method_decorator(csrf_exempt, name="dispatch")
class CartView(generic.ListView):
    model = Cart
    template_name = "index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        products = context["object_list"]
        if products:
            data = [
                {
                    "id": item.id,
                    "product": {
                        "id": item.product.product.id,
                        "name": item.product.product.name,
                        "desciption": item.product.product.description,
                        "slug": item.product.product.slug,
                        "price": item.product.product.price,
                        "brand": {
                            "id": item.product.product.brand.id,
                            "name": item.product.product.brand.name,
                        },
                        "images": [
                            {"id": int(image.id), "path": str(image.image)}
                            for image in item.product.product.productimage.all()
                        ],
                        "sizes": [
                            {"id": size.size.id, "name": size.size.name}
                            for size in item.product.product.productsize.all()
                        ],
                    },
                    "selectedsize": item.product.size.id,
                    "quantity": item.quantity,
                }
                for item in products
            ]
            context["data"] = json.dumps(data)
        return context

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return self.model.objects.filter(user=self.request.user)
