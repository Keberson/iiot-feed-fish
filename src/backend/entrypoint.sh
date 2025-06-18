#!/bin/sh

set -e

echo "➤ Принудительное создание миграций..."
python manage.py makemigrations --noinput

echo "➤ Применение миграций..."
python manage.py migrate --noinput

exec gunicorn --bind ${BACK_HOST:-0.0.0.0}:${BACK_PORT:-8000} core.wsgi:application