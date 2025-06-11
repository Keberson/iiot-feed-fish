FROM python:3.12-slim as builder

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Копируем только requirements.txt для лучшего кеширования слоев
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN useradd -m django_user && \
    mkdir /app && \
    chown django_user:django_user /app

WORKDIR /app
USER django_user

# Копируем сначала только необходимые файлы для запуска приложения
COPY --chown=django_user:django_user manage.py .
COPY --chown=django_user:django_user core/ core/
# Копируем остальные приложения Django
COPY --chown=django_user:django_user fish_app/ fish_app/

# RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Для разработки
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Для production (рекомендуется)
# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]