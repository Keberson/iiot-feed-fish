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
from .decorators import log_event
from .utils import create_log_entry, log_arduino_event
from .models import Log

# Create your views here.
@swagger_auto_schema(
    method='get',
    operation_description="API status endpoint",
    responses={
        200: openapi.Response(
            description="API status",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING, description='API status'),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, description='Status message')
                }
            )
        )
    }
)
@api_view(['GET'])
def index(request):
    """
    API status endpoint
    """
    return JsonResponse({"status": "ok", "message": "API кормления рыб работает"})

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
        401: "Неверные учетные данные",
        400: "Неверный запрос"
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
        return JsonResponse({"status": "error", "message": "Метод не разрешен"}, status=405, json_dumps_params={'ensure_ascii': False})
    
    try:
        data = json.loads(request.body)
        login = data.get('login')
        password = data.get('password')
        
        if not login or not password:
            return JsonResponse({"status": "error", "message": "Логин и пароль обязательны"}, status=400, json_dumps_params={'ensure_ascii': False})
        
        try:
            user = User.objects.get(login=login)
            
            if not user.check_password(password):
                return JsonResponse({"status": "error", "message": "Неверные учетные данные"}, status=401, json_dumps_params={'ensure_ascii': False})
                
            
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
                "message": "Аутентификация успешна",
                "token": token,
                "user": {
                    "uuid": str(user.uuid),
                    "login": user.login,
                    "fullname": user.fullname
                }
            })
            
        except User.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Неверные учетные данные"}, status=401, json_dumps_params={'ensure_ascii': False})
            
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Неверный JSON"}, status=400, json_dumps_params={'ensure_ascii': False})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500, json_dumps_params={'ensure_ascii': False})

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
        401: "Недействительный токен",
        400: "Неверный запрос"
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
        return JsonResponse({"status": "error", "message": "Метод не разрешен"}, status=405, json_dumps_params={'ensure_ascii': False})
    
    try:
        data = json.loads(request.body)
        token = data.get('token')
        
        if not token:
            return JsonResponse({"status": "error", "message": "Токен обязателен"}, status=400, json_dumps_params={'ensure_ascii': False})
        
        try:
            # Verify token signature
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_uuid = payload.get('uuid')
            
            # Check if token exists in database
            try:
                user = User.objects.get(uuid=user_uuid, jwt=token)
                
                return JsonResponse({
                    "status": "success", 
                    "message": "Токен действителен",
                    "user": {
                        "uuid": str(user.uuid),
                        "login": user.login,
                        "fullname": user.fullname
                    }
                })
                
            except User.DoesNotExist:
                return JsonResponse({"status": "error", "message": "Недействительный токен"}, status=401, json_dumps_params={'ensure_ascii': False})
                
        except jwt.ExpiredSignatureError:
            return JsonResponse({"status": "error", "message": "Срок действия токена истек"}, status=401, json_dumps_params={'ensure_ascii': False})
        except jwt.InvalidTokenError:
            return JsonResponse({"status": "error", "message": "Недействительный токен"}, status=401, json_dumps_params={'ensure_ascii': False})
            
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Неверный JSON"}, status=400, json_dumps_params={'ensure_ascii': False})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500, json_dumps_params={'ensure_ascii': False})

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
@log_event(log_type='system', action=None)
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
        return Response({"ошибки": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

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
    responses={204: "Нет содержимого"}
)
@swagger_auto_schema(
    method='patch',
    operation_description="Partial update a specific feeding task",
    responses={200: FeedingTaskSerializer}
)
@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
@log_event(log_type='system')
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
        return Response({"ошибка": "Задача кормления не найдена"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = FeedingTaskSerializer(task)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = FeedingTaskSerializer(task, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({"ошибки": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'PATCH':
        serializer = FeedingTaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({"ошибки": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@swagger_auto_schema(
    method='get',
    operation_description="Export feeding data to CSV",
    manual_parameters=[
        openapi.Parameter('pool', openapi.IN_QUERY, description="Filter by pool UUID", type=openapi.TYPE_STRING, format='uuid'),
        openapi.Parameter('feed', openapi.IN_QUERY, description="Filter by feed UUID", type=openapi.TYPE_STRING, format='uuid'),
        openapi.Parameter('min-weight', openapi.IN_QUERY, description="Minimum weight filter", type=openapi.TYPE_NUMBER),
        openapi.Parameter('max-weight', openapi.IN_QUERY, description="Maximum weight filter", type=openapi.TYPE_NUMBER),
    ],
    responses={
        200: openapi.Response(description="CSV file with feeding data")
    }
)
@api_view(['GET'])
def export_feeding_data(request):
    # Get query parameters for filtering
    pool_id = request.query_params.get('pool')
    feed_id = request.query_params.get('feed')
    min_weight = request.query_params.get('minWeight')
    max_weight = request.query_params.get('maxWeight')
    
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

@swagger_auto_schema(
    method='get',
    operation_description="Get system status",
    responses={
        200: openapi.Response(
            description="System status",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING, description='System status (ok, warning, error)')
                }
            )
        ),
        500: "Internal server error"
    }
)
@api_view(['GET'])
def system_status(request):
    try:
        # Get the first system record or create one if it doesn't exist
        system, created = System.objects.get_or_create(id=1, defaults={'status': 'ok'})
        return Response({'status': system.status})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@swagger_auto_schema(
    method='get',
    operation_description="Get system WiFi settings",
    responses={
        200: openapi.Response(
            description="System WiFi settings",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'wifi_ssid': openapi.Schema(type=openapi.TYPE_STRING, description='WiFi SSID'),
                    'wifi_password': openapi.Schema(type=openapi.TYPE_STRING, description='WiFi password')
                }
            )
        ),
        500: "Internal server error"
    }
)
@swagger_auto_schema(
    method='put',
    operation_description="Update system WiFi settings",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'wifi_ssid': openapi.Schema(type=openapi.TYPE_STRING, description='WiFi SSID'),
            'wifi_password': openapi.Schema(type=openapi.TYPE_STRING, description='WiFi password')
        }
    ),
    responses={
        200: openapi.Response(
            description="Updated WiFi settings",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'wifi_ssid': openapi.Schema(type=openapi.TYPE_STRING, description='WiFi SSID'),
                    'wifi_password': openapi.Schema(type=openapi.TYPE_STRING, description='WiFi password')
                }
            )
        ),
        400: "Bad request",
        500: "Internal server error"
    }
)
@api_view(['GET', 'PUT'])
@log_event(log_type='system', action='update_wifi')
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
        return Response({'ошибка': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@swagger_auto_schema(
    method='get',
    operation_description="Get logs list with filtering options",
    manual_parameters=[
        openapi.Parameter('current', openapi.IN_QUERY, description="Current page number", type=openapi.TYPE_INTEGER),
        openapi.Parameter('itemsPerPage', openapi.IN_QUERY, description="Number of items per page", type=openapi.TYPE_INTEGER),
        openapi.Parameter('type', openapi.IN_QUERY, description="Log type filter (cart, system, bunker)", type=openapi.TYPE_STRING, enum=['cart', 'system', 'bunker']),
        openapi.Parameter('dateMin', openapi.IN_QUERY, description="Minimum date filter (YYYY-MM-DD)", type=openapi.TYPE_STRING, format='date'),
        openapi.Parameter('dateMax', openapi.IN_QUERY, description="Maximum date filter (YYYY-MM-DD)", type=openapi.TYPE_STRING, format='date'),
    ],
    responses={
        200: openapi.Response(
            description="Logs list with pagination",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'data': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_OBJECT, ref=LogSerializer)),
                    'total': openapi.Schema(type=openapi.TYPE_INTEGER, description='Total number of logs'),
                    'current': openapi.Schema(type=openapi.TYPE_INTEGER, description='Current page number'),
                    'itemsPerPage': openapi.Schema(type=openapi.TYPE_INTEGER, description='Number of items per page'),
                    'totalPages': openapi.Schema(type=openapi.TYPE_INTEGER, description='Total number of pages')
                }
            )
        )
    }
)
@api_view(['GET'])
def logs_list(request):
    # Get query parameters
    current_page = request.query_params.get('current', '1')
    items_per_page = request.query_params.get('itemsPerPage', '10')
    log_type = request.query_params.get('type')
    date_min = request.query_params.get('dateMin')
    date_max = request.query_params.get('dateMax')
    
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
    
    # Apply filters if provided
    if log_type and log_type in ['cart', 'system', 'bunker']:
        logs = logs.filter(type=log_type)
    
    if date_min:
        try:
            # Convert date string to datetime with time set to beginning of day
            from datetime import datetime
            date_min_obj = datetime.strptime(date_min, '%Y-%m-%d')
            logs = logs.filter(when__gte=date_min_obj)
        except ValueError:
            pass  # Invalid date format, ignore filter
    
    if date_max:
        try:
            # Convert date string to datetime with time set to end of day
            from datetime import datetime, timedelta
            date_max_obj = datetime.strptime(date_max, '%Y-%m-%d') + timedelta(days=1) - timedelta(microseconds=1)
            logs = logs.filter(when__lte=date_max_obj)
        except ValueError:
            pass  # Invalid date format, ignore filter
    
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

