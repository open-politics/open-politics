import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path, include

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'open_politics_project.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            [
                path('events/', include('django_eventstream.urls')),
            ]
        )
    ),
})
