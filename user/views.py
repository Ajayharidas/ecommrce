from django.db.models.base import Model as Model
from django.db.models.query import QuerySet
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
from user.serializers import CartSerializer, WishlistSerializer


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
                existing_cart_products = Cart.cartobjects.filter(
                    user=request.user, productsize__in=products
                ).values_list("productsize_id", flat=True)

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
                    Cart.cartobjects.bulk_create(
                        [
                            Cart(user=request.user, productsize=product)
                            for product in products_to_add
                        ]
                    )

                # Bulk update cart entries
                if products_to_update:
                    cart_items = Cart.cartobjects.filter(
                        user=request.user, productsize__in=products_to_update
                    )

                    for cart_item in cart_items:
                        for qty in qty_list:
                            if (
                                cart_item.productsize.product.id == qty["product"]
                                and cart_item.productsize.size.id == qty["size"]
                            ):
                                cart_item.quantity = qty["quantity"]

                    Cart.cartobjects.bulk_update(cart_items, ["quantity"])

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
        print(product, size)
        if not product or not size:
            return JsonResponse({"message": "Invalid parameters"}, status=400)

        try:
            productsize = ProductSize.objects.get(product_id=product, size__id=size)
        except ProductSize.DoesNotExist:
            return JsonResponse({"message": "No matching products found"}, status=404)

        exists = Cart.cartobjects.filter(
            user=request.user, productsize=productsize
        ).exists()

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
            return self.model.cartobjects.filter(user=self.request.user)


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
            user_cart = Cart.cartobjects.filter(user=request.user)
            if product:
                cartobj = user_cart.filter(productsize_id=product).first()
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

        cart = Cart.cartobjects.filter(user=request.user)
        current_size_item = cart.filter(id=cartid).first()

        if not current_size_item:
            return JsonResponse({"message": "Cart item not found"}, status=404)

        new_size_item = cart.filter(productsize_id=product_size.id).first()

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

        current_size_item.productsize = product_size
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
            cart = Cart.cartobjects.filter(user=request.user)
            data = CartSerializer(products=cart).serialize()
            return JsonResponse(
                {"message": "Item successfully removed", "cart": data}, status=200
            )
        except Cart.DoesNotExist:
            return JsonResponse({"message": "Item not found"}, status=404)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)


class WishlistView(generic.DetailView):
    model = Wishlist
    template_name = "index.html"
    context_object_name = "wishlist"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        wishlist = context.get(self.context_object_name)
        context["data"] = WishlistSerializer(wishlist).serialize() if wishlist else None
        return context

    def get_object(self):
        if not self.request.user.is_authenticated:
            return None
        return self.model.wishlistobjects.get(user__id=self.request.user.id)


@method_decorator(csrf_exempt, name="dispatch")
class DeleteWishlistItem(generic.DeleteView):
    model = WishlistItem

    def delete(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {"message": "You must be logged in to perform this action"}, status=403
            )
        try:
            self.object = self.get_object()
            wishlist = self.model.objects.filter(wishlist__user=request.user)
            if self.object not in wishlist:
                return JsonResponse({"message": "Item not found"}, status=404)

            # Delete the item
            self.object.delete()

            # Get the updated wishlist
            updated_wishlist = Wishlist.wishlistobjects.get(user=request.user)
            wishlist = WishlistSerializer(wishlist=updated_wishlist).serialize()

            return JsonResponse(
                {
                    "message": "Item successfully removed",
                    "wishlist": wishlist,
                },
                status=200,
            )
        except WishlistItem.DoesNotExist:
            return JsonResponse({"message": "Item not found"}, status=404)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)
