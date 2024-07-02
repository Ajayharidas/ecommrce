from django.contrib import admin
from order.models import Order, OrderedProduct

admin.site.register(Order)
admin.site.register(OrderedProduct)
