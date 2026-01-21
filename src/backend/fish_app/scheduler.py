"""
Планировщик задач для отправки сообщений в MQTT по расписанию кормления
"""
import logging
from datetime import datetime, time, timedelta
from typing import List, Optional
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.utils import timezone
from django.conf import settings

from .models import FeedingTask, Pool, Feed
from .mqtt_client import send_feeding_command, send_cart_command
from .route_generator import calculate_period_times

logger = logging.getLogger(__name__)

# Глобальный планировщик
_scheduler: Optional[BackgroundScheduler] = None


def get_scheduler() -> BackgroundScheduler:
    """
    Получить или создать планировщик задач (singleton)
    """
    global _scheduler
    
    if _scheduler is None:
        _scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)
        _scheduler.start()
        logger.info("Планировщик задач запущен")
    
    return _scheduler


def calculate_feeding_times(task: FeedingTask) -> List[time]:
    """
    Вычислить времена кормления для задачи на основе периода
    
    Логика:
    - 1 раз в день -> 12:00 (середина дня)
    - 2 раза в день -> 6:00 и 18:00 (середины половин дня)
    - 3 раза в день -> 4:00, 12:00, 20:00 (середины третей дня)
    - 4 раза в день -> 3:00, 9:00, 15:00, 21:00 (середины четвертей дня)
    - Кастомное время -> указанное время
    
    Args:
        task: Задача кормления (FeedingTask)
    
    Returns:
        Список времен кормления
    """
    if task.other_period:
        # Кастомное время
        return [task.other_period]
    elif task.period:
        # Стандартный период (например, "1 раз в день", "2 раза в день")
        period_name = task.period.name
        
        # Парсим количество раз в день
        import re
        pattern = r'(\d+)\s*раз[а]?\s*в\s*день'
        match = re.search(pattern, period_name)
        
        if match:
            num_feedings = int(match.group(1))
            
            if num_feedings == 1:
                # 1 раз в день -> 12:00 (середина дня)
                return [time(12, 0)]
            elif num_feedings == 2:
                # 2 раза в день -> 6:00 и 18:00 (середины половин дня)
                return [time(6, 0), time(18, 0)]
            else:
                # 3+ раза в день -> равномерно распределяем по дню
                # Делим день на num_feedings частей и берем середины
                feeding_times = []
                day_minutes = 24 * 60  # 1440 минут в дне
                segment_duration = day_minutes // num_feedings
                
                for i in range(num_feedings):
                    # Середина каждого сегмента
                    segment_center = (i * segment_duration) + (segment_duration // 2)
                    hour = segment_center // 60
                    minute = segment_center % 60
                    feeding_times.append(time(hour, minute))
                
                return feeding_times
        else:
            # Если не удалось распарсить, используем стандартную функцию
            return calculate_period_times(period_name)
    else:
        # По умолчанию - 12:00
        return [time(12, 0)]


def schedule_feeding_task(task: FeedingTask):
    """
    Запланировать отправку сообщений в MQTT для задачи кормления
    
    Args:
        task: Задача кормления (FeedingTask)
    """
    try:
        scheduler = get_scheduler()
        task_id = str(task.uuid)
        
        # Удаляем старые задачи для этого FeedingTask, если они есть
        remove_scheduled_task(task_id)
        
        # Получаем времена кормления
        feeding_times = calculate_feeding_times(task)
        
        # Запланировать отправку для каждого времени
        for feed_time in feeding_times:
            # Создаем уникальный ID для каждой задачи планировщика
            job_id = f"{task_id}_{feed_time.hour:02d}_{feed_time.minute:02d}"
            
            # Добавляем задачу в планировщик (каждый день в указанное время)
            scheduler.add_job(
                send_scheduled_feeding_message,
                trigger=CronTrigger(hour=feed_time.hour, minute=feed_time.minute),
                id=job_id,
                args=[str(task.uuid)],
                replace_existing=True,
                max_instances=1
            )
            
            logger.info(
                f"Запланирована отправка кормления для задачи {task_id} "
                f"в {feed_time.hour:02d}:{feed_time.minute:02d}"
            )
        
    except Exception as e:
        logger.error(f"Ошибка при планировании задачи кормления {task.uuid}: {e}")


def send_scheduled_feeding_message(task_uuid: str):
    """
    Отправить отложенное сообщение кормления в топик cart MQTT (вызывается планировщиком)
    
    Args:
        task_uuid: UUID задачи кормления
    """
    try:
        task = FeedingTask.objects.get(uuid=task_uuid)
        
        # Отправляем команду в топик cart
        success = send_cart_command(
            pool_id=str(task.pool.uuid),
            feed_id=str(task.feed.uuid),
            weight=float(task.weight),
            pool_name=task.pool.name,
            feed_name=task.feed.name
        )
        
        if success:
            logger.info(
                f"Отправлена команда кормления в топик cart: бассейн={task.pool.name}, "
                f"корм={task.feed.name}, масса={task.weight} кг"
            )
        else:
            logger.error(
                f"Не удалось отправить команду кормления в топик cart для задачи {task_uuid}"
            )
            
    except FeedingTask.DoesNotExist:
        logger.warning(f"Задача кормления {task_uuid} не найдена, пропускаем отправку")
    except Exception as e:
        logger.error(f"Ошибка при отправке запланированного кормления {task_uuid}: {e}")


def remove_scheduled_task(task_uuid: str):
    """
    Удалить запланированные задачи для FeedingTask
    
    Args:
        task_uuid: UUID задачи кормления
    """
    try:
        scheduler = get_scheduler()
        task_id = str(task_uuid)
        
        # Удаляем все задачи, связанные с этим FeedingTask
        # Ищем задачи по префиксу task_id
        jobs_to_remove = [
            job.id for job in scheduler.get_jobs()
            if job.id.startswith(task_id)
        ]
        
        for job_id in jobs_to_remove:
            try:
                scheduler.remove_job(job_id)
                logger.info(f"Удалена запланированная задача {job_id}")
            except Exception as e:
                logger.warning(f"Не удалось удалить задачу {job_id}: {e}")
                
    except Exception as e:
        logger.error(f"Ошибка при удалении запланированных задач для {task_uuid}: {e}")


def reschedule_all_tasks():
    """
    Перепланировать все активные задачи кормления
    Полезно при запуске приложения
    """
    try:
        tasks = FeedingTask.objects.all()
        logger.info(f"Перепланирование {tasks.count()} задач кормления")
        
        for task in tasks:
            schedule_feeding_task(task)
            
        logger.info("Все задачи кормления перепланированы")
        
    except Exception as e:
        logger.error(f"Ошибка при перепланировании задач: {e}")


def get_scheduled_jobs():
    """
    Получить список всех запланированных задач
    
    Returns:
        Список словарей с информацией о запланированных задачах
    """
    try:
        scheduler = get_scheduler()
        jobs = scheduler.get_jobs()
        
        jobs_info = []
        for job in jobs:
            # Парсим ID задачи для получения UUID FeedingTask
            # Формат: {task_uuid}_{hour:02d}_{minute:02d}
            # Например: "550e8400-e29b-41d4-a716-446655440000_06_00"
            job_id_parts = job.id.rsplit('_', 2)  # Разделяем с конца, максимум 2 раза
            if len(job_id_parts) == 3:
                task_uuid = job_id_parts[0]  # UUID задачи
                hour = job_id_parts[1]
                minute = job_id_parts[2]
                
                jobs_info.append({
                    'job_id': job.id,
                    'task_uuid': task_uuid,
                    'time': f"{hour}:{minute}",
                    'next_run_time': str(job.next_run_time) if job.next_run_time else None,
                    'trigger': str(job.trigger)
                })
        
        return jobs_info
    except Exception as e:
        logger.error(f"Ошибка при получении списка запланированных задач: {e}")
        return []


def shutdown_scheduler():
    """
    Остановить планировщик задач
    """
    global _scheduler
    
    if _scheduler is not None:
        try:
            _scheduler.shutdown(wait=False)
            logger.info("Планировщик задач остановлен")
        except Exception as e:
            logger.error(f"Ошибка при остановке планировщика: {e}")
        finally:
            _scheduler = None
