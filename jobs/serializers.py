from rest_framework import serializers
from .models import Job, Location, Bookmark
from .service import validate_job, get_location_obj
from allauth.account.admin import EmailAddress
from django.db import IntegrityError, transaction

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['city','country']
        validators = []

    def validate(self, attrs):
        attrs['city'] = attrs.get('city').lower().strip()
        attrs['country'] = attrs.get('country').lower().strip()
        return attrs

class JobSerializer(serializers.ModelSerializer):

    locations = LocationSerializer(many=True)
    is_bookmarked = serializers.SerializerMethodField()
    bookmark_id = serializers.SerializerMethodField()
    created_by = serializers.SlugRelatedField(
        read_only=True,
        slug_field='username'
        )
    application_status = serializers.SerializerMethodField()
    application_count = serializers.SerializerMethodField()
    company = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'pk',
            'title', 
            'company',
            'job_type',
            'description',
            'application_status',
            'application_count',
            'description_html',
            'locations', 
            'salary_min', 
            'salary_max',
            'experience_min',
            'experience_max',
            'is_bookmarked',
            'bookmark_id',
            'is_active',
            'created_by',
            'created_at',
            'updated_by',
            'updated_at',
        ]
        read_only_fields = [
            'pk',
            'created_by',
            'company',
            'description_html',
            'updated_by',
            'application_status',
            'application_count',
            'created_at',
            'updated_at',
            ]
        extra_kwargs = {
            'salary_min':{'allow_null':True,'required':False},
            'salary_max': {'allow_null':True,'required':False}
        }

    def get_is_bookmarked(self, obj):
        user = self.context['request'].user
        return user.bookmarks.filter(job=obj).exists()
    
    def get_company(self,obj):
        print('get company',obj.created_by)
        profile = obj.created_by.recruiter_profile
        return profile.company

    
    def get_bookmark_id(self,obj):
        user = self.context['request'].user
        if(user.bookmarks.filter(job=obj).exists()):
            bookmark = user.bookmarks.get(job=obj)
            return bookmark.pk
        return None
    
    def get_application_status(self, obj):
        app = getattr(obj, 'user_application', None)
        if app:
            return app[0].status
        return None

    def get_application_count(self, obj):
        count = getattr(obj, 'application_count', None)
        if count:
            return count
        return None
    
    def validate(self, attrs):
        validate_job(attrs)
        title = attrs.get('title')
        if title:
            attrs['title'] = title.lower().strip()
        return attrs
    
    # def update(self, instance, validated_data):
    #     locations = validated_data.pop('locations',None)
    #     if locations is not None:
    #         location_objs = get_location_obj(locations)
    #         instance.locations.set(location_objs) 

    #     for attr, value in validated_data.items():
    #         setattr(instance,attr,value)
         
    #     instance.save()
    #     return instance
    
    def create(self,validated_data):
        # only create the job if the email is verified
        user = self.context['request'].user
        email = EmailAddress.objects.filter(user=user).first()
        if not email or not email.verified:
            raise serializers.ValidationError({'non_field_errors':['Please Verify yourself before creating Jobs.']})

        locations = validated_data.pop('locations',[])
        try:
            with transaction.atomic():
                job = Job.objects.create(**validated_data)
                location_objs = get_location_obj(locations)
                job.locations.set(location_objs)   
        except IntegrityError as e:
            if 'unique_job' in str(e):
                raise serializers.ValidationError({'non_field_errors':['Job already exists!']})
            raise serializers.ValidationError({'non_field_errors':['Oops something went wrong!']})
            
        return job

class JobUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'pk',
            'title', 
            'job_type',
            'description',
            'description_html',
            'locations', 
            'salary_min', 
            'salary_max',
            'experience_min',
            'experience_max',
            'is_active',
            'created_by',
            'created_at',
            'updated_by',
            'updated_at'
        ]
        read_only_fields = [
            'pk',
            'title', 
            'job_type',
            'description_html',
            'locations', 
            'salary_min', 
            'salary_max',
            'experience_min',
            'experience_max',
            'created_by',
            'created_at',
            'updated_by',
            'updated_at'
        ]
    

class BookmarkSerializer(serializers.ModelSerializer):
    job = serializers.PrimaryKeyRelatedField(queryset=Job.objects.all())

    class Meta:
        model = Bookmark
        fields = ['pk','job','user','created_at']
        read_only_fields = ['pk','user','created_at']

    def validate(self, attrs):
        job = attrs.get('job',None)
        if not job:
            raise serializers.ValidationError('Cannot create bookmark without job.')
        return attrs

    def create(self, validated_data):
        job = validated_data.get('job')
        user = validated_data.get('user')

        if Bookmark.objects.filter(user=user,job=job).exists():
            raise serializers.ValidationError('Bookmark already exists.')
        
        try:
            obj = Bookmark.objects.create(**validated_data)
            return obj
        except IntegrityError:
            raise serializers.ValidationError({'non_field_errors': ['Bookmark already exists.']})
