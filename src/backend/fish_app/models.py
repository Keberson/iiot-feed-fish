from django.db import models
import uuid


class Pool(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    additional = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.name


class Feed(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    additional = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.name


class Timetable(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    value = models.CharField(max_length=255)
    additional = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.name


class Feeding(models.Model):
    STATUS_CHOICES = [
        ('done', 'Выполнено'),
        ('planned', 'Запланировано'),
        ('in-progress', 'В процессе'),
        ('error', 'Ошибка'),
    ]
    
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pool = models.ForeignKey(Pool, on_delete=models.CASCADE)
    feed = models.ForeignKey(Feed, on_delete=models.CASCADE)
    weight = models.DecimalField(max_digits=10, decimal_places=2)
    period = models.ForeignKey(Timetable, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='planned')
    result = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Feeding {self.uuid} - {self.pool.name} with {self.feed.name}"


class Log(models.Model):
    TYPE_CHOICES = [
        ('cart', 'Тележка'),
        ('bunker', 'Бункер'),
        ('system', 'Система'),
    ]
    
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    action = models.CharField(max_length=255)
    when = models.DateTimeField(auto_now_add=True)
    description = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)

    def __str__(self):
        return f"{self.type} log: {self.action} at {self.when}"


class System(models.Model):
    STATUS_CHOICES = [
        ('error', 'Ошибка'),
        ('warning', 'Предупреждение'),
        ('ok', 'OK'),
    ]
    
    id = models.AutoField(primary_key=True)
    wifi_ssid = models.CharField(max_length=255, null=True, blank=True)
    wifi_password = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ok')

    def __str__(self):
        return f"System status: {self.status}"


class User(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    login = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    jwt = models.CharField(max_length=255, null=True, blank=True)
    fullname = models.CharField(max_length=255)

    def __str__(self):
        return self.fullname 