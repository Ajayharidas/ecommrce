from django.contrib import admin
from product.models import Product, ProductImages, Size, ProductSize

admin.site.register(Product)
admin.site.register(ProductImages)
admin.site.register(Size)
admin.site.register(ProductSize)
