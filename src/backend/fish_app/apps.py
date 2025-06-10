from django.apps import AppConfig


class FishAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'fish_app'
    
    def ready(self):
        import fish_app.signals 