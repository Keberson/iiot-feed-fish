from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/auth/login', views.login, name='login'),
    path('api/auth/token', views.validate_token, name='validate_token'),
] 