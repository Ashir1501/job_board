from rest_framework import serializers
from .models import (
    CandidateProfile,
    WorkExperience,
    Project,
    Education,
    RecruiterProfile,
)
from .service import validate_start_end_date, get_skills
import filetype
from django.db import IntegrityError
import os

class CandidateSerializer(serializers.ModelSerializer):
    resume = serializers.FileField(required=False)
    resume_name = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()
    skill_list = serializers.ListField(
        child = serializers.CharField(max_length=30),
        write_only=True,
    )
    skills = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field = 'name'
    )

    class Meta:
        model = CandidateProfile
        fields = ['pk','summary','resume','resume_name','resume_url','skills','skill_list','user','updated_by']
        read_only_fields = ['pk','user','updated_by','skills','resume_name','resume_url']

    def get_resume_name(self,obj):
        if obj.resume:
            # return obj.resume.name.split('/')[2]
            return os.path.basename(obj.resume.name)
        return None

    def get_resume_url(self,obj):
        if obj.resume:
            return obj.resume.url
        return None

    def validate_resume(self,value):
        file = value
        if not file:
            return None
        
        if file.size > 2 * 1024 * 1024:
            raise serializers.ValidationError('File size should be under 2MB.')
        
        try:
            # pdf files always starts with %PDF-
            file.seek(0)
            header = file.read(5)

            if header != b'%PDF-':
                raise serializers.ValidationError("Invalid PDF file.")
            file.seek(0)

            sample = file.read(2048)

            kind = filetype.guess(sample)

            if not kind or kind.mime != 'application/pdf':
                raise serializers.ValidationError("Invalid PDF file.")
            file.seek(0)
            return value
        except Exception as e:
            raise serializers.ValidationError({
                'non_field_errors': f'PDF validation failed: {str(e)}'
            })
    
    def validate_summary(self,value):
        if value:
            return value.lower().strip()
        else:
            return value
        
    def update(self, instance, validated_data):
        skills = validated_data.pop('skill_list',None)
        if skills is not None:
            skill_objs = get_skills(skills)
            instance.skills.set(skill_objs)
            
        for attr, value in validated_data.items():
            setattr(instance,attr,value)

        instance.updated_by = self.context['request'].user
        try:
            instance.save()
            return instance
        except IntegrityError:
            raise serializers.ValidationError({'non_field_errors':['Profile already exists']})
    
class WorkExperienceSerializer(serializers.ModelSerializer):
    skill_list = serializers.ListField(
        child = serializers.CharField(max_length=30),
        write_only=True,
    )
    skills = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field = 'name'
    )
    readable_work_type = serializers.SerializerMethodField()

    class Meta:
        model = WorkExperience
        fields = ['pk','designation','company','work_type','readable_work_type','description','skills','skill_list','start_date','end_date']
        read_only_fields = ['pk','readable_work_type']

    def get_readable_work_type(self,obj):
        return obj.get_work_type_display()
    
    def validate(self, attrs):
        validate_start_end_date(attrs)
        return attrs
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['profile'] = user.candidate_profile
        skills = validated_data.pop('skill_list',None)
        try:
            obj = WorkExperience.objects.create(**validated_data)

            if skills is not None:
                skill_objs = get_skills(skills)
                obj.skills.set(skill_objs)
            return obj
        except IntegrityError:
            raise serializers.ValidationError({'non_field_errors':['Work Experience already exists.']})
    
    def update(self, instance, validated_data):
        skills = validated_data.pop('skill_list',None)
        if skills is not None:
            skill_objs = get_skills(skills)
            instance.skills.set(skill_objs)
        
        for attr, value in validated_data.items():
            setattr(instance,attr,value)
        try:
            instance.save()
            return instance
        except IntegrityError:
            raise serializers.ValidationError({'non_field_errors':['Work Experience already exists.']})
    
class ProjectSerializer(serializers.ModelSerializer):
    skill_list = serializers.ListField(
        child = serializers.CharField(max_length=30),
        write_only=True,
    )
    skills = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field = 'name'
    )
    class Meta:
        model = Project
        fields = ['pk','title','description','skills','skill_list','start_date','end_date']
        read_only_fields = ['pk']

    def validate(self, attrs):
        validate_start_end_date(attrs)
        title = attrs.get('title',None)
        if title:
            attrs['title'] = title.lower().strip()
        return attrs
    
    def update(self, instance, validated_data):
        skills = validated_data.pop('skill_list',None)
        if skills is not None:
            skill_objs = get_skills(skills)
            instance.skills.set(skill_objs)

        for attr, value in validated_data.items():
            setattr(instance,attr,value)

        instance.save()
        return instance
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['profile'] = user.candidate_profile
        skills = validated_data.pop('skill_list',None)
        obj = Project.objects.create(**validated_data)

        if skills is not None:
            skill_objs = get_skills(skills)
            obj.skills.set(skill_objs)
        return obj
    
class EducationSerializer(serializers.ModelSerializer):
    readable_level = serializers.SerializerMethodField()

    class Meta:
        model = Education
        fields = ['pk','level','readable_level','other','field','institution','start_date','end_date']
        read_only_fields = ['pk','readable_level']

    def get_readable_level(self,obj):
        return obj.get_level_display()

    def validate(self, attrs):
        level = attrs.get('level', None)
        other = attrs.get('other',None)
        if level: 
            if level == Education.OTHER and not other:
                raise serializers.ValidationError('Please provide the other field.')
            if level != Education.OTHER and other:
                raise serializers.ValidationError('You cannot enter both level and other field ')
        validate_start_end_date(attrs)
        return attrs
        
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['profile'] = user.candidate_profile
        try:
            obj = Education.objects.create(**validated_data)
            return obj
        except IntegrityError:
            raise serializers.ValidationError({'non_field_errors':['Education already exists.']})

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance,attr,value)
        try:
            instance.save()
            return instance
        except IntegrityError:
            raise serializers.ValidationError({'non_field_errors':['Education already exists.']})
    
class RecruiterSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterProfile
        fields = ['pk','company','website','description','user','updated_by']
        read_only_fields = ['pk','user','updated_by']


    def update(self, instance, validated_data):
        user = self.context['request'].user
        validated_data['updated_by'] = user
        for attr, value in validated_data.items():
            setattr(instance,attr,value)
        try:
            instance.save()
            return instance
        except IntegrityError:
            raise serializers.ValidationError({'non_field_errors':['Profile already exists']})

class ApplicantProfileSerializer(serializers.ModelSerializer):

    work_experience = WorkExperienceSerializer(many=True)
    educations = EducationSerializer(many=True)
    projects = ProjectSerializer(many=True)

    skills = serializers.SerializerMethodField()

    class Meta:
        model = CandidateProfile
        fields = [
            'summary',
            'resume',
            'skills',
            'work_experience',
            'educations',
            'projects',
        ]

    def get_skills(self, obj):
        return obj.skills.values_list('name', flat=True)