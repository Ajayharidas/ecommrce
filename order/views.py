from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.generic import ListView, View
from order.models import Order, OrderedProduct
from user.models import Cart
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json


class OrderListView(ListView):
    model = Order
    template_name = "order/orders.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        orders = self.model.objects.filter(user=self.request.user).prefetch_related(
            "ordered_products"
        )
        # for order in orders:
        #     p = order.ordered_products.all()
        #     for i in p:
        #         print(i.product.name)
        context["orders"] = orders
        return context


@method_decorator(csrf_exempt, name="dispatch")
class OrderCreateView(View):
    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            user = request.user
            print(user)
            cart_products = Cart.objects.filter(user=user)
            print(cart_products)
            order = Order.objects.create(user=user)
            if order:
                products = [
                    OrderedProduct(
                        order=order,
                        product=obj.product,
                        quantity=obj.quantity,
                        price=int(obj.product.price) * int(obj.quantity),
                    )
                    for obj in cart_products
                ]
                ordered_products = OrderedProduct.objects.bulk_create(products)
                print(ordered_products)
                if ordered_products:
                    cart_products.delete()
                    data = [
                        {
                            "order": obj.id,
                            "product": obj.product.name,
                            "quantity": obj.quantity,
                            "price": obj.price,
                        }
                        for obj in ordered_products
                    ]
                    return JsonResponse(
                        {
                            "message": "order placed successfully.",
                            "order": data,
                        },
                        status=201,
                    )
        return JsonResponse(
            {"message": "You need to login before order placing"}, status=401
        )
