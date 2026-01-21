from django.apps import AppConfig
import logging
import os

logger = logging.getLogger(__name__)


class FishAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'fish_app'
    
    def ready(self):
        import fish_app.signals
        
        # Запускаем планировщик и перепланируем все задачи при старте приложения
        # Пропускаем инициализацию при выполнении миграций или в тестах
        import sys
        if 'migrate' in sys.argv or 'makemigrations' in sys.argv or 'test' in sys.argv:
            return
        
        # Отложенная инициализация планировщика через threading
        import threading
        
        def init_scheduler_delayed():
            try:
                import time
                time.sleep(2)  # Даем время на полную инициализацию Django
                from .scheduler import reschedule_all_tasks
                reschedule_all_tasks()
                logger.info("Планировщик задач кормления инициализирован")
            except Exception as e:
                logger.error(f"Ошибка при инициализации планировщика задач: {e}")
        
        def init_mqtt_subscriber_delayed():
            try:
                import time
                time.sleep(3)  # Даем время на полную инициализацию Django и планировщика
                from .mqtt_client import start_logs_subscription
                start_logs_subscription()
                logger.info("Подписка на MQTT логи инициализирована")
            except Exception as e:
                logger.error(f"Ошибка при инициализации подписки на MQTT логи: {e}")
        
        # Запускаем планировщик в отдельном потоке
        thread = threading.Thread(target=init_scheduler_delayed, daemon=True)
        thread.start()
        
        # Запускаем подписку на MQTT логи в отдельном потоке
        mqtt_thread = threading.Thread(target=init_mqtt_subscriber_delayed, daemon=True)
        mqtt_thread.start() 