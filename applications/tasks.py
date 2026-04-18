from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from .models import Application
from django.core import mail
from celery import shared_task
from django.db import close_old_connections

@shared_task
def new_application_mailer_task(pk):
    close_old_connections()
    application = Application.objects.select_related('job','user').get(pk=pk)
    title = application.job.title
    recruiter = application.job.created_by.username
    recruiter_email = application.job.created_by.email
    candidate = application.user.username
    candidate_email = application.user.email

    # Candidate email
    # First, render the plain text content.
    text_content_ca = render_to_string(
        "emails/application_email_ca.txt",
        context={
            "candidate": candidate,
            'title':title
        }
    )

    # Secondly, render the HTML content.
    html_content_ca = render_to_string(
        "emails/application_email_ca.html",
        context={
            "candidate": candidate,
            'title':title
        }
    )

    # Then, create a multipart email instance.
    msg_ca = EmailMultiAlternatives(
        subject=f"Application for {title}",
        body=text_content_ca,
        from_email='support@carrierhai.com',
        to=[candidate_email],
        headers={"List-Unsubscribe": "<mailto:unsub@example.com>"},
    )

    # Lastly, attach the HTML content to the email instance and send.
    msg_ca.attach_alternative(html_content_ca, "text/html")

    # Recruiter email
    text_content_re = render_to_string(
        "emails/application_email_re.txt",
        context={
            "recruiter": recruiter,
            "candidate": candidate,
            'title':title
        }
    )

    html_content_re = render_to_string(
        "emails/application_email_re.html",
        context={
            "recruiter": recruiter,
            "candidate": candidate,
            'title':title
        }
    )

    msg_re = EmailMultiAlternatives(
        subject=f"New Applicant for {title}",
        body=text_content_re,
        from_email="support@carrierhai.com",
        to=[recruiter_email],
        headers={"List-Unsubscribe": "<mailto:unsub@example.com>"},
    )

    msg_re.attach_alternative(html_content_re, "text/html")

    with mail.get_connection() as connection:
        connection.send_messages([msg_ca,msg_re])
    
@shared_task
def application_status_mailer_task(pk):
    close_old_connections() #Inside Celery tasks, DB connections can get stale. 
    application = Application.objects.select_related('job','user').get(pk=pk)
    title = application.job.title
    status = application.status
    candidate = application.user.username
    candidate_email = application.user.email

    # Candidate email
    text_content_ca = render_to_string(
        "emails/application_email_status.txt",
        context={
            "candidate": candidate,
            'title':title,
            'status':status
        }
    )

    html_content_ca = render_to_string(
        "emails/application_email_status.html",
        context={
            "candidate": candidate,
            'title':title,
            'status':status
        }
    )

    msg_ca = EmailMultiAlternatives(
        subject=f"Application for {title}",
        body=text_content_ca,
        from_email='support@carrierhai.com',
        to=[candidate_email],
        headers={"List-Unsubscribe": "<mailto:unsub@example.com>"},
    )

    msg_ca.attach_alternative(html_content_ca, "text/html")

    with mail.get_connection() as connection:
        connection.send_messages([msg_ca])