"""
MQTT Client для отправки сообщений в брокер MQTT
"""
import json
import logging
from typing import Dict, Any, Optional
import paho.mqtt.client as mqtt
from django.conf import settings

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

# Глобальный клиент MQTT
_mqtt_client: Optional[mqtt.Client] = None


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


def disconnect_mqtt():
    """
    Отключить MQTT клиент
    """
    global _mqtt_client
    
    if _mqtt_client is not None:
        try:
            _mqtt_client.loop_stop()
            _mqtt_client.disconnect()
            logger.info("MQTT: Клиент отключен")
        except Exception as e:
            logger.error(f"MQTT: Ошибка при отключении: {e}")
        finally:
            _mqtt_client = None
