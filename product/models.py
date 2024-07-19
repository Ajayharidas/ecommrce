from django.db import models
from django.utils.translation import gettext_lazy as _
from brand.models import Brand
from category.models import Category
from django.template.defaultfilters import slugify
from django.db.models import Prefetch
from django.db import connection


class Gender(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    class ProductManager(models.Manager):

        def get_queryset(self):
            products = (
                super()
                .get_queryset()
                .select_related("brand")
                .prefetch_related(
                    "productimage",
                    Prefetch(
                        "productsize",
                        queryset=ProductSize.objects.select_related("size"),
                    ),
                )
            )
            return products

    name = models.CharField(_("Product"), max_length=150)
    description = models.TextField(_("Description"), max_length=500)
    slug = models.SlugField(blank=True)
    price = models.IntegerField()
    category = models.ManyToManyField(Category, related_name="product")
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name="product")
    gender = models.ManyToManyField(
        Gender,
        null=True,
        blank=True,
        related_name="product",
    )
    objects = models.Manager()
    productobjects = ProductManager()

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ProductImages(models.Model):
    image = models.ImageField(upload_to="product_images")
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="productimage"
    )

    def __str__(self):
        return self.product.name


class Size(models.Model):
    name = models.CharField(max_length=10)

    def __str__(self):
        return self.name


class ProductSize(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="productsize"
    )
    size = models.ForeignKey(Size, on_delete=models.CASCADE, related_name="productsize")
    stock = models.PositiveIntegerField(default=0)

    class Meta:
        # db_table = "productsize"
        # verbose_name = "Product Size"
        # verbose_name_plural = "Product Sizes"
        constraints = [
            models.UniqueConstraint(
                fields=["product", "size"], name="unique_product_size"
            )
        ]

    def __str__(self):
        return f"{self.product.name} - {self.size.name}"

    def display_name(self):
        return self.size.name
