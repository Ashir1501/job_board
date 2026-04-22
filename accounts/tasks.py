from celery import shared_task
from django.core.mail import EmailMultiAlternatives

@shared_task(rate_limit='10/m',bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={'max_retries': 5})
def send_email_task(subject, body, from_email, to, alternatives=None):
    msg = EmailMultiAlternatives(subject, body, from_email, to)

    if alternatives:
        for content, mimetype in alternatives:
            msg.attach_alternative(content, mimetype)

    msg.send()