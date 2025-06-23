#!/bin/sh

set -e

echo "➤ Принудительное создание миграций..."
python manage.py makemigrations
python manage.py makemigrations fish_app

echo "➤ Применение миграций..."
python manage.py migrate
python manage.py migrate fish_app

exec gunicorn --bind localhost:${BACK_PORT:-8000} core.wsgi:application
