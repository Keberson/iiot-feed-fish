from django.shortcuts import render
from django.http import JsonResponse
from .models import Pool, Feed, Timetable, Feeding, Log, System, User
import json
import jwt
import datetime
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

# Create your views here.
def index(request):
    return JsonResponse({"status": "ok", "message": "Fish feeding API is running"})

@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
        login = data.get('login')
        password = data.get('password')
        
        if not login or not password:
            return JsonResponse({"status": "error", "message": "Login and password are required"}, status=400)
        
        try:
            user = User.objects.get(login=login, password=password)
            
            # Create JWT token
            payload = {
                'uuid': str(user.uuid),
                'login': user.login,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
            }
            
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
            
            # Save token in the database
            user.jwt = token
            user.save()
            
            return JsonResponse({
                "status": "success", 
                "message": "Authentication successful",
                "token": token,
                "user": {
                    "uuid": str(user.uuid),
                    "login": user.login,
                    "fullname": user.fullname
                }
            })
            
        except User.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Invalid credentials"}, status=401)
            
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

@csrf_exempt
def validate_token(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
        token = data.get('token')
        
        if not token:
            return JsonResponse({"status": "error", "message": "Token is required"}, status=400)
        
        try:
            # Verify token signature
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_uuid = payload.get('uuid')
            
            # Check if token exists in database
            try:
                user = User.objects.get(uuid=user_uuid, jwt=token)
                
                return JsonResponse({
                    "status": "success", 
                    "message": "Token is valid",
                    "user": {
                        "uuid": str(user.uuid),
                        "login": user.login,
                        "fullname": user.fullname
                    }
                })
                
            except User.DoesNotExist:
                return JsonResponse({"status": "error", "message": "Invalid token"}, status=401)
                
        except jwt.ExpiredSignatureError:
            return JsonResponse({"status": "error", "message": "Token has expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"status": "error", "message": "Invalid token"}, status=401)
            
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500) 