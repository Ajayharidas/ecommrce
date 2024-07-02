from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from user.models import CustomUser, Cart
from django.forms import TextInput, Textarea, CharField
from django.db import models
from django.utils.translation import gettext_lazy as _


class CustomAdminConfig(UserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "email", "about")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "user_permissions",
                    "groups",
                )
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2"),
            },
        ),
    )
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "is_superuser",
    )
    search_fields = ("username", "first_name", "last_name", "email")
    ordering = ("-date_joined",)
    formfield_overrides = {
        models.TextField: {"widget": Textarea(attrs={"rows": 20, "cols": 60})}
    }


admin.site.register(CustomUser, CustomAdminConfig)
admin.site.register(Cart)
