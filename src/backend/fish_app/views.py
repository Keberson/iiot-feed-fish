from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from .models import Pool, Feed, Timetable, Feeding, Log, System, User
import json
import jwt
import datetime
import csv
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Min, Max
from .models import Period, FeedingTask
from .serializers import PoolSerializer, FeedSerializer, PeriodSerializer, FeedingTaskSerializer

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

@api_view(['GET'])
def get_feeding_form_data(request):
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

@api_view(['GET', 'POST'])
def feeding_list_create(request):
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

@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
def feeding_detail(request, id):
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