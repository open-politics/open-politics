from django import forms

class VorgangActionForm(forms.Form):
    vorgang_id = forms.IntegerField(label="Vorgang ID", required=True)
