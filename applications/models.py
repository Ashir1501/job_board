from django.db import models
from jobs.models import Job
from accounts.models import User
# Create your models here.
class Application(models.Model):
    PENDING = 'PEN'
    VIEWED = 'VEW'
    SHORTLISTED = 'SHL'
    REJECTED = 'REJ'
    status_type = (
        (PENDING,'Pending'),
        (VIEWED, 'Viewed'),
        (SHORTLISTED,'Shortlisted'),
        (REJECTED,'Rejected')
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applied_jobs')
    status = models.CharField(max_length=3, choices=status_type, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) # gets updated if status is changed
    updated_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='application_updates', null=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['job','user'],
                name='unique_user_job'
            )
        ]
        indexes = [
            models.Index(fields=['job','status'],name='job_appl_status_idx'),
            models.Index(fields=['user','status'],name='user_appl_status_idx')
        ]
    
    ALLOWED_TRANSITIONS = {
        PENDING: [VIEWED, REJECTED],
        VIEWED: [SHORTLISTED, REJECTED],
        SHORTLISTED: [],
        REJECTED: []
    }
    
    def can_transition(self, new_status):
        return new_status in self.ALLOWED_TRANSITIONS.get(self.status, [])
    
    def __str__(self):
        return f"App: {self.user} - {self.job.title}"
    