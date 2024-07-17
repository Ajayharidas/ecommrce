from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from product.models import Product, ProductSize
from django.db.models import Prefetch


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError("You must provide a username.")
        if not email:
            raise ValueError("Email can't be empty.")

        email = self.normalize_email(email)
        user = self.model(
            username=username, email=email, password=password, **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(username, email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(
        _("username"),
        max_length=150,
        unique=True,
        help_text=_("username required, Max. 150 characters allowed"),
        error_messages={"unique": _("username already exists.")},
    )
    first_name = models.CharField(_("first_name"), max_length=150, blank=True)
    last_name = models.CharField(_("last_name"), max_length=150, blank=True)
    email = models.EmailField(
        _("email"),
        unique=True,
        help_text=_("email required."),
        error_messages={"unique": _("email already exists.")},
    )
    about = models.TextField(_("about"), max_length=500, blank=True)
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Designates whether the user can log into this admin site."),
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Designates whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )
    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)

    user_permissions = models.ManyToManyField(
        "auth.Permission",
        verbose_name=_("user permissions"),
        blank=True,
        related_name="customuser_set",
        help_text=_("Specific permissions for this user."),
        related_query_name="user",
    )

    objects = CustomUserManager()

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username

    def clean(self):
        return super().clean()

    def get_full_name(self):
        full_name = "{} {}".format(self.first_name, self.last_name)
        return full_name

    def get_short_name(self):
        return self.first_name


class Cart(models.Model):
    class CartManager(models.Manager):
        def get_queryset(self):
            return (
                super()
                .get_queryset()
                .select_related("product", "user")
                .prefetch_related(
                    Prefetch("product__product"),
                    Prefetch("product__product__brand"),
                    Prefetch("product__product__productimage"),
                    Prefetch("product__product__productsize"),
                    Prefetch("product__product__productsize__size"),
                    Prefetch("product__size"),
                )
            )

    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, blank=True, null=True, related_name="cart"
    )
    product = models.ForeignKey(
        ProductSize, on_delete=models.CASCADE, related_name="cart"
    )
    quantity = models.PositiveIntegerField(default=1)
    objects = CartManager()

    def __str__(self):
        return "{} - {}".format(self.user.get_full_name(), self.product)

    def serialize(self):
        return 


class Wishlist(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return f"Wishlist of {self.user.username}"


class WishlistItem(models.Model):
    wishlist = models.ForeignKey(
        Wishlist, related_name="items", on_delete=models.CASCADE
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} in {self.wishlist.user.username}'s wishlist"
