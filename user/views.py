from django.db.models.query import QuerySet
from django.shortcuts import redirect, render
from django.views import generic
from product.models import Product, ProductSize
from user.models import CustomUser, Cart
from user.forms import CustomSignupForm
from category.models import Category
from django.utils.translation import gettext_lazy as _
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpRequest, HttpResponse, JsonResponse
import json
from allauth.account.views import SignupView, LoginView
from django.utils import timezone
from allauth.account.forms import LoginForm


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

    # def get_queryset(self):
    # return self.model.objects.filter(parent=None)

    # def render_to_response(self, context, **response_kwargs):
    #     self.request.session["created_time"] = str(timezone.now)
    #     queryset = self.get_queryset()
    #     data = [
    #         {
    #             "id": category.id,
    #             "name": category.name,
    #             "parent": (
    #                 {"id": category.parent.id, "name": category.parent.name}
    #                 if category.parent
    #                 else None
    #             ),
    #         }
    #         for category in queryset
    #     ]
    #     return JsonResponse(data, safe=False)


class CustomSignupView(SignupView):
    form_class = CustomSignupForm
    template_name = "index.html"


@method_decorator(csrf_exempt, name="dispatch")
class AddToCartView(generic.View):
    def cart_operation(self, user=None, *args, **kwargs):
        print(kwargs)
        product = kwargs.get("product")
        product = ProductSize.objects.get(id=product)
        session_key = kwargs.get("session_key")
        action = kwargs.get("action")
        print(product, user, session_key, action)
        cart, created = Cart.objects.get_or_create(
            user=user,
            product=product,
            session_key=session_key,
        )
        if action and cart:
            if action == "decrement":
                if cart.quantity > 0:
                    print(product.stock)
                    cart.quantity -= 1
                    product.stock += 1
            else:
                cart.quantity += 1
                product.stock -= 1

            product.save()
            if cart.quantity == 0:
                cart.delete()
                return 0, product.stock
            cart.save()
            return cart, product.stock
        product.stock -= 1
        print(product.stock)
        product.save()
        return 1, product.stock

    def post(self, request, *args, **kwargs):
        print(request.session.session_key)
        try:
            data = json.loads(request.body)
            product = int(data.get("product"))

            if product:
                action = data.get("action")
                if request.user.is_authenticated:
                    cart, stock = self.cart_operation(
                        user=request.user,
                        product=product,
                        session_key=request.session.session_key,
                        action=action,
                    )

                else:
                    cart, stock = self.cart_operation(
                        product=product,
                        session_key=request.session.session_key,
                        action=action,
                    )
                print(cart)
                return JsonResponse(
                    {
                        "message": "updated cart successfully",
                        "quantity": cart if isinstance(cart, int) else cart.quantity,
                        "stock": stock,
                    },
                    status=201,
                )
        except json.JSONDecodeError:
            print("hi")
            return JsonResponse({"message": "Invalid JSON data"}, status=400)


class CartView(generic.ListView):
    model = Cart
    template_name = "user/cart.html"
    context_object_name = "items"

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return self.model.objects.filter(
                user=self.request.user, session_key=self.request.session.session_key
            )
        return self.model.objects.filter(session_key=self.request.session.session_key)


# class UserRegistrationView(generic.CreateView):
#     model = CustomUser
#     form_class = UserRegistrationForm
#     # template_name = "user/register.html"
#     template_name_suffix = "_user_form"
#     success_url = "home"

#     def get_template_names(self):
#         template_names = super().get_template_names()
#         template_names.append("user/register.html")
#         return template_names


# class UserLoginView(generic.FormView):
#     form_class = UserLoginForm
#     template_name = "user/login.html"

#     def post(self, request, *args, **kwargs):
#         username = request.POST["username"]
#         password = request.POST["password"]
#         print(username, password)
#         if username and password:
#             request.session["uid"] = request.user.id
#             print(request.session["uid"])
#             user = authenticate(request, username=username, password=password)
#             if user is not None:
#                 login(request, user)
#                 return JsonResponse(
#                     {
#                         "message": "login successfull.",
#                         "redirect_url": (
#                             "/product/product/{}".format(request.session["pslug"])
#                             if request.session["pslug"]
#                             else "/home"
#                         ),
#                     }
#                 )
#         return JsonResponse({"message": "login unsuccessfull."})


# class UserLogoutView(generic.RedirectView):
#     pattern_name = "home"

#     def get_redirect_url(self, *args, **kwargs):
#         self.request.session["uid"] = ""
#         logout(self.request)
#         return super().get_redirect_url(*args, **kwargs)
