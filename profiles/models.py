from django.db import models
from accounts.models import User
from .service import validate_start_end_date
from django.core.validators import FileExtensionValidator
# Create your models here.

class Skill(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def save(self, *args, **kwargs):
        self.name = self.name.lower().strip()
        super().save(*args,**kwargs)

    def __str__(self):
        return self.name

def resume_directory_path(instance,filename):
    return "resume/user_{0}/{1}".format(instance.user.id,filename)

class CandidateProfile(models.Model):
    summary = models.TextField(null=True)
    resume = models.FileField(upload_to=resume_directory_path, null=True, validators=[FileExtensionValidator(['pdf'])])
    skills = models.ManyToManyField(Skill, related_name='in_profiles')
    user = models.OneToOneField(User,on_delete=models.PROTECT, related_name='candidate_profile')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) #update this field if any of the related models gets updated
    updated_by = models.ForeignKey(User,on_delete=models.PROTECT, related_name='candidate_profile_updates', blank=True, null=True)

    def __str__(self):
        return f"P:{self.user} (Candidate)"

class Project(models.Model):
    title = models.CharField(max_length=120)
    description = models.TextField()
    skills = models.ManyToManyField(Skill, related_name='in_projects')
    start_date = models.DateField()
    end_date = models.DateField()
    profile = models.ForeignKey(CandidateProfile,on_delete=models.PROTECT,related_name='projects')

    def clean(self):
        data = {
            'start_date':self.start_date,
            'end_date': self.end_date
        }
        validate_start_end_date(self)

    def __str__(self):
        return f"{self.title}"

class WorkExperience(models.Model):
    FULL_TIME = 'FULL'
    PART_TIME = 'PART'
    INTERNSHIP = 'INTR'
    FREELANCE = 'FRLN'
    CONTRACTUAL = 'CONT'
    work_type_choice = (
        (FULL_TIME, 'Full time'),
        (PART_TIME, 'Part time'),
        (INTERNSHIP, 'Internship'),
        (FREELANCE, 'Freelance'),
        (CONTRACTUAL, 'Contractual'),
    )
    designation = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    work_type = models.CharField(max_length=4, choices=work_type_choice)
    description = models.TextField()
    skills = models.ManyToManyField(Skill, related_name='in_workexp')
    start_date = models.DateField()
    end_date = models.DateField()
    profile = models.ForeignKey(CandidateProfile, on_delete=models.PROTECT, related_name='work_experience')

    def clean(self):
        data = {
            'start_date':self.start_date,
            'end_date': self.end_date
        }
        validate_start_end_date(data)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['designation','company','profile'],
                name='unique_work_exp'
            )
        ]

    def __str__(self):
        return f"{self.designation} at {self.company}"

class Education(models.Model):
    TENTH = 'TEN'
    TWELVE = 'TWL'
    DIPLOMA = 'DIP'
    BACHELORS = 'BAC'
    MASTERS = 'MAS'
    DOCTORATE = 'DOC'
    OTHER = 'OTH'
    education_level = (
        (TENTH,'10th Pass'),
        (TWELVE,'12th Pass'),
        (DIPLOMA,'Diploma'),
        (BACHELORS,'Bachelor\'s Degree'),
        (MASTERS, 'Master\'s Degree'),
        (DOCTORATE, 'Doctorate'),
        (OTHER, 'Other'),
    )
    level = models.CharField(max_length=3, choices=education_level)
    other = models.CharField(max_length=80,null=True,blank=True)
    field = models.CharField(max_length=80)
    institution = models.CharField(max_length=80)
    start_date = models.DateField()
    end_date = models.DateField()
    profile = models.ForeignKey(CandidateProfile,on_delete=models.PROTECT,related_name='educations')

    def clean(self):
        data = {
            'start_date':self.start_date,
            'end_date': self.end_date
        }
        validate_start_end_date(self)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['level','field','institution','profile'],
                name='unique_education'
            ),
            models.UniqueConstraint(
                fields=['other','field','institution','profile'],
                name='other_unique_education'
            )
        ]

class RecruiterProfile(models.Model):
    company = models.CharField(max_length=80,null=True)
    website = models.URLField(null=True)
    description = models.TextField(null=True)
    user = models.OneToOneField(User,on_delete=models.PROTECT, related_name='recruiter_profile')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, related_name='recruiter_profile_updates', on_delete=models.PROTECT, null=True, blank=True)

    def __str__(self):
        return f"P:{self.user} (Recruiter)"