from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
# Create your models here.

class User(AbstractUser):
    RECRUITER = 'RE'
    CANDIDATE = 'CA'
    role_type = (
        (RECRUITER, 'Recruiter'),
        (CANDIDATE, 'Candidate'),
    )
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=2, choices=role_type, db_index=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, db_index=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = [""]

    # def clean(self):
    #     if not self.email:
    #         raise ValidationError('Email is Required!')
    
    #     self.email = self.email.lower()

    # def save(self, *args, **kwargs):
    #     if not self.email:
    #         raise ValidationError('Email is Required!')
        
        # self.email = self.email.lower()
        # if not self.username:
        #     base_username = self.email.split('@')[0]
        #     counter = 0
        #     while User.objects.filter(username=base_username).exists():
        #         base_username = f"{base_username}{counter}"
        #         counter+=1
        #     self.username = base_username
        # super().save(*args,*kwargs)


    def __str__(self):
        return f"{self.username} ({self.role})"