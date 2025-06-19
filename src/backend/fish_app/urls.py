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
] 