@swagger_auto_schema(
    method='post',
    operation_description="Arduino sensor data endpoint",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'sensor_id': openapi.Schema(type=openapi.TYPE_STRING, description='Sensor ID'),
            'reading': openapi.Schema(type=openapi.TYPE_NUMBER, description='Sensor reading'),
            'timestamp': openapi.Schema(type=openapi.TYPE_STRING, description='Timestamp of reading'),
        }
    ),
    responses={
        200: openapi.Response(
            description="Data received successfully",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING, description='Response status'),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, description='Response message'),
                }
            )
        ),
        400: "Неверный запрос"
    }
)
@api_view(['POST'])
@csrf_exempt
def arduino_sensor_data(request):
    """
    Arduino sensor data endpoint
    
    Receives sensor data from Arduino and logs it
    """
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Метод не разрешен"}, status=405, json_dumps_params={'ensure_ascii': False})
    
    try:
        data = json.loads(request.body)
        sensor_id = data.get('sensor_id')
        reading = data.get('reading')
        timestamp = data.get('timestamp')
        
        if not sensor_id or reading is None:
            return JsonResponse({"status": "error", "message": "Отсутствуют обязательные поля"}, status=400, json_dumps_params={'ensure_ascii': False})
        
        # Log the Arduino event
        log_arduino_event('sensor_reading', data)
        
        return JsonResponse({
            "status": "success", 
            "message": "Данные получены"
        })
            
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Неверный JSON"}, status=400, json_dumps_params={'ensure_ascii': False})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500, json_dumps_params={'ensure_ascii': False}) 


