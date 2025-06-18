import uuid
from django.db.models.signals import pre_save, post_migrate
from django.dispatch import receiver
from django.contrib.auth.hashers import make_password

from .models import Pool, Feed, Timetable, Feeding, Log, User, Period

@receiver(pre_save, sender=Pool)
def create_pool_uuid(sender, instance, **kwargs):
    if not instance.uuid:
        instance.uuid = f"pool-{uuid.uuid4()}"

@receiver(pre_save, sender=Feed)
def create_feed_uuid(sender, instance, **kwargs):
    if not instance.uuid:
        instance.uuid = f"feed-{uuid.uuid4()}"

@receiver(pre_save, sender=Timetable)
def create_timetable_uuid(sender, instance, **kwargs):
    if not instance.uuid:
        instance.uuid = f"timetable-{uuid.uuid4()}"

@receiver(pre_save, sender=Feeding)
def create_feeding_uuid(sender, instance, **kwargs):
    if not instance.uuid:
        instance.uuid = f"feeding-{uuid.uuid4()}"

@receiver(pre_save, sender=Log)
def create_log_uuid(sender, instance, **kwargs):
    if not instance.uuid:
        instance.uuid = f"log-{uuid.uuid4()}"

@receiver(pre_save, sender=User)
def create_user_uuid(sender, instance, **kwargs):
    if not instance.uuid:
        instance.uuid = f"user-{uuid.uuid4()}" 

@receiver(pre_save, sender=Period)
def create_period_uuid(sender, instance, **kwargs):
    if not instance.uuid:
        instance.uuid = f"period-{uuid.uuid4()}" 

@receiver(pre_save, sender=User)
def hash_user_password(sender, instance, **kwargs):
    if not instance.password.startswith(('pbkdf2_sha256$', 'bcrypt$', 'argon2$')):
        instance.password = make_password(instance.password)

@receiver(post_migrate)
def create_default_users(sender, **kwargs):
    if sender.name == 'fish_app':
        default_users = [
            {
                'login': 'user',
                'password': 'user',
                'fullname': 'Пользователь',
                'jwt': None
            },
        ]
        
        for user_data in default_users:
            if not User.objects.filter(login=user_data['login']).exists():
                User.objects.create(
                    login=user_data['login'],
                    password=user_data['password'],
                    fullname=user_data['fullname'],
                    jwt=user_data['jwt']
                )

@receiver(post_migrate)
def create_default_pools(sender, **kwargs):
    if sender.name == 'fish_app':
        pools = [
                {"name": "Бассейн №1", "additional": {"popultation": "Караси",}},
                {"name": "Бассейн №2", "additional": {"popultation": "Сомики"}},
                {"name": "Бассейн №3", "additional": {"popultation": "Угри"}}
            ]

        for pool_data in pools:
            Pool.objects.get_or_create(
                name=pool_data['name'],
                defaults={'additional': pool_data['additional']}
            )

@receiver(post_migrate)
def create_default_feeds(sender, **kwargs):
    if sender.name == 'fish_app':            
        feeds = [
            {"name": "Стартовый корм", "additional": {"protein": 45, "fat": 12}},
            {"name": "Ростовой корм", "additional": {"protein": 38, "fat": 10}},
            {"name": "Финишный корм", "additional": {"protein": 32, "fat": 8}}
        ]

        for feed_data in feeds:
            Feed.objects.get_or_create(
                name=feed_data['name'],
                defaults={'additional': feed_data['additional']}
            )

@receiver(post_migrate)
def create_default_periods(sender, **kwargs):
    if sender.name == 'fish_app':
        periods = [
            "1 раз в день",
            "2 раза в день",
            "3 раза в день",
            "4 раза в день"
        ]
        for period_name in periods:
            Period.objects.get_or_create(name=period_name)
