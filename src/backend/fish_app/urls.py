from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/auth/login', views.login, name='login'),
    path('api/auth/token', views.validate_token, name='validate_token'),
    
    # Feeding endpoints
    path('api/feeding/form-data', views.get_feeding_form_data, name='feeding_form_data'),
    path('api/feeding', views.feeding_list_create, name='feeding_list_create'),
    path('api/feeding/<int:id>', views.feeding_detail, name='feeding_detail'),
] 