@swagger_auto_schema(
    method='post',
    operation_description="Отправить команду движения тележки вперед",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'direction': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Направление движения тележки",
                enum=['forward']
            ),
        },
        required=[],
    ),
    responses={
        200: openapi.Response(
            description="Команда принята",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING),
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                    'direction': openapi.Schema(type=openapi.TYPE_STRING),
                }
            )
        ),
        400: "Неверный запрос"
    }
)
@api_view(['POST'])
@csrf_exempt
@log_event(log_type='cart', action='move_forward')
def cart_move_forward(request):
    """
    Принимает команду движения тележки вперед и логирует запрос.
    Пока только возвращает подтверждение, фактическое управление будет через MQTT.
    """
    direction = request.data.get('direction', 'forward')

    if direction != 'forward':
        return Response(
            {"status": "error", "message": "Поддерживается только направление forward"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Явно фиксируем событие в логах для наглядности
    try:
        Log.objects.create(
            action='move_forward',
            type='cart',
            description=json.dumps({'direction': direction}, ensure_ascii=False),
        )
    except Exception:
        # Не блокируем ответ при ошибке логирования
        pass

    return Response(
        {"status": "success", "message": "Команда движения вперед принята", "direction": direction}
    )


@swagger_auto_schema(
    method='post',
    operation_description="Тест шнекового механизма - запуск подачи корма",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'action': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Действие: start или stop",
                enum=['start', 'stop']
            ),
            'weight': openapi.Schema(
                type=openapi.TYPE_NUMBER,
                description="Целевая масса корма (кг) - только для start"
            ),
        },
    ),
    responses={
        200: openapi.Response(
            description="Команда принята",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING),
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                }
            )
        ),
        400: "Неверный запрос"
    }
)
@api_view(['POST'])
@csrf_exempt
@log_event(log_type='system', action='auger_test')
def test_auger(request):
    """
    Тест шнекового механизма подачи корма
    """
    action = request.data.get('action', 'start')
    weight = request.data.get('weight')
    
    if action not in ['start', 'stop']:
        return Response(
            {"status": "error", "message": "Действие должно быть start или stop"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    if action == 'start' and weight is None:
        return Response(
            {"status": "error", "message": "Для запуска необходимо указать целевую массу"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    try:
        log_data = {'action': action}
        if weight:
            log_data['target_weight'] = weight
        
        Log.objects.create(
            action='auger_test',
            type='system',
            description=json.dumps(log_data, ensure_ascii=False),
        )
    except Exception:
        pass
    
    message = f"Шнековый механизм {'запущен' if action == 'start' else 'остановлен'}"
    if action == 'start' and weight:
        message += f" (целевая масса: {weight} кг)"
    
    return Response(
        {"status": "success", "message": message}
    )


@swagger_auto_schema(
    method='post',
    operation_description="Тест весов - тарировка или проверка",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'action': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Действие: tare (тарировка) или check (проверка)",
                enum=['tare', 'check']
            ),
            'reference_weight': openapi.Schema(
                type=openapi.TYPE_NUMBER,
                description="Эталонная масса для проверки (кг) - только для check"
            ),
        },
    ),
    responses={
        200: openapi.Response(
            description="Команда принята",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING),
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                    'current_weight': openapi.Schema(type=openapi.TYPE_NUMBER),
                }
            )
        ),
        400: "Неверный запрос"
    }
)
@api_view(['POST'])
@csrf_exempt
@log_event(log_type='system', action='scales_test')
def test_scales(request):
    """
    Тест весов (пьезодатчиков)
    """
    action = request.data.get('action', 'tare')
    reference_weight = request.data.get('reference_weight')
    
    if action not in ['tare', 'check']:
        return Response(
            {"status": "error", "message": "Действие должно быть tare или check"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    if action == 'check' and reference_weight is None:
        return Response(
            {"status": "error", "message": "Для проверки необходимо указать эталонную массу"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    try:
        log_data = {'action': action}
        if reference_weight:
            log_data['reference_weight'] = reference_weight
        
        Log.objects.create(
            action='scales_test',
            type='system',
            description=json.dumps(log_data, ensure_ascii=False),
        )
    except Exception:
        pass
    
    # Симуляция текущего показания весов (в реальности будет считываться с датчика)
    current_weight = 0.0 if action == 'tare' else (reference_weight or 0.0)
    
    message = "Весы обнулены (тарировка выполнена)" if action == 'tare' else f"Проверка весов с эталоном {reference_weight} кг"
    
    return Response(
        {
            "status": "success",
            "message": message,
            "current_weight": current_weight
        }
    )


@swagger_auto_schema(
    method='post',
    operation_description="Тест концевых выключателей",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'position': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Позиция для проверки: home, bunker, pool",
            ),
        },
    ),
    responses={
        200: openapi.Response(
            description="Команда принята",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING),
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                    'triggered': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                }
            )
        ),
        400: "Неверный запрос"
    }
)
@api_view(['POST'])
@csrf_exempt
@log_event(log_type='cart', action='limit_switch_test')
def test_limit_switches(request):
    """
    Тест концевых выключателей
    """
    position = request.data.get('position', 'home')
    
    try:
        log_data = {'position': position}
        
        Log.objects.create(
            action='limit_switch_test',
            type='cart',
            description=json.dumps(log_data, ensure_ascii=False),
        )
    except Exception:
        pass
    
    # Симуляция срабатывания выключателя
    triggered = True
    
    return Response(
        {
            "status": "success",
            "message": f"Проверка концевого выключателя в позиции {position}",
            "triggered": triggered
        }
    )


