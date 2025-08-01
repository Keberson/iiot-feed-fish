from django.http import JsonResponse
from .models import User
import re

class JWTAuthMiddleware:
    EXCLUDED_PATHS = [
        re.compile(r'^/api/auth/login/?$'),
        re.compile(r'^/api/auth/token/?$'),
    ]

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if any(pattern.match(request.path) for pattern in self.EXCLUDED_PATHS):
            return self.get_response(request)
            
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'status': 'error', 'message': 'Токен отсутствует'}, status=401, json_dumps_params={'ensure_ascii': False})
            
        token = auth_header.split(' ')[1]
        
        try:
            User.objects.get(jwt=token)
        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Недействительный токен'}, status=401, json_dumps_params={'ensure_ascii': False})
            
        return self.get_response(request)