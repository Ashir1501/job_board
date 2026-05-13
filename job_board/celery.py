from celery import Celery
import os

# this exposes settings module to celery even though environment for the 
# same is set on manage.py but celery doesnt access manage.py but celery.py
os.environ.setdefault(
    'DJANGO_SETTINGS_MODULE',
    os.getenv(
        'DJANGO_SETTINGS_MODULE',
        'job_board.settings.dev'
    )
)

# celery instance
app = Celery('job_board')

# reads config from django setting specifically starting from CELERY
app.config_from_object('django.conf:settings', namespace='CELERY')
# This scans all installed apps and looks for: tasks.py
app.autodiscover_tasks()