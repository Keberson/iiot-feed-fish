import os
import sys
import django
import traceback

# Настройка Django окружения
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Импорт модели User после настройки окружения
from fish_app.models import User

try:
    # Проверяем, существует ли пользователь с таким логином
    username = 'newuser'
    existing_user = User.objects.filter(login=username).first()
    
    if existing_user:
        print(f"User already exists: {existing_user.login} with uuid: {existing_user.uuid}")
    else:
        # Создание нового пользователя
        user = User.objects.create(
            login=username,
            password='password123',
            fullname='New Test User'
        )
        print(f"Created user: {user.login} with uuid: {user.uuid}")
    
except Exception as e:
    print(f"Error creating user: {str(e)}")
    traceback.print_exc() 