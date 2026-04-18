from rest_framework import serializers
from django.shortcuts import get_object_or_404
from accounts.models import User
from django.core.exceptions import ValidationError
from django.db import IntegrityError

def validate_start_end_date(data):
      start_date = data.get('start_date')
      end_date = data.get('end_date')
      if (start_date and end_date) and (start_date >= end_date):
            raise serializers.ValidationError("Start date cannot be greater than End date!")
      

def create_profile(pk):
      user = get_object_or_404(User,pk=pk)

      if user.role == 'CA':
            from .models import CandidateProfile
            CandidateProfile.objects.create(user=user)

      if user.role == 'RE':
            from .models import RecruiterProfile
            RecruiterProfile.objects.create(user=user) 

def get_skills(skills):
      skill_obj = []
      from .models import Skill
      # enable this when only working with swagger ui
      skills_cleaned = []
      for concat_skills in skills:
            for skill in concat_skills.split(','):
                  skills_cleaned.append(skill)
      skills = skills_cleaned
      # -------------------------------------

      for skill in skills:
            normalized = skill.lower().strip()
            try:
                  obj, created = Skill.objects.get_or_create(name=skill)
            except IntegrityError:
                  obj = Skill.objects.get(name=normalized)
            skill_obj.append(obj)
      return skill_obj
            