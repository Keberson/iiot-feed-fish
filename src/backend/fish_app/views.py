from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from .models import Pool, Feed, Timetable, Feeding, Log, System, User
import json
import jwt
import datetime
import csv
import math
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Min, Max
from .models import Period, FeedingTask
from .serializers import PoolSerializer, FeedSerializer, PeriodSerializer, FeedingTaskSerializer, SystemSerializer, LogSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Create your views here.
def index(request):
    """
    API status endpoint
    """
    return JsonResponse({"status": "ok", "message": "Fish feeding API is running"})

@swagger_auto_schema(
    method='post',
    operation_description="User authentication endpoint",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['login', 'password'],
        properties={
            'login': openapi.Schema(type=openapi.TYPE_STRING, description='User login'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description='User password'),
        }
    ),
    responses={
        200: openapi.Response(
            description="Authentication successful",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING, description='Response status'),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, description='Response message'),
                    'token': openapi.Schema(type=openapi.TYPE_STRING, description='JWT token'),
                    'user': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'uuid': openapi.Schema(type=openapi.TYPE_STRING, description='User UUID'),
                            'login': openapi.Schema(type=openapi.TYPE_STRING, description='User login'),
                            'fullname': openapi.Schema(type=openapi.TYPE_STRING, description='User full name'),
                        }
                    )
                }
            )
        ),
        401: "Invalid credentials",
        400: "Bad request"
    }
)
@api_view(['POST'])
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
            user = User.objects.get(login=login)
            
            if not user.check_password(password):
                return JsonResponse({"status": "error", "message": "Invalid credentials"}, status=401)
                
            
            # Create JWT token
            payload = {
                'uuid': str(user.uuid),
                'login': user.login,
                'fullname': user.fullname,
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

@swagger_auto_schema(
    method='post',
    operation_description="Token validation endpoint",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['token'],
        properties={
            'token': openapi.Schema(type=openapi.TYPE_STRING, description='JWT token to validate'),
        }
    ),
    responses={
        200: openapi.Response(
            description="Token is valid",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING, description='Response status'),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, description='Response message'),
                    'user': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'uuid': openapi.Schema(type=openapi.TYPE_STRING, description='User UUID'),
                            'login': openapi.Schema(type=openapi.TYPE_STRING, description='User login'),
                            'fullname': openapi.Schema(type=openapi.TYPE_STRING, description='User full name'),
                        }
                    )
                }
            )
        ),
        401: "Invalid token",
        400: "Bad request"
    }
)
@api_view(['POST'])
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
        'pool': [{'id': pool.uuid, 'name': pool.name} for pool in pools],
        'feed': [{'id': feed.uuid, 'name': feed.name} for feed in feeds],
        'period': [{'id': period.uuid, 'name': period.name} for period in periods],
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
        # Get query parameters
        current_page = request.query_params.get('current', '1')
        items_per_page = request.query_params.get('itemsPerPage', '10')
        pool_id = request.query_params.get('pool')
        feed_id = request.query_params.get('feed')
        min_weight = request.query_params.get('min-weight', '0')
        max_weight = request.query_params.get('max-weight')
        
        # Convert to integers with defaults
        try:
            current_page = int(current_page)
            if current_page < 1:
                current_page = 1
        except ValueError:
            current_page = 1
            
        try:
            items_per_page = int(items_per_page)
            if items_per_page < 1:
                items_per_page = 10
        except ValueError:
            items_per_page = 10
            
        # Start with all tasks and apply default sorting by UUID
        tasks = FeedingTask.objects.all().order_by('uuid')
        
        # Apply filters if provided
        if pool_id:
            tasks = tasks.filter(pool=pool_id)
        
        if feed_id:
            tasks = tasks.filter(feed=feed_id)
        
        try:
            min_weight = float(min_weight)
            tasks = tasks.filter(weight__gte=min_weight)
        except ValueError:
            pass
        
        if max_weight:
            try:
                max_weight = float(max_weight)
                tasks = tasks.filter(weight__lte=max_weight)
            except ValueError:
                pass
        
        # Calculate pagination
        total_items = tasks.count()
        total_pages = math.ceil(total_items / items_per_page)
        
        # If current_page is out of range, set to last page
        if current_page > total_pages and total_pages > 0:
            current_page = total_pages
        
        # Calculate slice indices
        start_idx = (current_page - 1) * items_per_page
        end_idx = start_idx + items_per_page
        
        # Slice the queryset
        paginated_tasks = tasks[start_idx:end_idx]
        
        # Serialize the paginated data
        serializer = FeedingTaskSerializer(paginated_tasks, many=True)
        
        # Return paginated response
        return Response({
            'data': serializer.data,
            'total': total_items,
            'current': current_page,
            'itemsPerPage': items_per_page,
            'totalPages': total_pages
        })

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
@swagger_auto_schema(
    method='patch',
    operation_description="Partial update a specific feeding task",
    responses={200: FeedingTaskSerializer}
)
@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
def feeding_detail(request, id):
    """
    Retrieve, update or delete a feeding task
    
    GET: Returns a specific feeding task
    PUT: Updates a specific feeding task
    DELETE: Deletes a specific feeding task
    """
    try:
        task = FeedingTask.objects.get(pk=id)
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
        
    elif request.method == 'PATCH':
        serializer = FeedingTaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def export_feeding_data(request):
    # Get query parameters for filtering
    pool_id = request.query_params.get('pool')
    feed_id = request.query_params.get('feed')
    min_weight = request.query_params.get('min-weight')
    max_weight = request.query_params.get('max-weight')
    
    # Start with all tasks
    tasks = FeedingTask.objects.all()
    
    # Apply filters if provided
    if pool_id:
        tasks = tasks.filter(pool=pool_id)
    
    if feed_id:
        tasks = tasks.filter(feed=feed_id)
    
    if min_weight:
        try:
            min_weight = float(min_weight)
            tasks = tasks.filter(weight__gte=min_weight)
        except ValueError:
            pass
    
    if max_weight:
        try:
            max_weight = float(max_weight)
            tasks = tasks.filter(weight__lte=max_weight)
        except ValueError:
            pass
    
    # Create CSV response with UTF-8 encoding and BOM
    response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
    response['Content-Disposition'] = 'attachment; filename="feeding_data.csv"'
    
    # Add BOM (Byte Order Mark) for Excel to recognize UTF-8
    response.write('\ufeff')
    
    writer = csv.writer(response)
    # Write header
    writer.writerow(['Бассейн', 'Популяция', 'Время', 'Масса', 'Тип корма'])
    
    # Write data rows
    for task in tasks:
        # Handle potential None values for period or other_period
        if task.other_period:
            time_value = task.other_period.strftime('%H:%M')
        elif task.period:
            time_value = task.period.name
        else:
            time_value = ''
            
        writer.writerow([
            task.pool.name,
            '',  # Популяция (пустой столбец)
            time_value,
            task.weight,
            task.feed.name
        ])
    
    return response 

