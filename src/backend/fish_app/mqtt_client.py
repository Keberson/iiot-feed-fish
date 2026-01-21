"""
MQTT Client для отправки сообщений в брокер MQTT и подписки на логи
"""
import json
import logging
from typing import Dict, Any, Optional
import paho.mqtt.client as mqtt
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

# MQTT настройки из settings
MQTT_CONFIG = {
    'server': getattr(settings, 'MQTT_SERVER', '158.160.78.241'),
    'port': getattr(settings, 'MQTT_PORT', 1883),
    'user': getattr(settings, 'MQTT_USER', 'user'),
    'password': getattr(settings, 'MQTT_PASSWORD', 'iiot-mqtt-fish'),
    'requests_topic': getattr(settings, 'MQTT_REQUESTS_TOPIC', 'bunker'),
    'logs_topic': getattr(settings, 'MQTT_LOGS_TOPIC', 'logs'),
}

# Глобальный клиент MQTT для отправки сообщений
_mqtt_client: Optional[mqtt.Client] = None

# Глобальный клиент MQTT для подписки на логи
_mqtt_subscriber_client: Optional[mqtt.Client] = None
_subscribed_to_logs: bool = False


def get_mqtt_client() -> mqtt.Client:
    """
    Получить или создать MQTT клиент (singleton)
    """
    global _mqtt_client
    
    if _mqtt_client is None:
        _mqtt_client = mqtt.Client()
        _mqtt_client.username_pw_set(MQTT_CONFIG['user'], MQTT_CONFIG['password'])
        
        def on_connect(client, userdata, flags, rc):
            if rc == 0:
                logger.info("MQTT: Подключение установлено")
            else:
                logger.error(f"MQTT: Ошибка подключения, код {rc}")
        
        def on_disconnect(client, userdata, rc):
            logger.warning(f"MQTT: Отключение, код {rc}")
        
        _mqtt_client.on_connect = on_connect
        _mqtt_client.on_disconnect = on_disconnect
        
        try:
            _mqtt_client.connect(MQTT_CONFIG['server'], MQTT_CONFIG['port'], 60)
            _mqtt_client.loop_start()
            # Даем время на подключение
            import time
            time.sleep(0.5)
        except Exception as e:
            logger.warning(f"MQTT: Ошибка при подключении: {e}. Система продолжит работу, но сообщения не будут отправляться в MQTT.")
    
    return _mqtt_client


def send_feeding_command(pool_id: str, feed_id: str, weight: float, pool_name: str = None, feed_name: str = None) -> bool:
    """
    Отправить команду кормления в MQTT брокер
    
    Args:
        pool_id: UUID бассейна
        feed_id: UUID корма
        weight: Масса корма в кг
        pool_name: Название бассейна (опционально)
        feed_name: Название корма (опционально)
    
    Returns:
        True если сообщение отправлено успешно, False в противном случае
    """
    try:
        client = get_mqtt_client()
        
        # Проверяем подключение
        if not client.is_connected():
            logger.warning("MQTT: Клиент не подключен, попытка переподключения...")
            try:
                client.reconnect()
            except Exception as reconnect_error:
                logger.error(f"MQTT: Не удалось переподключиться: {reconnect_error}")
                return False
        
        message = {
            'pool_id': pool_id,
            'feed_id': feed_id,
            'weight': float(weight),
        }
        
        if pool_name:
            message['pool_name'] = pool_name
        if feed_name:
            message['feed_name'] = feed_name
        
        payload = json.dumps(message, ensure_ascii=False)
        result = client.publish(MQTT_CONFIG['requests_topic'], payload, qos=1)
        
        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            logger.info(f"MQTT: Команда кормления отправлена в топик {MQTT_CONFIG['requests_topic']}: {payload}")
            return True
        else:
            logger.error(f"MQTT: Ошибка отправки сообщения, код {result.rc}")
            return False
            
    except Exception as e:
        logger.error(f"MQTT: Исключение при отправке команды кормления: {e}")
        return False


def send_log_message(message: str, log_type: str = 'system') -> bool:
    """
    Отправить лог-сообщение в MQTT брокер
    
    Args:
        message: Текст сообщения
        log_type: Тип лога (system, cart, bunker)
    
    Returns:
        True если сообщение отправлено успешно, False в противном случае
    """
    try:
        client = get_mqtt_client()
        
        log_data = {
            'type': log_type,
            'message': message
        }
        
        payload = json.dumps(log_data, ensure_ascii=False)
        result = client.publish(MQTT_CONFIG['logs_topic'], payload, qos=1)
        
        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            logger.info(f"MQTT: Лог отправлен в топик {MQTT_CONFIG['logs_topic']}: {payload}")
            return True
        else:
            logger.error(f"MQTT: Ошибка отправки лога, код {result.rc}")
            return False
            
    except Exception as e:
        logger.error(f"MQTT: Исключение при отправке лога: {e}")
        return False


def _save_log_to_db(log_data: Dict[str, Any]) -> bool:
    """
    Сохранить лог в базу данных
    
    Args:
        log_data: Словарь с данными лога (type, message, action, description и т.д.)
    
    Returns:
        True если лог сохранен успешно, False в противном случае
    """
    try:
        from .models import Log
        
        # Извлекаем данные из сообщения
        log_type = log_data.get('type', 'system')
        message = log_data.get('message', '')
        action = log_data.get('action', message[:255])  # Используем message как action, если action не указан
        description = log_data.get('description', message)
        
        # Проверяем, что тип лога валидный
        valid_types = ['cart', 'bunker', 'system']
        if log_type not in valid_types:
            log_type = 'system'
        
        # Создаем запись в БД
        log_entry = Log.objects.create(
            action=action[:255],  # Ограничиваем длину action
            description=description,
            type=log_type
        )
        
        logger.info(f"MQTT: Лог сохранен в БД: {log_entry.uuid} - {log_type} - {action}")
        return True
        
    except Exception as e:
        logger.error(f"MQTT: Ошибка при сохранении лога в БД: {e}")
        return False


