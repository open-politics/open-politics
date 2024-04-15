from django.middleware.csrf import CsrfViewMiddleware

class HtmxCsrfExemptMiddleware(CsrfViewMiddleware):
    def process_view(self, request, callback, callback_args, callback_kwargs):
        if request.headers.get('HTMX-Request') == 'true':
            return self._accept(request)
        return super().process_view(request, callback, callback_args, callback_kwargs)