@api_view(['GET'])
def system_status(request):
    try:
        # Get the first system record or create one if it doesn't exist
        system, created = System.objects.get_or_create(id=1, defaults={'status': 'ok'})
        return Response({'status': system.status})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT'])
def system_settings(request):
    try:
        # Get the first system record or create one if it doesn't exist
        system, created = System.objects.get_or_create(id=1, defaults={'status': 'ok'})
        
        if request.method == 'GET':
            serializer = SystemSerializer(system)
            return Response({
                'wifi_ssid': serializer.data['wifi_ssid'],
                'wifi_password': serializer.data['wifi_password']
            })
        
        elif request.method == 'PUT':
            # Only update wifi settings
            data = {
                'wifi_ssid': request.data.get('wifi_ssid'),
                'wifi_password': request.data.get('wifi_password'),
                'status': system.status  # Keep the current status
            }
            
            serializer = SystemSerializer(system, data=data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'wifi_ssid': serializer.data['wifi_ssid'],
                    'wifi_password': serializer.data['wifi_password']
                })
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def logs_list(request):
    # Get query parameters
    current_page = request.query_params.get('current', '1')
    items_per_page = request.query_params.get('itemsPerPage', '10')
    
    # Convert to integers with defaults
    try:
        current_page = int(current_page)
        if current_page < 1:
            current_page = 1
    except ValueError:
        current_page = 1
        
    try:
        items_per_page = int(items_per_page)
        if items_per_page < 1:
            items_per_page = 10
    except ValueError:
        items_per_page = 10
        
    # Get all logs
    logs = Log.objects.all().order_by('-when')  # Most recent first
    
    # Calculate pagination
    total_items = logs.count()
    total_pages = math.ceil(total_items / items_per_page)
    
    # If current_page is out of range, set to last page
    if current_page > total_pages and total_pages > 0:
        current_page = total_pages
    
    # Calculate slice indices
    start_idx = (current_page - 1) * items_per_page
    end_idx = start_idx + items_per_page
    
    # Slice the queryset
    paginated_logs = logs[start_idx:end_idx]
    
    # Serialize the paginated data
    serializer = LogSerializer(paginated_logs, many=True)
    
    # Return paginated response
    return Response({
        'data': serializer.data,
        'total': total_items,
        'current': current_page,
        'itemsPerPage': items_per_page,
        'totalPages': total_pages
    }) 