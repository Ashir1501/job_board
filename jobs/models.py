from django.db import models
from accounts.models import User
from django.core.validators import MaxValueValidator
from .service import validate_job, render_markdown_safe

# Create your models here.
class Location(models.Model):
    city = models.CharField(max_length=30)
    country = models.CharField(max_length=30)

    def clean(self):
        self.city = self.city.lower()
        self.country = self.country.lower()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['city','country'],
                name='unique_location'
            )
        ]

    def __str__(self):
        return f"{self.city},{self.country}"

class Job(models.Model):
    FULL_TIME = 'FULL'
    PART_TIME = 'PART'
    INTERNSHIP = 'INTR'
    FREELANCE = 'FRLN'
    CONTRACTUAL = 'CONT'
    job_type_choices = (
        (FULL_TIME, 'Full_time'),
        (PART_TIME, 'Part_time'),
        (INTERNSHIP, 'Internship'),
        (FREELANCE, 'Freelance'),
        (CONTRACTUAL, 'Contractual'),
    )
    title = models.CharField(max_length=80, db_index=True)
    job_type = models.CharField(max_length=4,choices=job_type_choices, db_index=True)
    description = models.TextField()
    description_html = models.TextField(blank=True)
    locations = models.ManyToManyField(Location, related_name='jobs')
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True,blank=True)
    experience_min = models.PositiveSmallIntegerField()
    experience_max = models.PositiveSmallIntegerField(validators=[MaxValueValidator(60,'Experience cannot be greated than 60')])
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='posted_jobs')
    updated_at = models.DateTimeField(auto_now=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='job_updates', blank=True, null=True)

    def clean(self):
        data = {
            'salary_min': self.salary_min,
            'salary_max':self.salary_max,
            'experience_min':self.experience_min,
            'experience_max':self.experience_max
        }
        validate_job(data)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_description = self.description

    # this will not run on calling .update() / bulk updates
    def save(self, *args, **kwargs):
        if not self.pk or self.description != self._original_description:
            if self.description:
                self.description_html = render_markdown_safe(self.description)
            else:
                self.description_html = ""
        super().save(*args, **kwargs)
        self._original_description = self.description

    class Meta:
        indexes = [
            models.Index(fields=['title','job_type'], name='title_job_type_idx'),
        ]
        constraints = [
            models.UniqueConstraint(fields=['title','job_type','created_by'], name='unique_job')
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} created by {self.created_by}"
    
class Bookmark(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='bookmarked_by')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['job','user'],
                name='unique_bookmark'
            )
        ] 

    def __str__(self):
        return f"{self.user} | {self.job}"