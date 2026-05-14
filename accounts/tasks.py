from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.db import close_old_connections
from django.conf import settings

@shared_task(bind=True,rate_limit='10/m', autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={'max_retries': 5})
def send_email_task(self,subject, body, to, alternatives=None):
    close_old_connections()
    msg = EmailMultiAlternatives(subject, body, settings.DEFAULT_FROM_EMAIL, to)

    if alternatives:
        for content, mimetype in alternatives:
            msg.attach_alternative(content, mimetype)

    msg.send()