# forms.py
from django import forms
from .models import UserProfile

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['query1', 'query2']
        labels = {
            'query1': 'Query 1',
            'query2': 'Query 2',
        }
        widgets = {
            'query1': forms.TextInput(attrs={'class': 'input input-bordered w-full', 'placeholder': 'Enter query...'}),
            'query2': forms.TextInput(attrs={'class': 'input input-bordered w-full', 'placeholder': 'Enter query...'}),
        }
