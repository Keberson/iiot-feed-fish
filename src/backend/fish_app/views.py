from django.shortcuts import render
from django.http import JsonResponse
from .models import Pool, Feed, Timetable, Feeding, Log, System, User
import json
import jwt
import datetime
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Min, Max
from .models import Period, FeedingTask
from .serializers import PoolSerializer, FeedSerializer, PeriodSerializer, FeedingTaskSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Create your views here.
def index(request):
    """
    API status endpoint
    """
    return JsonResponse({"status": "ok", "message": "Fish feeding API is running"})

@csrf_exempt
def login(request):
    """
    User authentication endpoint
    
    Authenticates a user and returns a JWT token
    """
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
    """
    Token validation endpoint
    
    Validates a JWT token and returns user information
    """
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

@swagger_auto_schema(
    method='get',
    operation_description="Get form data for feeding configuration",
    responses={200: "Returns pools, feeds, periods, and weight range"}
)
@api_view(['GET'])
def get_feeding_form_data(request):
    """
    Get form data for feeding configuration
    
    Returns a list of pools, feeds, periods, and weight range for the feeding form
    """
    pools = Pool.objects.all()
    feeds = Feed.objects.all()
    periods = Period.objects.all()
    weight_range = FeedingTask.objects.aggregate(
        min_weight=Min('weight'),
        max_weight=Max('weight')
    )

    return Response({
        'pool': [{'id': pool.id, 'name': pool.name} for pool in pools],
        'feed': [{'id': feed.id, 'name': feed.name} for feed in feeds],
        'period': [{'id': period.id, 'name': period.name} for period in periods],
        'weight': {
            'min': float(weight_range['min_weight'] or 0),
            'max': float(weight_range['max_weight'] or 0)
        }
    })

@swagger_auto_schema(
    method='get',
    operation_description="Get all feeding tasks",
    responses={200: FeedingTaskSerializer(many=True)}
)
@swagger_auto_schema(
    method='post',
    operation_description="Create a new feeding task",
    request_body=FeedingTaskSerializer,
    responses={201: FeedingTaskSerializer}
)
@api_view(['GET', 'POST'])
def feeding_list_create(request):
    """
    List all feeding tasks or create a new one
    
    GET: Returns a list of all feeding tasks
    POST: Creates a new feeding task
    """
    if request.method == 'GET':
        tasks = FeedingTask.objects.all()
        serializer = FeedingTaskSerializer(tasks, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = FeedingTaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(
    method='get',
    operation_description="Get a specific feeding task",
    responses={200: FeedingTaskSerializer}
)
@swagger_auto_schema(
    method='put',
    operation_description="Update a specific feeding task",
    request_body=FeedingTaskSerializer,
    responses={200: FeedingTaskSerializer}
)
@swagger_auto_schema(
    method='delete',
    operation_description="Delete a specific feeding task",
    responses={204: "No content"}
)
@api_view(['GET', 'PUT', 'DELETE'])
def feeding_detail(request, id):
    """
    Retrieve, update or delete a feeding task
    
    GET: Returns a specific feeding task
    PUT: Updates a specific feeding task
    DELETE: Deletes a specific feeding task
    """
    try:
        task = FeedingTask.objects.get(id=id)
    except FeedingTask.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = FeedingTaskSerializer(task)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = FeedingTaskSerializer(task, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT) 