from django import forms
from user.models import CustomUser
from django.utils.translation import gettext_lazy as _
from allauth.account.forms import SignupForm


class CustomSignupForm(SignupForm):
    first_name = forms.CharField(
        max_length=150,
        required=False,
        label=_("First name"),
        widget=forms.TextInput(attrs={"placeholder": "First name"}),
    )
    last_name = forms.CharField(
        max_length=150,
        required=False,
        label=_("Last name"),
        widget=forms.TextInput(attrs={"placeholder": "Last name"}),
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        print(self.fields)

    def save(self, request):
        user = super(CustomSignupForm, self).save(request)
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        user.save()
        return user
    
# class CustomLoginForm(LoginForm):
#     fields = "__all__"



# class UserRegistrationForm(forms.ModelForm):
#     password = forms.CharField(
#         label=_("Password"), widget=forms.PasswordInput(attrs={"class": "form-control"})
#     )
#     confirm_password = forms.CharField(
#         label=_("Confirm Password"),
#         widget=forms.PasswordInput(attrs={"class": "form-control"}),
#     )

#     class Meta:
#         model = CustomUser
#         fields = ("first_name", "last_name", "username", "email")
#         widgets = {
#             "first_name": forms.TextInput(attrs={"class": "form-control"}),
#             "last_name": forms.TextInput(attrs={"class": "form-control"}),
#             "username": forms.TextInput(attrs={"class": "form-control"}),
#             "email": forms.EmailInput(attrs={"class": "form-control"}),
#         }

#     def clean(self):
#         cleaned_data = super().clean()
#         password = cleaned_data.get("password")
#         confirm_password = cleaned_data.get("confirm_password")

#         if password and confirm_password and password != confirm_password:
#             self.add_error("confirm_password", _("the two password fields must match."))
#         return cleaned_data


# class UserLoginForm(forms.Form):
#     username = forms.CharField(
#         label=_("Username"), widget=forms.TextInput(attrs={"class": "form-control"})
#     )
#     password = forms.CharField(
#         label=_("Password"), widget=forms.PasswordInput(attrs={"class": "form-control"})
#     )
