from rest_framework import serializers
from .models import Application
from allauth.account.admin import EmailAddress
from profiles.models import CandidateProfile
from django.db import IntegrityError

class ApplicationSerializer(serializers.ModelSerializer):
    applicant = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = ['pk','job','user','skills','applicant','status','updated_by','created_at']
        read_only_fields = ['status','updated_by','pk','user','applicant','created_at','skills']

    def get_applicant(self,obj):
        return obj.user.username
    
    def get_skills(self, obj):
        profile = obj.user.candidate_profile
        return profile.skills.values_list('name', flat=True)

    def validate(self, attrs):
        user = self.context['request'].user
        
        email = EmailAddress.objects.filter(user=user).first()
        if not email or not email.verified:
            raise serializers.ValidationError('Please verify your email before applying.')

        profile = CandidateProfile.objects.filter(user=user).first()
        if not profile or not profile.resume:
            raise serializers.ValidationError('Please upload your resume before applying.')

        return attrs
    
    def create(self, validated_data):
        user = self.context['request'].user
        job = validated_data.get('job')

        if Application.objects.filter(job=job, user=user).exists():
            raise serializers.ValidationError({
                "non_field_errors": ["You have already applied for this job."]
            })

        validated_data['user'] = user
        try:
            application = Application.objects.create(**validated_data)
            return application
        except IntegrityError as e:
            error_msg = str(e)
            if 'job_id' in error_msg and 'user_id' in error_msg:
                raise serializers.ValidationError({"non_field_errors":["You have already applied for this job."]})
            raise serializers.ValidationError({"non_field_errors":["Something went wrong!"]})
    
class ApplicationStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = Application
        fields = ['pk','job','user','status', 'updated_by']
        read_only_fields = ['pk','job', 'user', 'updated_by']

    def update(self, instance, validated_data):
        # pen -> view -> shl or pen - vew -> rej
        new_status = validated_data.get('status')

        if not new_status:
            raise serializers.ValidationError({'status': 'This field is required.'})  
          
        if instance.status == new_status:
            raise serializers.ValidationError({
                'status': 'Status is already set to this value.'
            })

        if not instance.can_transition(new_status):
            raise serializers.ValidationError({
                'status': 'Invalid status transition.'
            })

        # moved the logic to models
        # all_status = [pending,viewed,shortlisted,rejected]
        # if (instance.status == pending and new_status in [shortlisted, rejected, pending]) \
        #     or (instance.status == viewed and new_status in [pending, viewed]) \
        #     or (instance.status == rejected and new_status in all_status) \
        #     or (instance.status == shortlisted and new_status in all_status):
        #     raise serializers.ValidationError({'status': 'Invalid Status.'})

        instance.status = new_status
        instance.updated_by = self.context['request'].user
        instance.save(update_fields=["status","updated_by"])

        return instance

