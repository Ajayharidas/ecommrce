from django.db import models
from django.utils.translation import gettext_lazy as _
from user.models import CustomUser
from product.models import Product
from django.utils import timezone


class Order(models.Model):
    STATUS_CHOICES = (
        ("pending", _("Pending")),
        ("out for delivery", _("Out for delivery")),
        ("delivered", _("Delivered")),
    )
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date = models.DateTimeField(_("ordered date"), default=timezone.now)
    status = models.CharField(
        _("status"), max_length=50, choices=STATUS_CHOICES, default="pending"
    )
    objects = models.Manager()

    def __str__(self):
        return self.user.username


class OrderedProduct(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="ordered_products"
    )
    product = models.ForeignKey(Product, on_delete=models.DO_NOTHING)
    quantity = models.IntegerField()
    price = models.IntegerField()

    def __str__(self):
        return self.order.user.username
