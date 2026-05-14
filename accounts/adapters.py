from allauth.account.adapter import DefaultAccountAdapter
from django.db.transaction import on_commit
from .tasks import send_email_task

class MyAccountAdapter(DefaultAccountAdapter):
    def send_mail(self, template_prefix, email, context):
        msg = self.render_mail(template_prefix, email, context)

        # Ensure DB commit before sending
        on_commit(lambda: send_email_task.delay(
            msg.subject,
            msg.body,
            # msg.from_email,
            [email],
            msg.alternatives  # includes your HTML email
        ))