# Generated by Django 5.0.6 on 2024-06-24 17:11

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0008_alter_productimages_product'),
        ('user', '0007_alter_cart_product_size'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='cart',
            name='product_size',
        ),
        migrations.AddField(
            model_name='cart',
            name='product',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='product.product'),
        ),
    ]
