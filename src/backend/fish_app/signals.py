import uuid
from django.db.models.signals import pre_save
from django.dispatch import receiver

from .models import Pool, Feed, Timetable, Feeding, Log, User

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