def _on_log_message(client, userdata, msg):
    """
    Обработчик сообщений из топика logs
    
    Args:
        client: MQTT клиент
        userdata: Пользовательские данные
        msg: Объект сообщения MQTT
    """
    try:
        # Декодируем сообщение
        payload = msg.payload.decode('utf-8')
        logger.debug(f"MQTT: Получено сообщение из топика {msg.topic}: {payload}")
        
        # Парсим JSON
        try:
            log_data = json.loads(payload)
        except json.JSONDecodeError:
            # Если не JSON, создаем простой лог из текста
            log_data = {
                'type': 'system',
                'message': payload,
                'action': payload[:255],
                'description': payload
            }
        
        # Сохраняем в БД
        _save_log_to_db(log_data)
        
    except Exception as e:
        logger.error(f"MQTT: Ошибка при обработке сообщения из топика logs: {e}")


def get_mqtt_subscriber_client() -> Optional[mqtt.Client]:
    """
    Получить или создать MQTT клиент для подписки на логи (singleton)
    
    Returns:
        MQTT клиент или None в случае ошибки
    """
    global _mqtt_subscriber_client, _subscribed_to_logs
    
    if _mqtt_subscriber_client is None:
        try:
            _mqtt_subscriber_client = mqtt.Client()
            _mqtt_subscriber_client.username_pw_set(MQTT_CONFIG['user'], MQTT_CONFIG['password'])
            
            def on_connect_subscriber(client, userdata, flags, rc):
                if rc == 0:
                    logger.info("MQTT Subscriber: Подключение установлено")
                    # Подписываемся на топик logs
                    try:
                        client.subscribe(MQTT_CONFIG['logs_topic'], qos=1)
                        logger.info(f"MQTT Subscriber: Подписка на топик {MQTT_CONFIG['logs_topic']} установлена")
                        _subscribed_to_logs = True
                    except Exception as e:
                        logger.error(f"MQTT Subscriber: Ошибка при подписке на топик: {e}")
                else:
                    logger.error(f"MQTT Subscriber: Ошибка подключения, код {rc}")
            
            def on_disconnect_subscriber(client, userdata, rc):
                global _subscribed_to_logs
                logger.warning(f"MQTT Subscriber: Отключение, код {rc}")
                _subscribed_to_logs = False
            
            _mqtt_subscriber_client.on_connect = on_connect_subscriber
            _mqtt_subscriber_client.on_disconnect = on_disconnect_subscriber
            _mqtt_subscriber_client.on_message = _on_log_message
            
            try:
                _mqtt_subscriber_client.connect(MQTT_CONFIG['server'], MQTT_CONFIG['port'], 60)
                _mqtt_subscriber_client.loop_start()
                # Даем время на подключение
                import time
                time.sleep(0.5)
            except Exception as e:
                logger.warning(f"MQTT Subscriber: Ошибка при подключении: {e}. Система продолжит работу, но логи не будут получаться из MQTT.")
                _mqtt_subscriber_client = None
                return None
        
        except Exception as e:
            logger.error(f"MQTT Subscriber: Ошибка при создании клиента: {e}")
            return None
    
    return _mqtt_subscriber_client


def start_logs_subscription():
    """
    Запустить подписку на топик logs для получения и сохранения логов в БД
    """
    global _subscribed_to_logs
    
    if _subscribed_to_logs:
        logger.info("MQTT Subscriber: Подписка на логи уже активна")
        return
    
    try:
        client = get_mqtt_subscriber_client()
        if client is None:
            logger.warning("MQTT Subscriber: Не удалось создать клиент для подписки")
            return
        
        # Если клиент уже подключен, но подписка не установлена, подписываемся
        if client.is_connected() and not _subscribed_to_logs:
            try:
                client.subscribe(MQTT_CONFIG['logs_topic'], qos=1)
                logger.info(f"MQTT Subscriber: Подписка на топик {MQTT_CONFIG['logs_topic']} установлена")
                _subscribed_to_logs = True
            except Exception as e:
                logger.error(f"MQTT Subscriber: Ошибка при подписке на топик: {e}")
        
    except Exception as e:
        logger.error(f"MQTT Subscriber: Ошибка при запуске подписки на логи: {e}")


def disconnect_mqtt():
    """
    Отключить MQTT клиенты (и для отправки, и для подписки)
    """
    global _mqtt_client, _mqtt_subscriber_client, _subscribed_to_logs
    
    if _mqtt_client is not None:
        try:
            _mqtt_client.loop_stop()
            _mqtt_client.disconnect()
            logger.info("MQTT: Клиент отключен")
        except Exception as e:
            logger.error(f"MQTT: Ошибка при отключении: {e}")
        finally:
            _mqtt_client = None
    
    if _mqtt_subscriber_client is not None:
        try:
            _mqtt_subscriber_client.loop_stop()
            _mqtt_subscriber_client.disconnect()
            logger.info("MQTT Subscriber: Клиент отключен")
        except Exception as e:
            logger.error(f"MQTT Subscriber: Ошибка при отключении: {e}")
        finally:
            _mqtt_subscriber_client = None
            _subscribed_to_logs = False