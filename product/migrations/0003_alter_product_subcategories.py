# Generated by Django 5.0.6 on 2024-06-24 08:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0002_category_parent_delete_subcategory'),
        ('product', '0002_alter_product_slug'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='subcategories',
            field=models.ManyToManyField(to='category.category'),
        ),
    ]
