from .celery import app as celery_app
#Controls what gets exported when module is imported
__all__ = ('celery_app',)