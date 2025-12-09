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

    # Cart endpoints
    path('cart/move', views.cart_move_forward, name='cart_move_forward'),
    
    # System endpoints
    path('system/status', views.system_status, name='system_status'),
    path('system/settings', views.system_settings, name='system_settings'),
    
    # Logs endpoint
    path('logs', views.logs_list, name='logs_list'),
    
    # Arduino endpoints
    path('arduino/sensor', views.arduino_sensor_data, name='arduino_sensor_data'),
    
    # Testing endpoints
    path('testing/auger', views.test_auger, name='test_auger'),
    path('testing/scales', views.test_scales, name='test_scales'),
    path('testing/limit-switches', views.test_limit_switches, name='test_limit_switches'),
    path('testing/barcode-scanner', views.test_barcode_scanner, name='test_barcode_scanner'),
    path('testing/rfid', views.test_rfid, name='test_rfid'),
    path('testing/obstacle-sensors', views.test_obstacle_sensors, name='test_obstacle_sensors'),
] 