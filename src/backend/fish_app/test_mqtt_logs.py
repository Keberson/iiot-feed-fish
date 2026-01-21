"""
Тестовый скрипт для проверки функционала подписки на MQTT логи
"""
import json
import time
import paho.mqtt.client as mqtt
from django.conf import settings
from fish_app.models import Log


def test_mqtt_logs_subscription():
    """
    Тест подписки на MQTT логи и сохранения в БД
    """
    print("=" * 60)
    print("Тест подписки на MQTT логи")
    print("=" * 60)
    
    # Получаем настройки MQTT
    mqtt_server = getattr(settings, 'MQTT_SERVER', '158.160.78.241')
    mqtt_port = getattr(settings, 'MQTT_PORT', 1883)
    mqtt_user = getattr(settings, 'MQTT_USER', 'user')
    mqtt_password = getattr(settings, 'MQTT_PASSWORD', 'iiot-mqtt-fish')
    logs_topic = getattr(settings, 'MQTT_LOGS_TOPIC', 'logs')
    
    print(f"\nНастройки MQTT:")
    print(f"  Сервер: {mqtt_server}:{mqtt_port}")
    print(f"  Пользователь: {mqtt_user}")
    print(f"  Топик: {logs_topic}")
    
    # Проверяем количество логов до отправки
    logs_before = Log.objects.count()
    print(f"\nЛогов в БД до теста: {logs_before}")
    
    # Создаем MQTT клиент для отправки тестового сообщения
    print("\nСоздание MQTT клиента для отправки тестового сообщения...")
    test_client = mqtt.Client()
    test_client.username_pw_set(mqtt_user, mqtt_password)
    
    connected = False
    try:
        test_client.connect(mqtt_server, mqtt_port, 60)
        test_client.loop_start()
        time.sleep(1)  # Даем время на подключение
        
        if test_client.is_connected():
            connected = True
            print("✓ Подключение к MQTT брокеру установлено")
            
            # Отправляем тестовое сообщение в формате JSON
            test_message_json = {
                'type': 'system',
                'message': 'Тестовое сообщение из test_mqtt_logs.py',
                'action': 'test_action',
                'description': 'Это тестовое сообщение для проверки функционала подписки на MQTT логи'
            }
            
            payload = json.dumps(test_message_json, ensure_ascii=False)
            result = test_client.publish(logs_topic, payload, qos=1)
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                print(f"✓ Тестовое сообщение отправлено в топик {logs_topic}")
                print(f"  Сообщение: {payload}")
            else:
                print(f"✗ Ошибка отправки сообщения, код {result.rc}")
                return False
            
            # Отправляем простое текстовое сообщение (не JSON)
            test_message_text = "Простое текстовое сообщение для теста"
            result2 = test_client.publish(logs_topic, test_message_text, qos=1)
            
            if result2.rc == mqtt.MQTT_ERR_SUCCESS:
                print(f"✓ Простое текстовое сообщение отправлено")
                print(f"  Сообщение: {test_message_text}")
            else:
                print(f"✗ Ошибка отправки текстового сообщения, код {result2.rc}")
            
            # Ждем немного, чтобы сообщения обработались
            print("\nОжидание обработки сообщений (3 секунды)...")
            time.sleep(3)
            
        else:
            print("✗ Не удалось подключиться к MQTT брокеру")
            return False
            
    except Exception as e:
        print(f"✗ Ошибка при работе с MQTT: {e}")
        return False
    finally:
        if connected:
            test_client.loop_stop()
            test_client.disconnect()
            print("\n✓ MQTT клиент отключен")
    
    # Проверяем количество логов после отправки
    logs_after = Log.objects.count()
    print(f"\nЛогов в БД после теста: {logs_after}")
    
    if logs_after > logs_before:
        new_logs_count = logs_after - logs_before
        print(f"✓ Успешно! Добавлено {new_logs_count} новых логов")
        
        # Показываем последние логи
        print("\nПоследние добавленные логи:")
        recent_logs = Log.objects.order_by('-when')[:new_logs_count]
        for log in recent_logs:
            print(f"  - [{log.type}] {log.action} (UUID: {log.uuid})")
            if log.description:
                print(f"    Описание: {log.description[:100]}...")
        
        return True
    else:
        print("✗ Логи не были добавлены в БД")
        print("\nВозможные причины:")
        print("  1. Подписка на MQTT логи не запущена")
        print("  2. Проверьте логи приложения на наличие ошибок")
        print("  3. Убедитесь, что приложение запущено и подписка инициализирована")
        return False


def check_subscription_status():
    """
    Проверить статус подписки на MQTT логи
    """
    print("=" * 60)
    print("Проверка статуса подписки на MQTT логи")
    print("=" * 60)
    
    try:
        from fish_app.mqtt_client import get_mqtt_subscriber_client, _subscribed_to_logs
        
        client = get_mqtt_subscriber_client()
        
        if client is None:
            print("✗ MQTT клиент для подписки не создан")
            return False
        
        if client.is_connected():
            print("✓ MQTT клиент подключен")
        else:
            print("✗ MQTT клиент не подключен")
        
        # Проверяем глобальную переменную статуса подписки
        # Это работает только если мы импортируем модуль напрямую
        try:
            import fish_app.mqtt_client as mqtt_module
            subscribed = getattr(mqtt_module, '_subscribed_to_logs', False)
            if subscribed:
                print("✓ Подписка на топик logs активна")
            else:
                print("✗ Подписка на топик logs не активна")
        except:
            print("? Не удалось проверить статус подписки (это нормально)")
        
        return True
        
    except Exception as e:
        print(f"✗ Ошибка при проверке статуса: {e}")
        return False


if __name__ == '__main__':
    import os
    import django
    
    # Настройка Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()
    
    print("\n" + "=" * 60)
    print("ТЕСТИРОВАНИЕ ПОДПИСКИ НА MQTT ЛОГИ")
    print("=" * 60)
    
    # Проверка статуса подписки
    print("\n1. Проверка статуса подписки:")
    check_subscription_status()
    
    # Тест отправки и получения логов
    print("\n2. Тест отправки и получения логов:")
    success = test_mqtt_logs_subscription()
    
    print("\n" + "=" * 60)
    if success:
        print("✓ ТЕСТ ПРОЙДЕН УСПЕШНО")
    else:
        print("✗ ТЕСТ НЕ ПРОЙДЕН")
    print("=" * 60)