@swagger_auto_schema(
    method='post',
    operation_description="Тест сканера штрих-кодов",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'barcode': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Штрих-код для тестирования (опционально)",
            ),
        },
    ),
    responses={
        200: openapi.Response(
            description="Команда принята",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING),
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                    'scanned': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    'barcode': openapi.Schema(type=openapi.TYPE_STRING),
                }
            )
        ),
        400: "Неверный запрос"
    }
)
@api_view(['POST'])
@csrf_exempt
@log_event(log_type='system', action='barcode_test')
def test_barcode_scanner(request):
    """
    Тест сканера штрих-кодов
    """
    barcode = request.data.get('barcode', '')
    
    try:
        log_data = {'barcode': barcode if barcode else 'test_scan'}
        
        Log.objects.create(
            action='barcode_test',
            type='system',
            description=json.dumps(log_data, ensure_ascii=False),
        )
    except Exception:
        pass
    
    # Симуляция успешного сканирования
    scanned = bool(barcode)
    
    return Response(
        {
            "status": "success",
            "message": f"Сканер {'успешно считал' if scanned else 'готов к сканированию'} штрих-код",
            "scanned": scanned,
            "barcode": barcode if scanned else None
        }
    )


@swagger_auto_schema(
    method='post',
    operation_description="Тест RFID-ридера для идентификации бассейнов и бункеров",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'barcode': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="ID RFID-метки для тестирования (опционально)",
            ),
        },
    ),
    responses={
        200: openapi.Response(
            description="Команда принята",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING),
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                    'scanned': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    'barcode': openapi.Schema(type=openapi.TYPE_STRING),
                }
            )
        ),
        400: "Неверный запрос"
    }
)
@api_view(['POST'])
@csrf_exempt
@log_event(log_type='system', action='rfid_test')
def test_rfid(request):
    """
    Тест RFID-ридера для идентификации бассейнов и бункеров
    """
    rfid_id = request.data.get('barcode', '')  # Используем barcode для совместимости с фронтендом
    
    try:
        log_data = {'rfid_id': rfid_id if rfid_id else 'test_rfid_scan'}
        
        Log.objects.create(
            action='rfid_test',
            type='system',
            description=json.dumps(log_data, ensure_ascii=False),
        )
    except Exception:
        pass
    
    # Симуляция успешного считывания RFID-метки
    scanned = bool(rfid_id)
    
    message = f"RFID-ридер {'успешно считал' if scanned else 'готов к считыванию'} метку"
    if scanned:
        message += f" (ID: {rfid_id})"
    
    return Response(
        {
            "status": "success",
            "message": message,
            "scanned": scanned,
            "barcode": rfid_id if scanned else None
        }
    )


