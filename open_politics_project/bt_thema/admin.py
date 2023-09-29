from django.contrib import admin
from django.urls import path
from django.shortcuts import render, redirect
from .models import Vorgang
import subprocess
from .views_api import get_vorgang
from .forms import VorgangActionForm

# Admin action to fetch data from the API
def fetch_data_from_api_action(modeladmin, request, queryset):
    for vorgang in queryset:
        get_vorgang(request, vorgang.id, admin_mode=True)
    modeladmin.message_user(request, "Data fetched from the API for selected Vorgangs.")

# Admin action to run the langchain script
def run_langchain_script(modeladmin, request, queryset):
    # Path to your script
    script_path = "/opt/open-politics/open_politics_project/bt_thema/scripts/langchain_main.py"
    
    for vorgang in queryset:
        # Run the script
        result = subprocess.run(['python3', script_path], capture_output=True, text=True)
        
        # Check for errors
        if result.returncode != 0:
            modeladmin.message_user(request, f"Error running the langchain script for Vorgang ID: {vorgang.id}")
            continue
        
        # Save the script's output to the ai_summary field
        vorgang.ai_summary = result.stdout.strip()  # assuming the output is a plain text summary
        vorgang.save()
        
    modeladmin.message_user(request, "Langchain script executed for selected Vorgangs.")

class VorgangAdmin(admin.ModelAdmin):
    actions = [fetch_data_from_api_action, run_langchain_script]
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('fetch-from-api/', self.fetch_from_api_view, name='fetch-from-api'),
            path('run-langchain-script/', self.run_langchain_script_view, name='run-langchain-script'),
        ]
        return custom_urls + urls
    
    def fetch_from_api_view(self, request):
        form = VorgangActionForm(request.POST or None)
        if form.is_valid():
            id = form.cleaned_data['vorgang_id']
            message = get_vorgang(request, id, admin_mode=True)
            self.message_user(request, message)
            return redirect("..")
        context = {'form': form}
        return render(request, 'admin/action_form.html', context)

    def run_langchain_script_view(self, request):
        form = VorgangActionForm(request.POST or None)
        if form.is_valid():
            id = form.cleaned_data['vorgang_id']
            queryset = Vorgang.objects.filter(pk=id)
            run_langchain_script(self, request, queryset)
            return redirect("..")
        context = {'form': form}
        return render(request, 'admin/action_form.html', context)

admin.site.register(Vorgang, VorgangAdmin)