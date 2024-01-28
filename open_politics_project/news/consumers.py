from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token

class MyWebSocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract the token from the WebSocket query string or headers
        token_key = self.scope.get("query_string").decode("utf-8")
        token_key = token_key.replace("token=", "")

        # Verify the token and authenticate the user
        user = await self.get_user_from_token(token_key)
        if user is None:
            await self.close()
        else:
            # Authenticate the WebSocket connection
            self.scope["user"] = user
            await self.accept()

    async def disconnect(self, close_code):
        # Disconnect logic here
        pass

    async def receive(self, text_data):
        # WebSocket message handling logic here
        pass

    @database_sync_to_async
    def get_user_from_token(self, token_key):
        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return None