@swagger_auto_schema(
    method='post',
    operation_description="Тест датчиков препятствий",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'sensor_side': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Сторона датчика: front или back",
                enum=['front', 'back']
            ),
            'obstacle_detected': openapi.Schema(
                type=openapi.TYPE_BOOLEAN,
                description="Сигнал о наличии препятствия (для симуляции)",
            ),
        },
    ),
    responses={
        200: openapi.Response(
            description="Команда принята",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING),
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                    'obstacle_detected': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    'distance': openapi.Schema(type=openapi.TYPE_NUMBER),
                }
            )
        ),
        400: "Неверный запрос"
    }
)
@api_view(['POST'])
@csrf_exempt
@log_event(log_type='cart', action='obstacle_sensor_test')
def test_obstacle_sensors(request):
    """
    Тест датчиков препятствий
    """
    sensor_side = request.data.get('sensor_side', 'front')
    obstacle_detected = request.data.get('obstacle_detected', False)
    
    if sensor_side not in ['front', 'back']:
        return Response(
            {"status": "error", "message": "Сторона датчика должна быть front или back"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    try:
        log_data = {
            'sensor_side': sensor_side,
            'obstacle_detected': obstacle_detected
        }
        
        Log.objects.create(
            action='obstacle_sensor_test',
            type='cart',
            description=json.dumps(log_data, ensure_ascii=False),
        )
    except Exception:
        pass
    
    # Симуляция расстояния до препятствия
    distance = 0.5 if obstacle_detected else 2.0
    
    message = f"Датчик препятствий ({sensor_side}): {'обнаружено препятствие' if obstacle_detected else 'препятствий нет'}"
    
    return Response(
        {
            "status": "success",
            "message": message,
            "obstacle_detected": obstacle_detected,
            "distance": distance
        }
    )