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

class CandidateSerializer(serializers.ModelSerializer):
    resume = serializers.FileField(required=False)
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
        fields = ['pk','summary','resume','skills','skill_list','user','updated_by']
        read_only_fields = ['pk','user','updated_by','skills']

    def validate_resume(self,value):
        file = value
        if file is None:
            return file
        
        if file.size > 2 * 1024 * 1024:
            raise serializers.ValidationError('File size should be under 2MB.')
        
        # pdf files always starts with %PDF-
        file.seek(0)
        if file.read(5) != b'%PDF-':
            raise serializers.ValidationError("Invalid PDF file.")
        file.seek(0)

        kind = filetype.guess(file.read(2048))
        if not kind or kind.mime != 'application/pdf':
            raise serializers.ValidationError("Invalid PDF file.")
        file.seek(0)
        return value
    
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
        instance.save()
        return instance
    
class WorkExperienceSerailizer(serializers.ModelSerializer):
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
        model = WorkExperience
        fields = ['designation','company','work_type','description','skills','skill_list','start_date','end_date']

    def validate(self, attrs):
        validate_start_end_date(attrs)
        return attrs
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['profile'] = user.candidate_profile
        skills = validated_data.pop('skill_list',None)
        obj = WorkExperience.objects.create(**validated_data)

        if skills is not None:
            skill_objs = get_skills(skills)
            obj.skills.set(skill_objs)
        return obj
    
    def update(self, instance, validated_data):
        skills = validated_data.pop('skill_list',None)
        if skills is not None:
            skill_objs = get_skills(skills)
            instance.skills.set(skill_objs)
        
        for attr, value in validated_data.items():
            setattr(instance,attr,value)
        
        instance.save()
        return instance
    
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
        fields = ['title','description','skills','skill_list','start_date','end_date']

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
    class Meta:
        model = Education
        fields = ['level','other','field','institution','start_date','end_date']

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
        obj = Education.objects.create(**validated_data)
        return obj
    
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

        instance.save()
        return instance
