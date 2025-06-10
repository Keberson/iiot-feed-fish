from django.shortcuts import render
from django.http import JsonResponse
from .models import Pool, Feed, Timetable, Feeding, Log, System, User

# Create your views here.
def index(request):
    return JsonResponse({"status": "ok", "message": "Fish feeding API is running"}) 