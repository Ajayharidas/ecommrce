from django import forms
from user.models import CustomUser
from django.utils.translation import gettext_lazy as _
from allauth.account.forms import SignupForm


# this custom form is registered in the settings.py where ACCOUNT_FORMS is specified
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
        # print(self.fields)

    def save(self, request):
        user = super(CustomSignupForm, self).save(request)
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        user.save()
        return user

