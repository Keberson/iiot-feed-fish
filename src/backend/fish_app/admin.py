from django.contrib import admin
from .models import Pool, Feed, Timetable, Feeding, Log, System, User

@admin.register(Pool)
class PoolAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'name')
    search_fields = ('name', 'uuid')

@admin.register(Feed)
class FeedAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'name')
    search_fields = ('name', 'uuid')

@admin.register(Timetable)
class TimetableAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'name', 'value')
    search_fields = ('name', 'value', 'uuid')

@admin.register(Feeding)
class FeedingAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'pool', 'feed', 'weight', 'period', 'status')
    list_filter = ('status', 'pool', 'feed', 'period')
    search_fields = ('uuid',)

@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'action', 'when', 'type')
    list_filter = ('type', 'when')
    search_fields = ('action', 'description', 'uuid')

@admin.register(System)
class SystemAdmin(admin.ModelAdmin):
    list_display = ('id', 'wifi_ssid', 'status')
    list_filter = ('status',)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'login', 'fullname')
    search_fields = ('login', 'fullname', 'uuid') 