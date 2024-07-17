from django.shortcuts import redirect, render, get_object_or_404
from django.views import generic
from product.models import Product, ProductSize
from user.models import CustomUser, Cart, Wishlist, WishlistItem
from category.models import Category
from django.utils.translation import gettext_lazy as _
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpRequest, HttpResponse, JsonResponse
import json
from django.db.models import Q
from user.serializers import CartSerializer


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
class AddToWishlist(generic.CreateView):
    def post(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return JsonResponse(
                {"message": "You must be logged in to perform this action"}, status=403
            )

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON data"}, status=400)

        user = request.user
        product_id = data.get("product")
        if product_id is None:
            return JsonResponse({"message": "Product ID is required"}, status=400)

        product = get_object_or_404(Product, pk=product_id)
        wishlist, created = Wishlist.objects.get_or_create(user=user)
        item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist, product=product
        )
        if created:
            return JsonResponse(
                {"message": "Product added to wishlist...."}, status=201
            )
        return JsonResponse(
            {"message": "Product already in your wishlist..."}, status=200
        )


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

        qty_list = []
        query = Q()
        for item in data:
            qty_list.append(
                {
                    "product": item["product"]["id"],
                    "size": item["selectedsize"],
                    "quantity": item["quantity"],
                }
            )
            query |= Q(product_id=item["product"]["id"], size_id=item["selectedsize"])

        if query:
            products = ProductSize.objects.filter(query)

            if products:
                # Get all products already in the user's cart
                existing_cart_products = Cart.objects.filter(
                    user=request.user, product__in=products
                ).values_list("product_id", flat=True)

                # Determine which products are not in the cart
                products_to_add = [
                    product
                    for product in products
                    if product.id not in existing_cart_products
                ]

                # Determine which products are in the cart
                products_to_update = [
                    product
                    for product in products
                    if product.id in existing_cart_products
                ]

                # Bulk create new cart entries
                if products_to_add:
                    Cart.objects.bulk_create(
                        [
                            Cart(user=request.user, product=product)
                            for product in products_to_add
                        ]
                    )

                # Bulk update cart entries
                if products_to_update:
                    cart_items = Cart.objects.filter(
                        user=request.user, product__in=products_to_update
                    )

                    for cart_item in cart_items:
                        for qty in qty_list:
                            if (
                                cart_item.product.product.id == qty["product"]
                                and cart_item.product.size.id == qty["size"]
                            ):
                                cart_item.quantity = qty["quantity"]

                    Cart.objects.bulk_update(cart_items, ["quantity"])

                return JsonResponse(
                    {"message": "Updated cart successfully"}, status=201
                )

            return JsonResponse({"message": "No matching products found"}, status=404)

        return JsonResponse({"message": "Empty request"}, status=400)


@method_decorator(csrf_exempt, name="dispatch")
class CheckCartItem(generic.View):
    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {"message": "You must be logged in to perform this action"}, status=403
            )

        product = request.GET.get("product")
        size = request.GET.get("selectedsize")
        if not product or not size:
            return JsonResponse({"message": "Invalid parameters"}, status=400)

        try:
            productsize = ProductSize.objects.get(product__id=product, size__id=size)
        except ProductSize.DoesNotExist:
            return JsonResponse({"message": "No matching products found"}, status=404)

        exists = Cart.objects.filter(user=request.user, product=productsize).exists()

        return JsonResponse({"message": exists}, status=200)


@method_decorator(csrf_exempt, name="dispatch")
class CartView(generic.ListView):
    model = Cart
    template_name = "index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        products = context["object_list"]
        if products:
            serializer = CartSerializer(products=products)
            context["data"] = serializer.serialize()
        return context

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return self.model.objects.filter(user=self.request.user)


@method_decorator(csrf_exempt, name="dispatch")
class UpdateQTYView(generic.View):
    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {"message": "You must be logged in to perform this action"}, status=403
            )

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON data"}, status=400)

        product = data["product"]
        size = data["size"]
        quantity = data["quantity"]
        if product and size and quantity:
            product = ProductSize.objects.get(product_id=product, size_id=size)
            user_cart = Cart.objects.filter(user=request.user)
            if product:
                cartobj = user_cart.filter(product=product).first()
                if cartobj:
                    cartobj.quantity = int(quantity)
                    cartobj.save()
                    data = CartSerializer(products=user_cart).serialize()
                    return JsonResponse(
                        {"message": "Quantity updated successfully...", "cart": data},
                        status=200,
                    )
                return JsonResponse({"message": "No cart item found..."}, status=404)
            return JsonResponse({"message": "No matching product found..."}, status=404)
        return HttpResponse({"message": "Invalid JSON data...."}, status=400)


@method_decorator(csrf_exempt, name="dispatch")
class UpdateSizeView(generic.View):
    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {"message": "You must be logged in to perform this action"}, status=403
            )

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON data"}, status=400)

        cartid = data.get("cart")
        size = data.get("size")
        product = data.get("product")

        if not (cartid and size and product):
            return JsonResponse(
                {"message": "Missing cart, size, or product data"}, status=400
            )
        try:
            product_size = ProductSize.objects.get(product__id=product, size__id=size)
        except ProductSize.DoesNotExist:
            return JsonResponse({"message": "No matching product found"}, status=404)

        cart = Cart.objects.filter(user=request.user)
        current_size_item = cart.filter(id=cartid).first()

        if not current_size_item:
            return JsonResponse({"message": "Cart item not found"}, status=404)

        new_size_item = cart.filter(product__id=product_size.id).first()

        if new_size_item and new_size_item.id != current_size_item.id:
            current_size_item.delete()
            data = CartSerializer(products=cart).serialize()
            return JsonResponse(
                {
                    "message": "Item with new size already exists, current item deleted",
                    "cart": data,
                },
                status=200,
            )

        current_size_item.product = product_size
        current_size_item.quantity = (
            product_size.stock
            if current_size_item.quantity > product_size.stock
            else current_size_item.quantity
        )
        current_size_item.save()
        data = CartSerializer(products=cart).serialize()
        return JsonResponse({"message": "Update successful", "cart": data}, status=200)


@method_decorator(csrf_exempt, name="dispatch")
class DeleteCartItem(generic.DeleteView):
    model = Cart

    def delete(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {"message": "You must be logged in to perform this action"}, status=403
            )
        try:
            self.object = self.get_object()
            self.object.delete()
            cart = Cart.objects.filter(user=request.user)
            data = CartSerializer(products=cart).serialize()
            return JsonResponse(
                {"message": "Item successfully removed", "cart": data}, status=200
            )
        except Cart.DoesNotExist:
            return JsonResponse({"message": "Item not found"}, status=404)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)
