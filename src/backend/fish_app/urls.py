from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('auth/login', views.login, name='login'),
    path('auth/token', views.validate_token, name='validate_token'),
    
    # Feeding endpoints
    path('feeding/form-data', views.get_feeding_form_data, name='feeding_form_data'),
    path('feeding/export', views.export_feeding_data, name='export_feeding_data'),
    path('feeding', views.feeding_list_create, name='feeding_list_create'),
    path('feeding/<uuid:id>', views.feeding_detail, name='feeding_detail'),
    
    # System endpoints
    path('system/status', views.system_status, name='system_status'),
    path('system/settings', views.system_settings, name='system_settings'),
    
    # Logs endpoint
    path('logs', views.logs_list, name='logs_list'),
    
    # Arduino endpoints
    path('arduino/sensor', views.arduino_sensor_data, name='arduino_sensor_data'),
] 